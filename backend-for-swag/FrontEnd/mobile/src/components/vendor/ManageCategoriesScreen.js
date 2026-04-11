import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, ActivityIndicator, Alert, Platform
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import vendorAPI from '../../api/vendorAPI';
import categoriesAPI from '../../api/categoriesAPI';

const ManageCategoriesScreen = () => {
  const router = useRouter();

  const [allSections, setAllSections] = useState([]);
  const [myItemIds, setMyItemIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const [catRes, myRes] = await Promise.all([
      categoriesAPI.getCategories(),
      vendorAPI.getMyCategories(),
    ]);
    if (catRes.success) setAllSections(catRes.data || []);
    if (myRes.success) {
      setMyItemIds(new Set((myRes.data || []).map((i) => i.id)));
    }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleItem = async (itemId) => {
    if (busyIds.has(itemId)) return;
    setBusyIds((prev) => new Set(prev).add(itemId));

    const isSelected = myItemIds.has(itemId);
    const result = isSelected
      ? await vendorAPI.removeCategory(itemId)
      : await vendorAPI.addCategory(itemId);

    if (result.success) {
      setMyItemIds((prev) => {
        const next = new Set(prev);
        if (isSelected) next.delete(itemId);
        else next.add(itemId);
        return next;
      });
    } else {
      const msg = result.error || (isSelected ? 'Failed to remove category.' : 'Failed to add category.');
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    }

    setBusyIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const sectionSelectedCount = (section) =>
    (section.items || []).filter((i) => myItemIds.has(i.id)).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#2D3E5E" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Categories</Text>
          <Text style={styles.headerSub}>
            Your selected service categories
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2D3E5E" />
          <Text style={styles.loadingText}>Loading categories…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.hint}>
            These are the service categories you chose during sign-up. They help customers find your shop through search and filters. Tap items to update your selection.
          </Text>

          {allSections.map((section) => {
            const count = sectionSelectedCount(section);
            return (
              <View key={section.id} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{section.name}</Text>
                  <Text style={styles.sectionCount}>
                    {count}/{(section.items || []).length} selected
                  </Text>
                </View>

                <View style={styles.itemsGrid}>
                  {(section.items || []).map((item) => {
                    const isSelected = myItemIds.has(item.id);
                    const isBusy = busyIds.has(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.itemChip, isSelected && styles.itemChipActive]}
                        onPress={() => toggleItem(item.id)}
                        disabled={isBusy}
                        activeOpacity={0.7}
                      >
                        {isBusy ? (
                          <ActivityIndicator size="small" color={isSelected ? '#FFF' : '#2D3E5E'} />
                        ) : (
                          <>
                            <Ionicons
                              name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                              size={18}
                              color={isSelected ? '#FFF' : '#8391A1'}
                              style={{ marginRight: 6 }}
                            />
                            <Text
                              style={[styles.itemText, isSelected && styles.itemTextActive]}
                              numberOfLines={1}
                            >
                              {item.name}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F9' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 4, marginRight: 10 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#2D3E5E' },
  headerSub: { fontSize: 12, color: '#8391A1', fontWeight: '500', marginTop: 1 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, gap: 10 },
  loadingText: { fontSize: 14, color: '#2D3E5E', fontWeight: '600' },

  scroll: { padding: 16 },
  hint: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 18,
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#2D3E5E' },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A1C27',
    backgroundColor: '#FDF2F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },

  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F4F9',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  itemChipActive: {
    backgroundColor: '#2D3E5E',
    borderColor: '#2D3E5E',
  },
  itemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5568',
  },
  itemTextActive: {
    color: '#FFFFFF',
  },
});

export default ManageCategoriesScreen;
