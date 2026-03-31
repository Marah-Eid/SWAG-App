import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import RevCard from '../common/RevCard';
import BottomTabsVen from '../commonV/BottomTabsVen';
import { fetchVendorReviews } from '../../store/slices/vendorSlice';

const defaultPic = require('../../../assets/images/gorg-icon.png');

const RatingRevVenScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { myProfile, reviews } = useSelector((state) => state.vendor);

  useEffect(() => {
    if (myProfile?.id) {
      dispatch(fetchVendorReviews(myProfile.id));
    }
  }, [dispatch, myProfile?.id]);

  const reviewsList = reviews.map((r) => ({
    id: r.id,
    firstName: (r.userName || r.fullName || 'User').split(' ')[0],
    lastName: (r.userName || r.fullName || '').split(' ').slice(1).join(' '),
    profilePic: r.profileImage ? { uri: r.profileImage } : defaultPic,
    rating: r.rating,
    feedback: r.feedback || r.content || '',
  }));

  const avgRating = myProfile?.averageRating?.toFixed(1) || '0.0';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color="#2D3E5E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ratings & Reviews</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>

        {/* AVG RATING CARD */}
        <View style={styles.avgCard}>
          <View style={styles.avgTextContainer}>
            <Text style={styles.avgLabel}>Total Score</Text>
            <Text style={styles.avgScore}>{avgRating}<Text style={styles.maxScore}>/5</Text></Text>
          </View>
          <View style={styles.starsContainer}>
            <Image
              source={require('../../../assets/images/Stars-icon.png')}
              style={styles.avgStars}
              resizeMode="contain"
            />
            <Text style={styles.ratingsCount}>Based on {reviewsList.length} customers</Text>
          </View>
        </View>

        {/* FEEDBACK LIST */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>Customer Feedback</Text>
            <View style={styles.headerLine} />
          </View>

          {reviewsList.map((item) => (
            <RevCard
              key={item.id}
              firstName={item.firstName}
              lastName={item.lastName}
              profilePic={item.profilePic}
              rating={item.rating}
              feedback={item.feedback}
            />
          ))}

          {reviewsList.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="star-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No reviews yet.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.tabsWrapper}>
        <BottomTabsVen />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#2D3E5E', letterSpacing: 0.5 },

  scrollPadding: { paddingHorizontal: 20, paddingTop: 10 },

  avgCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  avgLabel: { fontSize: 11, fontWeight: '800', color: '#8391A1', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 1 },
  avgScore: { fontSize: 32, fontWeight: '800', color: '#2D3E5E' },
  maxScore: { fontSize: 18, color: '#A0AEC0' },
  starsContainer: { alignItems: 'flex-end' },
  avgStars: { width: 100, height: 24, marginBottom: 4 },
  ratingsCount: { fontSize: 11, color: '#8391A1', fontWeight: '600' },

  listContainer: { marginTop: 10 },
  listHeader: { marginBottom: 20, paddingHorizontal: 5 },
  listHeaderText: { fontSize: 18, fontWeight: '800', color: '#2D3E5E' },
  headerLine: { width: 40, height: 4, backgroundColor: '#8A1C27', borderRadius: 2, marginTop: 6 },

  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { marginTop: 12, color: '#8391A1', fontSize: 15, fontWeight: '600' },

  tabsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10
  }
});

export default RatingRevVenScreen;
