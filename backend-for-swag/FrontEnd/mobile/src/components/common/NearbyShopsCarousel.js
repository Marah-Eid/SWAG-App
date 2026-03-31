import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

// Get Screen Dimensions
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.88;
const CARD_MARGIN = 15;

const NearbyShopsCarousel = ({ shopsData = [] }) => {
  const router = useRouter();

  // Get user location context from Redux
  const { user } = useSelector((state) => state.auth);
  const userCity = user?.city || 'Amman';

  // Filter shops by city or location string
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
        {nearbyShops.map((shop) => {
          return (
            <View key={shop.id} style={styles.cardWrapper}>
              <ImageBackground
                source={shop.bgImage}
                style={styles.card}
                imageStyle={{ borderRadius: 16 }}
              >
                <View style={styles.darkOverlay}>

                  <TouchableOpacity
                    onPress={() => router.push('/customer/NearByCust')}
                    style={styles.badgeContainer}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cardHeader}>Nearby Shop</Text>
                  </TouchableOpacity>

                  <View style={styles.contentRow}>
                    <TouchableOpacity
                      onPress={() => router.push('/customer/VendorProfCust')}
                      activeOpacity={0.8}
                    >
                      <Image source={shop.logo} style={styles.logo} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.textContainer}
                      onPress={() => router.push('/customer/VendorProfCust')}
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

                    {/* FOLLOW BUTTON REMOVED FROM HERE */}
                  </View>

                  <Text style={styles.bioText} numberOfLines={2}>{shop.bio}</Text>

                </View>
              </ImageBackground>
            </View>
          );
        })}
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