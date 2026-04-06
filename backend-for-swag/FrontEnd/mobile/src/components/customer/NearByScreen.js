import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import CustomSearchBar from '../common/CustomSearchBar';
import CustomerCard from '../common/CustomerCard';
import NearbyShopsCarousel from '../common/NearbyShopsCarousel';
import CustomerPosts from '../common/CustomerPosts';
import BottomTabs from '../common/BottomTabs';
import SideMenu from '../common/SideMenu';
import { fetchVendors } from '../../store/slices/vendorSlice';
import { fetchPosts } from '../../store/slices/postsSlice';

const defaultLogo = require('../../../assets/images/nmk-icon.png');
const defaultBg = require('../../../assets/images/theshop-photo.png');

const NearByScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isMenuVisible, setMenuVisible] = useState(false);

  const { vendors } = useSelector((state) => state.vendor);
  const { posts } = useSelector((state) => state.posts);
  const { profile } = useSelector((state) => state.customer);
  const { user } = useSelector((state) => state.auth);
  const userCity = user?.city || '';

  useEffect(() => {
    dispatch(fetchVendors());
    dispatch(fetchPosts());
  }, [dispatch]);

  const nearbyShops = vendors.map((v) => ({
    id: v.id,
    name: v.shopName || '',
    sub: v.city || '',
    bio: v.bio || '',
    logo: v.profileImage ? { uri: v.profileImage } : defaultLogo,
    bgImage: v.bannerImage ? { uri: v.bannerImage } : defaultBg,
  }));

  const nearbyVendorIds = new Set(
    vendors
      .filter((v) => !userCity || (v.city || '').toLowerCase() === userCity.toLowerCase())
      .map((v) => v.id)
  );

  const feedPosts = posts
    .filter((p) => nearbyVendorIds.has(p.vendorId))
    .map((p) => ({
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

      {/* FIXED HEADER */}
      <View style={styles.fixedHeader}>
        <CustomSearchBar onMenuPress={() => setMenuVisible(true)} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* PROFILE SUMMARY */}
        <View style={styles.cardWrapper}>
          <CustomerCard
            name={profile?.fullName || 'User'}
            phone={profile?.phone || profile?.email || ''}
            location={profile?.city || ''}
            profileImage={profile?.profileImage ? { uri: profile.profileImage } : require('../../../assets/images/gorg-icon.png')}
            onProfilePress={() => router.push('/customer/ProfileCust')}
            onCarPress={() => router.push('/customer/ProfileCust')}
          />
        </View>

        {/* NEARBY CAROUSEL */}
        <NearbyShopsCarousel shopsData={nearbyShops} />

        {/* LOCAL DISCOVER FEED */}
        <View style={styles.feedContainer}>
          {feedPosts.map((post) => (
            <CustomerPosts
              key={post.id}
              postId={post.id}
              vendorName={post.vendorName}
              location={post.location}
              description={post.description}
              vendorLogo={post.vendorLogo}
              postImage={post.postImage}
              onVendorPress={() => router.push({ pathname: '/customer/VendorProfCust', params: { vendorId: post.vendorId } })}
            />
          ))}
        </View>

        {/* Spacer for navigation bars */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BOTTOM TABS */}
      <View style={styles.bottomTabsWrapper}>
        <BottomTabs />
      </View>

      {/* SIDE MENU */}
      <SideMenu
        visible={isMenuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#AFC6D8' },
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
    marginTop: 10
  },
  bottomTabsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100
  }
});

export default NearByScreen;