import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet, TouchableOpacity,
  ImageBackground, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import vendorAPI from '../../api/vendorAPI';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_MARGIN = 15;

const defaultBanner = require('../../../assets/images/theshop-photo.png');
const defaultLogo = require('../../../assets/images/nmk-icon.png');

const CoordinatorCard = ({ shop, onVendorPress, onFollow }) => {
  const [isAdded, setIsAdded] = useState(shop.isFollowed || false);
  const [bgSrc, setBgSrc] = useState(shop.bgImage || defaultBanner);
  const [logoSrc, setLogoSrc] = useState(shop.logo || defaultLogo);

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
            <Text style={styles.cardHeader}>Top Coordinators</Text>
          </View>

          {/* Content Row */}
          <View style={styles.contentRow}>

            {/* Logo */}
            <TouchableOpacity onPress={() => onVendorPress && onVendorPress(shop.id)} activeOpacity={0.8}>
              <Image
                source={logoSrc}
                onError={() => setLogoSrc(defaultLogo)}
                style={styles.logo}
              />
            </TouchableOpacity>

            {/* Text Info */}
            <TouchableOpacity
              style={styles.textContainer}
              onPress={() => onVendorPress && onVendorPress(shop.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
              {shop.sub ? (
                <Text style={styles.shopSub} numberOfLines={1}>{shop.sub}</Text>
              ) : null}
            </TouchableOpacity>

            {/* Follow Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                const next = !isAdded;
                setIsAdded(next);
                if (onFollow) onFollow(shop.id, next);
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isAdded ? 'checkmark' : 'add'}
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
  );
};

const TopCoordinatorsCarousel = ({ onVendorPress, onFollow }) => {
  const [coordinators, setCoordinators] = useState([]);

  useEffect(() => {
    vendorAPI.getEventCoordinators().then((result) => {
      if (result.success) {
        setCoordinators(result.data.map((v) => ({
          id: v.id,
          name: v.shopName,
          sub: v.city || '',
          bio: v.bio || '',
          logo: v.profileImage ? { uri: v.profileImage } : defaultLogo,
          bgImage: v.bannerImage ? { uri: v.bannerImage } : defaultBanner,
          isFollowed: v.isFollowed,
        })));
      }
    });
  }, []);

  if (coordinators.length === 0) return null;

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
        {coordinators.map((shop) => (
          <CoordinatorCard
            key={shop.id}
            shop={shop}
            onVendorPress={onVendorPress}
            onFollow={onFollow}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2B3C',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollPadding: {
    paddingHorizontal: 20,
    paddingBottom: 15,
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
    justifyContent: 'space-between',
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
    backgroundColor: '#FFF',
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
    marginBottom: 2,
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
    fontWeight: '600',
  },
});

export default TopCoordinatorsCarousel;
