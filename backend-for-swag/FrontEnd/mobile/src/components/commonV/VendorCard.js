import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient'; // Added LinearGradient
import { Entypo } from '@expo/vector-icons';

const VendorCard = ({ shopName = "Automotive", rating = "4.0", logo }) => {
  const router = useRouter();
  const ratingNum = parseFloat(rating) || 0;

  const handleNavigate = () => {
    router.push('/vendor/ProfileVen');
  };

  return (
    <View style={styles.wrapper}>
      {/* 1. Main Card Background - Now a Gradient */}
      <LinearGradient
        colors={['#FFFFFF', '#b5cbe2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >

        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>{shopName}</Text>
          <Text style={styles.subText} numberOfLines={1}>Avg Rating {rating}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Entypo
                key={i}
                name={ratingNum >= i ? 'star' : 'star-outlined'}
                size={12}
                color={ratingNum >= i ? '#8A1C27' : '#CBD5E1'}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.shopAction} onPress={handleNavigate} activeOpacity={0.7}>
          <Image
            source={require('../../../assets/images/Myshop-icon.png')}
            style={styles.shopIcon}
          />
          <Text style={styles.shopLabel}>My Shop</Text>
        </TouchableOpacity>

      </LinearGradient>

      <TouchableOpacity style={styles.pfpContainer} onPress={handleNavigate} activeOpacity={0.8}>
        <View style={styles.logoBorder}>
          {/* CHECK IF LOGO IS NULL. IF NULL, SHOW BLANK VIEW. ELSE SHOW IMAGE */}
          {logo === null ? (
            <View style={[styles.profilePic, { backgroundColor: '#F1F4F9' }]} />
          ) : (
            <Image
              source={logo || require('../../../assets/images/nmk-icon.png')}
              style={styles.profilePic}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
    marginLeft: 60, // UI Polish: Accommodate the overlapping avatar perfectly
  },
  card: {
    flexDirection: 'row',
    borderRadius: 20, // UI Polish: Modern rounding
    paddingVertical: 15,
    paddingRight: 20,
    paddingLeft: 55, // UI Polish: Breathing room for the avatar
    alignItems: 'center',
    minHeight: 90, // UI Polish: Slightly taller for elegance
    // UI Polish: Premium depth shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  pfpContainer: {
    position: 'absolute',
    left: -45, // UI Polish: Center the overlap
    zIndex: 10,
    elevation: 6,
    // UI Polish: Shadow on the avatar makes it pop out from the card
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoBorder: {
    width: 85, // UI Polish: Matched Customer Card sizing
    height: 85,
    borderRadius: 42.5,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // UI Polish: Bolder brand border
    borderColor: '#8A1C27',
    overflow: 'hidden',
  },
  profilePic: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // UI Polish: cover ensures the image fills the circle perfectly
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '800', // UI Polish: Bolder name
    color: '#2D3E5E', // UI Polish: Brand Navy
    marginBottom: 2,
  },
  subText: {
    fontSize: 13,
    color: '#8391A1', // UI Polish: Softer secondary text
    marginTop: 2,
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  shopAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  shopIcon: {
    width: 42,
    height: 42,
    resizeMode: 'contain'
  },
  shopLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
    color: '#2D3E5E' // UI Polish: Brand Navy
  },
});

export default VendorCard;