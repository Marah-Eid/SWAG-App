import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, StatusBar, LayoutAnimation, Platform, UIManager, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

// 1. Vendor-specific components from commonV
import VendorSearchBar from '../commonV/VendorSearchBar';
import VendorCard from '../commonV/VendorCard';
import FollowingShopsV from '../commonV/FollowingShopsV';
import VendorPosts from '../commonV/VendorPosts';
import BottomTabsVen from '../commonV/BottomTabsVen';
import SideMenuV from '../commonV/SideMenuV';

import { fetchMyFollowing, unfollowVendor } from '../../store/slices/vendorSlice';
import { fetchPosts } from '../../store/slices/postsSlice';

// Enable smooth Layout Animations for Android when cards disappear
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const defaultLogo = require('../../../assets/images/default-user-pfp.png');
const defaultBg = require('../../../assets/images/default-banner.png');

const FollowingVenScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isMenuVisible, setMenuVisible] = useState(false);

  const { myFollowing: following, myProfile } = useSelector((state) => state.vendor);
  const { posts } = useSelector((state) => state.posts);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMyFollowing());
      dispatch(fetchPosts());
    }, [dispatch])
  );

  const handleUnfollow = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(unfollowVendor(id));
  };

  const followedIds = following.map((v) => String(v.id));

  const visibleShops = following.map((v) => ({
    id: v.id,
    name: v.shopName || v.fullName || 'User Name',
    sub: v.phone ? `${v.phone} / ${v.city || ''}` : (v.city || ''),
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
      location: p.location || '',
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

      {/* FIXED HEADER */}
      <View style={styles.fixedHeader}>
        <VendorSearchBar onMenuPress={() => setMenuVisible(true)} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* VENDOR IDENTITY CARD */}
        <View style={styles.cardWrapper}>
          <VendorCard
            shopName={myProfile?.shopName || 'User Name'}
            rating={myProfile?.averageRating?.toFixed(1) || '0.0'}
            logo={myProfile?.profileImage ? { uri: myProfile.profileImage } : defaultLogo}
          />
        </View>

        {/* HORIZONTAL FOLLOWED SHOPS HIGHLIGHT */}
        {visibleShops.length > 0 && (
          <FollowingShopsV shopsData={visibleShops} onUnfollow={handleUnfollow} />
        )}

        {/* VERTICAL POST FEED */}
        <View style={styles.feedContainer}>
          {visiblePosts.map(post => (
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
              onVendorPress={() => router.push({
                pathname: '/commonScreensV/otherVendorProfile',
                params: { vendorId: post.vendorId }
              })}
            />
          ))}

          {/* Fallback if user unfollows everyone */}
          {visiblePosts.length === 0 && (
            <Text style={styles.emptyFeedText}>No recent posts from vendors you follow.</Text>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FIXED FOOTER */}
      <View style={styles.bottomTabsWrapper}>
        <BottomTabsVen />
      </View>

      {/* SIDE MENU */}
      <SideMenuV
        visible={isMenuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#BFCEDC' },
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

export default FollowingVenScreen;
