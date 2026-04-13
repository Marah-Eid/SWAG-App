import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, StatusBar,
  ActivityIndicator, TouchableOpacity, StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import searchAPI from '../../api/searchAPI';
import CustomSearchBar from './CustomSearchBar';
import SuggestedCarousel from './SuggestedCarousel';
import CustomerPosts from './CustomerPosts';
import BottomTabs from './BottomTabs';
import { followVendor, unfollowVendor } from '../../store/slices/customerSlice';

const defaultLogo = require('../../../assets/images/default-user-pfp.png');
const defaultBg = require('../../../assets/images/default-banner.png');

const SearchResultsScreen = () => {
  const { query } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const [results, setResults] = useState({ vendors: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;

    const doSearch = async () => {
      setLoading(true);
      setSearched(false);
      setError(null);

      const result = await searchAPI.search(query);

      if (result.success) {
        setResults(result.data);
      } else {
        setError(result.error);
        setResults({ vendors: [], posts: [] });
      }

      setLoading(false);
      setSearched(true);
    };

    doSearch();
  }, [query]);

  const vendorCards = (results.vendors || []).map((v) => ({
    id: v.id,
    name: v.shopName || 'User Name',
    sub: [v.city, v.shopType].filter(Boolean).join(' · '),
    bio: v.bio || '',
    logo: v.profileImage ? { uri: v.profileImage } : defaultLogo,
    bgImage: v.bannerImage ? { uri: v.bannerImage } : defaultBg,
    isFollowed: v.isFollowed || false,
  }));

  const postCards = (results.posts || []).map((p) => ({
    id: p.id,
    vendorId: p.vendorId,
    vendorName: p.vendorShopName || 'User Name',
    location: p.location || '',
    description: p.description || '',
    vendorLogo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
    postImage: p.postImage ? { uri: p.postImage } : null,
    isLiked: p.isLiked || false,
    isSaved: p.isSaved || false,
    likeCount: p.likeCount,
    commentCount: p.commentCount,
    isEvent: p.type === 'event',
    date: p.eventDate || null,
    time: p.eventTime || null,
    mediaType: p.mediaType || 'image',
    mediaWidth: p.mediaWidth,
    mediaHeight: p.mediaHeight,
  }));

  const handleFollow = (vendorId, shouldFollow) => {
    if (shouldFollow) {
      dispatch(followVendor(vendorId));
    } else {
      dispatch(unfollowVendor(vendorId));
    }
    setResults((prev) => ({
      ...prev,
      vendors: (prev.vendors || []).map((v) =>
        String(v.id) === String(vendorId) ? { ...v, isFollowed: shouldFollow } : v
      ),
    }));
  };

  const hasVendors = vendorCards.length > 0;
  const hasPosts = postCards.length > 0;
  const hasResults = hasVendors || hasPosts;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header row: back button + result label */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#2D3E5E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Results for "{query}"
        </Text>
      </View>

      {/* Search bar pre-filled so user can refine */}
      <View style={styles.searchWrapper}>
        <CustomSearchBar initialQuery={query} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2D3E5E" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Vendors Section ───────────────────────────────── */}
          {hasVendors && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vendors</Text>
              <SuggestedCarousel data={vendorCards} onFollow={handleFollow} />
            </View>
          )}

          {/* ── Posts Section ─────────────────────────────────── */}
          {hasPosts && (
            <View style={[styles.section, styles.postsSection]}>
              <Text style={styles.sectionTitle}>Posts</Text>
              {postCards.map((post) => (
                <View key={post.id} style={styles.postSpacing}>
                  <CustomerPosts
                    postId={post.id}
                    vendorName={post.vendorName}
                    vendorLogo={post.vendorLogo}
                    location={post.location}
                    description={post.description}
                    postImage={post.postImage}
                    initialLiked={post.isLiked}
                    initialSaved={post.isSaved}
                    likeCount={post.likeCount}
                    commentCount={post.commentCount}
                    isEvent={post.isEvent}
                    date={post.date}
                    time={post.time}
                    mediaType={post.mediaType}
                    mediaWidth={post.mediaWidth}
                    mediaHeight={post.mediaHeight}
                    onVendorPress={() =>
                      router.push({
                        pathname: '/customer/VendorProfCust',
                        params: { vendorId: post.vendorId },
                      })
                    }
                  />
                </View>
              ))}
            </View>
          )}

          {/* ── Error State ───────────────────────────────────── */}
          {searched && error && (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={60} color="#E57373" />
              <Text style={styles.emptyText}>Something went wrong</Text>
              <Text style={styles.emptySubText}>{error}</Text>
            </View>
          )}

          {/* ── Empty State ───────────────────────────────────── */}
          {searched && !error && !hasResults && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={60} color="#A0AEC0" />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubText}>
                Try searching for a shop name, category, or sub-category
              </Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      <View style={styles.bottomTabsWrapper}>
        <BottomTabs />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AFC6D8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 2,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3E5E',
  },
  searchWrapper: {
    zIndex: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#2D3E5E',
    fontWeight: '600',
  },
  scroll: {
    paddingTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  postsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3E5E',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  postSpacing: {
    marginBottom: 20,
  },
  emptyState: {
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3E5E',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomTabsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 15,
    zIndex: 100,
  },
});

export default SearchResultsScreen;
