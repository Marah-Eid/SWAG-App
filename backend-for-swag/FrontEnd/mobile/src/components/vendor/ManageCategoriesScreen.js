import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, ActivityIndicator, Alert, Platform
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import vendorAPI from '../../api/vendorAPI';

const ManageCategoriesScreen = () => {
  const router = useRouter();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await vendorAPI.getMyCollections();
    if (result.success) setCollections(result.data || []);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const showError = (msg) => {
    if (Platform.OS === 'web') window.alert(msg);
    else Alert.alert('Error', msg);
  };

  const handleDelete = (collection) => {
    const confirmDelete = async () => {
      setBusyId(collection.id);
      const result = await vendorAPI.deleteCollection(collection.id);
      setBusyId(null);
      if (!result.success) {
        showError(result.error || 'Failed to delete category.');
        return;
      }
      load();
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete the category "${collection.name}"?`)) confirmDelete();
    } else {
      Alert.alert(
        'Delete Category',
        `Delete "${collection.name}"? Posts will remain but will no longer be in this category.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

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
            {collections.length} {collections.length === 1 ? 'category' : 'categories'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/vendor/AddCategoryVen')}
          style={styles.addBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2D3E5E" />
          <Text style={styles.loadingText}>Loading categories…</Text>
        </View>
      ) : collections.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="grid-outline" size={56} color="#BFCEDC" />
          <Text style={styles.emptyTitle}>No categories yet</Text>
          <Text style={styles.emptySub}>
            Create your first custom category to organise your posts.
          </Text>
          <TouchableOpacity
            style={styles.emptyCta}
            onPress={() => router.push('/vendor/AddCategoryVen')}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyCtaText}>Create Category</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.hint}>
            Tap a category to edit its name, description, or which posts belong to it.
          </Text>

          {collections.map((col) => (
            <View key={col.id} style={styles.card}>
              <TouchableOpacity
                style={styles.cardBody}
                onPress={() => router.push({ pathname: '/vendor/AddCategoryVen', params: { collectionId: col.id } })}
                activeOpacity={0.85}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{col.name}</Text>
                  {!!col.description && (
                    <Text style={styles.cardDesc} numberOfLines={2}>{col.description}</Text>
                  )}
                  <View style={styles.metaRow}>
                    <Ionicons name="images-outline" size={14} color="#8391A1" />
                    <Text style={styles.metaText}>
                      {col.postCount || 0} {col.postCount === 1 ? 'post' : 'posts'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(col)}
                disabled={busyId === col.id}
                activeOpacity={0.7}
              >
                {busyId === col.id
                  ? <ActivityIndicator size="small" color="#8A1C27" />
                  : <Ionicons name="trash-outline" size={18} color="#8A1C27" />
                }
              </TouchableOpacity>
            </View>
          ))}

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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3E5E',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13, marginLeft: 4 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, gap: 10 },
  loadingText: { fontSize: 14, color: '#2D3E5E', fontWeight: '600' },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#2D3E5E', marginTop: 8 },
  emptySub: { fontSize: 13, color: '#8391A1', textAlign: 'center', lineHeight: 19, marginBottom: 12 },
  emptyCta: { backgroundColor: '#8A1C27', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 22 },
  emptyCtaText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },

  scroll: { padding: 16 },
  hint: { fontSize: 13, color: '#64748B', lineHeight: 19, marginBottom: 14 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#2D3E5E' },
  cardDesc: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaText: { fontSize: 12, color: '#8391A1', marginLeft: 5, fontWeight: '600' },

  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF2F3',
    marginRight: 6,
  },
});

export default ManageCategoriesScreen;
