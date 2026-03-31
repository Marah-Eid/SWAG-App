import React, { useState, useRef } from 'react';
import {
  StyleSheet, View, Text, TextInput, ScrollView, Modal,
  TouchableOpacity, Image, Platform, Alert, KeyboardAvoidingView, LayoutAnimation, UIManager, StatusBar, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { createPost } from '../../store/slices/postsSlice';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const eventTypes = [
  { label: 'Drift Event', value: 'DriftEvent' },
  { label: 'Car Meet', value: 'CarMeet' },
  { label: 'Track Day', value: 'TrackDay' },
  { label: 'Tuning Workshop', value: 'Workshop' },
  { label: 'Others', value: 'Others' },
];

const CreateEventScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [publishing, setPublishing] = useState(false);

  // --- Form States ---
  const [media, setMedia] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // --- UI States ---
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [activeTarget, setActiveTarget] = useState('date');

  const webDateRef = useRef(null);
  const webStartRef = useRef(null);
  const webEndRef = useRef(null);

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
    } catch (error) {
      console.log("Error picking media:", error);
    }
  };

  const removeMedia = () => setMedia(null);

  const triggerPicker = (target, mode) => {
    if (Platform.OS === 'web') {
      if (target === 'date' && webDateRef.current) webDateRef.current.showPicker();
      else if (target === 'start' && webStartRef.current) webStartRef.current.showPicker();
      else if (target === 'end' && webEndRef.current) webEndRef.current.showPicker();
    } else {
      setActiveTarget(target);
      setPickerMode(mode);
      setShowPicker(true);
    }
  };

  const onAndroidChange = (event, selectedDate) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate) {
      if (activeTarget === 'date') setDate(selectedDate);
      else if (activeTarget === 'start') setStartTime(selectedDate);
      else if (activeTarget === 'end') setEndTime(selectedDate);
    }
  };

  const onIOSChange = (event, selectedDate) => {
    if (selectedDate) {
      if (activeTarget === 'date') setDate(selectedDate);
      else if (activeTarget === 'start') setStartTime(selectedDate);
      else if (activeTarget === 'end') setEndTime(selectedDate);
    }
  };

  const formatTime = (time) => {
    if (!time) return null;
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleEventType = (val) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selectedTypes.includes(val)) {
      setSelectedTypes(selectedTypes.filter(t => t !== val));
    } else {
      setSelectedTypes([...selectedTypes, val]);
    }
  };

  const handlePublish = async () => {
    if (!eventTitle.trim()) {
      Alert.alert("Required", "Please provide a title for your event.");
      return;
    }

    setPublishing(true);
    const result = await dispatch(createPost({
      type: 'event',
      eventTitle: eventTitle.trim(),
      description: description.trim(),
      postImage: media?.uri || null,
      mediaType: media?.type || 'image',
      mediaWidth: media?.width || null,
      mediaHeight: media?.height || null,
      eventDate: date.toISOString().split('T')[0],
      eventTime: formatTime(startTime),
      eventEndTime: formatTime(endTime),
      eventTypeIds: [],
    }));
    setPublishing(false);

    if (result.meta.requestStatus === 'fulfilled') {
      router.back();
    } else {
      Alert.alert('Error', 'Failed to publish event. Please try again.');
    }
  };

  const previewAspect = media ? Math.max(media.width / media.height, 0.75) : 4 / 3;

  const getPickerValue = () => {
    if (activeTarget === 'date') return date;
    if (activeTarget === 'start') return startTime || new Date();
    if (activeTarget === 'end') return endTime || new Date();
    return new Date();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <StatusBar barStyle="dark-content" />

      {Platform.OS === 'web' && (
        <View style={{ height: 0, opacity: 0 }}>
          <input type="date" ref={webDateRef} onChange={(e) => setDate(new Date(e.target.value))} />
          <input type="time" ref={webStartRef} onChange={(e) => { const [h, m] = e.target.value.split(':'); const d = new Date(); d.setHours(h, m); setStartTime(d); }} />
          <input type="time" ref={webEndRef} onChange={(e) => { const [h, m] = e.target.value.split(':'); const d = new Date(); d.setHours(h, m); setEndTime(d); }} />
        </View>
      )}

      {/* HEADER */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Event Planner</Text>
        <TouchableOpacity
          style={[styles.publishBtn, (!eventTitle.trim() || publishing) && styles.publishBtnDisabled]}
          onPress={handlePublish}
          activeOpacity={0.8}
          disabled={!eventTitle.trim() || publishing}
        >
          {publishing
            ? <ActivityIndicator size="small" color="#FFF" />
            : <Text style={styles.publishText}>Publish</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

        {/* POST COMPOSITION CARD */}
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
            style={styles.titleInput}
            placeholder="Give it a catchy title..."
            placeholderTextColor="#A0AEC0"
            value={eventTitle}
            onChangeText={setEventTitle}
            maxLength={50}
          />

          <TextInput
            style={styles.descInput}
            placeholder="Tell us about the activities, rules, and vibes..."
            placeholderTextColor="#A0AEC0"
            multiline
            value={description}
            onChangeText={setDescription}
          />

          {selectedTypes.length > 0 && (
            <View style={styles.previewTagsContainer}>
              {selectedTypes.map((tag, index) => (<Text key={index} style={styles.previewTagText}>#{tag}</Text>))}
            </View>
          )}

          {/* MEDIA AREA */}
          <View style={styles.mediaWrapper}>
            {media ? (
              <View style={[styles.mediaArea, { aspectRatio: previewAspect }]}>
                {media.type === 'video' ? (
                  <Video style={styles.flexibleMedia} source={{ uri: media.uri }} useNativeControls resizeMode={ResizeMode.COVER} isLooping shouldPlay isMuted />
                ) : (
                  <Image source={{ uri: media.uri }} style={styles.flexibleMedia} resizeMode="cover" />
                )}
                <TouchableOpacity style={styles.removeMediaBadge} onPress={removeMedia} activeOpacity={0.8}>
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imagePlaceholder} onPress={pickMedia} activeOpacity={0.8}>
                <View style={styles.placeholderIconCircle}>
                  <Ionicons name="cloud-upload-outline" size={32} color="#8A1C27" />
                </View>
                <Text style={styles.placeholderText}>Tap to add event poster</Text>
                <Text style={styles.placeholderSub}>Image or Video allowed</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* SCHEDULE SECTION */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardSectionTitle}>Event Schedule</Text>

          <TouchableOpacity style={styles.dateTimeRow} onPress={() => triggerPicker('date', 'date')} activeOpacity={0.7}>
            <View style={styles.iconBox}><Ionicons name="calendar" size={20} color="#8A1C27" /></View>
            <View style={styles.dateTimeTextContainer}>
              <Text style={styles.dateTimeLabel}>Start Date</Text>
              <Text style={styles.dateTimeValue}>{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.timeRowContainer}>
            <TouchableOpacity style={styles.halfTimeBtn} onPress={() => triggerPicker('start', 'time')} activeOpacity={0.7}>
              <View style={styles.iconBox}><Ionicons name="time" size={20} color="#8A1C27" /></View>
              <View style={styles.dateTimeTextContainer}>
                <Text style={styles.dateTimeLabel}>Begins</Text>
                <Text style={[styles.dateTimeValue, !startTime && { color: '#A0AEC0' }]}>
                  {startTime ? formatTime(startTime) : "Set time"}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.verticalDivider} />

            <TouchableOpacity style={styles.halfTimeBtn} onPress={() => triggerPicker('end', 'time')} activeOpacity={0.7}>
              <View style={styles.iconBox}><Ionicons name="time-outline" size={20} color="#8A1C27" /></View>
              <View style={styles.dateTimeTextContainer}>
                <Text style={styles.dateTimeLabel}>Finishes</Text>
                <Text style={[styles.dateTimeValue, !endTime && { color: '#A0B0C0' }]}>
                  {endTime ? formatTime(endTime) : "Set time"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* CATEGORY SECTION */}
        <View style={styles.detailsCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.cardSectionTitle}>Category</Text>
            <Text style={styles.sectionSubLabel}>Select all that apply</Text>
          </View>
          <View style={styles.chipsContainer}>
            {eventTypes.map((type) => {
              const isSelected = selectedTypes.includes(type.value);
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggleEventType(type.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{type.label}</Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={16} color="#FFF" style={{ marginLeft: 6 }} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* --- ANDROID PICKER --- */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={getPickerValue()}
          mode={pickerMode}
          is24Hour={false}
          display="default"
          themeVariant="light"
          onChange={onAndroidChange}
        />
      )}

      {/* --- IOS MODAL PICKER --- */}
      {showPicker && Platform.OS === 'ios' && (
        <Modal transparent={true} animationType="slide">
          <View style={styles.iosPickerModalContainer}>
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.iosPickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.iosPickerBody}>
              <DateTimePicker
                value={getPickerValue()}
                mode={pickerMode}
                is24Hour={false}
                display="spinner"
                themeVariant="light"
                textColor="#2D3E5E"
                onChange={onIOSChange}
              />
            </View>
          </View>
        </Modal>
      )}

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
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3
  },
  cancelText: { fontSize: 16, color: '#8391A1', fontWeight: '600' },
  navTitle: { fontSize: 18, fontWeight: '800', color: '#2D3E5E', letterSpacing: 0.5 },
  publishBtn: { backgroundColor: '#8A1C27', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, elevation: 4, shadowColor: '#8A1C27', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5 },
  publishBtnDisabled: { backgroundColor: '#E2E8F0', elevation: 0 },
  publishText: { color: 'white', fontWeight: '800', fontSize: 14, textTransform: 'uppercase' },

  scrollArea: { flex: 1, padding: 20 },

  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarWrapper: { padding: 2, backgroundColor: '#F1F4F9', borderRadius: 22, marginRight: 12 },
  vendorAvatar: { width: 40, height: 40, borderRadius: 20 },
  vendorName: { fontSize: 16, fontWeight: '800', color: '#2D3E5E' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  vendorLocation: { fontSize: 12, color: '#8391A1', marginLeft: 4, fontWeight: '600' },

  titleInput: { fontSize: 24, fontWeight: '800', color: '#2D3E5E', marginBottom: 10, letterSpacing: 0.3 },
  descInput: { fontSize: 15, color: '#4A5568', minHeight: 60, marginBottom: 15, lineHeight: 22, fontWeight: '500' },

  previewTagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  previewTagText: { color: '#8A1C27', fontSize: 14, fontWeight: '800', marginRight: 10, marginBottom: 4 },

  mediaWrapper: { marginTop: 10 },
  mediaArea: { width: '100%', borderRadius: 20, overflow: 'hidden', backgroundColor: '#F1F4F9', position: 'relative' },
  flexibleMedia: { width: '100%', height: '100%' },
  removeMediaBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20, zIndex: 10 },

  imagePlaceholder: {
    width: '100%', height: 200, backgroundColor: '#FFFFFF',
    borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E2E8F0', borderStyle: 'dashed'
  },
  placeholderIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FDF2F3', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  placeholderText: { color: '#2D3E5E', fontWeight: '800', fontSize: 16 },
  placeholderSub: { color: '#8391A1', fontSize: 12, marginTop: 4, fontWeight: '500' },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardSectionTitle: { fontSize: 16, fontWeight: '800', color: '#2D3E5E' },
  sectionSubLabel: { fontSize: 12, color: '#8391A1', fontWeight: '600' },

  dateTimeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FDF2F3', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  dateTimeTextContainer: { flex: 1 },
  dateTimeLabel: { fontSize: 11, color: '#8391A1', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  dateTimeValue: { fontSize: 16, fontWeight: '700', color: '#2D3E5E' },

  divider: { height: 1, backgroundColor: '#F1F4F9', marginVertical: 15, marginLeft: 59 },

  timeRowContainer: { flexDirection: 'row', alignItems: 'center' },
  halfTimeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  verticalDivider: { width: 1, height: 40, backgroundColor: '#F1F4F9', marginHorizontal: 15 },

  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F4F9', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 25, borderWidth: 1, borderColor: '#E2E8F0' },
  chipSelected: { backgroundColor: '#8A1C27', borderColor: '#8A1C27' },
  chipText: { fontSize: 13, color: '#4A5568', fontWeight: '600' },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '800' },

  iosPickerModalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  iosPickerHeader: { backgroundColor: '#FFFFFF', padding: 18, alignItems: 'flex-end', borderTopLeftRadius: 30, borderTopRightRadius: 30, borderBottomWidth: 1, borderBottomColor: '#F1F4F9' },
  iosPickerDoneText: { color: '#8A1C27', fontWeight: '800', fontSize: 17 },
  iosPickerBody: { backgroundColor: '#FFFFFF', paddingBottom: 40 }
});

export default CreateEventScreen;