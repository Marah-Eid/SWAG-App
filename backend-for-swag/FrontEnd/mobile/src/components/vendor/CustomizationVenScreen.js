import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

import VendorSearchBar from '../commonV/VendorSearchBar';
import VendorCard from '../commonV/VendorCard';
import BottomTabsVen from '../commonV/BottomTabsVen';

const defaultLogo = require('../../../assets/images/carshop-icon.png');

const CustomizationVenScreen = () => {
  const router = useRouter();
  const { myProfile } = useSelector((state) => state.vendor);

  const categories = [
    {
      id: 1,
      title: 'Tuning',
      subtitle: 'Manage modification listings',
      route: '/commonScreensV/AfterTuningV',
      icon: <MaterialCommunityIcons name="engine-outline" size={24} color="#8A1C27" />
    },
    {
      id: 2,
      title: 'Accessories & Add-ons',
      subtitle: 'Interior and exterior gadgets',
      route: '/commonScreensV/AfterAccessoriesV',
      icon: <Ionicons name="construct-outline" size={22} color="#8A1C27" />
    },
    {
      id: 3,
      title: 'Paint & Bodywork',
      subtitle: 'Restoration and detailing services',
      route: '/commonScreensV/AfterPaint&BodyworkV',
      icon: <MaterialCommunityIcons name="format-paint" size={24} color="#8A1C27" />
    },
    {
      id: 4,
      title: 'Seat Upholstery',
      subtitle: 'Custom interior design management',
      route: '/commonScreensV/AfterSeatUpholsteryV',
      icon: <FontAwesome5 name="couch" size={18} color="#8A1C27" />
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* UI Polish: Pinned Search Bar */}
      <View style={styles.searchWrapper}>
        <VendorSearchBar />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* UI Polish: Full width card with perfect bottom gap */}
        <View style={styles.cardWrapper}>
          <VendorCard
            shopName={myProfile?.shopName || ''}
            rating={myProfile?.averageRating?.toFixed(1) || '0.0'}
            logo={myProfile?.profileImage ? { uri: myProfile.profileImage } : defaultLogo}
          />
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.sectionLabel}>Customization Services</Text>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.navCardWrapper}
              onPress={() => router.push(cat.route)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFFFFF', '#b5cbe2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.navCard}
              >
                <View style={styles.navContent}>
                  <View style={styles.iconCircle}>
                    {cat.icon}
                  </View>
                  <View style={styles.textGroup}>
                    <Text style={styles.navTitle}>{cat.title}</Text>
                    <Text style={styles.navSubtitle}>{cat.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.tabsWrapper}>
        <BottomTabsVen />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BFCEDC',
  },
  searchWrapper: {
    paddingTop: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 130,
    paddingTop: 10,
  },
  cardWrapper: {
    marginBottom: 25,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8391A1',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
    marginLeft: 5,
  },
  navCardWrapper: {
    marginBottom: 15,
    borderRadius: 25,
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
    overflow: 'hidden',
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
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
    color: '#2D3E5E',
    letterSpacing: 0.3,
  },
  navSubtitle: {
    fontSize: 12,
    color: '#8391A1',
    fontWeight: '500',
    marginTop: 2,
  },
  tabsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  }
});

export default CustomizationVenScreen;