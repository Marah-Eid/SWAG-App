import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Modal, StatusBar, Platform } from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import RevCard from '../common/RevCard';
import BottomTabs from '../common/BottomTabs';
import { fetchVendorReviews } from '../../store/slices/vendorSlice';
import { fetchVendorById } from '../../store/slices/vendorSlice';

const defaultPic = require('../../../assets/images/default-user-pfp.png');

const RatingRevScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { success, vendorId } = useLocalSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const reviews = useSelector((state) => state.vendor.reviews) || [];
  const selectedVendor = useSelector((state) => state.vendor.selectedVendor);

  useEffect(() => {
    if (vendorId) {
      dispatch(fetchVendorReviews(vendorId));
      dispatch(fetchVendorById(vendorId));
    }
  }, [dispatch, vendorId]);

  useEffect(() => {
    if (success === 'true') {
      setShowSuccessModal(true);
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        router.setParams({ success: undefined });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const reviewsList = reviews.map((r) => ({
    id: r.id,
    firstName: (r.customerName || r.userName || r.fullName || 'User Name').split(' ')[0],
    lastName: (r.customerName || r.userName || r.fullName || 'User Name').split(' ').slice(1).join(' '),
    profilePic: (r.customerImage || r.profileImage) ? { uri: r.customerImage || r.profileImage } : defaultPic,
    rating: r.rating,
    feedback: r.feedback || r.content || '',
  }));

  const avgRating = selectedVendor?.averageRating?.toFixed(1) || '0.0';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color="#2D3E5E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rating & Reviews</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>

        {/* AVG RATING CARD */}
        <View style={styles.avgCard}>
          <View style={styles.avgTextContainer}>
            <Text style={styles.avgLabel}>Average Rating</Text>
            <Text style={styles.avgScore}>{avgRating}<Text style={styles.maxScore}>/5</Text></Text>
          </View>
          <View style={styles.starsContainer}>
            <View style={styles.avgStarsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Entypo
                  key={i}
                  name={parseFloat(avgRating) >= i ? "star" : parseFloat(avgRating) >= i - 0.5 ? "star" : "star-outlined"}
                  size={22}
                  color={parseFloat(avgRating) >= i ? "#8A1C27" : parseFloat(avgRating) >= i - 0.5 ? "#8A1C27" : "#CBD5E1"}
                />
              ))}
            </View>
            <Text style={styles.ratingsCount}>{reviewsList.length} total reviews</Text>
          </View>
        </View>

        {/* ADD REVIEW ACTION */}
        <View style={styles.actionRow}>
          <Text style={styles.actionTitle}>Community Feedback</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push({ pathname: '/customer/AddReviewCust', params: { vendorId } })}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.addBtnText}>Write a review</Text>
          </TouchableOpacity>
        </View>

        {/* REVIEWS LIST */}
        <View style={styles.listContainer}>
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
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FIXED BOTTOM TABS */}
      <View style={styles.tabsWrapper}>
        <BottomTabs />
      </View>

      {/* SUCCESS POP-UP MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successBox}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-sharp" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>Review Published!</Text>
            <Text style={styles.successSub}>Thank you for sharing your experience with the community.</Text>
          </View>
        </View>
      </Modal>

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
    backgroundColor: '#FFF',
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
  avgLabel: { fontSize: 13, fontWeight: '700', color: '#8391A1', textTransform: 'uppercase', marginBottom: 4 },
  avgScore: { fontSize: 32, fontWeight: '800', color: '#2D3E5E' },
  maxScore: { fontSize: 18, color: '#A0AEC0' },
  starsContainer: { alignItems: 'flex-end' },
  avgStarsRow: { flexDirection: 'row', marginBottom: 4 },
  ratingsCount: { fontSize: 11, color: '#8391A1', fontWeight: '600' },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 5,
  },
  actionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3E5E' },
  addBtn: {
    backgroundColor: '#8A1C27',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#8A1C27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },

  listContainer: { marginTop: 5 },
  tabsWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 },

  // SUCCESS MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBox: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 35,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  successIconCircle: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#8A1C27',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#2D3E5E', marginBottom: 10 },
  successSub: { fontSize: 15, color: '#4A5568', textAlign: 'center', lineHeight: 22, fontWeight: '500' }
});

export default RatingRevScreen;