import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import VendorPosts from '../commonV/VendorPosts';
import BottomTabsVen from '../commonV/BottomTabsVen';
import { fetchPosts } from '../../store/slices/postsSlice';
import { fetchMyVendorCategories } from '../../store/slices/vendorSlice';

const { width } = Dimensions.get('window');

const defaultLogo = require('../../../assets/images/carag-icon.png');
const defaultBg = require('../../../assets/images/nmk-pic.png');

const CATEGORY_KEYWORDS = {
  'Part Posts': ['car-parts', 'carparts', 'parts', 'exhaust', 'tires', 'wheels', 'glass'],
  'Events': ['event', 'events'],
  'Services': ['maintenance', 'service', 'carwash', 'car wash', 'gas station', 'tuning'],
  'Reviews': ['review', 'reviews'],
};

const CATEGORY_DESCRIPTIONS = {
  'Part Posts': 'Find the best genuine and aftermarket parts for your vehicle engine, body, and more.',
  'Events': 'Official automotive gatherings, drift championships, and car meets hosted by your shop.',
  'Services': 'Expert maintenance, high-precision tuning, and professional repair service logs.',
  'Reviews': 'Customer feedback and testimonials regarding your shop performance.',
};

const VendorsCategoryVen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useLocalSearchParams();

  const passedCategory = params.category;
  const passedDescription = params.description;

  const { myProfile, myCategories } = useSelector((state) => state.vendor);
  const { posts: reduxPosts } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts());
    dispatch(fetchMyVendorCategories());
  }, [dispatch]);

  // Build category list from vendor's registered categories + defaults
  const builtInCategories = ['Part Posts', 'Events', 'Services', 'Reviews'];
  const apiCategories = myCategories.map((c) => c.name || c.categoryName || c).filter(Boolean);
  const allCategoryNames = [...new Set([...builtInCategories, ...apiCategories])];

  // Inject passed category if it's new
  if (passedCategory && !allCategoryNames.includes(passedCategory)) {
    allCategoryNames.push(passedCategory);
  }

  const [activeTab, setActiveTab] = useState(passedCategory || allCategoryNames[0]);

  // Filter own posts for the active category
  const myVendorPosts = reduxPosts.filter(
    (p) => myProfile && String(p.vendorId) === String(myProfile.id)
  );

  const keywords = CATEGORY_KEYWORDS[activeTab] || [activeTab.toLowerCase()];
  const filteredPosts = myVendorPosts.filter((p) => {
    if (activeTab === 'Events') return p.type === 'event';
    const desc = (p.description || '').toLowerCase();
    return keywords.some((k) => desc.includes(k));
  });

  const currentPosts = filteredPosts.map((p) => ({
    id: p.id,
    vendorId: p.vendorId,
    vendorName: p.vendorShopName || myProfile?.shopName || '',
    location: p.location || '',
    description: p.description || '',
    vendorLogo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
    postImage: p.postImage ? { uri: p.postImage } : defaultBg,
    isLiked: p.isLiked,
    isSaved: p.isSaved,
    likeCount: p.likeCount,
    commentCount: p.commentCount,
  }));

  const currentDescription = CATEGORY_DESCRIPTIONS[activeTab]
    || (activeTab === passedCategory && passedDescription)
    || `Posts tagged under ${activeTab}.`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color="#2D3E5E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Category Manager</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HORIZONTAL PILL BAR */}
        <View style={styles.pillBarContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {allCategoryNames.map((cat) => {
              const isActive = activeTab === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.pillItem, isActive && styles.pillItemActive]}
                  onPress={() => setActiveTab(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* DYNAMIC INFO MODULE */}
        <View style={styles.infoModule}>
          <View style={styles.accentBar} />
          <View style={styles.moduleBody}>
            <View style={styles.moduleHeaderRow}>
              <Text style={styles.moduleTitle}>{activeTab}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{currentPosts.length} posts</Text>
              </View>
            </View>
            <Text style={styles.moduleDesc}>{currentDescription}</Text>
          </View>
        </View>

        {/* FEED AREA */}
        <View style={styles.feedWrapper}>
          {currentPosts.length > 0 ? (
            currentPosts.map((post) => (
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
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="layers-outline" size={50} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>This category is empty</Text>
              <Text style={styles.emptySub}>Assign existing posts to this category in the edit menu.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footerWrapper}>
        <BottomTabsVen />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F9' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#2D3E5E', letterSpacing: 0.5 },

  scrollContent: { paddingTop: 20 },

  pillBarContainer: { marginBottom: 25, paddingLeft: 20 },
  pillItem: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  pillItemActive: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  pillText: { fontSize: 14, fontWeight: '700', color: '#8391A1' },
  pillTextActive: { color: '#8A1C27' },

  infoModule: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10,
    marginBottom: 20,
  },
  accentBar: { width: 6, backgroundColor: '#2D3E5E' },
  moduleBody: { flex: 1, padding: 20 },
  moduleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  moduleTitle: { fontSize: 20, fontWeight: '800', color: '#2D3E5E' },
  countBadge: { backgroundColor: '#FDF2F3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  countText: { color: '#8A1C27', fontSize: 12, fontWeight: '800' },
  moduleDesc: { fontSize: 14, color: '#4A5568', lineHeight: 22, fontWeight: '500' },

  feedWrapper: { paddingHorizontal: 20 },

  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyIconCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.05
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#2D3E5E', textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#8391A1', textAlign: 'center', marginTop: 8, lineHeight: 20, fontWeight: '500' },

  footerWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 },
});

export default VendorsCategoryVen;