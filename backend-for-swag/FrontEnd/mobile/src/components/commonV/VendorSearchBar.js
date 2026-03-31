import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
// 1. Import the SideMenuV component directly
import SideMenuV from './SideMenuV';

const VendorSearchBar = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  // 2. Add state to control menu visibility
  const [isMenuVisible, setMenuVisible] = useState(false);

  const handleSearch = () => {
    console.log('Searching for:', searchText);
  };

  return (
    <View style={styles.container}>

      {/* 1. Menu Button - Updates state instead of routing */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => setMenuVisible(true)}
        activeOpacity={0.7}
      >
        <Image
          source={require('../../../assets/images/menu-icon.png')}
          style={styles.iconImage}
        />
      </TouchableOpacity>

      {/* Text Input */}
      <TextInput
        style={styles.input}
        placeholder="Search for parts, shops, or events..."
        placeholderTextColor="#8391A1"
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
      />

      {/* 2. Custom Search Button */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={handleSearch}
        activeOpacity={0.7}
      >
        <Image
          source={require('../../../assets/images/search-icon.png')}
          style={styles.iconImage}
        />
      </TouchableOpacity>

      {/* 3. Render the SideMenuV here, controlled by state */}
      <SideMenuV
        visible={isMenuVisible}
        onClose={() => setMenuVisible(false)}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // UI Polish: Crisp white matching customer side
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50, // UI Polish: Standardized height
    marginHorizontal: 20,
    marginTop: 5, // UI Polish: Removed the massive 50px margin since SafeAreaView handles it now
    marginBottom: 15,
    // UI Polish: Premium floating shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2D3E5E', // UI Polish: Brand primary dark
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  iconButton: {
    padding: 5, // UI Polish: Larger touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#2D3E5E', // UI Polish: Brand consistency
  }
});

export default VendorSearchBar;