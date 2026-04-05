import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import NotificationCard from '../common/NotificationCard';
import BottomTabs from '../common/BottomTabs';
import { fetchNotifications, deleteNotification, clearAllNotifications } from '../../store/slices/notificationsSlice';

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  const handleNavigate = (deepLink) => {
    if (!deepLink) return;
    // deepLink format from backend: "post/{id}" or "vendor/{id}/reviews"
    if (deepLink.startsWith('post/')) {
      // no dedicated post detail screen yet — navigate to explore
    } else if (deepLink.startsWith('vendor/')) {
      const vendorId = deepLink.split('/')[1];
      router.push({ pathname: '/customer/VendorProfCust', params: { vendorId } });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color="#2D3E5E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* FIX: Added flex: 1 to the wrapper and contentContainerStyle to the ScrollView
      */}
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.pillBadge}>
                <Text style={styles.pillText}>LATEST</Text>
              </View>
              {notifications.length > 0 && (
                <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>Clear all</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {loading && notifications.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 }}>
              <ActivityIndicator size="large" color="#5B7896" />
            </View>
          ) : notifications.length > 0 ? (
            notifications.map((item) => (
              <NotificationCard
                key={item.id}
                title={item.title}
                message={item.body}
                isRead={item.isRead}
                onDelete={() => handleDelete(item.id)}
                onCardPress={() => { handleDelete(item.id); handleNavigate(item.deepLink); }}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={50} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySub}>Check back later for car alerts and vendor updates.</Text>
            </View>
          )}

          {/* Extra padding so the last notification isn't hidden by the tabs */}
          <View style={{ height: 150 }} />
        </ScrollView>
      </View>

      {/* FIXED FOOTER */}
      <View style={styles.tabsWrapper}>
        <BottomTabs />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#AFC6D8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#2D3E5E', letterSpacing: 0.5 },

  // FIX: flexGrow ensures the scrollview can actually scroll and show items
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 25,
    flexGrow: 1
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 5
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3E5E' },
  pillBadge: {
    backgroundColor: '#8A1C27',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillText: { color: '#FFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIconCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#2D3E5E' },
  emptySub: { fontSize: 14, color: '#8391A1', marginTop: 5, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 },

  tabsWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#2D3E5E' },
  clearBtnText: { color: '#FFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
});