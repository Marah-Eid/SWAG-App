import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import BottomTabsVen from '../commonV/BottomTabsVen';
import ProfilePopup from '../common/ProfilePopup';
import { fetchVendorFollowers } from '../../store/slices/vendorSlice';

const defaultPfp = require('../../../assets/images/Euleback-photo.png');
const defaultLogo = require('../../../assets/images/nmk-icon.png');

const FollowersListScreenV = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const myProfile = useSelector((state) => state.vendor.myProfile);
  const vendorFollowers = useSelector((state) => state.vendor.vendorFollowers) || [];

  useEffect(() => {
    if (myProfile?.id) dispatch(fetchVendorFollowers(myProfile.id));
  }, [myProfile?.id, dispatch]);

  const followersData = vendorFollowers.map((f) => ({
    id: f.id,
    name: f.fullName || f.shopName || 'User',
    type: f.userType || f.type || 'customer',
    pfp: f.profileImage ? { uri: f.profileImage } : defaultPfp,
    logo: f.profileImage ? { uri: f.profileImage } : defaultLogo,
    banner: f.bannerImage ? { uri: f.bannerImage } : null,
  }));

  const filteredFollowers = followersData.filter(follower =>
    follower.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCustomerPress = (customer) => {
    setSelectedCustomer(customer);
    setPopupVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={30} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Followers</Text>
          <View style={styles.countBadge}>
            <Text style={styles.headerCount}>{vendorFollowers.length}</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#7F8C8D" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search followers..."
            placeholderTextColor="#7F8C8D"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {filteredFollowers.map((follower) => (
            <TouchableOpacity
              key={follower.id}
              style={styles.userCard}
              onPress={() => {
                if (follower.type === 'vendor') {
                  router.push('/vendor/otherVendorProfile');
                } else {
                  handleCustomerPress(follower);
                }
              }}
              activeOpacity={0.7}
            >
              <Image
                source={follower.type === 'vendor' ? follower.logo : follower.pfp}
                style={styles.avatarImage}
                defaultSource={defaultPfp}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{follower.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedCustomer && (
        <ProfilePopup
          visible={isPopupVisible}
          onClose={() => setPopupVisible(false)}
          userName={selectedCustomer.name}
          profileImage={selectedCustomer.pfp}
          customerId={selectedCustomer.id}
        />
      )}
      <BottomTabsVen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#AFC6D8' },
  headerContainer: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#AFC6D8' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50' },
  countBadge: { backgroundColor: '#2C3E50', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12, marginLeft: 10 },
  headerCount: { fontSize: 16, fontWeight: 'bold', color: '#AFC6D8' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 15, height: 50, elevation: 3 },
  searchInput: { flex: 1, fontSize: 15, color: '#2C3E50', fontWeight: '500' },
  scroll: { paddingBottom: 120 },
  listContainer: { paddingHorizontal: 15, paddingTop: 10 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, marginBottom: 12, elevation: 2 },
  avatarImage: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#F0F2F5', borderWidth: 1, borderColor: '#E2E8F0' },
  userInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50' },
});

export default FollowersListScreenV;