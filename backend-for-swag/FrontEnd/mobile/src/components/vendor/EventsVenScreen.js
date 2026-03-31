import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

// 1. Import Vendor-specific components from commonV
import VendorSearchBar from '../commonV/VendorSearchBar';
import VendorCard from '../commonV/VendorCard';
import BottomTabsVen from '../commonV/BottomTabsVen';
import SideMenuV from '../commonV/SideMenuV';
import EventsCarouselV from '../commonV/EventsCarouselV';
import VendorPosts from '../commonV/VendorPosts';
import { fetchPosts } from '../../store/slices/postsSlice';

const defaultLogo = require('../../../assets/images/nmk-icon.png');
const defaultBg = require('../../../assets/images/nmk-pic.png');

const EventsVenScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isMenuVisible, setMenuVisible] = useState(false);

  const { myProfile } = useSelector((state) => state.vendor);
  const { posts } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const eventPosts = posts.filter((p) => p.type === 'event');

  const carouselEvents = eventPosts.slice(0, 6).map((p) => ({
    id: p.id,
    title: p.vendorShopName || p.eventTitle || '',
    location: p.location || '',
    date: p.eventDate || '',
    description: p.description || '',
    logo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
    bgImage: p.postImage ? { uri: p.postImage } : defaultBg,
  }));

  const feedEvents = eventPosts.map((p) => ({
    id: p.id,
    vendorId: p.vendorId,
    vendorName: p.vendorShopName || '',
    location: p.location || '',
    description: p.description || '',
    vendorLogo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
    postImage: p.postImage ? { uri: p.postImage } : defaultBg,
    date: p.eventDate || '',
    time: p.eventTime || '',
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
            shopName={myProfile?.shopName || ''}
            rating={myProfile?.averageRating?.toFixed(1) || '0.0'}
            logo={myProfile?.profileImage ? { uri: myProfile.profileImage } : defaultLogo}
          />
        </View>

        {/* FEATURED EVENTS CAROUSEL */}
        <EventsCarouselV events={carouselEvents} />

        {/* EVENT FEED */}
        <View style={styles.feedContainer}>
          {feedEvents.map((item) => (
            <VendorPosts
              key={item.id}
              vendorName={item.vendorName}
              location={item.location}
              description={item.description}
              vendorLogo={item.vendorLogo}
              postImage={item.postImage}
              isEvent={true}
              date={item.date}
              time={item.time}
              onVendorPress={() => router.push({
                pathname: '/commonScreensV/otherVendorProfile',
                params: { vendorId: item.vendorId }
              })}
            />
          ))}
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BOTTOM TABS */}
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
    marginTop: 20
  },
  bottomTabsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100
  }
});

export default EventsVenScreen;