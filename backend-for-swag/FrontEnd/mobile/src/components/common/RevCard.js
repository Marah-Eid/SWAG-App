import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';

const RevCard = ({ profilePic, firstName, lastName, rating, feedback }) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Maximum characters to show before truncating
  const MAX_LENGTH = 35;

  const safeFeedback = feedback || "";
  const shouldTruncate = safeFeedback.length > MAX_LENGTH;

  // Text to display on the card
  const displayText = shouldTruncate
    ? safeFeedback.substring(0, MAX_LENGTH) + '... '
    : safeFeedback;

  return (
    <>
      <View style={styles.cardContainer}>
        {/* Floating Avatar */}
        <View style={styles.avatarWrapper}>
          <Image source={profilePic} style={styles.profilePic} resizeMode="cover" />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.textRow}>

            <View style={styles.nameCol}>
              <Text style={styles.firstName} numberOfLines={1}>{firstName}</Text>
              <Text style={styles.lastName} numberOfLines={1}>{lastName}</Text>

              {/* Feedback Text & Clickable Read More */}
              {safeFeedback ? (
                <Text style={styles.feedbackText}>
                  {displayText}
                  {shouldTruncate && (
                    <Text
                      style={styles.readMoreText}
                      onPress={() => setModalVisible(true)}
                    >
                      Read more
                    </Text>
                  )}
                </Text>
              ) : null}
            </View>

            <View style={styles.divider} />

            <View style={styles.ratingCol}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Entypo
                    key={i}
                    name={rating >= i ? "star" : "star-outlined"}
                    size={12}
                    color={rating >= i ? "#8A1C27" : "#CBD5E1"}
                  />
                ))}
              </View>
              <Text style={styles.reviewLabel}>{rating || 0}/5</Text>
            </View>

          </View>
        </View>
      </View>

      {/* --- THE POP-UP MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.backdrop} onPress={() => setModalVisible(false)} activeOpacity={1} />

          <View style={styles.modalContent}>

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review by {firstName}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={28} color="#8A1C27" />
              </TouchableOpacity>
            </View>

            {/* Modal Scrollable Text */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.modalFeedbackText}>{safeFeedback}</Text>
            </ScrollView>

          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 15, // UI Polish: Added breathing room
  },
  avatarWrapper: {
    zIndex: 10,
    elevation: 6, // UI Polish: Lifts avatar off the card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
  },
  profilePic: {
    width: 76, // UI Polish: Slightly tweaked sizes
    height: 76,
    borderRadius: 38,
    borderWidth: 3, // UI Polish: Crisp white ring to separate from the card
    borderColor: '#FFFFFF',
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // UI Polish: Softer curves
    flex: 1,
    marginLeft: -45, // Pulls the card underneath the avatar
    paddingLeft: 55, // Pushes text past the avatar
    paddingVertical: 18,
    paddingRight: 15,
    minHeight: 85,
    justifyContent: 'center',
    // UI Polish: Premium depth shadow
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameCol: {
    flex: 1,
    paddingRight: 10,
  },
  firstName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3E5E', // Brand Navy
    letterSpacing: 0.3,
  },
  lastName: {
    fontSize: 13,
    color: '#8391A1',
    fontWeight: '600',
    marginTop: 2,
  },
  feedbackText: {
    fontSize: 12,
    color: '#4A5568',
    marginTop: 6,
    lineHeight: 18,
    fontWeight: '500',
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A1C27', // Brand Red
  },
  divider: {
    width: 1.5,
    alignSelf: 'stretch',
    backgroundColor: '#E2E8F0', // UI Polish: Softer gray divider
    marginHorizontal: 12,
  },
  ratingCol: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 65, // Fixes jumping width issues
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2D3E5E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // UI Polish: Darker backdrop
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '85%',
    maxHeight: '65%',
    backgroundColor: '#FFFFFF',
    borderRadius: 25, // UI Polish: Global modal curve
    padding: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F4F9', // UI Polish: Softer bottom line
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3E5E',
  },
  closeBtn: {
    padding: 4, // Makes it easier to tap
  },
  modalFeedbackText: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 24, // Better reading experience
    fontWeight: '500',
  }
});

export default RevCard;