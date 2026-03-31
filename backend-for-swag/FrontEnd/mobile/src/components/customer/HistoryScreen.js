import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import BottomTabs from '../common/BottomTabs';
import { fetchMyCars, fetchMaintenanceRecords } from '../../store/slices/carsSlice';

export default function HistoryCust() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { cars: reduxCars, maintenance } = useSelector((state) => state.cars);
  const [selectedCarId, setSelectedCarId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyCars());
  }, [dispatch]);

  useEffect(() => {
    if (reduxCars.length > 0) {
      const firstId = reduxCars[0].id;
      if (!selectedCarId) setSelectedCarId(firstId);
      reduxCars.forEach((car) => dispatch(fetchMaintenanceRecords(car.id)));
    }
  }, [reduxCars]);

  const userCars = reduxCars.map((c) => ({
    id: c.id,
    name: `${c.brand || ''} ${c.model || ''} ${c.year || ''}`.trim(),
    image: c.carImage ? { uri: c.carImage } : require('../../../assets/images/car-new-img.png'),
  }));

  const currentRecords = selectedCarId ? (maintenance[selectedCarId] || []) : [];
  const filteredLogs = currentRecords.map((r) => ({
    id: r.id,
    type: r.title || r.type || 'Maintenance',
    date: r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'No Date'),
    status: 'Completed',
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color="#2D3E5E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maintenance History</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* CAR SELECTOR SECTION */}
      <View style={styles.selectorWrapper}>
        <Text style={styles.selectorLabel}>Select your vehicle</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carList}>
          {userCars.map((car) => {
            const isSelected = selectedCarId === car.id;
            return (
              <TouchableOpacity
                key={car.id}
                style={[styles.carCard, isSelected && styles.carCardSelected]}
                onPress={() => setSelectedCarId(car.id)}
                activeOpacity={0.8}
              >
                <View style={styles.thumbWrapper}>
                  <Image source={car.image} style={styles.carThumb} resizeMode="cover" />
                </View>
                {/* This name matches the Make + Model + Year joined string */}
                <Text style={[styles.carName, isSelected && styles.carNameSelected]} numberOfLines={2}>
                  {car.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* HISTORY FEED */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Logs</Text>
          <View style={styles.titleUnderline} />
        </View>

        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <View key={log.id} style={styles.historyCard}>
              <View style={styles.accentBar} />
              <View style={styles.logInfo}>
                <Text style={styles.logType}>{log.type}</Text>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={14} color="#8391A1" />
                  <Text style={styles.logDate}>{log.date}</Text>
                </View>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{log.status}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="clipboard-outline" size={50} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyText}>No logs found for this car</Text>
            <Text style={styles.emptySubText}>Add maintenance in your profile.</Text>
          </View>
        )}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footerContainer}>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#2D3E5E', letterSpacing: 0.5 },

  selectorWrapper: { backgroundColor: '#FFFFFF', paddingVertical: 20, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  selectorLabel: { marginLeft: 20, fontSize: 13, fontWeight: '800', color: '#8391A1', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  carList: { paddingHorizontal: 15 },
  carCard: {
    width: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F4F9',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3
  },
  carCardSelected: { borderColor: '#8A1C27', backgroundColor: '#FDF2F3' },
  thumbWrapper: { width: '100%', height: 65, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F1F4F9' },
  carThumb: { width: '100%', height: '100%' },
  carName: { fontSize: 12, color: '#4A5568', marginTop: 10, textAlign: 'center', fontWeight: '700', minHeight: 32 },
  carNameSelected: { color: '#8A1C27' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 },
  sectionHeader: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3E5E' },
  titleUnderline: { width: 40, height: 4, backgroundColor: '#8A1C27', borderRadius: 2, marginTop: 6 },

  historyCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    position: 'relative',
    overflow: 'hidden'
  },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, backgroundColor: '#2D3E5E' },
  logInfo: { flex: 1, paddingLeft: 10 },
  logType: { color: '#2D3E5E', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  logDate: { color: '#8391A1', fontSize: 12, fontWeight: '600', marginLeft: 5 },
  statusBadge: { backgroundColor: '#FDF2F3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: '#8A1C27', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  emptyStateContainer: { alignItems: 'center', marginTop: 60 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyText: { textAlign: 'center', color: '#2D3E5E', fontSize: 18, fontWeight: '800' },
  emptySubText: { textAlign: 'center', color: '#8391A1', fontSize: 14, marginTop: 5, fontWeight: '500' },

  footerContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }
});