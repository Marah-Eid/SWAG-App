import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import RevCard from '../common/RevCard';
import BottomTabs from '../common/BottomTabs';
import { submitReview } from '../../store/slices/postsSlice';
import { fetchVendorReviews } from '../../store/slices/vendorSlice';

const { width } = Dimensions.get('window');

const AddReviewScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { vendorId } = useLocalSearchParams();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviews = useSelector((state) => state.vendor.reviews) || [];

  useEffect(() => {
    if (vendorId) dispatch(fetchVendorReviews(vendorId));
  }, [vendorId, dispatch]);

  const defaultPic = require('../../../assets/images/gorg-icon.png');
  const recentReviews = (Array.isArray(reviews) ? reviews : []).slice(0, 3).map((r) => ({
    id: r.id,
    firstName: (r.customerName || r.userName || r.fullName || 'User').split(' ')[0],
    lastName: (r.customerName || r.userName || r.fullName || '').split(' ').slice(1).join(' '),
    profilePic: (r.customerImage || r.profileImage) ? { uri: r.customerImage || r.profileImage } : defaultPic,
    rating: r.rating,
    feedback: r.feedback || r.content || '',
  }));

  const handleTextChange = (text) => {
    // Basic word count logic
    const words = text.trim().split(/\s+/);
    if (words.length <= 100 || text === '') {
      setFeedback(text);
    }
  };

  const wordCount = feedback.trim() === '' ? 0 : feedback.trim().split(/\s+/).length;

  const handlePost = async () => {
    if (!feedback.trim() || rating === 0) {
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    const result = await dispatch(submitReview({ vendorId, rating, feedback: feedback.trim() }));
    setIsSubmitting(false);

    if (submitReview.fulfilled.match(result)) {
      router.push({
        pathname: '/customer/Rating&RevCust',
        params: { success: 'true', vendorId }
      });
    } else {
      setShowErrorModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color="#2D3E5E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Review</Text>

        <TouchableOpacity style={styles.postBtn} onPress={handlePost} activeOpacity={0.8} disabled={isSubmitting}>
          {isSubmitting
            ? <ActivityIndicator size="small" color="#FFF" />
            : <Text style={styles.postBtnText}>Post</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        <View style={styles.topTextSection}>
          <Text style={styles.mainTitle}>How was your experience?</Text>
          <Text style={styles.subTitle}>Your feedback helps the community grow!</Text>
        </View>

        {/* --- REVIEW INPUT CARD --- */}
        <View style={styles.inputCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#8A1C27" />
            </View>
            <Text style={styles.cardHeaderText}>Write your feedback</Text>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="Share your experience with the community..."
            placeholderTextColor="#A0AEC0"
            multiline
            value={feedback}
            onChangeText={handleTextChange}
            textAlignVertical="top"
          />

          <View style={styles.inputFooter}>
            <View style={styles.divider} />
            <Text style={[styles.wordCounter, wordCount >= 90 && { color: '#8A1C27', fontWeight: '800' }]}>
              {wordCount} / 100 words
            </Text>
          </View>
        </View>

        {/* --- STAR RATING SECTION --- */}
        <View style={styles.rateSection}>
          <Text style={styles.rateLabel}>Tap to rate</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setRating(index)}
                activeOpacity={0.5}
              >
                <Entypo
                  name={rating >= index ? "star" : "star-outlined"}
                  size={42}
                  color={rating >= index ? "#8A1C27" : "#CBD5E1"}
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* RECENT REVIEWS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          <View style={styles.titleUnderline} />
        </View>

        <View style={styles.listContainer}>
          {recentReviews.length > 0 ? recentReviews.map((item) => (
            <RevCard
              key={item.id}
              firstName={item.firstName}
              lastName={item.lastName}
              profilePic={item.profilePic}
              rating={item.rating}
              feedback={item.feedback}
            />
          )) : (
            <Text style={{ textAlign: 'center', color: '#8391A1', fontSize: 14, fontWeight: '500' }}>No reviews yet. Be the first!</Text>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.tabsWrapper}>
        <BottomTabs />
      </View>

      {/* ERROR MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showErrorModal}
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorBox}>
            <View style={styles.errorIconBg}>
              <Ionicons name="warning" size={40} color="#8A1C27" />
            </View>
            <Text style={styles.errorTitle}>Required Fields</Text>
            <Text style={styles.errorSubtext}>Please provide both a star rating and some feedback before posting.</Text>

            <TouchableOpacity
              style={styles.closeErrorBtn}
              onPress={() => setShowErrorModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeErrorText}>Got it</Text>
            </TouchableOpacity>
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
  postBtn: {
    backgroundColor: '#8A1C27',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#8A1C27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  postBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14, textTransform: 'uppercase' },

  scrollPadding: { paddingHorizontal: 20 },
  topTextSection: { marginVertical: 30, alignItems: 'center' },
  mainTitle: { fontSize: 24, fontWeight: '800', color: '#2D3E5E', textAlign: 'center' },
  subTitle: { fontSize: 14, color: '#8391A1', marginTop: 8, textAlign: 'center', fontWeight: '500' },

  inputCard: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FDF2F3',
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  cardHeaderText: { fontSize: 16, fontWeight: '700', color: '#2D3E5E' },
  textInput: {
    fontSize: 15,
    color: '#4A5568',
    height: 120,
    lineHeight: 24,
    fontWeight: '500',
  },
  inputFooter: { marginTop: 10 },
  divider: { height: 1, backgroundColor: '#F1F4F9', marginBottom: 10 },
  wordCounter: { alignSelf: 'flex-end', fontSize: 11, color: '#A0AEC0', fontWeight: '600' },

  rateSection: { alignItems: 'center', marginVertical: 40 },
  rateLabel: { fontSize: 16, fontWeight: '800', color: '#2D3E5E', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },
  starsRow: { flexDirection: 'row', gap: 10 },
  starIcon: { marginHorizontal: 2 },

  sectionHeader: { marginBottom: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3E5E' },
  titleUnderline: { width: 40, height: 4, backgroundColor: '#8A1C27', borderRadius: 2, marginTop: 6 },

  listContainer: { width: '100%' },
  tabsWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 },

  // ERROR MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 35,
    padding: 30,
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  errorIconBg: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#FDF2F3',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20
  },
  errorTitle: { fontSize: 20, fontWeight: '800', color: '#2D3E5E', marginBottom: 10 },
  errorSubtext: {
    fontSize: 15,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
    fontWeight: '500',
  },
  closeErrorBtn: {
    backgroundColor: '#2D3E5E',
    height: 55,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D3E5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  closeErrorText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});

export default AddReviewScreen;