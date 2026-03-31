import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Modal,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import BottomTabsVen from '../commonV/BottomTabsVen';
import VendorPosts from '../commonV/VendorPosts';
import { fetchPosts } from '../../store/slices/postsSlice';

const defaultLogo = require('../../../assets/images/carag-icon.png');
const defaultBg = require('../../../assets/images/tcic-post.png');

const AddCategoryVenScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // FORM STATE
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPostIds, setSelectedPostIds] = useState([]);

  // PREVIEW STATE
  const [previewPost, setPreviewPost] = useState(null);

  const { myProfile } = useSelector((state) => state.vendor);
  const { posts: reduxPosts } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const myPosts = reduxPosts
    .filter((p) => myProfile && String(p.vendorId) === String(myProfile.id))
    .map((p) => ({
      id: p.id,
      vendorName: p.vendorShopName || myProfile?.shopName || '',
      location: p.location || '',
      description: p.description || '',
      vendorLogo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
      postImage: p.postImage ? { uri: p.postImage } : defaultBg,
    }));

  // TOGGLE SELECTION
  const togglePostSelection = (id) => {
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter(postId => postId !== id) : [...prev, id]
    );
  };

  // SUBMIT
  const handleAddCategory = () => {
    if (!categoryName.trim()) {
      Alert.alert('Missing Info', 'Please give your category a name.');
      return;
    }

    router.push({
      pathname: '/vendor/ProfileVen',
      params: {
        newCategory: categoryName,
        newDescription: description
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerSideBtn} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>New Category</Text>

        <View style={styles.headerSideBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* INPUT CARD */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Name Your Category</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="e.g. Summer Deals, Engine Parts..."
            placeholderTextColor="#A0AEC0"
            value={categoryName}
            onChangeText={setCategoryName}
            maxLength={30}
          />

          <View style={styles.divider} />

          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            style={styles.descInput}
            placeholder="What kind of posts belong here?"
            placeholderTextColor="#A0AEC0"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            textAlignVertical="top"
          />
        </View>

        {/* POST SELECTION GRID */}
        <View style={styles.postsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Add Content</Text>
              <Text style={styles.sectionSub}>Select posts to include in this category</Text>
            </View>
            {selectedPostIds.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{selectedPostIds.length}</Text>
              </View>
            )}
          </View>

          <View style={styles.gridContainer}>
            {myPosts.map((post) => {
              const isSelected = selectedPostIds.includes(post.id);
              return (
                <TouchableOpacity
                  key={post.id}
                  style={[styles.gridItem, isSelected && styles.gridItemSelected]}
                  onPress={() => togglePostSelection(post.id)}
                  activeOpacity={0.9}
                >
                  <Image source={typeof post.postImage === 'string' ? { uri: post.postImage } : post.postImage} style={styles.gridImage} />

                  {/* Preview Eye */}
                  <TouchableOpacity
                    style={styles.previewButton}
                    onPress={() => setPreviewPost(post)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="eye" size={18} color="#FFF" />
                  </TouchableOpacity>

                  {/* Checkmark Overlay */}
                  {isSelected && (
                    <View style={styles.checkOverlay}>
                      <Ionicons name="checkmark-circle" size={26} color="#8A1C27" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity style={styles.submitButton} onPress={handleAddCategory} activeOpacity={0.8}>
          <Text style={styles.submitButtonText}>Create Category</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* PREVIEW MODAL */}
      <Modal visible={!!previewPost} transparent={true} animationType="fade" onRequestClose={() => setPreviewPost(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseArea} onPress={() => setPreviewPost(null)} activeOpacity={1} />

          <View style={styles.modalContent}>
            {previewPost && (
              <VendorPosts
                vendorName={previewPost.vendorName}
                location={previewPost.location}
                description={previewPost.description}
                vendorLogo={previewPost.vendorLogo}
                postImage={previewPost.postImage}
              />
            )}
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setPreviewPost(null)} activeOpacity={0.8}>
              <Text style={styles.closeModalText}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomTabsWrapper}>
        <BottomTabsVen />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F4F9' },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  headerSideBtn: { minWidth: 70 },
  cancelText: { fontSize: 16, color: '#8391A1', fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#2D3E5E', letterSpacing: 0.5 },

  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 140 },

  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8
  },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#8391A1', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 },
  titleInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3E5E',
    paddingVertical: 8,
    marginBottom: 5
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F4F9',
    marginVertical: 15
  },
  descInput: {
    fontSize: 14,
    color: '#4A5568',
    minHeight: 80,
    lineHeight: 22,
    fontWeight: '500'
  },

  postsSection: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3E5E' },
  sectionSub: { fontSize: 12, color: '#8391A1', fontWeight: '500', marginTop: 2 },
  countBadge: { backgroundColor: '#FDF2F3', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  countText: { fontSize: 13, fontWeight: '800', color: '#8A1C27' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: 'transparent',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5
  },
  gridItemSelected: { borderColor: '#8A1C27' },
  gridImage: { width: '100%', height: '100%' },

  previewButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(45, 62, 94, 0.7)',
    width: 34, height: 34,
    borderRadius: 10,
    justifyContent: 'center', alignItems: 'center'
  },
  checkOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 2,
    elevation: 5
  },

  submitButton: {
    backgroundColor: '#2D3E5E',
    borderRadius: 25,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#2D3E5E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  modalCloseArea: { ...StyleSheet.absoluteFillObject },
  modalContent: { width: '90%', backgroundColor: 'transparent', borderRadius: 25, overflow: 'hidden' },
  closeModalBtn: { backgroundColor: '#FFFFFF', padding: 18, alignItems: 'center' },
  closeModalText: { color: '#8A1C27', fontWeight: '800', fontSize: 16 },

  bottomTabsWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 }
});

export default AddCategoryVenScreen;