import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import VendorSearchBar from '../commonV/VendorSearchBar';
import BottomTabsVen from '../commonV/BottomTabsVen';
import SuggestedCarouselV from '../commonV/SuggestedCarouselV';
import VendorPosts from '../commonV/VendorPosts';
import TopCategoryBarV from '../commonV/TopCategoryBarV';

import { fetchVendors } from '../../store/slices/vendorSlice';
import { fetchPosts } from '../../store/slices/postsSlice';

const defaultLogo = require('../../../assets/images/nmk-icon.png');
const defaultBg = require('../../../assets/images/theshop-photo.png');

const ExploreVenScreen = () => {
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
    name: v.shopName || '',
    sub: v.city || '',
    bio: v.bio || '',
    logo: v.profileImage ? { uri: v.profileImage } : defaultLogo,
    bgImage: v.bannerImage ? { uri: v.bannerImage } : defaultBg,
  }));

  const explorePosts = posts.slice(0, 10).map((p) => ({
    id: p.id,
    vendorId: p.vendorId,
    vendorName: p.vendorShopName || '',
    location: p.location || '',
    description: p.description || '',
    vendorLogo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
    postImage: p.postImage ? { uri: p.postImage } : defaultBg,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* SEARCH BAR (Fixed at top) */}
      <View style={styles.fixedHeader}>
        <VendorSearchBar />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: Category Bar */}
        <View style={styles.section}>
          <TopCategoryBarV showAdd={false} />
        </View>

        {/* SECTION 2: Trending Carousel */}
        <View style={styles.section}>
          <SuggestedCarouselV data={trendingShops} />
        </View>

        {/* SECTION 3: Explore Feed */}
        <View style={[styles.section, { paddingHorizontal: 20 }]}>
          {explorePosts.map((post) => (
            <View key={post.id} style={styles.postSpacing}>
              <VendorPosts
                vendorName={post.vendorName}
                vendorLogo={post.vendorLogo}
                location={post.location}
                description={post.description}
                postImage={post.postImage}
                onVendorPress={() => router.push({
                  pathname: '/commonScreensV/otherVendorProfile',
                  params: { vendorId: post.vendorId }
                })}
              />
            </View>
          ))}
        </View>

        {/* Padding for bottom tabs */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.bottomTabsWrapper}>
        <BottomTabsVen />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BFCEDC'
  },
  fixedHeader: {
    backgroundColor: '#BFCEDC',
    paddingTop: 5,
    paddingBottom: 5,
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: 10,
  },
  section: {
    marginBottom: 25,
  },
  postSpacing: {
    marginBottom: 20,
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

export default ExploreVenScreen;
