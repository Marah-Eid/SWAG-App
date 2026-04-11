import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

import CustomSearchBar from '../common/CustomSearchBar';
import CustomerCard from '../common/CustomerCard';
import BottomTabs from '../common/BottomTabs';
import SideMenu from '../common/SideMenu';

const defaultPic = require('../../../assets/images/default-user-pfp.png');

const ServicesScreen = () => {
  const router = useRouter();
  const { profile } = useSelector((state) => state.customer);

  // State to control the side menu popup
  const [isMenuVisible, setMenuVisible] = useState(false);

  // Array containing titles, icons, and routes for services
  const categories = [
    {
      title: "Maintenance",
      subtitle: "Mechanical and electrical repairs",
      route: "/commonScreens/AfterMaintenance",
      icon: <Ionicons name="build-outline" size={22} color="#8A1C27" />
    },
    {
      title: "Car Washes",
      subtitle: "Full detailing and express wash",
      route: "/commonScreens/AfterCarWashes",
      // FIXED: Changed "bubbles" to "car-wash" so it renders perfectly
      icon: <MaterialCommunityIcons name="car-wash" size={24} color="#8A1C27" />
    },
    {
      title: "Gas Stations",
      subtitle: "Fuel, oil changes, and convenience",
      route: "/commonScreens/AfterGasStation",
      icon: <FontAwesome5 name="gas-pump" size={20} color="#8A1C27" />
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* UI Polish: Moved Search Bar outside ScrollView to stay fixed at the top, just like Home */}
      <View style={styles.searchWrapper}>
        <CustomSearchBar onMenuPress={() => setMenuVisible(true)} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* USER PROFILE CARD */}
        <View style={styles.cardWrapper}>
          <CustomerCard
            name={profile?.fullName || 'User'}
            phone={profile?.phone || profile?.email || ''}
            city={profile?.city || ''}
            profileImage={profile?.profileImage ? { uri: profile.profileImage } : defaultPic}
            onProfilePress={() => router.push('/customer/ProfileCust')}
            onCarPress={() => router.push('/customer/ProfileCust')}
          />
        </View>

        {/* SERVICES NAVIGATION LIST */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Essential Services</Text>

          {categories.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navCardWrapper}
              onPress={() => router.push(item.route)}
              activeOpacity={0.8}
            >
              {/* Applied Gradient Background */}
              <LinearGradient
                colors={['#FFFFFF', '#b5cbe2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.navCard}
              >
                <View style={styles.navContent}>
                  <View style={styles.iconCircle}>
                    {item.icon}
                  </View>
                  <View style={styles.textGroup}>
                    <Text style={styles.navTitle}>{item.title}</Text>
                    <Text style={styles.navSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* FOOTER */}
      <View style={styles.bottomTabsWrapper}>
        <BottomTabs />
      </View>

      {/* SIDE MENU OVERLAY */}
      <SideMenu
        visible={isMenuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AFC6D8'
  },
  // UI Polish: Matched Home Screen Search Bar spacing
  searchWrapper: {
    paddingTop: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 10, // Nice gap before the profile card starts
  },
  cardWrapper: {
    // FIXED: Removed paddingHorizontal: 20 so the card stretches to its proper length
    marginBottom: 25, // Creates a beautiful gap between the Profile Card and the List
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8391A1',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
    marginLeft: 5,
  },
  // Separated the wrapper for shadows so the gradient's overflow doesn't clip it
  navCardWrapper: {
    marginBottom: 15,
    borderRadius: 25, // Global Premium Card Curves
    // High-end depth shadow
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 25,
    overflow: 'hidden', // Ensures the gradient stays inside the rounded corners
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF', // Changed to white to pop against the blue gradient
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    // Added a subtle shadow to the icon circle for extra depth
    shadowColor: '#8A1C27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  textGroup: {
    flex: 1,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3E5E', // Brand Navy
    letterSpacing: 0.3,
  },
  navSubtitle: {
    fontSize: 12,
    color: '#8391A1',
    fontWeight: '500',
    marginTop: 2,
  },

  bottomTabsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  }
});

export default ServicesScreen;