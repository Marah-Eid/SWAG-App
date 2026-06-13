import React, { useEffect, useState, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, Text, SafeAreaView, StatusBar,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

import VendorSearchBar from '../commonV/VendorSearchBar';
import TopCategoryBarV from '../commonV/TopCategoryBarV';
import SuggestedCarouselV from '../commonV/SuggestedCarouselV';
import VendorPosts from '../commonV/VendorPosts';
import BottomTabsVen from '../commonV/BottomTabsVen';
import categoriesAPI from '../../api/categoriesAPI';
import vendorAPI from '../../api/vendorAPI';
import postsAPI from '../../api/postsAPI';

const defaultLogo = require('../../../assets/images/default-user-pfp.png');
const defaultBg = require('../../../assets/images/default-banner.png');

// Normalize a string for fuzzy matching: lowercase, strip non-letters
const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, '');

const CategoryFeedScreenV = ({ category }) => {
  const router = useRouter();
  const myProfile = useSelector((state) => state.vendor.myProfile);

  const [sectionItems, setSectionItems] = useState([]);
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

  const suggestions = vendors.filter((v) => String(v.id) !== String(myProfile?.id)).map((v) => ({
    id: v.id,
    name: v.shopName || 'User Name',
    sub: v.city || '',
    bio: v.bio || '',
    logo: v.profileImage ? { uri: v.profileImage } : defaultLogo,
    bgImage: v.bannerImage ? { uri: v.bannerImage } : defaultBg,
    isFollowed: v.isFollowed,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.searchWrapper}>
        <VendorSearchBar />
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
          <TopCategoryBarV />

          {/* ── Feed content (vendors + posts) ─────────────────────────── */}
          {loadingFeed ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#2D3E5E" />
            </View>
          ) : (
            <>
              {/* Suggested Vendors */}
              {suggestions.length > 0 ? (
                <SuggestedCarouselV data={suggestions} />
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No vendors for this category yet.</Text>
                  <Text style={styles.emptySubText}>Check back soon!</Text>
                </View>
              )}

              {/* Posts */}
              <View style={styles.feedContainer}>
                {posts.filter((p) => String(p.vendorId) !== String(myProfile?.id)).map((p) => (
                  <VendorPosts
                    key={p.id}
                    postId={p.id}
                    vendorId={p.vendorId}
                    vendorName={p.vendorShopName || 'User Name'}
                    vendorLogo={p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo}
                    location={p.location || p.vendorCity || ''}
                    description={p.description || ''}
                    postImage={p.postImage ? { uri: p.postImage } : null}
                    mediaType={p.mediaType}
                    mediaWidth={p.mediaWidth}
                    mediaHeight={p.mediaHeight}
                    initialLiked={p.isLiked}
                    initialSaved={p.isSaved}
                    isEvent={p.type === 'event'}
                    date={p.eventDate}
                    time={p.eventTime}
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

      <View style={styles.bottomTabsWrapper}>
        <BottomTabsVen />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f1f1',
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

export default CategoryFeedScreenV;
