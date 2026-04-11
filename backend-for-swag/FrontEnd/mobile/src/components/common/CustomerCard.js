import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient'; // Added LinearGradient

const CustomerCard = ({ name, phone, city, location, profileImage }) => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/customer/ProfileCust');
  };

  return (
    <View style={styles.wrapper}>
      {/* 1. The main card background - Now a Gradient */}
      <LinearGradient
        colors={['#FFFFFF', '#b5cbe2']} // White to Light Blue
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }} // Horizontal spread
        style={styles.card}
      >
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.subText} numberOfLines={1}>{phone}</Text>
          <Text style={styles.subText} numberOfLines={1}>{city || location}</Text>
        </View>

        {/* Car Icon: Always navigates to ProfileCust */}
        <TouchableOpacity style={styles.carAction} onPress={handleNavigate} activeOpacity={0.7}>
          <Image
            source={require('../../../assets/images/carprof-icon.png')}
            style={styles.carIcon}
          />
          <Text style={styles.carLabel}>My Car</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Profile Picture: Always navigates to ProfileCust */}
      <TouchableOpacity style={styles.pfpContainer} onPress={handleNavigate} activeOpacity={0.8}>
        <Image
          source={profileImage || require('../../../assets/images/default-user-pfp.png')}
          style={styles.profilePic}
        />
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
    borderRadius: 20, // UI Polish: Modern rounding matching the rest of the app
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
  profilePic: {
    width: 85, // UI Polish: Slightly larger avatar
    height: 85,
    borderRadius: 42.5,
    borderWidth: 2, // UI Polish: Thicker, bolder border
    borderColor: '#8A1C27', // Brand Red
    backgroundColor: '#FFF',
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
    fontWeight: '500',
    marginTop: 2,
  },
  carAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  carIcon: {
    width: 42,
    height: 42,
    resizeMode: 'contain'
  },
  carLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
    color: '#2D3E5E' // UI Polish: Brand Navy
  },
});

export default CustomerCard;