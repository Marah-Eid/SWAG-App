import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, ScrollView,
  TouchableOpacity, Image, LayoutAnimation, Platform, UIManager, Alert, KeyboardAvoidingView, StatusBar, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { createPost } from '../../store/slices/postsSlice';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORIES = [
  { id: 'parts', title: 'Parts', subCategories: ['Car-Parts', 'Exhaust System', 'Glass Services', 'Wheels & Tires'] },
  { id: 'autohub', title: 'Auto Hub', subCategories: ['Car Rental', 'Agencies', 'Dealerships'] },
  { id: 'customization', title: 'Customization', subCategories: ['Tuning', 'Accessories', 'Paint & Body', 'Interior'] },
  { id: 'services', title: 'Services', subCategories: ['Maintenance', 'Car Washes', 'Gas Station'] }
];

const CreatePostVenScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [publishing, setPublishing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [postText, setPostText] = useState('');
  const [media, setMedia] = useState(null);

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

  const toggleCategorySelection = (sub) => {
    if (selectedCategories.includes(sub)) {
      setSelectedCategories(selectedCategories.filter(item => item !== sub));
    } else {
      setSelectedCategories([...selectedCategories, sub]);
    }
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
    const hashtags = selectedCategories.length > 0
      ? `${selectedCategories.map(cat => `#${cat.replace(/\s+/g, '')}`).join(' ')}\n\n`
      : '';
    const result = await dispatch(createPost({
      description: `${hashtags}${postText}`,
      postImage: media?.uri || null,
      mediaType: media?.type || 'text',
      type: 'regular',
    }));
    setPublishing(false);
    if (result.meta.requestStatus === 'fulfilled') {
      router.back();
    } else {
      Alert.alert('Error', 'Failed to publish post. Please try again.');
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
        <Text style={styles.navTitle}>New Post</Text>
        <TouchableOpacity
          style={[styles.publishBtn, (!postText.trim() && !media) && styles.publishBtnDisabled]}
          onPress={handlePublish}
          disabled={(!postText.trim() && !media) || publishing}
          activeOpacity={0.8}
        >
          {publishing ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.publishText}>Publish</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* COMPOSITION CARD */}
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.avatarWrapper}>
              <Image source={require('../../../assets/images/carag-icon.png')} style={styles.vendorAvatar} />
            </View>
            <View>
              <Text style={styles.vendorName}>Automotive</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color="#8391A1" />
                <Text style={styles.vendorLocation}>Amman, Jordan</Text>
              </View>
            </View>
          </View>

          <TextInput
            style={[styles.descInput, selectedCategories.length > 0 && { marginBottom: 5 }]}
            placeholder="Share an update, product, or service..."
            placeholderTextColor="#A0AEC0"
            multiline
            value={postText}
            onChangeText={setPostText}
            autoFocus={true}
          />

          {selectedCategories.length > 0 && (
            <View style={styles.previewTagsContainer}>
              {selectedCategories.map((tag, index) => (
                <Text key={index} style={styles.previewTagText}>#{tag.replace(/\s+/g, '')}</Text>
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
              style={[styles.addonPill, selectedCategories.length > 0 && styles.categoryActivePill]}
              onPress={toggleCategoryMenu}
              activeOpacity={0.8}
            >
              <Ionicons name="pricetag" size={18} color={selectedCategories.length > 0 ? "#FFF" : "#8A1C27"} style={styles.pillIcon} />
              <Text style={[styles.pillText, selectedCategories.length > 0 && { color: '#FFF' }]}>
                {selectedCategories.length > 0 ? `${selectedCategories.length} Categories` : "Categories"}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {isCategoryMenuOpen && (
            <View style={styles.dropdownMenuWrapper}>
              {CATEGORIES.map((cat) => (
                <View key={cat.id} style={styles.accordionItem}>
                  <TouchableOpacity
                    style={[styles.mainCatBtn, expandedSection === cat.id && styles.mainCatBtnActive]}
                    onPress={() => toggleAccordion(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.mainCatText, expandedSection === cat.id && { color: '#FFFFFF' }]}>{cat.title}</Text>
                    <MaterialCommunityIcons
                      name={expandedSection === cat.id ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={expandedSection === cat.id ? "#FFF" : "#8391A1"}
                    />
                  </TouchableOpacity>
                  {expandedSection === cat.id && (
                    <View style={styles.subList}>
                      {cat.subCategories.map((sub, index) => (
                        <TouchableOpacity key={index} style={styles.subItem} onPress={() => toggleCategorySelection(sub)} activeOpacity={0.7}>
                          <Text style={[styles.subItemText, selectedCategories.includes(sub) && styles.selectedSubText]}>{sub}</Text>
                          {selectedCategories.includes(sub) && <Ionicons name="checkmark-circle" size={20} color="#8A1C27" />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
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