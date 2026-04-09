import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSelector } from 'react-redux';

const BottomTabs = () => {
  const router = useRouter();
  const pathname = usePathname() || '';
  const isActive = (routeKeyword) => pathname.includes(routeKeyword);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const unreadChats = useSelector((state) =>
    state.chats.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  );

  return (
    <View style={styles.container}>

      {/* Home Icon */}
      <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/customer/HomeCust')}>
        <Image source={require('../../../assets/images/home-icon.png')} style={styles.icon} />
        {/* The dot is always rendered, but only gets colored white if active */}
        <View style={[styles.dot, { backgroundColor: isActive('HomeCust') ? '#FFFFFF' : 'transparent' }]} />
      </TouchableOpacity>

      {/* Notifications Icon */}
      <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/customer/NotificationsCust')}>
        <View style={styles.iconWrapper}>
          <Image source={require('../../../assets/images/noti-icon.png')} style={styles.icon} />
          {unreadCount > 0 && <View style={styles.badge} />}
        </View>
        <View style={[styles.dot, { backgroundColor: isActive('NotificationsCust') ? '#FFFFFF' : 'transparent' }]} />
      </TouchableOpacity>

      {/* Explore Icon (Center Prominent) */}
      <TouchableOpacity style={styles.iconLargeContainer} onPress={() => router.push('/customer/ExploreCust')}>
        <Image source={require('../../../assets/images/explore-icon.png')} style={styles.iconLarge} />
        <View style={[styles.dot, styles.largeDotSpacing, { backgroundColor: isActive('Explore') ? '#FFFFFF' : 'transparent' }]} />
      </TouchableOpacity>

      {/* Chats Icon */}
      <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/customer/ChatsCust')}>
        <View style={styles.iconWrapper}>
          <Image source={require('../../../assets/images/chats-icon.png')} style={styles.icon} />
          {unreadChats > 0 && <View style={styles.badge} />}
        </View>
        <View style={[styles.dot, { backgroundColor: isActive('ChatsCust') ? '#FFFFFF' : 'transparent' }]} />
      </TouchableOpacity>

      {/* Profile Icon */}
      <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/customer/ProfileCust')}>
        <Image source={require('../../../assets/images/prof-icon.png')} style={styles.icon} />
        <View style={[styles.dot, { backgroundColor: isActive('ProfileCust') ? '#FFFFFF' : 'transparent' }]} />
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#5A82A0',
    height: 90,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 15,
  },
  iconButton: {
    padding: 10,
    alignItems: 'center', // Centers the dot perfectly under the image
    justifyContent: 'center',
  },
  iconLargeContainer: {
    padding: 5,
    marginBottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderColor: '#5A82A0',
  },
  icon: {
    width: 26,
    height: 26,
    tintColor: 'white',
    resizeMode: 'contain',
  },
  iconLarge: {
    width: 40,
    height: 40,
    tintColor: 'white',
    resizeMode: 'contain',
  },
  // --- BULLETPROOF DOT STYLING ---
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6, // Adds a safe gap between the icon and the dot
  },
  largeDotSpacing: {
    marginTop: 2, // Slightly less margin for the big center button so it doesn't push the bar height
  }
});

export default BottomTabs;