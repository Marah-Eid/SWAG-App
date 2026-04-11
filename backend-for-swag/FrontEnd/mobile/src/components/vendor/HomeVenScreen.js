import React, { useState, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, SafeAreaView, StatusBar, Text, TouchableOpacity, Alert, Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// Import reusable components
import VendorSearchBar from '../commonV/VendorSearchBar';
import VendorCard from '../commonV/VendorCard';
import HomeGridV from '../commonV/HomeGridV';
import FollowingSectionV from '../commonV/FollowingSectionV';
import EventsCarouselV from '../commonV/EventsCarouselV';
import BottomTabsVen from '../commonV/BottomTabsVen';
import SideMenuV from '../commonV/SideMenuV';
import { useFocusEffect } from 'expo-router';
import { fetchMyVendorProfile, fetchMyFollowing } from '../../store/slices/vendorSlice';
import { fetchPosts } from '../../store/slices/postsSlice';
import { fetchNotifications } from '../../store/slices/notificationsSlice';
import { fetchConversations } from '../../store/slices/chatsSlice';

const defaultBg = require('../../../assets/images/default-banner.png');
const defaultLogo = require('../../../assets/images/default-user-pfp.png');

const HomeVenScreen = () => {
  const dispatch = useDispatch();
  const [isMenuVisible, setMenuVisible] = useState(false);

  const { myProfile } = useSelector((state) => state.vendor);
  const { posts } = useSelector((state) => state.posts);

  const isPending = !myProfile || myProfile.status !== 'active';

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMyVendorProfile());
      dispatch(fetchMyFollowing());
      dispatch(fetchPosts());
      dispatch(fetchNotifications());
      dispatch(fetchConversations());
    }, [dispatch])
  );

  const handleRestrictedAction = () => {
    if (Platform.OS === 'web') {
      window.alert("Account Pending: You cannot create posts, events, or share your profile until an admin approves your shop.");
    } else {
      Alert.alert(
        "Account Pending",
        "You cannot create posts, events, or share your profile until an admin approves your shop.",
        [{ text: "Understood", style: "cancel" }]
      );
    }
  };

  const eventsData = posts
    .filter((p) => p.type === 'event')
    .map((p) => ({
      id: p.id,
      vendorId: p.vendorId,
      title: p.eventTitle || p.vendorShopName || 'User Name',
      location: p.location || '',
      date: p.eventDate || '',
      description: p.description || '',
      bgImage: p.postImage ? { uri: p.postImage } : null,
      logo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
    }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* --- UI Polish: Premium Warning Banner --- */}
      {isPending && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>⚠️ Please wait until your shop request is approved!</Text>
        </View>
      )}

      {/* UI Polish: Increased padding to push it down slightly to match the customer side */}
      <View style={styles.searchWrapper}>
        <VendorSearchBar onMenuPress={() => setMenuVisible(true)} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* UI Polish: Added a wrapper to create a clean gap below the card */}
        <View style={styles.cardWrapper}>
          <VendorCard
            shopName={myProfile?.shopName || 'User Name'}
            rating={myProfile?.averageRating?.toFixed(1) || '0'}
            logo={myProfile?.profileImage ? { uri: myProfile.profileImage } : null}
            onSharePress={isPending ? handleRestrictedAction : undefined}
          />
        </View>

        {/* UI Polish: Added a wrapper to ensure breathing room below the grid */}
        <View style={styles.gridWrapper}>
          <HomeGridV />
        </View>

        <FollowingSectionV />
        <EventsCarouselV events={eventsData} />
      </ScrollView>

      {/* Fixed Bottom Navigation */}
      <View style={styles.bottomTabsWrapper}>
        <BottomTabsVen
          isPending={isPending}
          onRestrictedAction={handleRestrictedAction}
        />
      </View>

      <SideMenuV
        visible={isMenuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BFCEDC',
  },
  searchWrapper: {
    zIndex: 5,
    marginTop: 5,
    paddingTop: 20, // UI Polish: Matched Customer side push down
    paddingBottom: 10,
  },
  alertBanner: {
    backgroundColor: '#8A1C27', // UI Polish: Brand Red for alert
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  alertText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingBottom: 120, // UI Polish: Space for the floating bottom tabs
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
    zIndex: 100,
    elevation: 15,
  }
});

export default HomeVenScreen;