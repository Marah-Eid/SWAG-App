import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ToggleTabs = ({ activeTab, onTabChange, tabs }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.value;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.tab,
              isActive && styles.activeTab,
            ]}
            onPress={() => onTabChange(tab.value)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                isActive && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // UI Polish: Softer glassmorphism
    borderRadius: 30, // UI Polish: Full pill shape container
    padding: 4,
    width: '100%',
    height: 55, // UI Polish: Standardized ergonomic height
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26, // UI Polish: Fully rounded inner pill
  },
  activeTab: {
    backgroundColor: '#FFFFFF', // Crisp white active state
    // UI Polish: Drop shadow makes the active pill "float"
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    color: '#FFFFFF', // Default inactive text
    fontWeight: '600',
  },
  activeTabText: {
    color: '#2D3E5E', // Brand Navy
    fontWeight: '800', // Bolder active text
    letterSpacing: 0.3,
  },
});

export default ToggleTabs;