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
import BottomTabsVen from '../commonV/BottomTabsVen';
import { fetchNotifications, markNotificationRead } from '../../store/slices/notificationsSlice';

export default function NotificationsVenScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const handleNavigate = (path) => {
    if (path) router.push(path);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color="#2D3E5E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Updates</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* TIMELINE HEADER */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Business Feed</Text>
            <View style={styles.pillBadge}>
              <Text style={styles.pillText}>Live</Text>
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
                title={item.type}
                message={item.body}
                onDelete={() => handleMarkRead(item.id)}
                onCardPress={() => { handleMarkRead(item.id); handleNavigate(item.link); }}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="stats-chart-outline" size={50} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>No Business Activity</Text>
              <Text style={styles.emptySub}>We will notify you when customers interact with your shop.</Text>
            </View>
          )}

          {/* Extra space to ensure bottom tabs don't cover the last card */}
          <View style={{ height: 150 }} />
        </ScrollView>
      </View>

      {/* FIXED FOOTER */}
      <View style={styles.tabsWrapper}>
        <BottomTabsVen isPending={false} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#BFCEDC' }, // Matched Vendor Theme Color
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

  tabsWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 }
});