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
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import BottomTabs from '../common/BottomTabs';
import CustomerPosts from '../common/CustomerPosts';
import { fetchVendorById } from '../../store/slices/vendorSlice';
import { fetchPosts } from '../../store/slices/postsSlice';
import { followVendor, unfollowVendor } from '../../store/slices/customerSlice';
import vendorAPI from '../../api/vendorAPI';

const { width, height } = Dimensions.get('window');

const defaultBg = require('../../../assets/images/default-banner.png');
const defaultLogo = require('../../../assets/images/default-user-pfp.png');

const VendorProfScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { vendorId } = useLocalSearchParams();

  const { selectedVendor, loading } = useSelector((state) => state.vendor);
  const { posts } = useSelector((state) => state.posts);

  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

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

  useEffect(() => {
    if (selectedVendor) {
      setIsFollowing(selectedVendor.isFollowed || false);
      setFollowersCount(selectedVendor.followerCount || 0);
    }
  }, [selectedVendor]);

  const handleFollowToggle = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
      dispatch(unfollowVendor(vendorId));
    } else {
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      dispatch(followVendor(vendorId));
    }
  };

  const handleMessagePress = () => {
    router.push({
      pathname: '/commonScreens/Chatting',
      params: {
        userName: selectedVendor?.shopName || 'User Name',
        userType: 'vendor',
        otherUserId: vendorId,
        userImage: selectedVendor?.profileImage || '',
      }
    });
  };

  const openMap = (addressText) => {
    // Prefer pinned coordinates if available
    if (v.locationLat && v.locationLng) {
      const lat = v.locationLat;
      const lng = v.locationLng;
      const nativeUrl = `geo:${lat},${lng}?q=${lat},${lng}`;
      const webUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      Linking.canOpenURL(nativeUrl)
        .then((supported) => Linking.openURL(supported ? nativeUrl : webUrl))
        .catch(() => Linking.openURL(webUrl));
      return;
    }
    // Fall back to location URL
    if (v.locationUrl) {
      const url = v.locationUrl;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        Linking.openURL(url).catch(() => {});
        return;
      }
    }
    // Fall back to address text
    if (!addressText) return;
    const query = encodeURIComponent(addressText.replace(/\n/g, ' '));
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
  };

  const openLink = (url) => {
    if (!url) return;
    const full = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(full).catch(() => {});
  };

  const v = selectedVendor || {};
  const workHours = v.openTime && v.closeTime ? `${v.openTime} - ${v.closeTime}` : null;

  const hasCoords = !!(v.locationLat && v.locationLng);
  const locationText = v.address || (hasCoords ? 'View pinned location on map' : null);

  const DETAILS_LIST = [
    locationText && {
      id: 1, label: 'Address',
      text: locationText,
      textColor: !v.address && hasCoords ? '#2D7DD2' : undefined,
      iconImage: require('../../../assets/images/locationVendor-icon.png'),
      action: () => openMap(v.address)
    },
    v.phone && {
      id: 2, label: 'Mobile', text: v.phone,
      iconImage: require('../../../assets/images/phone-icon.png'),
      action: () => Linking.openURL(`tel:${v.phone}`)
    },
    v.email && {
      id: 3, label: 'Email', text: v.email,
      iconName: 'mail',
      action: () => Linking.openURL(`mailto:${v.email}`)
    },
    v.whatsapp && {
      id: 4, label: 'WhatsApp', text: v.whatsapp,
      iconImage: require('../../../assets/images/whatsapp-icon.png'),
      action: () => Linking.openURL(`https://wa.me/${v.whatsapp.replace(/\D/g, '')}`)
    },
    v.instagramUrl && {
      id: 5, label: 'Confirmed link', text: v.instagramUrl,
      iconImage: require('../../../assets/images/insta-icon.png'),
      action: () => openLink(v.instagramUrl)
    },
    workHours && {
      id: 6, label: 'Work hours', text: workHours, textColor: '#22C55E', iconName: 'time'
    },
    v.status === 'active' && {
      id: 7, label: 'Rate',
      text: `${v.averageRating?.toFixed(1) || '0.0'} rated ( ${v.reviewCount || 0} Reviews )`,
      textColor: '#D32F2F',
      iconImage: require('../../../assets/images/rate-icon.png'),
      action: () => router.push({ pathname: '/customer/Rating&RevCust', params: { vendorId } })
    },
  ].filter(Boolean);

  const allVendorPosts = posts.filter((p) => !vendorId || String(p.vendorId) === String(vendorId));

  const vendorPosts = selectedCollectionId
    ? allVendorPosts.filter((p) => Array.isArray(p.collectionIds) && p.collectionIds.includes(selectedCollectionId))
    : allVendorPosts;

  if (loading && !selectedVendor) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#5B7896" />
      </SafeAreaView>
    );
  }

  const bgSource = v.bannerImage ? { uri: v.bannerImage } : defaultBg;
  const logoSource = v.profileImage ? { uri: v.profileImage } : defaultLogo;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* --- COVER & PROFILE SECTION --- */}
        <View style={styles.headerSection}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => setPreviewImage(bgSource)}>
            <Image source={bgSource} style={styles.coverImage} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* FIXED LAYOUT: Avatar overlaps, Buttons stay clear of the cover border */}
          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => setPreviewImage(logoSource)}>
                <Image source={logoSource} style={styles.avatarImage} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, isFollowing ? styles.followingBtn : styles.followBtn]}
                onPress={handleFollowToggle}
                activeOpacity={0.8}
              >
                <Text style={[styles.actionBtnText, isFollowing && styles.followingBtnText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>

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
              <Text style={styles.vendorTitle}>{v.shopName || v.fullName || 'User Name'}</Text>
              <View style={styles.locationTag}>
                <Ionicons name="location" size={14} color="#8391A1" />
                <Text style={styles.locationText}>{v.city || ''}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.miniRating} onPress={() => router.push({ pathname: '/customer/Rating&RevCust', params: { vendorId } })}>
              <Text style={styles.miniRatingVal}>{v.averageRating?.toFixed(1) || '0.0'}</Text>
              <View style={{ flexDirection: 'row' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Entypo key={i} name={(v.averageRating || 0) >= i ? "star" : "star-outlined"} size={14} color={(v.averageRating || 0) >= i ? "#8A1C27" : "#CBD5E1"} />
                ))}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.statsBar}>
            <TouchableOpacity onPress={() => router.push({ pathname: '/commonScreens/FollowersList', params: { vendorId } })} style={styles.statItem}>
              <Text style={styles.statNumber}>{followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{v.postCount || 0}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>

          <Text style={styles.bioText}>{v.bio || ''}</Text>
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

        {/* --- CATEGORY TABS (vendor's custom collections, read-only) --- */}
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
            <CustomerPosts
              key={post.id}
              postId={post.id}
              vendorName={post.vendorShopName || v.shopName}
              location={post.location || v.city || ''}
              description={post.description}
              vendorLogo={post.vendorProfileImage ? { uri: post.vendorProfileImage } : logoSource}
              postImage={post.postImage ? { uri: post.postImage } : null}
              mediaType={post.mediaType}
              mediaWidth={post.mediaWidth}
              mediaHeight={post.mediaHeight}
              initialLiked={post.isLiked}
              initialSaved={post.isSaved}
              likeCount={post.likeCount}
              commentCount={post.commentCount}
              isEvent={post.type === 'event'}
              date={post.eventDate}
              time={post.eventTime}
              onVendorPress={() => {}}
            />
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- IMAGE MODAL --- */}
      <Modal visible={!!previewImage} transparent={true} animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity style={styles.closeFullBtn} onPress={() => setPreviewImage(null)}>
            <Ionicons name="close-circle" size={44} color="white" />
          </TouchableOpacity>
          {previewImage && (
            <Image
              source={typeof previewImage === 'string' ? { uri: previewImage } : previewImage}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* FOOTER */}
      <View style={styles.footerWrapper}>
        <BottomTabs />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#AFC6D8' },
  scrollContent: { paddingBottom: 0 },

  // Header & Profile Layout Updates
  headerSection: { marginBottom: 15 },
  coverImage: { width: '100%', height: 180 },
  backBtn: {
    position: 'absolute', top: 50, left: 20, zIndex: 10,
    backgroundColor: 'rgba(45, 62, 94, 0.5)', borderRadius: 25, width: 44, height: 44,
    justifyContent: 'center', alignItems: 'center'
  },

  // Flex layout for the avatar and buttons
  profileHeaderContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  avatarWrapper: {
    marginTop: -50, // Pulls the avatar UP to overlap the cover image perfectly
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

export default VendorProfScreen;