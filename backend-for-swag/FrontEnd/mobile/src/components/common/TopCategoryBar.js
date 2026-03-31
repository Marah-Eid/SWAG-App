import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const CategoryItem = ({ title, iconName, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.8}>
    {/* Upper Part: Icon Container */}
    <View style={styles.imageContainer}>
      <Ionicons name={iconName} size={28} color="#5B7896" />
    </View>
    {/* Lower Part: Red Label */}
    <View style={styles.footer}>
      <Text style={styles.footerText} numberOfLines={1}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const TopCategoryBar = () => {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#3A4E63', '#1B2A38']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <View style={styles.itemsRow}>
          <CategoryItem
            title="Parts"
            iconName="settings-sharp"
            onPress={() => router.push('/customer/PartsCust')}
          />
          <CategoryItem
            title="Auto Hub"
            iconName="business-sharp"
            onPress={() => router.push('/customer/AutoHubCust')}
          />
          <CategoryItem
            title="Customs"
            iconName="color-palette-sharp"
            onPress={() => router.push('/customer/CustomizationCust')}
          />
          <CategoryItem
            title="Services"
            iconName="construct-sharp"
            onPress={() => router.push('/customer/ServicesCust')}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  container: {
    width: '100%',
    height: 100,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    justifyContent: 'center',
  },
  itemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  item: {
    width: '22%',
    height: 75,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#F1F4F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    backgroundColor: '#8A1C27',
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});

export default TopCategoryBar;