import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TOAST_CONFIG = {
  success:  { icon: 'checkmark-circle', bg: '#ECFDF5', border: '#10B981', text: '#065F46', iconColor: '#10B981' },
  error:    { icon: 'alert-circle',     bg: '#FEF2F2', border: '#EF4444', text: '#991B1B', iconColor: '#EF4444' },
  warning:  { icon: 'warning',          bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', iconColor: '#F59E0B' },
  info:     { icon: 'information-circle', bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF', iconColor: '#3B82F6' },
  follow:   { icon: 'person-add',       bg: '#F0F9FF', border: '#0EA5E9', text: '#0C4A6E', iconColor: '#0EA5E9' },
  post:     { icon: 'newspaper',        bg: '#FDF4FF', border: '#A855F7', text: '#581C87', iconColor: '#A855F7' },
  review:   { icon: 'star',             bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', iconColor: '#F59E0B' },
  comment:  { icon: 'chatbubble',       bg: '#F0FDF4', border: '#22C55E', text: '#14532D', iconColor: '#22C55E' },
  event:    { icon: 'calendar',         bg: '#EFF6FF', border: '#6366F1', text: '#312E81', iconColor: '#6366F1' },
  account:  { icon: 'shield-checkmark', bg: '#ECFDF5', border: '#10B981', text: '#065F46', iconColor: '#10B981' },
};

const NOTIFICATION_TYPE_MAP = {
  maintenancealert: 'warning',
  vendorpost:       'post',
  insuranceexpiry:  'warning',
  newevent:         'event',
  mention:          'comment',
  nearbysuggestion: 'info',
  systemalert:      'info',
  accountstatus:    'account',
  newreview:        'review',
  newfollower:      'follow',
  eventupdate:      'event',
  inventorytip:     'info',
};

export function getToastType(notificationType) {
  if (!notificationType) return 'info';
  return NOTIFICATION_TYPE_MAP[notificationType.toLowerCase()] || 'info';
}

const AUTO_DISMISS_MS = 4000;

export default function ToastNotification({ id, type = 'info', title, message, onDismiss, index = 0 }) {
  const config = TOAST_CONFIG[type] || TOAST_CONFIG.info;
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => dismiss(), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -100, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => onDismiss?.(id));
  };

  return (
    <Animated.View style={[
      styles.container,
      { backgroundColor: config.bg, borderLeftColor: config.border },
      { transform: [{ translateY }], opacity, top: 10 + index * 80 },
    ]}>
      <Ionicons name={config.icon} size={24} color={config.iconColor} style={styles.icon} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: config.text }]} numberOfLines={1}>{title}</Text>
        {message ? <Text style={[styles.message, { color: config.text }]} numberOfLines={2}>{message}</Text> : null}
      </View>
      <TouchableOpacity onPress={dismiss} style={styles.closeBtn} activeOpacity={0.7}>
        <Ionicons name="close" size={18} color={config.text} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  icon: { marginRight: 12 },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700' },
  message: { fontSize: 13, fontWeight: '500', marginTop: 2, opacity: 0.85 },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
