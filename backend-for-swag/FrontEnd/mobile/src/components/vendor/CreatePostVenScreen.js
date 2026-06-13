import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput, ScrollView,
  TouchableOpacity, Image, LayoutAnimation, Platform, UIManager, Alert, KeyboardAvoidingView, StatusBar, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, updatePost } from '../../store/slices/postsSlice';
import { isLocalUri, uploadMedia } from '../../api/uploadAPI';
import categoriesAPI from '../../api/categoriesAPI';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const defaultLogo = require('../../../assets/images/default-user-pfp.png');

const CreatePostVenScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { postId, initialDescription, initialImage, initialCategoryIds } = useLocalSearchParams();
  const isEditing = !!postId;
  const myProfile = useSelector((state) => state.vendor.myProfile);
  const [publishing, setPublishing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [postText, setPostText] = useState(initialDescription || '');
  const [media, setMedia] = useState(initialImage ? { uri: initialImage } : null);
  // sections fetched from the DB: [{ id, name, items: [{ id, name }] }]
  const [sections, setSections] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      const result = await categoriesAPI.getCategories();
      if (result.success) setSections(result.data);
      setLoadingCategories(false);
    };
    fetchCategories();
  }, []);

  const pickMedia = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        setMedia({ uri: asset.uri, type: asset.type, width: asset.width, height: asset.height });
      }
    } catch (error) { console.log("Error picking media:", error); }
  };

  const removeMedia = () => setMedia(null);

  const toggleCategorySelection = (item) => {
    setSelectedItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, { id: item.id, name: item.name }];
    });
  };

  const toggleCategoryMenu = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCategoryMenuOpen(!isCategoryMenuOpen);
  };

  const toggleAccordion = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handlePublish = async () => {
    if (!postText.trim() && !media) {
      const errorMsg = "Please add some text or a photo/video before publishing.";
      if (Platform.OS === 'web') window.alert(errorMsg);
      else Alert.alert("Empty Post", errorMsg);
      return;
    }
    setPublishing(true);

    let mediaUrl = null;
    if (media?.uri && isLocalUri(media.uri)) {
      mediaUrl = await uploadMedia(media.uri, media.type === 'video' ? 'video' : 'image');
    } else if (media?.uri) {
      mediaUrl = media.uri;
    }

    const hashtags = selectedItems.length > 0
      ? `${selectedItems.map(i => `#${i.name.replace(/\s+/g, '')}`).join(' ')}\n\n`
      : '';
    const description = `${hashtags}${postText}`;

    let result;
    if (isEditing) {
      result = await dispatch(updatePost({
        id: postId,
        data: {
          description,
          postImage: mediaUrl,
          categoryIds: selectedItems.map((i) => i.id),
        },
      }));
    } else {
      result = await dispatch(createPost({
        description,
        postImage: mediaUrl,
        mediaType: media?.type || 'text',
        type: 'regular',
        categoryIds: selectedItems.map((i) => i.id),
      }));
    }

    setPublishing(false);
    if (result.meta.requestStatus === 'fulfilled') {
      router.back();
    } else {
      Alert.alert('Error', isEditing ? 'Failed to update post.' : 'Failed to publish post. Please try again.');
    }
  };

  const previewAspect = media ? Math.max(media.width / media.height, 0.75) : 4 / 3;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{isEditing ? 'Edit Post' : 'New Post'}</Text>
        <TouchableOpacity
          style={[styles.publishBtn, (!postText.trim() && !media) && styles.publishBtnDisabled]}
          onPress={handlePublish}
          disabled={(!postText.trim() && !media) || publishing}
          activeOpacity={0.8}
        >
          {publishing ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.publishText}>{isEditing ? 'Update' : 'Publish'}</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* COMPOSITION CARD */}
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.avatarWrapper}>
              <Image
                source={myProfile?.profileImage ? { uri: myProfile.profileImage } : defaultLogo}
                style={styles.vendorAvatar}
              />
            </View>
            <View>
              <Text style={styles.vendorName}>{myProfile?.shopName || myProfile?.fullName || 'User Name'}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color="#8391A1" />
                <Text style={styles.vendorLocation}>{myProfile?.city || ''}</Text>
              </View>
            </View>
          </View>

          <TextInput
            style={[styles.descInput, selectedItems.length > 0 && { marginBottom: 5 }]}
            placeholder="Share an update, product, or service..."
            placeholderTextColor="#A0AEC0"
            multiline
            value={postText}
            onChangeText={setPostText}
            autoFocus={true}
          />

          {selectedItems.length > 0 && (
            <View style={styles.previewTagsContainer}>
              {selectedItems.map((item) => (
                <Text key={item.id} style={styles.previewTagText}>#{item.name.replace(/\s+/g, '')}</Text>
              ))}
            </View>
          )}

          {media ? (
            <View style={[styles.dynamicMediaWrapper, { aspectRatio: previewAspect }]}>
              {media.type === 'video' ? (
                <Video style={styles.flexibleMedia} source={{ uri: media.uri }} useNativeControls resizeMode={ResizeMode.COVER} isLooping shouldPlay isMuted />
              ) : (
                <Image source={{ uri: media.uri }} style={styles.flexibleMedia} resizeMode="cover" />
              )}
              <TouchableOpacity style={styles.removeImageBadge} onPress={removeMedia} activeOpacity={0.8}>
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* TOOLS SECTION */}
        <View style={styles.addonsContainer}>
          <Text style={styles.addonsLabel}>Add to your post</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
            <TouchableOpacity style={[styles.addonPill, { borderColor: '#5B7896' }]} onPress={pickMedia} activeOpacity={0.8}>
              <Ionicons name="images" size={20} color="#5B7896" style={styles.pillIcon} />
              <Text style={[styles.pillText, { color: '#2D3E5E' }]}>Media</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addonPill, selectedItems.length > 0 && styles.categoryActivePill]}
              onPress={toggleCategoryMenu}
              activeOpacity={0.8}
            >
              <Ionicons name="pricetag" size={18} color={selectedItems.length > 0 ? "#FFF" : "#8A1C27"} style={styles.pillIcon} />
              <Text style={[styles.pillText, selectedItems.length > 0 && { color: '#FFF' }]}>
                {selectedItems.length > 0 ? `${selectedItems.length} Categories` : "Categories"}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {isCategoryMenuOpen && (
            <View style={styles.dropdownMenuWrapper}>
              {loadingCategories ? (
                <ActivityIndicator color="#2D3E5E" style={{ marginVertical: 16 }} />
              ) : (
                sections.map((section) => (
                  <View key={section.id} style={styles.accordionItem}>
                    <TouchableOpacity
                      style={[styles.mainCatBtn, expandedSection === section.id && styles.mainCatBtnActive]}
                      onPress={() => toggleAccordion(section.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.mainCatText, expandedSection === section.id && { color: '#FFFFFF' }]}>{section.name}</Text>
                      <MaterialCommunityIcons
                        name={expandedSection === section.id ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={expandedSection === section.id ? "#FFF" : "#8391A1"}
                      />
                    </TouchableOpacity>
                    {expandedSection === section.id && (
                      <View style={styles.subList}>
                        {section.items.map((item) => {
                          const isSelected = selectedItems.some((i) => i.id === item.id);
                          return (
                            <TouchableOpacity key={item.id} style={styles.subItem} onPress={() => toggleCategorySelection(item)} activeOpacity={0.7}>
                              <Text style={[styles.subItemText, isSelected && styles.selectedSubText]}>{item.name}</Text>
                              {isSelected && <Ionicons name="checkmark-circle" size={20} color="#8A1C27" />}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F9' },

  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3
  },
  cancelText: { fontSize: 16, color: '#8391A1', fontWeight: '600' },
  navTitle: { fontSize: 18, fontWeight: '800', color: '#2D3E5E', letterSpacing: 0.5 },
  publishBtn: { backgroundColor: '#8A1C27', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, elevation: 4, shadowColor: '#8A1C27', shadowOpacity: 0.3, shadowRadius: 5 },
  publishBtnDisabled: { backgroundColor: '#E2E8F0', elevation: 0 },
  publishText: { color: 'white', fontWeight: '800', fontSize: 14, textTransform: 'uppercase' },

  scrollArea: { flex: 1, padding: 20 },

  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
    elevation: 5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10,
    marginBottom: 25
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarWrapper: { padding: 2, backgroundColor: '#F1F4F9', borderRadius: 22, marginRight: 12 },
  vendorAvatar: { width: 40, height: 40, borderRadius: 20 },
  vendorName: { fontSize: 16, fontWeight: '800', color: '#2D3E5E' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  vendorLocation: { fontSize: 12, color: '#8391A1', marginLeft: 4, fontWeight: '600' },

  descInput: { fontSize: 16, color: '#2D3E5E', minHeight: 100, marginBottom: 15, lineHeight: 24, fontWeight: '500' },
  previewTagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  previewTagText: { color: '#8A1C27', fontSize: 14, fontWeight: '800', marginRight: 10, marginBottom: 4 },

  dynamicMediaWrapper: { width: '100%', backgroundColor: '#F1F4F9', borderRadius: 20, overflow: 'hidden', marginTop: 10, position: 'relative' },
  flexibleMedia: { width: '100%', height: '100%' },
  removeImageBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20, zIndex: 10 },

  addonsContainer: { paddingHorizontal: 5 },
  addonsLabel: { fontSize: 13, fontWeight: '800', color: '#8391A1', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  pillsRow: { paddingBottom: 15 },
  addonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  categoryActivePill: { backgroundColor: '#8A1C27', borderColor: '#8A1C27' },
  pillIcon: { marginRight: 8 },
  pillText: { fontWeight: '700', fontSize: 14 },

  dropdownMenuWrapper: { marginTop: 10, backgroundColor: '#FFFFFF', borderRadius: 25, padding: 15, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10 },
  accordionItem: { marginBottom: 10 },
  mainCatBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#F1F4F9'
  },
  mainCatBtnActive: { backgroundColor: '#2D3E5E' },
  mainCatText: { color: '#2D3E5E', fontWeight: '800', fontSize: 14 },

  subList: { backgroundColor: '#FFFFFF', paddingTop: 10, paddingHorizontal: 5 },
  subItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F4F9'
  },
  subItemText: { color: '#4A5568', fontSize: 14, fontWeight: '600' },
  selectedSubText: { color: '#8A1C27', fontWeight: '800' },
});

export default CreatePostVenScreen;