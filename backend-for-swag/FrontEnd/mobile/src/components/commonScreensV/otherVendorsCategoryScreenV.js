import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

// 1. IMPORTED VendorPosts
import VendorPosts from '../commonV/VendorPosts';
import BottomTabsVen from '../commonV/BottomTabsVen';
import { fetchPosts } from '../../store/slices/postsSlice';

const { width } = Dimensions.get('window');

const defaultLogo = require('../../../assets/images/nmk-icon.png');
const defaultBg = require('../../../assets/images/nmk-pic.png');

const CATEGORY_KEYWORDS = {
  'Part Posts': ['car-parts', 'carparts', 'parts', 'exhaust', 'tires', 'wheels', 'glass'],
  'Events': ['event', 'events'],
  'Services': ['maintenance', 'service', 'carwash', 'car wash', 'gas station', 'tuning'],
  'Reviews': ['review', 'reviews'],
};

const CATEGORY_DESCRIPTIONS = {
  'Part Posts': 'Find the best genuine and aftermarket parts for your vehicle engine, body, and more.',
  'Events': 'Join the latest automotive gatherings, drift championships, and car meets in Jordan.',
  'Services': 'Expert maintenance, tuning, and repair services for all car models.',
  'Reviews': 'See what our customers are saying about our top-rated vendors.',
};

const CATEGORIES = ['Part Posts', 'Events', 'Services', 'Reviews'];

const OtherVendorsCategoryScreenV = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useLocalSearchParams();

  const passedCategory = params.category;
  const vendorId = params.vendorId;

  const { posts } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const allCategoryNames = passedCategory && !CATEGORIES.includes(passedCategory)
    ? [...CATEGORIES, passedCategory]
    : CATEGORIES;

  const [activeTab, setActiveTab] = useState(passedCategory || allCategoryNames[0]);

  // Filter posts by vendorId if provided, otherwise show all
  const vendorPosts = vendorId
    ? posts.filter((p) => String(p.vendorId) === String(vendorId))
    : posts;

  const keywords = CATEGORY_KEYWORDS[activeTab] || [activeTab.toLowerCase()];
  const filteredPosts = vendorPosts.filter((p) => {
    if (activeTab === 'Events') return p.type === 'event';
    const desc = (p.description || '').toLowerCase();
    return keywords.some((k) => desc.includes(k));
  });

  const currentPosts = filteredPosts.map((p) => ({
    id: p.id,
    vendorId: p.vendorId,
    vendorName: p.vendorShopName || '',
    location: p.location || '',
    description: p.description || '',
    vendorLogo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
    postImage: p.postImage ? { uri: p.postImage } : defaultBg,
  }));

  const currentDescription = CATEGORY_DESCRIPTIONS[activeTab] || `Posts tagged under ${activeTab}.`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color="#2D3E5E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={{ width: 44 }} /> {/* Spacer for perfect centering */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* --- SCROLLABLE CATEGORY BAR --- */}
        <View style={styles.tabBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {allCategoryNames.map((cat) => {
              const isActive = activeTab === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                  onPress={() => setActiveTab(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* --- DYNAMIC CATEGORY CARD --- */}
        <View style={styles.cardWrapper}>
          <View style={styles.infoCard}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{activeTab}</Text>
              <Text style={styles.cardDesc} numberOfLines={3}>
                {currentDescription}
              </Text>
            </View>
            <Text style={styles.postCount}>{currentPosts.length} posts</Text>
          </View>
        </View>

        {/* --- POSTS FEED --- */}
        <View style={styles.feedContainer}>
          {currentPosts.map((post) => (
            <VendorPosts
              key={post.id}
              vendorName={post.vendorName}
              location={post.location}
              description={post.description}
              vendorLogo={post.vendorLogo}
              postImage={post.postImage}
              onVendorPress={() => router.push({
                pathname: '/commonScreensV/otherVendorProfile',
                params: { vendorId: post.vendorId }
              })}
            />
          ))}

          {/* Fallback if no posts */}
          {currentPosts.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={48} color="#CBD5E1" />
              <Text style={styles.noPostsText}>No posts available in this category yet.</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* BOTTOM TABS */}
      <View style={styles.bottomTabsWrapper}>
        <BottomTabsVen />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F9' }, // Premium Off-White

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3E5E', // Brand Navy
    letterSpacing: 0.5
  },

  scrollContent: {
    paddingTop: 5,
    paddingBottom: 120 // Prevents content from hiding under bottom tabs
  },

  // Tab Bar
  tabBarContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 25, // Fully rounded pill
    backgroundColor: '#E2E8F0', // Soft Gray
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8391A1', // Inactive text color
  },
  tabTextActive: {
    color: '#2D3E5E', // Active text color
    fontWeight: '800',
  },

  // Info Card
  cardWrapper: {
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Global Card radius
    padding: 20,
    marginBottom: 25,
    minHeight: 110,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // Drop shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3E5E',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 20,
    fontWeight: '500',
  },
  postCount: {
    backgroundColor: '#FDF2F3', // Light Red tint
    color: '#8A1C27', // Brand Red
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: '800',
    fontSize: 12,
    overflow: 'hidden',
  },

  // Feed
  feedContainer: {
    paddingHorizontal: 20
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  noPostsText: {
    textAlign: 'center',
    color: '#8391A1',
    marginTop: 15,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },

  // Tabs
  bottomTabsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 15,
  },
});

export default OtherVendorsCategoryScreenV;