import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const ChatRow = ({ userName, lastMessage, time, avatar, unreadCount = 0, onPress }) => {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>

        {/* Avatar with Premium Border */}
        <View style={styles.avatarContainer}>
          <Image
            source={avatar ? avatar : require('../../../assets/images/prof-icon.png')}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>

        <View style={styles.content}>

          {/* Top Row: Name and Time */}
          <View style={styles.topRow}>
            <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
            <Text style={[styles.time, unreadCount > 0 && styles.timeUnread]}>{time}</Text>
          </View>

          {/* Bottom Row: Message and Unread Badge */}
          <View style={styles.bottomRow}>
            <Text
              style={[styles.message, unreadCount > 0 && styles.messageUnread]}
              numberOfLines={1}
            >
              {lastMessage}
            </Text>

            {/* Conditional Unread Badge */}
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>

        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingVertical: 6, // UI Polish: Spacing between floating chat cards
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', // UI Polish: Clean crisp white
    borderRadius: 20, // UI Polish: Modern rounding
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignItems: 'center',
    // UI Polish: Premium depth shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 58, // UI Polish: Slightly tweaked sizing
    height: 58,
    borderRadius: 29,
    borderWidth: 2, // UI Polish: Thicker, bolder border
    borderColor: '#8A1C27', // Brand Red
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F4F9',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800', // UI Polish: Bolder name
    color: '#2D3E5E', // Brand Navy
    flex: 1,
    marginRight: 10,
  },
  time: {
    fontSize: 12,
    color: '#8391A1', // UI Polish: Softer secondary text
    fontWeight: '500',
  },
  timeUnread: {
    color: '#8A1C27', // UI Polish: Red time if unread
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: '#4A5568',
    flex: 1,
    marginRight: 10,
    fontWeight: '400',
  },
  messageUnread: {
    color: '#2D3E5E', // UI Polish: Darker message if unread
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: '#8A1C27', // Brand Red
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});

export default ChatRow;