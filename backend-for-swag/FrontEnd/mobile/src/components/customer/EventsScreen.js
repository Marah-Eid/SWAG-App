import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import CustomSearchBar from '../common/CustomSearchBar';
import CustomerCard from '../common/CustomerCard';
import BottomTabs from '../common/BottomTabs';
import CustomerPosts from '../common/CustomerPosts';
import TopCoordinatorsCarousel from '../common/TopCoordinatorsCarousel';
import SideMenu from '../common/SideMenu';
import { fetchPosts } from '../../store/slices/postsSlice';

const defaultLogo = require('../../../assets/images/default-user-pfp.png');
const defaultBg = require('../../../assets/images/default-banner.png');

const EventsScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isMenuVisible, setMenuVisible] = useState(false);

  const { posts } = useSelector((state) => state.posts);
  const { profile } = useSelector((state) => state.customer);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const eventPosts = posts.filter((p) => p.type === 'event');

  const feedEvents = eventPosts.map((p) => ({
    id: p.id,
    vendorId: p.vendorId,
    vendorName: p.vendorShopName || 'User Name',
    location: p.location || '',
    description: p.description || '',
    vendorLogo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
    postImage: p.postImage ? { uri: p.postImage } : null,
    date: p.eventDate || '',
    time: p.eventTime || '',
    isLiked: p.isLiked,
    isSaved: p.isSaved,
    likeCount: p.likeCount,
    commentCount: p.commentCount,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* FIXED HEADER */}
      <View style={styles.fixedHeader}>
        <CustomSearchBar onMenuPress={() => setMenuVisible(true)} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* USER CARD */}
        <View style={styles.cardWrapper}>
          <CustomerCard
            name={profile?.fullName || 'User'}
            phone={profile?.phone || profile?.email || ''}
            location={profile?.city || ''}
            profileImage={profile?.profileImage ? { uri: profile.profileImage } : require('../../../assets/images/default-user-pfp.png')}
            onProfilePress={() => router.push('/customer/ProfileCust')}
            onCarPress={() => router.push('/customer/ProfileCust')}
          />
        </View>

        {/* TOP COORDINATORS */}
        <TopCoordinatorsCarousel
          onVendorPress={(vendorId) => router.push({ pathname: '/customer/VendorProfCust', params: { vendorId } })}
        />

        {/* EVENT FEED */}
        <View style={styles.feedContainer}>
          {feedEvents.map((item) => (
            <CustomerPosts
              key={item.id}
              postId={item.id}
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
              onVendorPress={() => router.push({ pathname: '/customer/VendorProfCust', params: { vendorId: item.vendorId } })}
            />
          ))}
        </View>

        {/* Spacer for Bottom Tabs */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
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

export default EventsScreen;
