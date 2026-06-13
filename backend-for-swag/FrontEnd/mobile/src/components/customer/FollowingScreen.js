import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import CustomSearchBar from '../common/CustomSearchBar';
import CustomerCard from '../common/CustomerCard';
import FollowingShops from '../common/FollowingShops';
import CustomerPosts from '../common/CustomerPosts';
import BottomTabs from '../common/BottomTabs';
import SideMenu from '../common/SideMenu';
import { fetchFollowing, unfollowVendor } from '../../store/slices/customerSlice';
import { fetchPosts } from '../../store/slices/postsSlice';

const defaultLogo = require('../../../assets/images/default-user-pfp.png');
const defaultBg = require('../../../assets/images/default-banner.png');

// Enable smooth Layout Animations for Android when cards disappear
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FollowingScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isMenuVisible, setMenuVisible] = useState(false);

  const { following, profile } = useSelector((state) => state.customer);
  const { posts } = useSelector((state) => state.posts);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchFollowing());
      dispatch(fetchPosts());
    }, [dispatch])
  );

  const handleUnfollow = (vendorId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(unfollowVendor(vendorId));
  };

  const followedIds = following.map((v) => String(v.id));

  const visibleShops = following.map((v) => ({
    id: v.id,
    name: v.shopName || v.fullName || 'User Name',
    sub: v.city ? `${v.city}` : '',
    bio: v.bio || '',
    logo: v.profileImage ? { uri: v.profileImage } : defaultLogo,
    bgImage: v.bannerImage ? { uri: v.bannerImage } : defaultBg,
  }));

  const visiblePosts = posts
    .filter((p) => followedIds.includes(String(p.vendorId)))
    .map((p) => ({
      id: p.id,
      vendorId: p.vendorId,
      vendorName: p.vendorShopName || 'User Name',
      location: p.location || p.vendorCity || '',
      description: p.description || '',
      vendorLogo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
      postImage: p.postImage ? { uri: p.postImage } : null,
      isLiked: p.isLiked,
      isSaved: p.isSaved,
      likeCount: p.likeCount,
      commentCount: p.commentCount,
    }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.fixedHeader}>
        <CustomSearchBar onMenuPress={() => setMenuVisible(true)} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* USER CARD */}
        <View style={styles.cardWrapper}>
          <CustomerCard
            name={profile?.fullName || 'User'}
            phone={profile?.phone || profile?.email || ''}
            location={profile?.city || ''}
            profileImage={profile?.profileImage ? { uri: profile.profileImage } : require('../../../assets/images/default-user-pfp.png')}
            onProfilePress={() => router.push('/customer/ProfileCust')}
            onCarPress={() => router.push('/customer/ProfileCust')}
          />
        </View>

        {/* HORIZONTAL SHOPS HIGHLIGHT */}
        {visibleShops.length > 0 && (
          <FollowingShops shopsData={visibleShops} onUnfollow={handleUnfollow} />
        )}

        {/* VERTICAL POST FEED */}
        <View style={styles.feedContainer}>
          {visiblePosts.map(post => (
            <CustomerPosts
              key={post.id}
              postId={post.id}
                vendorId={post.vendorId}
              vendorName={post.vendorName}
              location={post.location || post.vendorCity || ''}
              description={post.description}
              vendorLogo={post.vendorLogo}
              postImage={post.postImage}
              initialLiked={post.isLiked}
              initialSaved={post.isSaved}
              likeCount={post.likeCount}
              commentCount={post.commentCount}
              onVendorPress={() => router.push({ pathname: '/customer/VendorProfCust', params: { vendorId: post.vendorId } })}
            />
          ))}

          {/* Fallback if user unfollows everyone */}
          {visiblePosts.length === 0 && (
            <Text style={styles.emptyFeedText}>No recent posts from vendors you follow.</Text>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.bottomTabsWrapper}>
        <BottomTabs />
      </View>

      {/* SIDE MENU */}
      <SideMenu
        visible={isMenuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#AFC6D8' },
  fixedHeader: {
    paddingTop: 10,
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: 5
  },
  cardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  feedContainer: {
    paddingHorizontal: 20,
    marginTop: 10
  },
  emptyFeedText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#5B7896',
    fontWeight: '700',
    fontSize: 16
  },
  bottomTabsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100
  }
});

export default FollowingScreen;