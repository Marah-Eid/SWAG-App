import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

// Imports from common folder
import BottomTabs from '../common/BottomTabs';
import { fetchFollowing } from '../../store/slices/customerSlice';

const defaultLogo = require('../../../assets/images/nmk-icon.png');

const FollowingListScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  const { following } = useSelector((state) => state.customer);

  useEffect(() => {
    dispatch(fetchFollowing());
  }, [dispatch]);

  const followedVendors = following.map((v) => ({
    id: v.id,
    name: v.shopName || v.fullName || '',
    logo: v.profileImage ? { uri: v.profileImage } : require('../../../assets/images/nmk-icon.png'),
    hasNewPosts: false,
  }));

  // Filter logic: Only by search
  const filteredVendors = followedVendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER SECTION */}
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          {/* BACK BUTTON */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={30} color="#2C3E50" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Following</Text>
          <View style={styles.countBadge}>
            <Text style={styles.headerCount}>{following.length}</Text>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#7F8C8D" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search shops you follow..."
            placeholderTextColor="#7F8C8D"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* VENDOR LIST */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {filteredVendors.map((vendor) => (
            <TouchableOpacity
              key={vendor.id}
              style={styles.vendorCard}
              onPress={() => router.push({ pathname: '/customer/VendorProfCust', params: { vendorId: vendor.id } })}
              activeOpacity={0.9}
            >
              {/* Logo & New Badge */}
              <View>
                <Image source={vendor.logo} style={styles.vendorLogo} />
                {vendor.hasNewPosts && <View style={styles.newBadge} />}
              </View>

              {/* Vendor Info - Name Only */}
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorName}>{vendor.name}</Text>
              </View>

              {/* Action Container */}
              <View style={styles.actionContainer}>
                <View style={styles.followingButton}>
                  <Text style={styles.followingButtonText}>Following</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredVendors.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={50} color="#7F8C8D" />
              <Text style={styles.emptyText}>No shops found matching {searchQuery}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <BottomTabs />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#AFC6D8' },
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#AFC6D8',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
    paddingVertical: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  countBadge: {
    backgroundColor: '#2C3E50',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 10,
  },
  headerCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#AFC6D8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500',
  },
  scroll: { paddingBottom: 120 },
  listContainer: { paddingHorizontal: 15, paddingTop: 10 },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vendorLogo: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#F0F2F5',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  newBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E74C3C',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  vendorInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#F1F4F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D9E6',
  },
  followingButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#546E7A',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#7F8C8D',
    fontSize: 15,
    fontWeight: '500',
  }
});

export default FollowingListScreen;