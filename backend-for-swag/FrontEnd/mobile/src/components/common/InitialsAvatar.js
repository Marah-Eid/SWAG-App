import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const COLORS = [
  '#8A1C27', '#2D3E5E', '#5B7896', '#D97706', '#059669',
  '#7C3AED', '#DB2777', '#0891B2', '#4F46E5', '#B45309',
];

function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

function isValidImageUri(uri) {
  return typeof uri === 'string' && uri.length > 0 && uri !== 'undefined' && uri !== 'null' && (uri.startsWith('http') || uri.startsWith('file'));
}

export default function InitialsAvatar({ name, imageUri, size = 64, style }) {
  if (isValidImageUri(imageUri)) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      />
    );
  }

  const initials = getInitials(name);
  const bgColor = getColorFromName(name || '');
  const fontSize = size * 0.38;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }, style]}>
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  initials: { color: '#FFFFFF', fontWeight: '800' },
});
