import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SideMenu from './SideMenu';

const CustomSearchBar = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* 1. Toggle state on press */}
      <TouchableOpacity style={styles.iconButton} onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
        <Image
          source={require('../../../assets/images/menu-icon.png')}
          style={styles.icon}
        />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Search for parts, shops, or events..."
        placeholderTextColor="#8391A1"
      />

      <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
        <Image
          source={require('../../../assets/images/search-icon.png')}
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* 2. Include SideMenu inside the SearchBar so it's always available */}
      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', // UI Polish: Crisp white for contrast
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50, // UI Polish: Fixed height for consistency
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 5,
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
    marginHorizontal: 10,
    fontSize: 15,
    color: '#2D3E5E', // UI Polish: Brand primary dark
    fontWeight: '500',
  },
  iconButton: {
    padding: 5, // UI Polish: Larger touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#2D3E5E', // UI Polish: Forces icons to match brand color
  }
});

export default CustomSearchBar;