import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Switch,
  SafeAreaView,
  Dimensions,
  Alert,
  Platform,
  StatusBar,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { addCar } from '../../store/slices/carsSlice';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomTabs from '../common/BottomTabs';

const { width } = Dimensions.get('window');

const AddNewCarCust = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  // --- STATE FOR FORM FIELDS ---
  const [form, setForm] = useState({
    brand: '',
    model: '',
    year: '',
    engineType: '',
    fuelType: '',
    currentMileage: '',
    lastMaintenance: '',
    nextMaintenance: '',
    insurance: '',
    licensePlate: '',
    color: '',
    registration: '',
    carImage: null
  });

  // --- DATE PICKER STATE ---
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPickerDate, setCurrentPickerDate] = useState(new Date());
  const [activeDateField, setActiveDateField] = useState(null); // 'lastMaintenance', 'insurance', or 'registration'

  // --- IMAGE PICKER FUNCTION ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: Platform.OS !== 'web',
      aspect: [16, 9],
      quality: 1,
    });
    if (!result.canceled) {
      setForm({ ...form, carImage: result.assets[0].uri });
    }
  };

  // --- DATE PICKER LOGIC ---
  const openDatePopup = (field) => {
    setActiveDateField(field);
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate && activeDateField) {
      const formattedDate = selectedDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      setForm({ ...form, [activeDateField]: formattedDate });
      setCurrentPickerDate(selectedDate);
    }
  };

  const handleAddCar = async () => {
    if (!form.brand || !form.model) {
      Alert.alert("Missing Info", "Please at least provide the Brand and Model.");
      return;
    }
    setSaving(true);
    const result = await dispatch(addCar({
      brand: form.brand,
      model: form.model,
      year: form.year,
      plateNumber: form.licensePlate,
      engineType: form.engineType,
      fuelType: form.fuelType || 'Petrol',
      currentMileage: form.currentMileage,
      lastMaintenance: form.lastMaintenance,
      nextMaintenance: form.nextMaintenance,
      insuranceExpiry: form.insurance,
      color: form.color,
      registrationDate: form.registration,
      carImage: form.carImage,
    }));
    setSaving(false);
    if (result.meta.requestStatus === 'fulfilled') {
      router.back();
    } else {
      Alert.alert('Error', 'Failed to add car. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color="#2D3E5E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Car</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* IMAGE UPLOAD SECTION */}
        <View style={styles.imageContainer}>
          <TouchableOpacity style={styles.imageCard} onPress={pickImage} activeOpacity={0.9}>
            {form.carImage ? (
              <>
                <Image source={{ uri: form.carImage }} style={styles.carImage} resizeMode="cover" />
                <View style={styles.editOverlay}>
                  <Ionicons name="camera" size={20} color="#FFF" />
                </View>
              </>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={styles.iconCircle}>
                  <Ionicons name="cloud-upload-outline" size={40} color="#8A1C27" />
                </View>
                <Text style={styles.uploadText}>Upload Car Photo</Text>
                <Text style={styles.uploadSubtext}>Tap to browse gallery</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* FORM SECTION */}
        <View style={styles.card}>
          <View style={styles.formGrid}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Car Brand</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Toyota"
                placeholderTextColor="#A0AEC0"
                onChangeText={(t) => setForm({ ...form, brand: t })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Model</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Camry"
                placeholderTextColor="#A0AEC0"
                onChangeText={(t) => setForm({ ...form, model: t })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Year</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="2024"
                placeholderTextColor="#A0AEC0"
                onChangeText={(t) => setForm({ ...form, year: t })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Engine Type</Text>
              <TextInput
                style={styles.input}
                placeholder="V6 / Hybrid"
                placeholderTextColor="#A0AEC0"
                onChangeText={(t) => setForm({ ...form, engineType: t })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fuel Type</Text>
              <TextInput
                style={styles.input}
                placeholder="Petrol"
                placeholderTextColor="#A0AEC0"
                onChangeText={(t) => setForm({ ...form, fuelType: t })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Mileage</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="km"
                placeholderTextColor="#A0AEC0"
                onChangeText={(t) => setForm({ ...form, currentMileage: t })}
              />
            </View>

            {/* DATE PICKER FIELD: Last Maintenance */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Maintenance</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => openDatePopup('lastMaintenance')}>
                <Text style={[styles.dateText, !form.lastMaintenance && { color: "#A0AEC0" }]}>
                  {form.lastMaintenance || "Select Date"}
                </Text>
                <Ionicons name="calendar-outline" size={16} color="#8391A1" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Next Maintenance</Text>
              <TextInput
                style={styles.input}
                placeholder="km or Date"
                placeholderTextColor="#A0AEC0"
                onChangeText={(t) => setForm({ ...form, nextMaintenance: t })}
              />
            </View>

            {/* DATE PICKER FIELD: Insurance */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Insurance Expiry</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => openDatePopup('insurance')}>
                <Text style={[styles.dateText, !form.insurance && { color: "#A0AEC0" }]}>
                  {form.insurance || "Select Date"}
                </Text>
                <Ionicons name="calendar-outline" size={16} color="#8391A1" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>License Plate</Text>
              <TextInput
                style={styles.input}
                placeholder="21-XXXXX"
                placeholderTextColor="#A0AEC0"
                onChangeText={(t) => setForm({ ...form, licensePlate: t })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Black"
                placeholderTextColor="#A0AEC0"
                onChangeText={(t) => setForm({ ...form, color: t })}
              />
            </View>

            {/* DATE PICKER FIELD: Registration */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Registration renewal</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => openDatePopup('registration')}>
                <Text style={[styles.dateText, !form.registration && { color: "#A0AEC0" }]}>
                  {form.registration || "Select Date"}
                </Text>
                <Ionicons name="calendar-outline" size={16} color="#8391A1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* NOTIFICATION TOGGLE */}
        <View style={styles.switchCard}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchTitle}>Maintenance Reminders</Text>
            <Text style={styles.switchSub}>Receive alerts for upcoming services</Text>
          </View>
          <Switch
            trackColor={{ false: "#E2E8F0", true: "#8A1C27" }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E2E8F0"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddCar} disabled={saving} activeOpacity={0.8}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.addButtonText}>ADD CAR</Text>}
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- POPUP DATE PICKER MODAL --- */}
      {Platform.OS === 'ios' ? (
        <Modal visible={showDatePicker} transparent={true} animationType="slide">
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={currentPickerDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={currentPickerDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )
      )}

      {/* FOOTER */}
      <View style={styles.footerContainer}>
        <BottomTabs />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F1F4F9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#2D3E5E', letterSpacing: 0.5 },

  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  imageContainer: { marginVertical: 20 },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  uploadPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#FDF2F3',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  uploadText: { color: '#2D3E5E', fontWeight: '800', fontSize: 16 },
  uploadSubtext: { color: '#8391A1', fontSize: 12, marginTop: 4, fontWeight: '500' },
  carImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  editOverlay: {
    position: 'absolute', bottom: 15, right: 15,
    backgroundColor: '#8A1C27', padding: 10, borderRadius: 25,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 5
  },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  inputGroup: { width: '48%', marginBottom: 20 },
  label: { fontSize: 13, color: '#8391A1', marginBottom: 8, fontWeight: '700', marginLeft: 4 },
  input: {
    backgroundColor: '#F1F4F9',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2D3E5E',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  // Added style for the Date Button to look like an Input
  dateInput: {
    backgroundColor: '#F1F4F9',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateText: {
    fontSize: 14,
    color: '#2D3E5E',
    fontWeight: '600',
  },

  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 25,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3
  },
  switchTextContainer: { flex: 1 },
  switchTitle: { fontSize: 16, color: '#2D3E5E', fontWeight: '800' },
  switchSub: { fontSize: 12, color: '#8391A1', fontWeight: '500', marginTop: 2 },

  addButton: {
    backgroundColor: '#8A1C27',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#8A1C27', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6
  },
  addButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 1 },

  // Date Modal Styling
  pickerModalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  pickerModalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingBottom: 40 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  pickerTitle: { fontSize: 17, fontWeight: 'bold', color: '#2D3E5E' },
  pickerDoneText: { fontSize: 17, fontWeight: 'bold', color: '#8A1C27' },

  footerContainer: { position: 'absolute', bottom: 0, width: width, zIndex: 10 }
});

export default AddNewCarCust;