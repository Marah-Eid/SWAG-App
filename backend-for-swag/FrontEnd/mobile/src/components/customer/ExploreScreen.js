import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import CustomSearchBar from '../common/CustomSearchBar';
import BottomTabs from '../common/BottomTabs';
import SuggestedCarousel from '../common/SuggestedCarousel';
import CustomerPosts from '../common/CustomerPosts';
import TopCategoryBar from '../common/TopCategoryBar';
import { fetchVendors } from '../../store/slices/vendorSlice';
import { fetchPosts } from '../../store/slices/postsSlice';
import { followVendor, unfollowVendor } from '../../store/slices/customerSlice';

const defaultLogo = require('../../../assets/images/default-user-pfp.png');
const defaultBg = require('../../../assets/images/default-banner.png');

const ExploreScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { vendors } = useSelector((state) => state.vendor);
  const { posts } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchVendors());
    dispatch(fetchPosts());
  }, [dispatch]);

  const trendingShops = vendors.slice(0, 6).map((v) => ({
    id: v.id,
    name: v.shopName,
    sub: `${v.city || ''} - ${v.shopType || ''}`,
    bio: v.bio || '',
    logo: v.profileImage ? { uri: v.profileImage } : defaultLogo,
    bgImage: v.bannerImage ? { uri: v.bannerImage } : defaultBg,
    isFollowed: v.isFollowed || false,
  }));

  const handleFollow = (vendorId, shouldFollow) => {
    if (shouldFollow) {
      dispatch(followVendor(vendorId));
    } else {
      dispatch(unfollowVendor(vendorId));
    }
  };

  const explorePosts = posts.map((p) => ({
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

      {/* SEARCH BAR (Fixed at top) */}
      <View style={styles.fixedHeader}>
        <CustomSearchBar />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: Category Bar (Now Scrolls) */}
        <View style={styles.section}>
          <TopCategoryBar />
        </View>

        {/* SECTION 2: Trending Carousel */}
        <View style={styles.section}>

          <SuggestedCarousel data={trendingShops} onFollow={handleFollow} />
        </View>

        {/* SECTION 3: Explore Feed */}
        <View style={[styles.section, { paddingHorizontal: 20 }]}>

          {explorePosts.map((post) => (
            <View key={post.id} style={styles.postSpacing}>
              <CustomerPosts
                postId={post.id}
                vendorId={post.vendorId}
                vendorName={post.vendorName}
                vendorLogo={post.vendorLogo}
                location={post.location || post.vendorCity || ''}
                description={post.description}
                postImage={post.postImage}
                initialLiked={post.isLiked}
                initialSaved={post.isSaved}
                likeCount={post.likeCount}
                commentCount={post.commentCount}
                onVendorPress={() => router.push({ pathname: '/customer/VendorProfCust', params: { vendorId: post.vendorId } })}
              />
            </View>
          ))}
        </View>

        {/* Spacing for bottom tabs */}
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomTabsWrapper}>
        <BottomTabs />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AFC6D8'
  },
  fixedHeader: {
    backgroundColor: '#AFC6D8',
    paddingTop: 5,
    paddingBottom: 5,
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: 10,
  },
  section: {
    marginBottom: 25, // Uniform gap between components
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionHeaderNoPadding: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D3E5E',
  },
  postSpacing: {
    marginBottom: 20, // Gap between posts
  },
  bottomTabsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 15,
    zIndex: 100,
  }
});

export default ExploreScreen;