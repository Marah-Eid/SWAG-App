import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 1. Get Screen Dimensions
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_MARGIN = 15;

// Added onUnfollow prop here
const FollowingShopsV = ({ shopsData = [], onUnfollow }) => {
  const router = useRouter();

  // Local state to briefly show the Plus icon before the card is erased
  const [localUnfollowed, setLocalUnfollowed] = useState({});

  const handleToggle = (id) => {
    // 1. Instantly change icon to Plus (+) so user sees the unfollow registered
    setLocalUnfollowed(prev => ({ ...prev, [id]: true }));

    // 2. Wait 400ms, then tell the parent screen to completely erase the card & posts
    setTimeout(() => {
      if (onUnfollow) onUnfollow(id);
    }, 400);
  };

  // Smart Navigation: Passes the vendor's name to the profile screen
  const handleNavigate = (vendorName) => {
    router.push({
      pathname: '/commonScreensV/otherVendorProfile',
      params: { userName: vendorName }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        snapToAlignment="center"
      >
        {shopsData.map((shop) => (
          <View key={shop.id} style={styles.cardWrapper}>
            <ImageBackground
              source={shop.bgImage}
              style={styles.card}
              imageStyle={{ borderRadius: 16 }}
            >
              <View style={styles.darkOverlay}>

                {/* Header Badge */}
                <TouchableOpacity
                  onPress={() => handleNavigate(shop.name)}
                  activeOpacity={0.8}
                  style={styles.badgeContainer}
                >
                  <Text style={styles.cardHeader}>Following</Text>
                </TouchableOpacity>

                <View style={styles.contentRow}>

                  {/* Logo -> Navigates to Vendor Profile */}
                  <TouchableOpacity onPress={() => handleNavigate(shop.name)} activeOpacity={0.8}>
                    <Image source={shop.logo} style={styles.logo} />
                  </TouchableOpacity>

                  {/* Text Info -> Navigates to Vendor Profile */}
                  <TouchableOpacity
                    style={styles.textContainer}
                    onPress={() => handleNavigate(shop.name)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>

                    {/* --- Separated Phone and City --- */}
                    {shop.sub ? (
                      <Text style={styles.shopSub} numberOfLines={1}>{shop.sub}</Text>
                    ) : (
                      <View style={styles.infoRow}>
                        <Text style={styles.shopSub} numberOfLines={1}>{shop.phone}</Text>
                        <Text style={styles.shopSub}> / </Text>
                        <Text style={styles.shopSub} numberOfLines={1}>{shop.city}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Toggle Action Button */}
                  {/* --- THE FIX: Action Button triggers handleToggle --- */}
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleToggle(shop.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      // If localUnfollowed is true, show add (+), otherwise show checkmark
                      name={localUnfollowed[shop.id] ? "add" : "checkmark"}
                      size={22}
                      color="#2D3E5E"
                    />
                  </TouchableOpacity>

                </View>

                {/* Footer Bio */}
                <Text style={styles.bioText} numberOfLines={1}>{shop.bio}</Text>

              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20
  },
  scrollPadding: {
    paddingHorizontal: 20,
    paddingBottom: 15
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: 170,
    marginRight: CARD_MARGIN,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  card: {
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 16,
    padding: 15,
    justifyContent: 'space-between'
  },
  badgeContainer: {
    backgroundColor: '#8A1C27',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  cardHeader: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 5,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  shopName: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 2
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopSub: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  bioText: {
    color: '#FFFFFF',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.9,
    fontWeight: '600'
  },
});

export default FollowingShopsV;