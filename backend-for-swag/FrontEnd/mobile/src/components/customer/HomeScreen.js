import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';

import CustomSearchBar from '../common/CustomSearchBar';
import CustomerCard from '../common/CustomerCard';
import BottomTabs from '../common/BottomTabs';
import HomeGrid from '../common/HomeGrid';
import EventsCarousel from '../common/EventsCarousel';
import NearbyShopsCarousel from '../common/NearbyShopsCarousel';
import FollowingSection from '../common/FollowingSection';
import SideMenu from '../common/SideMenu';
import { fetchVendors } from '../../store/slices/vendorSlice';
import { fetchPosts } from '../../store/slices/postsSlice';
import { fetchFollowing } from '../../store/slices/customerSlice';

const defaultLogo = require('../../../assets/images/carshop-icon.png');
const defaultBg = require('../../../assets/images/theshop-photo.png');

const HomeScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isMenuVisible, setMenuVisible] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { vendors } = useSelector((state) => state.vendor);
  const { posts } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchVendors());
    dispatch(fetchPosts());
    dispatch(fetchFollowing());
  }, [dispatch]);

  // Map vendors → NearbyShopsCarousel shape
  const shopsData = vendors.map((v) => ({
    id: v.id,
    name: v.shopName,
    phone: v.phone || '',
    city: v.city || '',
    bio: v.bio || '',
    logo: v.profileImage ? { uri: v.profileImage } : defaultLogo,
    bgImage: v.bannerImage ? { uri: v.bannerImage } : defaultBg,
  }));

  // Map event posts → EventsCarousel shape
  const eventsData = posts
    .filter((p) => p.type === 'event')
    .map((p) => ({
      id: p.id,
      title: p.eventTitle || p.vendorShopName,
      phone: '',
      city: p.location || '',
      date: p.eventDate || '',
      description: p.description || '',
      logo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
      bgImage: p.postImage ? { uri: p.postImage } : defaultBg,
    }));

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />

      {/* UI Polish: Increased top padding to push it down slightly */}
      <View style={styles.searchWrapper}>
        <CustomSearchBar onMenuPress={() => setMenuVisible(true)} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* UI Polish: Added a wrapper to create a clean gap below the card */}
        <View style={styles.cardWrapper}>
          <CustomerCard
            name={user?.firstName || "George"}
            phone={user?.email || "+962 7 8888 7777"}
            city={user?.city || "Amman"}
            onProfilePress={() => router.push('/customer/ProfileCust')}
            onCarPress={() => router.push('/customer/ProfileCust')}
          />
        </View>

        {/* UI Polish: Added a wrapper to ensure breathing room below the grid */}
        <View style={styles.gridWrapper}>
          <HomeGrid />
        </View>

        <FollowingSection />
        <EventsCarousel events={eventsData} />
        <NearbyShopsCarousel shopsData={shopsData} />
      </ScrollView>

      {/* UI Polish: Fixed position bottom tabs */}
      <View style={styles.bottomTabsWrapper}>
        <BottomTabs />
      </View>

      <SideMenu
        visible={isMenuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#AFC6D8'
  },
  searchWrapper: {
    paddingTop: 20, // Increased to move it slightly down from the very top
    paddingBottom: 10, // Added space between search bar and the scrolling content
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 10, // Gives a nice gap before the profile card starts
  },
  cardWrapper: {
    marginBottom: 25, // Creates a beautiful gap between the Profile Card and the Grid
  },
  gridWrapper: {
    marginBottom: 10, // Creates breathing room between the Grid and the Following Section
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

export default HomeScreen;