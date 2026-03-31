import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

// 1. IMPORT VENDOR COMPONENTS
import VendorSearchBar from '../commonV/VendorSearchBar';
import TopCategoryBarV from '../commonV/TopCategoryBarV';
import SuggestedCarouselV from '../commonV/SuggestedCarouselV';
import VendorPosts from '../commonV/VendorPosts';
import BottomTabsVen from '../commonV/BottomTabsVen';
import { fetchVendors } from '../../store/slices/vendorSlice';
import { fetchPosts } from '../../store/slices/postsSlice';

const defaultLogo = require('../../../assets/images/carshop-icon.png');
const defaultBg = require('../../../assets/images/Euleback-photo.png');

// Maps category prop key → keywords to match in post description
const CATEGORY_KEYWORDS = {
  CarParts: ['car-parts', 'carparts', 'parts'],
  Exhaust: ['exhaust'],
  Glass: ['glass', 'tint', 'windshield'],
  WheelsTires: ['wheels', 'tires', 'tyre', 'rims'],
  Tuning: ['tuning', 'tune', 'ecu'],
  Accessories: ['accessories', 'accessory'],
  PaintBody: ['paint', 'body', 'dent'],
  Upholstery: ['interior', 'upholstery', 'leather'],
  Maintenance: ['maintenance', 'service', 'oil'],
  CarWash: ['car wash', 'carwash', 'detailing'],
  GasStation: ['gas', 'fuel', 'station'],
  Rental: ['rental', 'rent'],
  Agencies: ['agency', 'agencies', 'official dealer'],
  Dealerships: ['dealership', 'used cars', 'new cars'],
};

// ====================================================
// 2. THE REUSABLE SCREEN COMPONENT
// ====================================================
const CategoryFeedScreenV = ({ category }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { vendors } = useSelector((state) => state.vendor);
  const { posts } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchVendors());
    dispatch(fetchPosts());
  }, [dispatch]);

  const keywords = CATEGORY_KEYWORDS[category] || [];

  const filteredPosts = posts.filter((p) => {
    const desc = (p.description || '').toLowerCase();
    return keywords.some((k) => desc.includes(k));
  });

  const suggestions = vendors.slice(0, 6).map((v) => ({
    id: v.id,
    name: v.shopName || '',
    sub: v.city || '',
    bio: v.bio || '',
    logo: v.profileImage ? { uri: v.profileImage } : defaultLogo,
    bgImage: v.bannerImage ? { uri: v.bannerImage } : defaultBg,
  }));

  const screenPosts = filteredPosts.map((p) => ({
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

      {/* Floating Search Bar */}
      <View style={styles.searchWrapper}>
        <VendorSearchBar />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Top Category Nav */}
        <TopCategoryBarV activeCategory={category} />

        {/* Dynamic Category Suggestions */}
        <SuggestedCarouselV data={suggestions} />

        {/* Dynamic Category Posts */}
        <View style={styles.feedContainer}>
          {screenPosts.map((post) => (
            <VendorPosts
              key={post.id}
              vendorName={post.vendorName}
              vendorLogo={post.vendorLogo}
              location={post.location}
              description={post.description}
              postImage={post.postImage}
              onVendorPress={() => router.push({ pathname: '/vendor/otherVendorProfileScreen', params: { vendorId: post.vendorId } })}
            />
          ))}

          {/* Fallback if no posts exist */}
          {screenPosts.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No posts yet for {category}.</Text>
              <Text style={styles.emptySubText}>Check back soon!</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.bottomTabsWrapper}>
        <BottomTabsVen />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f1f1' // UI Polish: Premium off-white
  },
  searchWrapper: {
    paddingTop: 10,
    zIndex: 10,
  },
  scroll: {
    paddingBottom: 120, // UI Polish: Prevents last post from hiding under tabs
    paddingTop: 5,
  },
  feedContainer: {
    paddingHorizontal: 20, // UI Polish: Prevents cards from touching edges
    marginTop: 5,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#8391A1',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  emptySubText: {
    color: '#A0AEC0',
    fontSize: 14,
    fontStyle: 'italic',
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

export default CategoryFeedScreenV;