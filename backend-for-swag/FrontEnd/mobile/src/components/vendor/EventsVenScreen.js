import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from 'expo-router';

import VendorSearchBar from '../commonV/VendorSearchBar';
import VendorCard from '../commonV/VendorCard';
import BottomTabsVen from '../commonV/BottomTabsVen';
import SideMenuV from '../commonV/SideMenuV';
import VendorPosts from '../commonV/VendorPosts';
import TopCoordinatorsCarousel from '../common/TopCoordinatorsCarousel';
import { fetchPosts } from '../../store/slices/postsSlice';

const defaultLogo = require('../../../assets/images/default-user-pfp.png');

const isExpired = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
};

const SectionHeader = ({ title, count }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionLine} />
    <Text style={styles.sectionTitle}>{title}</Text>
    {count > 0 && <View style={styles.sectionBadge}><Text style={styles.sectionBadgeText}>{count}</Text></View>}
    <View style={styles.sectionLine} />
  </View>
);

const EventsVenScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isMenuVisible, setMenuVisible] = useState(false);

  const { myProfile } = useSelector((state) => state.vendor);
  const { posts } = useSelector((state) => state.posts);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchPosts({ type: 'event', pageSize: 100 }));
    }, [dispatch])
  );

  const eventPosts = posts.filter((p) => p.type === 'event');

  const upcoming = eventPosts
    .filter((p) => !isExpired(p.eventDate))
    .sort((a, b) => new Date(a.eventDate || 0) - new Date(b.eventDate || 0));

  const finished = eventPosts
    .filter((p) => isExpired(p.eventDate))
    .sort((a, b) => new Date(b.eventDate || 0) - new Date(a.eventDate || 0));

  const mapEvent = (p) => ({
    id: p.id,
    vendorId: p.vendorId,
    vendorName: p.vendorShopName || 'User Name',

    location: p.location || p.vendorCity || '',
    description: p.description || '',
    vendorLogo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
    postImage: p.postImage ? { uri: p.postImage } : null,
    date: p.eventDate || '',
    time: p.eventTime || '',
    isLiked: p.isLiked,
    isSaved: p.isSaved,
    likeCount: p.likeCount,
    commentCount: p.commentCount,
  });

  const renderEvent = (item) => (
    <VendorPosts
      key={item.id}
      postId={item.id}
      vendorId={item.vendorId}
      vendorName={item.vendorName}
      location={item.location}
      description={item.description}
      vendorLogo={item.vendorLogo}
      postImage={item.postImage}
      isEvent={true}
      date={item.date}
      time={item.time}
      initialLiked={item.isLiked}
      initialSaved={item.isSaved}
      likeCount={item.likeCount}
      commentCount={item.commentCount}
      onVendorPress={() => router.push({
        pathname: '/commonScreensV/otherVendorProfile',
        params: { vendorId: item.vendorId }
      })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.fixedHeader}>
        <VendorSearchBar onMenuPress={() => setMenuVisible(true)} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.cardWrapper}>
          <VendorCard
            shopName={myProfile?.shopName || 'User Name'}
            rating={myProfile?.averageRating?.toFixed(1) || '0.0'}
            logo={myProfile?.profileImage ? { uri: myProfile.profileImage } : defaultLogo}
          />
        </View>

        <TopCoordinatorsCarousel
          onVendorPress={(vendorId) => router.push({ pathname: '/vendor/otherVendorProfile', params: { vendorId } })}
        />

        <View style={styles.feedContainer}>

          <SectionHeader title="Upcoming Events" count={upcoming.length} />
          {upcoming.length === 0 ? (
            <Text style={styles.emptyText}>No upcoming events right now.</Text>
          ) : (
            upcoming.map(mapEvent).map(renderEvent)
          )}

          {finished.length > 0 && (
            <>
              <SectionHeader title="Finished Events" count={finished.length} />
              {finished.map(mapEvent).map(renderEvent)}
            </>
          )}

        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomTabsWrapper}>
        <BottomTabsVen />
      </View>

      <SideMenuV visible={isMenuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#BFCEDC' },
  fixedHeader: { paddingTop: 10, zIndex: 10 },
  scrollContent: { paddingTop: 5 },
  cardWrapper: { paddingHorizontal: 20, marginBottom: 10 },
  feedContainer: { paddingHorizontal: 20, marginTop: 20 },
  bottomTabsWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 16, marginTop: 8,
  },
  sectionLine: { flex: 1, height: 1.5, backgroundColor: '#B0C0D0' },
  sectionTitle: {
    fontSize: 14, fontWeight: '800', color: '#2D3E5E',
    marginHorizontal: 10, letterSpacing: 0.5,
  },
  sectionBadge: {
    backgroundColor: '#2D3E5E', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2, marginRight: 10,
  },
  sectionBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  emptyText: {
    textAlign: 'center', color: '#64748B', fontSize: 14,
    fontStyle: 'italic', marginBottom: 20,
  },
});

export default EventsVenScreen;
