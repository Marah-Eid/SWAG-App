import React, { useEffect, useState, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, Text, SafeAreaView, StatusBar,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';

import CustomSearchBar from '../common/CustomSearchBar';
import BottomTabs from '../common/BottomTabs';
import TopCategoryBar from '../common/TopCategoryBar';
import SuggestedCarousel from '../common/SuggestedCarousel';
import CustomerPosts from '../common/CustomerPosts';
import categoriesAPI from '../../api/categoriesAPI';
import vendorAPI from '../../api/vendorAPI';
import postsAPI from '../../api/postsAPI';

const defaultLogo = require('../../../assets/images/carshop-icon.png');
const defaultBg = require('../../../assets/images/Euleback-photo.png');

// Normalize a string for fuzzy matching: lowercase, strip non-letters
const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, '');

const CategoryFeedScreen = ({ category }) => {
  const router = useRouter();

  const [sectionItems, setSectionItems] = useState([]);   // items of the matched DB section
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(false);

  // ── Step 1: fetch all sections, find the matching one, set default item ────
  useEffect(() => {
    const init = async () => {
      setLoadingInit(true);
      const result = await categoriesAPI.getCategories();
      if (!result.success) { setLoadingInit(false); return; }

      const catNorm = norm(category);
      let matchedSection = null;
      let defaultItemId = null;

      for (const section of result.data) {
        for (const item of section.items) {
          const itemNorm = norm(item.name);
          // "CarParts" ↔ "Car Parts", "WheelsTires" ↔ "Wheels & Tires", etc.
          if (itemNorm === catNorm || itemNorm.includes(catNorm) || catNorm.includes(itemNorm)) {
            matchedSection = section;
            defaultItemId = item.id;
            break;
          }
        }
        if (matchedSection) break;
      }

      if (matchedSection) {
        setSectionItems(matchedSection.items);
        setSelectedItemId(defaultItemId);
      }
      setLoadingInit(false);
    };
    init();
  }, [category]);

  // ── Step 2: fetch vendors + posts whenever the selected chip changes ────────
  const fetchFeed = useCallback(async (itemId) => {
    setLoadingFeed(true);
    const [vendorResult, postResult] = await Promise.all([
      vendorAPI.getVendors({ categoryId: itemId }),
      postsAPI.getPosts({ categoryId: itemId }),
    ]);
    setVendors(vendorResult.success ? vendorResult.data : []);
    setPosts(postResult.success ? postResult.data : []);
    setLoadingFeed(false);
  }, []);

  useEffect(() => {
    if (selectedItemId != null) fetchFeed(selectedItemId);
  }, [selectedItemId, fetchFeed]);

  // ── Map API data to component shapes ──────────────────────────────────────
  const suggestions = vendors.map((v) => ({
    id: v.id,
    name: v.shopName || '',
    sub: v.city || '',
    bio: v.bio || '',
    logo: v.profileImage ? { uri: v.profileImage } : defaultLogo,
    bgImage: v.bannerImage ? { uri: v.bannerImage } : defaultBg,
    isFollowed: v.isFollowed,
  }));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Fixed search bar */}
      <View style={styles.searchWrapper}>
        <CustomSearchBar />
      </View>

      {loadingInit ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2D3E5E" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* Top Category Nav */}
          <TopCategoryBar />

          {/* ── Feed content (vendors + posts) ─────────────────────────── */}
          {loadingFeed ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#2D3E5E" />
            </View>
          ) : (
            <>
              {/* Suggested Vendors */}
              {suggestions.length > 0 ? (
                <SuggestedCarousel data={suggestions} />
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No vendors for this category yet.</Text>
                  <Text style={styles.emptySubText}>Check back soon!</Text>
                </View>
              )}

              {/* Posts */}
              <View style={styles.feedContainer}>
                {posts.map((p) => (
                  <CustomerPosts
                    key={p.id}
                    postId={p.id}
                    vendorName={p.vendorShopName || ''}
                    vendorLogo={p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo}
                    location={p.location || ''}
                    description={p.description || ''}
                    postImage={p.postImage ? { uri: p.postImage } : defaultBg}
                    mediaType={p.mediaType}
                    mediaWidth={p.mediaWidth}
                    mediaHeight={p.mediaHeight}
                    initialLiked={p.isLiked}
                    initialSaved={p.isSaved}
                    likeCount={p.likeCount}
                    commentCount={p.commentCount}
                    isEvent={p.type === 'event'}
                    date={p.eventDate}
                    time={p.eventTime}
                    onVendorPress={() =>
                      router.push({ pathname: '/customer/VendorProfCust', params: { vendorId: p.vendorId } })
                    }
                  />
                ))}

                {posts.length === 0 && !loadingFeed && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No posts for this category yet.</Text>
                    <Text style={styles.emptySubText}>Check back soon!</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* Fixed bottom tabs */}
      <View style={styles.bottomTabsWrapper}>
        <BottomTabs />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4F9',
  },
  searchWrapper: {
    paddingTop: 10,
    zIndex: 10,
  },
  scroll: {
    paddingBottom: 120,
    paddingTop: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  // ── Feed ──────────────────────────────────────────────────────────────────
  feedContainer: {
    paddingHorizontal: 20,
    marginTop: 5,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  emptyText: {
    color: '#8391A1',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  emptySubText: {
    color: '#A0AEC0',
    fontSize: 13,
    fontStyle: 'italic',
  },

  // ── Bottom tabs ───────────────────────────────────────────────────────────
  bottomTabsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 15,
    zIndex: 100,
  },
});

export default CategoryFeedScreen;
