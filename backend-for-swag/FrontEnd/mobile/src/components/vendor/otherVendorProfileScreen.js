import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Modal,
  StatusBar,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import BottomTabsVen from '../commonV/BottomTabsVen';
import VendorPosts from '../commonV/VendorPosts';
import { fetchVendorById, followVendor, unfollowVendor } from '../../store/slices/vendorSlice';
import { fetchPosts } from '../../store/slices/postsSlice';
import vendorAPI from '../../api/vendorAPI';

const { width, height } = Dimensions.get('window');

const defaultBg = require('../../../assets/images/default-banner.png');
const defaultLogo = require('../../../assets/images/default-user-pfp.png');

const OtherVendorProfileScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { vendorId } = useLocalSearchParams();

  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { selectedVendor, loading, myProfile } = useSelector((state) => state.vendor);
  const { posts } = useSelector((state) => state.posts);
  const isOwnProfile = myProfile && String(vendorId) === String(myProfile.id);

  useFocusEffect(
    useCallback(() => {
      if (vendorId) {
        dispatch(fetchVendorById(vendorId));
        dispatch(fetchPosts({ vendorId }));
        (async () => {
          const result = await vendorAPI.getVendorCollections(vendorId);
          if (result.success) setCollections(result.data || []);
        })();
      }
    }, [vendorId, dispatch])
  );

  const vendor = selectedVendor || {};
  const [isFollowing, setIsFollowing] = useState(vendor.isFollowed || false);
  const [followersCount, setFollowersCount] = useState(vendor.followerCount || 0);

  useEffect(() => {
    if (selectedVendor) {
      setIsFollowing(selectedVendor.isFollowed || false);
      setFollowersCount(selectedVendor.followerCount || 0);
    }
  }, [selectedVendor]);

  const handleFollowToggle = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
      dispatch(unfollowVendor(vendorId));
    } else {
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
      dispatch(followVendor(vendorId));
    }
  };

  const handleMessagePress = () => {
    router.push({
      pathname: '/commonScreensV/ChattingV',
      params: {
        userName: vendor.shopName || 'User Name',
        userType: 'vendor',
        otherUserId: vendorId,
        userImage: vendor.profileImage || '',
      }
    });
  };

  const openMap = (addressText) => {
    const query = encodeURIComponent((addressText || '').replace(/\n/g, ' '));
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
  };

  const openLink = (linkText) => {
    let url = (linkText || '').split(' ')[0];
    if (!url.startsWith('http')) url = 'https://' + url;
    Linking.openURL(url).catch(() => {});
  };

  const DETAILS_LIST = [
    vendor.address && {
      id: 1, label: 'Address', text: vendor.address,
      iconImage: require('../../../assets/images/locationVendor-icon.png'),
      action: () => openMap(vendor.address)
    },
    vendor.phone && {
      id: 2, label: 'Mobile', text: vendor.phone,
      iconImage: require('../../../assets/images/phone-icon.png'),
      action: () => Linking.openURL(`tel:${vendor.phone}`)
    },
    vendor.email && {
      id: 3, label: 'Email', text: vendor.email,
      iconName: 'mail',
      action: () => Linking.openURL(`mailto:${vendor.email}`)
    },
    vendor.whatsapp && {
      id: 4, label: 'WhatsApp', text: vendor.whatsapp,
      iconImage: require('../../../assets/images/whatsapp-icon.png'),
      action: () => Linking.openURL(`https://wa.me/${vendor.whatsapp.replace(/\D/g, '')}`)
    },
    vendor.instagramUrl && {
      id: 5, label: 'Instagram', text: vendor.instagramUrl,
      iconImage: require('../../../assets/images/insta-icon.png'),
      action: () => openLink(vendor.instagramUrl)
    },
    (vendor.openTime || vendor.closeTime) && {
      id: 6, label: 'Work hours',
      text: `${vendor.openTime || ''} - ${vendor.closeTime || ''}`,
      textColor: '#22C55E', iconName: 'time'
    },
    vendor.averageRating && {
      id: 7, label: 'Rate',
      text: `${vendor.averageRating.toFixed(1)} rated`,
      textColor: '#D32F2F',
      iconImage: require('../../../assets/images/rate-icon.png'),
      action: () => router.push('/vendor/Rating&RevVen')
    },
  ].filter(Boolean);

  const vendorPosts = posts
    .filter((p) => vendorId && String(p.vendorId) === String(vendorId))
    .filter((p) => selectedCollectionId
      ? Array.isArray(p.collectionIds) && p.collectionIds.includes(selectedCollectionId)
      : true)
    .map((p) => ({
      id: p.id,
      vendorName: p.vendorShopName || vendor.shopName || 'User Name',
      location: p.location || '',
      description: p.description || '',
      vendorLogo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
      postImage: p.postImage ? { uri: p.postImage } : null,
      isLiked: p.isLiked,
      isSaved: p.isSaved,
      likeCount: p.likeCount,
      commentCount: p.commentCount,
    }));

  const bgImage = vendor.bannerImage ? { uri: vendor.bannerImage } : defaultBg;
  const profileImage = vendor.profileImage ? { uri: vendor.profileImage } : defaultLogo;

  if (loading && !selectedVendor) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8A1C27" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* --- HEADER SECTION --- */}
        <View style={styles.headerSection}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => setPreviewImage(bgImage)}>
            <Image source={bgImage} style={styles.coverImage} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#2D3E5E" />
          </TouchableOpacity>

          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => setPreviewImage(profileImage)}>
                <Image source={profileImage} style={styles.avatarImage} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtonsRow}>
              {!isOwnProfile && (
                <TouchableOpacity
                  style={[styles.actionBtn, isFollowing ? styles.followingBtn : styles.followBtn]}
                  onPress={handleFollowToggle}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.actionBtnText, isFollowing && styles.followingBtnText]}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={[styles.actionBtn, styles.messageBtn]} onPress={handleMessagePress} activeOpacity={0.8}>
                <Text style={styles.actionBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- IDENTITY CARD --- */}
        <View style={styles.identityCard}>
          <View style={styles.identityHeader}>
            <View>
              <Text style={styles.vendorTitle}>{vendor.shopName || 'User Name'}</Text>
              <View style={styles.locationTag}>
                <Ionicons name="location" size={14} color="#8391A1" />
                <Text style={styles.locationText}>{vendor.city || vendor.address || ''}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.miniRating} onPress={() => router.push('/vendor/Rating&RevVen')}>
              <Text style={styles.miniRatingVal}>{vendor.averageRating?.toFixed(1) || '0.0'}</Text>
              <View style={{ flexDirection: 'row' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Entypo key={i} name={(vendor.averageRating || 0) >= i ? "star" : "star-outlined"} size={14} color={(vendor.averageRating || 0) >= i ? "#8A1C27" : "#CBD5E1"} />
                ))}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.statsBar}>
            <TouchableOpacity onPress={() => router.push({ pathname: '/commonScreensV/FollowersListV', params: { vendorId } })} style={styles.statItem}>
              <Text style={styles.statNumber}>{followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{vendor.postCount || 0}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <TouchableOpacity onPress={() => router.push({ pathname: '/commonScreensV/FollowingListV', params: { vendorId } })} style={styles.statItem}>
              <Text style={styles.statNumber}>{vendor.followingCount || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.bioText}>{vendor.bio || ''}</Text>
        </View>

        {/* --- BUSINESS DETAILS SECTION --- */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Shop Details</Text>
          {DETAILS_LIST.map((item, index) => (
            <View key={item.id}>
              {/* Entire row wrapped in TouchableOpacity */}
              <TouchableOpacity
                style={styles.detailRow}
                onPress={item.action}
                activeOpacity={item.action ? 0.7 : 1}
                disabled={!item.action}
              >
                <View style={styles.iconCircle}>
                  {item.iconImage ? (
                    <Image source={item.iconImage} style={styles.iconImageStyle} />
                  ) : (
                    <Ionicons name={item.iconName} size={20} color="#5B7896" />
                  )}
                </View>
                <View style={styles.detailTextCol}>
                  <Text style={[styles.detailValue, item.textColor && { color: item.textColor }]} numberOfLines={2}>
                    {item.text}
                  </Text>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                </View>

                {/* Visual cue that the row is clickable */}
                {item.action && <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />}
              </TouchableOpacity>
              {index < DETAILS_LIST.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* --- CATEGORY PILLS (vendor's custom collections, read-only) --- */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            <TouchableOpacity
              style={[styles.pillTab, selectedCollectionId === null && styles.pillTabActive]}
              onPress={() => setSelectedCollectionId(null)}
            >
              <Text style={[styles.pillTabText, selectedCollectionId === null && styles.pillTabTextActive]}>All</Text>
            </TouchableOpacity>
            {collections.map((col) => {
              const isActive = selectedCollectionId === col.id;
              return (
                <TouchableOpacity
                  key={col.id}
                  style={[styles.pillTab, isActive && styles.pillTabActive]}
                  onPress={() => setSelectedCollectionId(isActive ? null : col.id)}
                >
                  <Text style={[styles.pillTabText, isActive && styles.pillTabTextActive]}>{col.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* --- POSTS FEED --- */}
        <View style={styles.feedWrapper}>
          {vendorPosts.map((post) => (
            <VendorPosts
              key={post.id}
              postId={post.id}
              vendorName={post.vendorName}
              location={post.location}
              description={post.description}
              vendorLogo={post.vendorLogo}
              postImage={post.postImage}
              initialLiked={post.isLiked}
              initialSaved={post.isSaved}
              likeCount={post.likeCount}
              commentCount={post.commentCount}
              onVendorPress={() => { }}
            />
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- IMAGE PREVIEW MODAL --- */}
      <Modal visible={!!previewImage} transparent={true} animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity style={styles.closeFullBtn} onPress={() => setPreviewImage(null)}>
            <Ionicons name="close-circle" size={44} color="white" />
          </TouchableOpacity>
          {previewImage && <Image source={typeof previewImage === 'string' ? { uri: previewImage } : previewImage} style={styles.fullImage} resizeMode="contain" />}
        </View>
      </Modal>

      <View style={styles.footerWrapper}>
        <BottomTabsVen />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#BFCEDC' }, // UI Polish: Matched Vendor Theme
  scrollContent: { paddingBottom: 0 },

  // Header & Profile Layout Updates
  headerSection: { marginBottom: 15 },
  coverImage: { width: '100%', height: 180 },
  backBtn: {
    position: 'absolute', top: 50, left: 20, zIndex: 10,
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3
  },

  profileHeaderContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  avatarWrapper: {
    marginTop: -50,
    padding: 4, backgroundColor: '#FFFFFF', borderRadius: 55, elevation: 5,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F4F9' },

  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: 15
  },
  actionBtn: {
    height: 44, paddingHorizontal: 22, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginLeft: 10
  },
  followBtn: { backgroundColor: '#8A1C27' },
  followingBtn: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#8A1C27' },
  messageBtn: { backgroundColor: '#2D3E5E' },
  actionBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  followingBtnText: { color: '#8A1C27' },

  // Identity Card
  identityCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 25,
    padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8
  },
  identityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  vendorTitle: { fontSize: 26, fontWeight: '800', color: '#2D3E5E' },
  locationTag: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: 13, color: '#8391A1', marginLeft: 4, fontWeight: '600' },
  miniRating: { alignItems: 'flex-end' },
  miniRatingVal: { fontSize: 16, fontWeight: '800', color: '#2D3E5E' },
  starsImg: { width: 70, height: 14, resizeMode: 'contain', marginTop: 2 },

  statsBar: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F4F9', marginBottom: 15
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '800', color: '#2D3E5E' },
  statLabel: { fontSize: 11, color: '#8391A1', textTransform: 'uppercase', fontWeight: '700', marginTop: 2 },
  statDivider: { width: 1, height: 25, backgroundColor: '#E2E8F0' },
  bioText: { fontSize: 14, color: '#4A5568', lineHeight: 22, fontWeight: '500' },

  // Business Details
  sectionCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 25,
    padding: 20, marginTop: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05
  },
  sectionTitle: {
    backgroundColor: '#FDF2F3', color: '#8A1C27', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start',
    fontSize: 13, fontWeight: '800', marginBottom: 15, overflow: 'hidden'
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconCircle: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#F1F4F9',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  iconImageStyle: { width: 20, height: 20, resizeMode: 'contain' },
  detailTextCol: { flex: 1 },
  detailValue: { fontSize: 14, fontWeight: '800', color: '#2D3E5E', marginBottom: 3 },
  detailLabel: { fontSize: 11, color: '#8391A1', fontWeight: '600', textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: '#F1F4F9', marginLeft: 57 },

  // Tabs & Feed (UPDATED MARGINS FOR MORE BREATHING ROOM)
  tabsContainer: { marginTop: 35, marginBottom: 30 },

  pillTab: {
    paddingVertical: 10, paddingHorizontal: 24, borderRadius: 25,
    backgroundColor: '#E2E8F0', marginRight: 12
  },
  pillTabActive: {
    backgroundColor: '#FFFFFF', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3
  },
  pillTabText: { fontSize: 14, fontWeight: '600', color: '#8391A1' },
  pillTabTextActive: { color: '#8A1C27', fontWeight: '800' },

  feedWrapper: { paddingHorizontal: 20 },
  footerWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 },

  // Fullscreen
  fullScreenOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  closeFullBtn: { position: 'absolute', top: 50, right: 20, zIndex: 100 },
  fullImage: { width: width, height: height * 0.8 },
});

export default OtherVendorProfileScreen;