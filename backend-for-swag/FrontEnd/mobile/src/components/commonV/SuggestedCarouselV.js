import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_MARGIN = 15;

const defaultBanner = require('../../../assets/images/default-banner.png');

const ShopCard = ({ shop, onFollow, myId }) => {
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(shop.isFollowed || false);
  const [bgSrc, setBgSrc] = useState(shop.bgImage || defaultBanner);

  const goToProfile = () => {
    router.push({ pathname: '/vendor/otherVendorProfile', params: { vendorId: shop.id } });
  };

  return (
    <View style={styles.cardWrapper}>
      <ImageBackground
        source={bgSrc}
        onError={() => setBgSrc(defaultBanner)}
        style={styles.card}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.darkOverlay}>

          {/* Header Badge */}
          <View style={styles.badgeContainer}>
            <Text style={styles.cardHeader}>Suggested</Text>
          </View>

          {/* Content Row */}
          <View style={styles.contentRow}>

            {/* 1. SHOP ICON -> Navigates to Vendor Profile */}
            <TouchableOpacity onPress={goToProfile} activeOpacity={0.8}>
              <Image source={shop.logo} style={styles.logo} />
            </TouchableOpacity>

            {/* Text Info -> Also Navigates to Profile */}
            <TouchableOpacity
              style={styles.textContainer}
              onPress={goToProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>

              {/* --- THE FIX: Separated Phone and City --- */}
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

            {String(shop.id) !== String(myId) && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => { const next = !isAdded; setIsAdded(next); if (onFollow) onFollow(shop.id, next); }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isAdded ? "checkmark" : "add"}
                  size={22}
                  color="#2D3E5E"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Footer Bio */}
          <Text style={styles.bioText} numberOfLines={1}>{shop.bio}</Text>

        </View>
      </ImageBackground>
    </View>
  );
};

// Main Carousel Component
const SuggestedCarouselV = ({ data, onFollow, myId }) => {
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
        {data.map((shopData) => (
          <ShopCard key={shopData.id} shop={shopData} onFollow={onFollow} myId={myId} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20
  },
  scrollPadding: {
    paddingHorizontal: 20,
    paddingBottom: 15 // UI Polish: Breathing room for the drop shadow
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: 170, // UI Polish: Matched events height for consistency
    marginRight: CARD_MARGIN,
    borderRadius: 16,
    backgroundColor: '#FFF',
    // UI Polish: Premium depth shadow
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)', // UI Polish: Cinematic depth
    borderRadius: 16,
    padding: 15,
    justifyContent: 'space-between'
  },
  badgeContainer: {
    backgroundColor: '#8A1C27', // Brand Red
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
    backgroundColor: '#FFF',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF', // UI Polish: Crisp white ring
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
    color: '#E2E8F0', // UI Polish: Softer light gray for contrast
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

export default SuggestedCarouselV;