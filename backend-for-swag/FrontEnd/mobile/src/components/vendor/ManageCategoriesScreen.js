import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, ActivityIndicator, Alert, Platform, LayoutAnimation, UIManager
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';

import categoriesAPI from '../../api/categoriesAPI';
import vendorAPI from '../../api/vendorAPI';
import { fetchMyVendorCategories } from '../../store/slices/vendorSlice';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ManageCategoriesScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [sections, setSections] = useState([]);        // all DB sections + items
  const [selectedIds, setSelectedIds] = useState(new Set()); // item IDs currently ON
  const [initialIds, setInitialIds] = useState(new Set()); // item IDs when screen opened
  const [expandedSection, setExpandedSection] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Load all categories and the vendor's current selections ───────────────
  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      const [catResult, myResult] = await Promise.all([
        categoriesAPI.getCategories(),
        vendorAPI.getMyCategories(),
      ]);

      if (catResult.success) {
        setSections(catResult.data);
        // Auto-expand the first section so the screen doesn't look empty
        if (catResult.data.length > 0) setExpandedSection(catResult.data[0].id);
      }

      if (myResult.success) {
        const ids = new Set(myResult.data.map((item) => item.id));
        setSelectedIds(ids);
        setInitialIds(new Set(ids)); // keep a copy to diff on save
      }

      setLoadingData(false);
    };
    load();
  }, []);

  const toggleSection = useCallback((id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection((prev) => (prev === id ? null : id));
  }, []);

  const toggleItem = useCallback((itemId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  // ── Save — diff against initial selection and call add/remove ─────────────
  const handleSave = async () => {
    const toAdd = [...selectedIds].filter((id) => !initialIds.has(id));
    const toRemove = [...initialIds].filter((id) => !selectedIds.has(id));

    if (toAdd.length === 0 && toRemove.length === 0) {
      router.back();
      return;
    }

    setSaving(true);

    const addResults = await Promise.all(toAdd.map((id) => vendorAPI.addCategory(id)));
    const removeResults = await Promise.all(toRemove.map((id) => vendorAPI.removeCategory(id)));

    const failed = [...addResults, ...removeResults].filter((r) => !r.success);

    setSaving(false);

    if (failed.length > 0) {
      const msg = failed[0].error || 'Some changes could not be saved.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
      return;
    }

    // Refresh Redux so the rest of the app reflects the new categories
    dispatch(fetchMyVendorCategories());
    router.back();
  };

  const totalSelected = selectedIds.size;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#2D3E5E" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Workplace Categories</Text>
          <Text style={styles.headerSub}>
            {totalSelected} selected · helps customers find you
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving
            ? <ActivityIndicator size="small" color="#FFFFFF" />
            : <Text style={styles.saveBtnText}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      {loadingData ? (
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
            Select every category and sub-category that describes your business.
            Customers searching by these terms will be able to find you.
          </Text>

          {sections.map((section) => {
            const isOpen = expandedSection === section.id;
            const selectedInSection = section.items.filter((i) => selectedIds.has(i.id)).length;

            return (
              <View key={section.id} style={[styles.card, isOpen && styles.cardOpen]}>
                {/* Section header */}
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(section.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.sectionLeft}>
                    <Text style={[styles.sectionName, isOpen && styles.sectionNameOpen]}>
                      {section.name}
                    </Text>
                    {selectedInSection > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{selectedInSection}</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.arrowCircle, isOpen && styles.arrowCircleOpen]}>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={isOpen ? '#2D3E5E' : '#8391A1'}
                    />
                  </View>
                </TouchableOpacity>

                {/* Items */}
                {isOpen && (
                  <View style={styles.itemsGrid}>
                    {section.items.length === 0 ? (
                      <Text style={styles.emptySection}>No sub-categories yet.</Text>
                    ) : (
                      section.items.map((item) => {
                        const isSelected = selectedIds.has(item.id);
                        return (
                          <TouchableOpacity
                            key={item.id}
                            style={[styles.chip, isSelected && styles.chipSelected]}
                            onPress={() => toggleItem(item.id)}
                            activeOpacity={0.75}
                          >
                            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                              {item.name}
                            </Text>
                            {isSelected && (
                              <Ionicons
                                name="checkmark-done"
                                size={15}
                                color="#FFFFFF"
                                style={{ marginLeft: 5 }}
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>
                )}
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
  container: {
    flex: 1,
    backgroundColor: '#F1F4F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 4,
    marginRight: 10,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2D3E5E',
  },
  headerSub: {
    fontSize: 12,
    color: '#8391A1',
    fontWeight: '500',
    marginTop: 1,
  },
  saveBtn: {
    backgroundColor: '#2D3E5E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#8391A1',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#2D3E5E',
    fontWeight: '600',
  },
  scroll: {
    padding: 16,
  },
  hint: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardOpen: {
    borderWidth: 1.5,
    borderColor: '#BFCEDC',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3E5E',
    marginRight: 8,
  },
  sectionNameOpen: {
    color: '#2D3E5E',
  },
  badge: {
    backgroundColor: '#8A1C27',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F4F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowCircleOpen: {
    backgroundColor: '#E2EAF4',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    gap: 10,
  },
  emptySection: {
    fontSize: 13,
    color: '#A0AEC0',
    fontStyle: 'italic',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#2D3E5E',
    borderColor: '#2D3E5E',
  },
  chipText: {
    fontSize: 13,
    color: '#5B7896',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});

export default ManageCategoriesScreen;
