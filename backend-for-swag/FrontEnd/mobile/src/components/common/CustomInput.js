import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomInput = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  iconName,
  keyboardType = 'default',
  autoCapitalize = 'none',
  editable = true,
  style,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {iconName && (
        <Ionicons
          name={iconName}
          size={20}
          color="#5B7896" // UI Polish: Secondary Navy for icons
          style={styles.icon}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#8391A1" // UI Polish: Softer placeholder gray
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
      />

      {secureTextEntry && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.eyeIcon}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="#8391A1"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F4F9', // UI Polish: Premium off-white inset
    borderRadius: 30, // UI Polish: Full pill shape
    paddingHorizontal: 20,
    height: 55, // UI Polish: Ergonomic height
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0', // UI Polish: Crisp border
    marginBottom: 15,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#2D3E5E', // Brand Navy
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 5,
    marginLeft: 5,
  },
});

export default CustomInput;