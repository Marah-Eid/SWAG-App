import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const GridOption = ({ title, mainIcons, icon, onPress }) => (
  <TouchableOpacity
    style={styles.gridItem}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {/* Gradient Background */}
    <LinearGradient
      colors={['#FFFFFF', '#b5cbe2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientBg}
    >
      <View style={styles.mainImageContainer}>
        {mainIcons.length === 1 ? (
          // SINGLE BARE ICON (For Parts & Auto Hub)
          <MaterialCommunityIcons
            name={mainIcons[0]}
            size={52}
            color="#2D3E5E"
            style={styles.shadowIcon}
          />
        ) : (
          // MERGED COMPOSITE ICON (For Customization & Services)
          <View style={styles.mergedIconContainer}>
            <MaterialCommunityIcons
              name={mainIcons[0]}
              size={46}
              color="#2D3E5E"
              style={styles.shadowIcon}
            />
            {/* The second icon is embedded as a "badge" with a cutout effect */}
            <View style={styles.secondaryIconCutout}>
              <MaterialCommunityIcons
                name={mainIcons[1]}
                size={22}
                color="#2D3E5E"
              />
            </View>
          </View>
        )}
      </View>

      {/* Red Footer Bar */}
      <View style={styles.footerBar}>
        <View style={styles.textWrapper}>
          <Text style={styles.footerText} numberOfLines={1}>{title}</Text>
        </View>
      </View>

      {/* The "Pump" (Bubble) Icon Container */}
      <View style={styles.iconBubble}>
        <Image source={icon} style={styles.bubbleIcon} />
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const HomeGrid = () => {
  const router = useRouter();

  return (
    <View style={styles.gridContainer}>
      <View style={styles.row}>
        <GridOption
          title="Parts"
          mainIcons={['engine']} // Single Engine
          icon={require('../../../assets/images/parts2-icon.png')}
          onPress={() => router.push('/customer/PartsCust')}
        />
        <GridOption
          title="Auto Hub"
          mainIcons={['car-multiple']} // Single overlapping cars
          icon={require('../../../assets/images/autohub2-icon.png')}
          onPress={() => router.push('/customer/AutoHubCust')}
        />
      </View>

      <View style={styles.row}>
        <GridOption
          title="Customization"
          // Merges Spray Can (paint) with a Wrench (tuning)
          mainIcons={['spray', 'wrench']}
          icon={require('../../../assets/images/customization2-icon.png')}
          onPress={() => router.push('/customer/CustomizationCust')}
        />
        <GridOption
          title="Services"
          // Merges Car Wash with a Gas Station pump
          mainIcons={['car-wash', 'gas-station']}
          icon={require('../../../assets/images/services2-icon.png')}
          onPress={() => router.push('/customer/ServicesCust')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  gridItem: {
    width: '47.5%',
    height: 135,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  gradientBg: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mainImageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25, // Breathing room above the footer
  },
  // --- STYLES FOR THE MERGED ICONS ---
  mergedIconContainer: {
    width: 55,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  secondaryIconCutout: {
    position: 'absolute',
    bottom: -2,
    right: -6,
    backgroundColor: '#E6F0FA', // Blends with the gradient to create the "cutout" space
    borderRadius: 15,
    padding: 3, // Pushes the main icon away perfectly
  },
  shadowIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  // -----------------------------------
  footerBar: {
    height: 40,
    backgroundColor: '#8A1C27',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
  },
  textWrapper: {
    position: 'absolute',
    left: 10,
    right: 50,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  footerText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  iconBubble: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8A1C27',
    width: 55,
    height: 50,
    borderTopLeftRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
    paddingLeft: 5,
  },
  bubbleIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  }
});

export default HomeGrid;