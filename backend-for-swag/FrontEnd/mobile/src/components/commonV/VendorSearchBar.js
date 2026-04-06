import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import SideMenuV from './SideMenuV';

const VendorSearchBar = ({ initialQuery = '' }) => {
  const router = useRouter();
  const [searchText, setSearchText] = useState(initialQuery);
  const [isMenuVisible, setMenuVisible] = useState(false);

  const handleSearch = () => {
    const q = searchText.trim();
    if (!q) return;
    router.push({ pathname: '/commonScreensV/SearchResultsV', params: { query: q } });
  };

  return (
    <View style={styles.container}>

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

      <TextInput
        style={styles.input}
        placeholder="Search for parts, shops, or events..."
        placeholderTextColor="#8391A1"
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />

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
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2D3E5E',
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  iconButton: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#2D3E5E',
  }
});

export default VendorSearchBar;
