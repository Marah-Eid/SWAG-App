import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

const defaultLogo = require('../../../assets/images/carshop-icon.png');
const defaultBanner = require('../../../assets/images/theshop-photo.png');

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.88;
const CARD_MARGIN = 15;

const ShopLogo = ({ source, fallback, logoStyle }) => {
  const [error, setError] = useState(false);
  return (
    <Image
      source={error ? fallback : source}
      style={logoStyle}
      onError={() => setError(true)}
    />
  );
};

const NearbyShopCard = ({ shop, isVendor, router }) => {
  const [bgSrc, setBgSrc] = useState(shop.bgImage || defaultBanner);

  const goToProfile = () => router.push(
    isVendor
      ? { pathname: '/vendor/otherVendorProfile', params: { vendorId: shop.id } }
      : { pathname: '/customer/VendorProfCust', params: { vendorId: shop.id } }
  );

  return (
    <View style={styles.cardWrapper}>
      <ImageBackground
        source={bgSrc}
        onError={() => setBgSrc(defaultBanner)}
        style={styles.card}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.darkOverlay}>

          <TouchableOpacity
            onPress={() => router.push(isVendor ? '/vendor/NearByVen' : '/customer/NearByCust')}
            style={styles.badgeContainer}
            activeOpacity={0.8}
          >
            <Text style={styles.cardHeader}>Nearby Shops</Text>
          </TouchableOpacity>

          <View style={styles.contentRow}>
            <TouchableOpacity onPress={goToProfile} activeOpacity={0.8}>
              <ShopLogo source={shop.logo} fallback={defaultLogo} logoStyle={styles.logo} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.textContainer} onPress={goToProfile} activeOpacity={0.8}>
              <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
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
          </View>

          <Text style={styles.bioText} numberOfLines={2}>{shop.bio}</Text>

        </View>
      </ImageBackground>
    </View>
  );
};

const NearbyShopsCarousel = ({ shopsData = [] }) => {
  const router = useRouter();

  const { user } = useSelector((state) => state.auth);
  const userCity = user?.city || 'Amman';
  const isVendor = user?.role === 'vendor';

  const nearbyShops = shopsData.filter(shop => {
    if (shop.city) return shop.city === userCity;
    if (shop.sub) return shop.sub.includes(userCity);
    return true;
  });

  if (nearbyShops.length === 0) return null;

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
        {nearbyShops.map((shop) => (
          <NearbyShopCard key={shop.id} shop={shop} isVendor={isVendor} router={router} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
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
    backgroundColor: '#FFF',
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
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#FFF',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  shopName: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 2
  },
  // Added this specifically for the new row layout
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopSub: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
  },
  bioText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9
  },
});

export default NearbyShopsCarousel;