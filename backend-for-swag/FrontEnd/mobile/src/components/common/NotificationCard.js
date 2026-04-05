import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationCard = ({ title, message, isRead = true, onDelete, onCardPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, !isRead && styles.cardUnread]}
      onPress={onCardPress}
      activeOpacity={0.8}
    >
      <View style={styles.headerRow}>
        {!isRead && <View style={styles.unreadDot} />}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={(e) => {
            // This stops the card-click from triggering when you just want to delete
            e.stopPropagation();
            onDelete();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color="#8391A1" />
        </TouchableOpacity>
      </View>

      <Text style={styles.message} numberOfLines={3}>{message}</Text>

      <View style={styles.footer}>
        <View style={styles.seeMoreButton}>
          <Text style={styles.seeMoreText}>See more</Text>
          <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#8A1C27',
    backgroundColor: '#FDF8F8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8A1C27',
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3E5E', // Brand Navy
    marginRight: 10,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F4F9', // UI Polish: Clean, clickable background
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 16,
    lineHeight: 22, // UI Polish: Better reading height
    fontWeight: '500',
  },
  footer: {
    alignItems: 'flex-end'
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A1C27', // Brand Red
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20, // UI Polish: Pill-shaped CTA
    shadowColor: '#8A1C27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  seeMoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginRight: 4,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default NotificationCard;