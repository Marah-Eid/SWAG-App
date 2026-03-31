import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  SafeAreaView, TextInput, Dimensions, Alert, Platform, Modal, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomTabs from '../common/BottomTabs';
import { fetchCustomerProfile, updateCustomerProfile } from '../../store/slices/customerSlice';
import {
  fetchMyCars,
  deleteCar as deleteCarThunk,
  updateCar as updateCarThunk,
  fetchMaintenanceRecords,
  addMaintenanceRecord as addMaintenanceThunk,
  deleteMaintenanceRecord as deleteMaintenanceThunk,
} from '../../store/slices/carsSlice';

const { width, height } = Dimensions.get('window');

// --- STATCARD COMPONENT ---
const StatCard = ({ label, field, value, isEditing, onUpdate, fullWidth, isDate, onPressDate }) => (
  <View style={[styles.statCard, fullWidth && { width: '100%' }]}>
    <Text style={styles.statLabel}>{label}</Text>
    {isEditing ? (
      isDate ? (
        <TouchableOpacity style={styles.datePickerTriggerSmall} onPress={onPressDate}>
          <Text style={styles.datePickerTriggerText}>{value}</Text>
        </TouchableOpacity>
      ) : (
        <TextInput
          style={styles.cleanEditableInput}
          value={value}
          onChangeText={(txt) => onUpdate(field, txt)}
          autoFocus={false}
          selectTextOnFocus={true}
        />
      )
    ) : (
      <View style={styles.statValueBadge}>
        <Text style={styles.statValueText}>{value}</Text>
      </View>
    )}
  </View>
);

// map API CarDto → local car shape
const mapApiCar = (c) => ({
  id: c.id,
  brand: c.brand || '',
  model: c.model || '',
  year: c.year || '',
  plate: c.plateNumber || '',
  engineType: c.engineType || '',
  fuelType: c.fuelType || '',
  currentMileage: c.currentMileage || '',
  lastMaintenance: c.lastMaintenance || '',
  nextMaintenance: c.nextMaintenance || '',
  insurance: c.insuranceExpiry || '',
  color: c.color || '',
  registration: c.registrationDate || '',
  carImage: c.carImage || null,
});

export default function ProfileCust() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.customer);
  const { cars: reduxCars, maintenance } = useSelector((state) => state.cars);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [previewSource, setPreviewSource] = useState(null);

  // local mutable copy of cars for inline editing
  const [cars, setCars] = useState([]);

  // --- CAR EDITING STATES ---
  const [editingCarId, setEditingCarId] = useState(null);
  const [editMake, setEditMake] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState('');

  // --- DATE PICKER STATE ---
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeDateTarget, setActiveDateTarget] = useState(null);

  // --- FETCH on mount ---
  useEffect(() => {
    dispatch(fetchCustomerProfile());
    dispatch(fetchMyCars());
  }, [dispatch]);

  // --- SYNC profile from Redux ---
  useEffect(() => {
    if (profile) {
      setProfileData({ name: profile.fullName || '', email: profile.email || '' });
      setProfileImage(profile.profileImage || null);
      setBannerImage(profile.bannerImage || null);
    } else if (user) {
      setProfileData({ name: user.fullName || '', email: user.email || '' });
    }
  }, [profile, user]);

  // --- SYNC cars from Redux ---
  useEffect(() => {
    if (reduxCars.length > 0) {
      setCars(reduxCars.map(mapApiCar));
      reduxCars.forEach((c) => dispatch(fetchMaintenanceRecords(c.id)));
    }
  }, [reduxCars]);

  // --- PROFILE SAVE ---
  const handleSaveProfile = async () => {
    await dispatch(updateCustomerProfile({
      fullName: profileData.name,
      profileImage,
      bannerImage,
    }));
    setIsEditingProfile(false);
  };

  // Split fields when editing a car
  const startEditingCar = (car) => {
    setEditMake(car.brand || '');
    setEditModel(car.model || '');
    setEditYear(car.year || '');
    setEditingCarId(car.id);
  };

  const saveCarModel = (id) => {
    const car = cars.find((c) => c.id === id);
    if (!car) return;
    const updatedCar = { ...car, brand: editMake, model: editModel, year: editYear };
    setCars((prev) => prev.map((c) => (c.id === id ? updatedCar : c)));
    dispatch(updateCarThunk({
      id,
      data: {
        brand: editMake,
        model: editModel,
        year: editYear,
        plateNumber: car.plate,
        engineType: car.engineType,
        fuelType: car.fuelType,
        color: car.color,
        currentMileage: car.currentMileage,
        lastMaintenance: car.lastMaintenance,
        nextMaintenance: car.nextMaintenance,
        insuranceExpiry: car.insurance,
        registrationDate: car.registration,
        carImage: car.carImage,
      },
    }));
    setEditingCarId(null);
  };

  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  const openDatePicker = (target) => {
    setActiveDateTarget(target);
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate && activeDateTarget) {
      const formatted = formatDate(selectedDate);
      if (activeDateTarget.type === 'car') {
        updateCarDetail(activeDateTarget.carId, activeDateTarget.field, formatted);
      }
      setCurrentDate(selectedDate);
    }
  };

  const updateCarDetail = useCallback((id, field, value) => {
    setCars(prev => prev.map(car => car.id === id ? { ...car, [field]: value } : car));
  }, []);

  const addMaintenanceRecord = (carId) => {
    dispatch(addMaintenanceThunk({
      carId,
      data: { title: 'New Record', recordDate: formatDate(new Date()), status: 'Completed' },
    }));
  };

  const deleteMaintenanceRecord = (carId, recordId) => {
    dispatch(deleteMaintenanceThunk({ carId, recordId }));
  };

  const deleteCar = (id, model) => {
    const confirmDelete = () => dispatch(deleteCarThunk(id));
    if (Platform.OS === 'web') {
      if (window.confirm(`Remove ${model}?`)) confirmDelete();
    } else {
      Alert.alert("Delete Car", `Remove ${model}?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: confirmDelete }
      ]);
    }
  };

  const pickImage = async (type) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [21, 9],
      quality: 1,
    });
    if (!result.canceled) {
      type === 'avatar' ? setProfileImage(result.assets[0].uri) : setBannerImage(result.assets[0].uri);
    }
  };

  const pickCarImage = async (carId) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });
    if (!result.canceled) updateCarDetail(carId, 'carImage', result.assets[0].uri);
  };

  const handleImagePress = (type, source, carId = null) => {
    if (type === 'banner') isEditingProfile ? pickImage('banner') : (source && setPreviewSource({ uri: source }));
    else if (type === 'avatar') isEditingProfile ? pickImage('avatar') : setPreviewSource(source ? { uri: source } : require('../../../assets/images/profile-img.png'));
    else if (type === 'car') editingCarId === carId ? pickCarImage(carId) : setPreviewSource(source ? { uri: source } : require('../../../assets/images/car-new-img.png'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/customer/HomeCust')}>
          <Ionicons name="chevron-back" size={28} color="#2D3E5E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.profileInfoCard}>
          <TouchableOpacity style={styles.bannerBackground} onPress={() => handleImagePress('banner', bannerImage)} activeOpacity={0.9}>
            {bannerImage && <Image source={{ uri: bannerImage }} style={styles.bannerImage} resizeMode="cover" />}
            {isEditingProfile && <View style={styles.cameraIconOverlay}><Ionicons name="camera" size={24} color="white" /></View>}
          </TouchableOpacity>

          <View style={styles.middleRow}>
            <TouchableOpacity style={styles.avatarWrapper} onPress={() => handleImagePress('avatar', profileImage)} activeOpacity={0.9}>
              <Image source={profileImage ? { uri: profileImage } : require('../../../assets/images/profile-img.png')} style={styles.avatarImage} resizeMode="cover" />
              {isEditingProfile && <View style={styles.avatarOverlay}><Ionicons name="camera" size={20} color="white" /></View>}
            </TouchableOpacity>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.editProfileBtn} onPress={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)} activeOpacity={0.8}>
                <Text style={styles.btnTextSmall}>{isEditingProfile ? "Save" : "Edit Profile"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.followingBtn} onPress={() => router.push('/commonScreens/FollowingList')} activeOpacity={0.8}>
                <Text style={styles.btnTextSmall}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.userTextContainer}>
            {isEditingProfile ? (
              <>
                <TextInput style={styles.editableInput} value={profileData.name} onChangeText={(txt) => setProfileData({ ...profileData, name: txt })} />
                <Text style={styles.userEmail}>{profileData.email}</Text>
              </>
            ) : (
              <>
                <Text style={styles.userName}>{profileData.name}</Text>
                <Text style={styles.userEmail}>{profileData.email}</Text>
              </>
            )}
          </View>
        </View>

        {cars.map((car, index) => {
          const isThisCarEditing = editingCarId === car.id;
          return (
            <View key={car.id} style={styles.carEntryWrapper}>
              <View style={styles.carShowcaseCard}>
                <TouchableOpacity onPress={() => handleImagePress('car', car.carImage, car.id)} activeOpacity={0.9}>
                  <Image source={car.carImage ? { uri: car.carImage } : require('../../../assets/images/car-new-img.png')} style={styles.carImagePremium} resizeMode="cover" />
                  {isThisCarEditing && <View style={styles.cameraIconOverlay}><Ionicons name="camera" size={32} color="white" /></View>}
                </TouchableOpacity>

                <View style={styles.carInfoContainer}>
                  <View style={styles.carDetailsRow}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      {isThisCarEditing ? (
                        <View style={{ gap: 5 }}>
                          <TextInput style={styles.cleanEditableInput} value={editMake} placeholder="Make" onChangeText={setEditMake} />
                          <TextInput style={styles.cleanEditableInput} value={editModel} placeholder="Model" onChangeText={setEditModel} />
                          <TextInput style={styles.cleanEditableInput} value={editYear} placeholder="Year" keyboardType="numeric" onChangeText={setEditYear} />
                          <TextInput style={styles.cleanEditableInput} value={car.plate} placeholder="Plate" onChangeText={(txt) => updateCarDetail(car.id, 'plate', txt)} />
                        </View>
                      ) : (
                        <>
                          <Text style={styles.carModelText}>{`${car.brand || ''} ${car.model} ${car.year || ''}`.trim()}</Text>
                          <Text style={styles.carPlateText}>{car.plate}</Text>
                        </>
                      )}
                    </View>
                    <View style={styles.carActions}>
                      <TouchableOpacity style={styles.carDeleteBtn} onPress={() => deleteCar(car.id, car.model)} activeOpacity={0.7}>
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.carEditBtn}
                        onPress={() => isThisCarEditing ? saveCarModel(car.id) : startEditingCar(car)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.btnTextSmall}>{isThisCarEditing ? "Save" : "Edit"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <StatCard label="Engine" field="engineType" value={car.engineType} isEditing={isThisCarEditing} onUpdate={(f, v) => updateCarDetail(car.id, f, v)} />
                <StatCard label="Fuel" field="fuelType" value={car.fuelType} isEditing={isThisCarEditing} onUpdate={(f, v) => updateCarDetail(car.id, f, v)} />
                <StatCard label="Mileage" field="currentMileage" value={car.currentMileage} isEditing={isThisCarEditing} onUpdate={(f, v) => updateCarDetail(car.id, f, v)} />

                <StatCard label="Last Maint." value={car.lastMaintenance} isEditing={isThisCarEditing} isDate={true} onPressDate={() => openDatePicker({ type: 'car', carId: car.id, field: 'lastMaintenance' })} />
                <StatCard label="Insurance" value={car.insurance} isEditing={isThisCarEditing} isDate={true} onPressDate={() => openDatePicker({ type: 'car', carId: car.id, field: 'insurance' })} />
                <StatCard label="Registration" value={car.registration} isEditing={isThisCarEditing} isDate={true} onPressDate={() => openDatePicker({ type: 'car', carId: car.id, field: 'registration' })} />

                <StatCard label="Next Maint." field="nextMaintenance" value={car.nextMaintenance} isEditing={isThisCarEditing} onUpdate={(f, v) => updateCarDetail(car.id, f, v)} />
                <StatCard label="Color" field="color" value={car.color} isEditing={isThisCarEditing} onUpdate={(f, v) => updateCarDetail(car.id, f, v)} />
              </View>

              <View style={styles.maintenanceSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>MAINTENANCE & STATUS</Text>
                  {isThisCarEditing && (
                    <TouchableOpacity onPress={() => addMaintenanceRecord(car.id)} style={styles.addRecordBtn} activeOpacity={0.7}>
                      <Ionicons name="add-circle" size={18} color="#8A1C27" />
                      <Text style={styles.addRecordText}>Add Status</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {(maintenance[car.id] || []).length > 0 ? (
                  (maintenance[car.id] || []).map((record) => (
                    <View key={record.id} style={styles.maintenanceCard}>
                      <View style={styles.maintIconCircle}><Image source={require('../../../assets/images/oil-icon.png')} style={styles.maintIcon} /></View>
                      <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.maintTitle}>{record.title || "Status Title"}</Text>
                        <Text style={styles.maintDate}>{record.recordDate || record.date || "Date"}</Text>
                      </View>
                      {isThisCarEditing && (
                        <TouchableOpacity onPress={() => deleteMaintenanceRecord(car.id, record.id)} style={styles.trashBtn}>
                          <Ionicons name="trash-outline" size={22} color="#E53E3E" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                ) : <Text style={styles.emptyMaintText}>No records added.</Text>}
              </View>
              {index < cars.length - 1 && <View style={styles.carDivider} />}
            </View>
          );
        })}

        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.footerBtn} onPress={() => router.push('/customer/AddNewCarCust')} activeOpacity={0.8}><Text style={styles.footerBtnText}>Add Another Car</Text></TouchableOpacity>
          <TouchableOpacity style={styles.footerBtnOutline} onPress={() => router.push({ pathname: '/customer/HistoryCust', params: { syncedCars: JSON.stringify(cars) } })} activeOpacity={0.8}><Text style={styles.footerBtnTextOutline}>View History</Text></TouchableOpacity>
        </View>
        {/* FIXED: Changed <div> to <View> */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- POPUP DATE PICKER --- */}
      {Platform.OS === 'ios' ? (
        <Modal visible={showDatePicker} transparent={true} animationType="slide">
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}><Text style={styles.doneText}>Done</Text></TouchableOpacity>
              </View>
              <DateTimePicker value={currentDate} mode="date" display="spinner" onChange={handleDateChange} />
            </View>
          </View>
        </Modal>
      ) : showDatePicker && (
        <DateTimePicker value={currentDate} mode="date" display="default" onChange={handleDateChange} />
      )}

      <Modal visible={!!previewSource} transparent={true} animationType="fade">
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity style={styles.closeFullscreen} onPress={() => setPreviewSource(null)}><Ionicons name="close-circle" size={40} color="white" /></TouchableOpacity>
          {previewSource && <Image source={previewSource} style={styles.fullscreenImage} resizeMode="contain" />}
        </View>
      </Modal>

      <View style={styles.footerContainer}><BottomTabs /></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#AFC6D8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#2D3E5E' },
  scrollContent: { paddingHorizontal: 20 },
  profileInfoCard: { backgroundColor: '#FFFFFF', borderRadius: 20, elevation: 4, marginBottom: 25, marginTop: 5, overflow: 'hidden', paddingBottom: 20 },
  bannerBackground: { height: 120, backgroundColor: '#8A1C27' },
  bannerImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  cameraIconOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  middleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: -43 },
  avatarWrapper: { width: 86, height: 86, borderRadius: 43, borderWidth: 3, borderColor: '#FFFFFF', backgroundColor: '#FFFFFF', overflow: 'hidden', elevation: 5 },
  avatarImage: { width: '100%', height: '100%' },
  avatarOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },

  actionButtons: { flexDirection: 'row', gap: 8, marginTop: 50 },
  editProfileBtn: { backgroundColor: '#2D3E5E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  followingBtn: { backgroundColor: '#8A1C27', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  btnTextSmall: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', textAlign: 'center' },

  userTextContainer: { paddingHorizontal: 20, marginTop: 15 },
  userName: { fontSize: 22, fontWeight: '800', color: '#2D3E5E' },
  userEmail: { fontSize: 14, color: '#8391A1', marginTop: 2, fontWeight: '500' },
  editableInput: { fontSize: 18, borderBottomWidth: 1, borderColor: '#8A1C27', color: '#2D3E5E', fontWeight: '700' },
  cleanEditableInput: { fontSize: 14, borderBottomWidth: 1, borderColor: '#8A1C27', color: '#2D3E5E', textAlign: 'center', fontWeight: '600', paddingVertical: 2 },
  carEntryWrapper: { marginBottom: 30 },
  carShowcaseCard: { backgroundColor: '#FFFFFF', borderRadius: 20, elevation: 4, marginBottom: 20, overflow: 'hidden' },
  carImagePremium: { width: '100%', height: 220, backgroundColor: '#E2E8F0' },
  carInfoContainer: { padding: 15 },
  carDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  carModelText: { fontSize: 20, fontWeight: '800', color: '#2D3E5E', marginBottom: 4 },
  carPlateText: { fontSize: 13, color: '#8391A1', fontWeight: '700' },
  carActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  carEditBtn: { backgroundColor: '#8A1C27', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  carDeleteBtn: { borderWidth: 1.5, borderColor: '#8391A1', paddingVertical: 6.5, paddingHorizontal: 16, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { color: '#8391A1', fontSize: 12, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 16, marginBottom: 15, elevation: 2 },
  statLabel: { fontSize: 11, color: '#8391A1', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase' },
  statValueBadge: { backgroundColor: '#F1F4F9', borderRadius: 8, paddingVertical: 6, marginTop: 8, minHeight: 28, justifyContent: 'center' },
  statValueText: { color: '#2D3E5E', fontSize: 12, textAlign: 'center', fontWeight: '700' },

  datePickerTriggerSmall: { backgroundColor: '#FDF2F3', borderRadius: 8, paddingVertical: 6, marginTop: 8, borderWidth: 1, borderColor: '#8A1C27', justifyContent: 'center', alignItems: 'center' },
  datePickerTriggerText: { color: '#8A1C27', fontSize: 12, textAlign: 'center', fontWeight: '700' },

  maintenanceSection: { paddingBottom: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#2D3E5E' },
  addRecordBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDF2F3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  addRecordText: { color: '#8A1C27', fontSize: 12, fontWeight: '700' },
  maintenanceCard: { backgroundColor: '#FFFFFF', flexDirection: 'row', padding: 15, borderRadius: 16, alignItems: 'center', marginBottom: 12, elevation: 2 },
  maintTitle: { color: '#2D3E5E', fontSize: 15, fontWeight: '800' },
  maintDate: { color: '#8391A1', fontSize: 12, marginTop: 4 },
  editableMaintTitle: { color: '#2D3E5E', fontSize: 15, fontWeight: '800', borderBottomWidth: 1, borderColor: '#CBD5E1' },
  editableMaintDate: { color: '#8A1C27', fontSize: 12, fontWeight: '700', borderBottomWidth: 1, borderColor: '#8A1C27', marginTop: 5 },
  maintIconCircle: { backgroundColor: '#FDF2F3', padding: 10, borderRadius: 12 },
  maintIcon: { width: 24, height: 24, tintColor: '#8A1C27' },
  trashBtn: { marginLeft: 15 },
  footerButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  footerBtn: { backgroundColor: '#8A1C27', width: '48%', paddingVertical: 14, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  footerBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  footerBtnOutline: { width: '48%', paddingVertical: 14, borderRadius: 25, alignItems: 'center', borderWidth: 2, borderColor: '#8A1C27', justifyContent: 'center' },
  footerBtnTextOutline: { color: '#8A1C27', fontWeight: '800', fontSize: 14 },

  pickerModalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  pickerModalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingBottom: 30 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  pickerTitle: { fontSize: 17, fontWeight: 'bold', color: '#2D3E5E' },
  doneText: { fontSize: 17, fontWeight: 'bold', color: '#8A1C27' },

  footerContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, elevation: 20, zIndex: 100 },
  fullscreenContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  closeFullscreen: { position: 'absolute', top: 50, right: 20 },
  fullscreenImage: { width: width, height: height * 0.8 },
});