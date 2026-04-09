import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient'; // Added LinearGradient

const defaultIcon = require('../../../assets/images/carshop-icon.png');

const VendorPin = ({ icon, onPress }) => {
  const [imgError, setImgError] = useState(false);
  const resolvedIcon = imgError ? defaultIcon : icon;
  return (
    <TouchableOpacity style={styles.pinWrapper} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.pinShape} />
      <View style={styles.iconContainer}>
        <Image source={resolvedIcon} style={styles.vendorIcon} onError={() => setImgError(true)} />
      </View>
    </TouchableOpacity>
  );
};

const FollowingSection = () => {
  const router = useRouter();
  const { following } = useSelector((state) => state.customer);

  const vendors = following.length > 0
    ? following.slice(0, 5).map((v) => ({
        id: v.id,
        icon: v.profileImage ? { uri: v.profileImage } : defaultIcon,
      }))
    : [];

  return (
    // Replaced the solid View with a LinearGradient
    <LinearGradient
      colors={['#FFFFFF', '#b5cbe2']} // White to Light Blue
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.glassContainer}
    >

      <TouchableOpacity onPress={() => router.push('/customer/FollowingCust')} style={styles.badgeContainer} activeOpacity={0.7}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Following</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.pinsRow}>
        {vendors.map((vendor) => (
          <VendorPin
            key={vendor.id}
            icon={vendor.icon}
            onPress={() => router.push({ pathname: '/customer/VendorProfCust', params: { vendorId: vendor.id } })}
          />
        ))}
      </View>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  glassContainer: {
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 20,
    borderRadius: 20,
    padding: 15,
    height: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  badgeContainer: {
    alignItems: 'flex-start',
    marginBottom: 5, // Tighter spacing to pins
  },
  badge: {
    backgroundColor: '#8A1C27', // Brand Red
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12, // UI Polish: Modern Pill shape
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pinsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 5,
  },
  pinWrapper: {
    width: 60,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pinShape: {
    width: 55,
    height: 55,
    backgroundColor: '#FFFFFF', // Keep pins solid white so they pop against the gradient
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 5,
    transform: [{ rotate: '45deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 55,
    height: 55,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -27.5 }, { translateY: -30 }],
  },
  vendorIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    resizeMode: 'cover',
    overflow: 'hidden',
  }
});

export default FollowingSection;