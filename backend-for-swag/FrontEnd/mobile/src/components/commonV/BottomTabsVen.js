import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Alert, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSelector } from 'react-redux';
import CreatePostEventModal from './CreatePostEventModal'; // <-- IMPORT MODAL

// --- UPDATED: isPending defaults to true so it stays locked on other screens! ---
const BottomTabsVen = ({ isPending = true, onRestrictedAction }) => {
  const router = useRouter();

  // --- NEW: Automatically get the current route ---
  const pathname = usePathname() || '';
  const isActive = (routeKeyword) => pathname.includes(routeKeyword);

  // --- ADD STATE FOR MODAL ---
  const [modalVisible, setModalVisible] = useState(false);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const unreadChats = useSelector((state) =>
    state.chats.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  );

  const handleAddPress = () => {
    if (isPending) {
      if (onRestrictedAction) {
        onRestrictedAction();
      } else {
        if (Platform.OS === 'web') {
          window.alert("Account Pending: You cannot create posts or events until an admin approves your shop.");
        } else {
          Alert.alert(
            "Account Pending",
            "You cannot create posts or events until an admin approves your shop.",
            [{ text: "Understood", style: "cancel" }]
          );
        }
      }
    } else {
      setModalVisible(true);
    }
  };

  return (
    <>
      <View style={styles.tabContainer}>

        {/* 1. Home Button */}
        <TouchableOpacity style={styles.tabButton} onPress={() => router.push('/vendor/HomeVen')} activeOpacity={0.8}>
          <Image
            source={require('../../../assets/images/home-icon.png')}
            style={styles.tabIcon}
          />
          <View style={[styles.dot, { backgroundColor: isActive('HomeVen') ? '#FFFFFF' : 'transparent' }]} />
        </TouchableOpacity>

        {/* 2. Notifications Button */}
        <TouchableOpacity style={styles.tabButton} onPress={() => router.push('/vendor/NotificationsVen')} activeOpacity={0.8}>
          <View style={styles.iconWrapper}>
            <Image
              source={require('../../../assets/images/noti-icon.png')}
              style={styles.tabIcon}
            />
            {unreadCount > 0 && <View style={styles.badge} />}
          </View>
          <View style={[styles.dot, { backgroundColor: isActive('NotificationsVen') ? '#FFFFFF' : 'transparent' }]} />
        </TouchableOpacity>

        {/* 3. The Central "Add" Button - SECURED GLOBALLY (No dot needed here) */}
        <TouchableOpacity
          style={styles.addButtonContainer}
          onPress={handleAddPress}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../../assets/images/add-icon.png')}
            style={styles.addIcon}
          />
        </TouchableOpacity>

        {/* 4. Messages/Chats Button */}
        <TouchableOpacity style={styles.tabButton} onPress={() => router.push('/vendor/ChatsVen')} activeOpacity={0.8}>
          <View style={styles.iconWrapper}>
            <Image
              source={require('../../../assets/images/chats-icon.png')}
              style={styles.tabIcon}
            />
            {unreadChats > 0 && <View style={styles.badge} />}
          </View>
          <View style={[styles.dot, { backgroundColor: isActive('ChatsVen') ? '#FFFFFF' : 'transparent' }]} />
        </TouchableOpacity>

        {/* 5. Explore Button */}
        <TouchableOpacity style={styles.tabButton} onPress={() => router.push('/vendor/ExploreVen')} activeOpacity={0.8}>
          <Image
            source={require('../../../assets/images/explore-icon.png')}
            style={styles.tabIcon}
          />
          <View style={[styles.dot, { backgroundColor: isActive('ExploreVen') ? '#FFFFFF' : 'transparent' }]} />
        </TouchableOpacity>

      </View>

      {/* --- RENDER THE MODAL --- */}
      <CreatePostEventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#61829B', // Vendor blue
    height: 90,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 15,
  },
  tabButton: {
    padding: 10,
    alignItems: 'center', // Centers the dot perfectly under the image
    justifyContent: 'center',
  },
  tabIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
    opacity: 0.9,
  },
  addButtonContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#F1F4F9',
  },
  addIcon: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
  },
  iconWrapper: {
    width: 26,
    height: 26,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#8A1C27',
    borderWidth: 1.5,
    borderColor: '#61829B',
  },
  // --- BULLETPROOF DOT STYLING ---
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  }
});

export default BottomTabsVen;