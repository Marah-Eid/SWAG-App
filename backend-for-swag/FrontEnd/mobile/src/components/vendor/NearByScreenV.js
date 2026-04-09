import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import VendorSearchBar from '../commonV/VendorSearchBar';
import VendorCard from '../commonV/VendorCard';
import NearbyShopsCarousel from '../common/NearbyShopsCarousel';
import VendorPosts from '../commonV/VendorPosts';
import BottomTabsVen from '../commonV/BottomTabsVen';
import SideMenuV from '../commonV/SideMenuV';
import { fetchVendors, fetchMyVendorProfile } from '../../store/slices/vendorSlice';
import { fetchPosts } from '../../store/slices/postsSlice';

const defaultLogo = require('../../../assets/images/nmk-icon.png');
const defaultBg = require('../../../assets/images/theshop-photo.png');

const NearByScreenV = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isMenuVisible, setMenuVisible] = useState(false);

  const { vendors, myProfile } = useSelector((state) => state.vendor);
  const { posts } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);
  const userCity = user?.city || '';

  useEffect(() => {
    dispatch(fetchVendors());
    dispatch(fetchPosts());
    dispatch(fetchMyVendorProfile());
  }, [dispatch]);

  const nearbyShops = vendors.map((v) => ({
    id: v.id,
    name: v.shopName || '',
    sub: v.city || '',
    bio: v.bio || '',
    logo: v.profileImage ? { uri: v.profileImage } : defaultLogo,
    bgImage: v.bannerImage ? { uri: v.bannerImage } : defaultBg,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.fixedHeader}>
        <VendorSearchBar onMenuPress={() => setMenuVisible(true)} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.cardWrapper}>
          <VendorCard
            shopName={myProfile?.shopName || 'My Shop'}
            rating={myProfile?.averageRating?.toFixed(1) || '0.0'}
            logo={myProfile?.profileImage ? { uri: myProfile.profileImage } : null}
          />
        </View>

        <NearbyShopsCarousel shopsData={nearbyShops} />

        <View style={styles.feedContainer}>
          {(() => {
            const nearbyVendorIds = new Set(
              vendors
                .filter((v) => !userCity || (v.city || '').toLowerCase() === userCity.toLowerCase())
                .map((v) => v.id)
            );
            return posts
              .filter((p) => nearbyVendorIds.has(p.vendorId))
              .map((p) => (
            <VendorPosts
              key={p.id}
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
            />
          ));
          })()}
        </View>


        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomTabsWrapper}>
        <BottomTabsVen />
      </View>

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
    paddingTop: 5,
  },
  cardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  feedContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  bottomTabsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 15,
  },
});

export default NearByScreenV;
