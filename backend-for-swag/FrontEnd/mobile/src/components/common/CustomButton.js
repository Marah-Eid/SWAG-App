import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

// Note: I kept your theme imports in case you need them elsewhere, 
// but I have overridden the styles below with our new hard-coded premium brand hex codes!
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const CustomButton = ({
  title,
  onPress,
  variant = 'primary', // Options: 'primary', 'secondary', 'brand', 'outline'
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'brand': // NEW: Added Brand Red variant
        return styles.brandButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'brand':
        return styles.brandText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  const getSpinnerColor = () => {
    if (variant === 'primary') return '#8A1C27'; // Brand Red spinner on white bg
    return '#FFFFFF'; // White spinner on dark backgrounds
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8} // UI Polish: Slightly firmer active feedback
    >
      {loading ? (
        <ActivityIndicator color={getSpinnerColor()} size="small" />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 60, // UI Polish: Standardized massive CTA height
    borderRadius: 30, // UI Polish: Fully rounded pill shape
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    // UI Polish: Premium default shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#2D3E5E', // Brand Navy
    shadowColor: '#2D3E5E', // UI Polish: Glowing colored shadow
  },
  brandButton: {
    backgroundColor: '#8A1C27', // Brand Red
    shadowColor: '#8A1C27', // UI Polish: Glowing colored shadow
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2, // UI Polish: Thicker, crisper border
    borderColor: '#FFFFFF',
    elevation: 0, // No shadow for outline buttons
    shadowOpacity: 0,
  },

  primaryText: {
    color: '#8A1C27', // Brand Red text on white background
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  outlineText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  disabled: {
    opacity: 0.6,
    elevation: 0, // Flattens out when disabled
    shadowOpacity: 0,
  },
});

export default CustomButton;