import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import otpAPI from '../../api/otpAPI';

const SignUpScreen = () => {
  const router = useRouter();

  const [role, setRole] = useState('Customer');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

  // State for City Modal
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);

  // --- Animation Ref for the Toggle Switch ---
  // Starts at 0 because this is the Customer screen (left side)
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Jordan Cities List
  const cities = [
    "Amman", "Zarqa", "Irbid", "Ma'an", "Aqaba",
    "Mafraq", "Balqa", "Karak", "Tafilah",
    "Jerash", "Ajloun", "Madaba"
  ];

  const showAlert = (title, message, onSuccess = null) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
      if (onSuccess) onSuccess();
    } else {
      const buttons = onSuccess
        ? [{ text: 'OK', onPress: onSuccess }]
        : [{ text: 'OK' }];
      Alert.alert(title, message, buttons, { cancelable: false });
    }
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      showAlert('Error', 'Please enter your full name');
      return false;
    }
    if (!city) {
      showAlert('Error', 'Please select your city');
      return false;
    }
    if (!emailOrPhone.trim()) {
      showAlert('Error', 'Please enter your email or phone number');
      return false;
    }
    if (!password || password.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    const result = await otpAPI.sendOtp(emailOrPhone.trim(), 'signup');
    setSubmitting(false);
    if (!result.success) {
      showAlert('Error', result.error);
      return;
    }
    router.push({
      pathname: '/auth/verify-signup',
      params: {
        emailOrPhone: emailOrPhone.trim(),
        fullName: fullName.trim(),
        city,
        password,
      }
    });
  };

  const selectCity = (item) => {
    setCity(item);
    setIsCityModalVisible(false);
  };

  const handleBackPress = () => {
    router.push('/auth/Login');
  };

  // --- Toggle Animation Logic ---
  const handleRoleChange = (selectedRole) => {
    if (selectedRole === 'Vendor' && role !== 'Vendor') {
      setRole('Vendor'); // Update text color instantly
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250, // Smooth glide duration
        useNativeDriver: false, // Using percentage for left property
      }).start(() => {
        // Use replace instead of push so users don't build a massive back-stack of toggles
        router.replace('/auth/SignUpVendor');
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />

      <ImageBackground
        source={require('../../../assets/images/swag-pattern.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topSection}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={28} color="#2D3E5E" />
            </TouchableOpacity>

            <View style={styles.headerContainer}>
              <Text style={styles.createText}>Create</Text>
              <Text style={styles.accountText}>your Account</Text>
              <Text style={styles.subtitleText}>select your account type to continue</Text>
            </View>
          </View>

          <View style={styles.blueCard}>

            {/* --- ANIMATED ROLE SWITCH TABS --- */}
            <View style={styles.roleTabsWrapper}>
              <Animated.View
                style={[
                  styles.activeSlider,
                  {
                    left: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['1%', '50%'], // Glides from left to right
                    }),
                  },
                ]}
              />

              <TouchableOpacity
                style={styles.roleTab}
                onPress={() => handleRoleChange('Customer')}
                activeOpacity={0.9}
              >
                <Text style={[styles.roleTabText, role === 'Customer' && styles.activeRoleTabText]}>
                  {"I'm a Customer"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roleTab}
                onPress={() => handleRoleChange('Vendor')}
                activeOpacity={0.9}
              >
                <Text style={[styles.roleTabText, role === 'Vendor' && styles.activeRoleTabText]}>
                  {"I'm a Vendor"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* User Name Input */}
            <View style={styles.inputContainer}>
              <Image source={require('../../../assets/images/user-icon.png')} style={styles.inputIcon} resizeMode="contain" />
              <TextInput style={styles.input} placeholder="User Name" placeholderTextColor="#8391A1" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
            </View>

            {/* City Selection Bar */}
            <TouchableOpacity style={styles.inputContainer} onPress={() => setIsCityModalVisible(true)} activeOpacity={0.7}>
              <Image source={require('../../../assets/images/city-icon.png')} style={styles.inputIcon} resizeMode="contain" />
              <Text style={[styles.input, { color: city ? '#2D3E5E' : '#8391A1', paddingTop: 0 }]}>
                {city ? city : "Select City"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#5B7896" />
            </TouchableOpacity>

            {/* Email/Phone Input */}
            <View style={styles.inputContainer}>
              <Image source={require('../../../assets/images/email-icon.png')} style={styles.inputIcon} resizeMode="contain" />
              <TextInput style={styles.input} placeholder="Email Address / Phone Number" placeholderTextColor="#8391A1" value={emailOrPhone} onChangeText={setEmailOrPhone} keyboardType="email-address" autoCapitalize="none" />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Image source={require('../../../assets/images/lock-icon.png')} style={styles.inputIcon} resizeMode="contain" />
              <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#8391A1" value={password} onChangeText={setPassword} secureTextEntry={true} autoCapitalize="none" />
            </View>

            {/* Continue Button */}
            <TouchableOpacity style={styles.continueButton} onPress={handleSignUp} disabled={submitting} activeOpacity={0.8}>
              <Text style={styles.continueButtonText}>{submitting ? 'Sending...' : 'Continue'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>

      {/* --- CITY SELECTION MODAL --- */}
      <Modal visible={isCityModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select City</Text>
              <TouchableOpacity onPress={() => setIsCityModalVisible(false)} style={{ padding: 5 }}>
                <Ionicons name="close" size={28} color="#8A1C27" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={cities}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.cityItem} onPress={() => selectCity(item)} activeOpacity={0.7}>
                  <Text style={[styles.cityItemText, city === item && { color: '#8A1C27', fontWeight: '700' }]}>{item}</Text>
                  {city === item && <Ionicons name="checkmark-circle" size={24} color="#8A1C27" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1 },
  topSection: { paddingTop: 60, paddingBottom: 30, position: 'relative' },
  backButton: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, justifyContent: 'center', zIndex: 10 },
  headerContainer: { alignItems: 'center', paddingTop: 20 },
  createText: { fontSize: 28, fontWeight: '700', color: '#2D3E5E', lineHeight: 32 },
  accountText: { fontSize: 28, fontWeight: '800', color: '#800C1F', lineHeight: 32, marginBottom: 8 },
  subtitleText: { fontSize: 13, color: '#8391A1', fontWeight: '500' },

  blueCard: {
    flex: 1,
    backgroundColor: '#5B7896',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },

  // ANIMATED SWITCH STYLES
  roleTabsWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 4,
    height: 55,
    marginBottom: 25,
    position: 'relative', // Allows absolute positioning of the slider
  },
  activeSlider: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '49%', // Leaves exactly enough room for the other tab
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  roleTab: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  roleTabText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
  activeRoleTabText: { color: '#5B7896', fontWeight: '800' },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 55,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: { width: 20, height: 20, marginRight: 12, tintColor: '#5B7896' },
  input: { flex: 1, fontSize: 14, color: '#2D3E5E', fontWeight: '500' },

  continueButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  continueButtonText: { color: '#800C1F', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '65%', padding: 25, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F4F9' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#2D3E5E' },
  cityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F4F9' },
  cityItemText: { fontSize: 16, color: '#2D3E5E', fontWeight: '500' },
});

export default SignUpScreen;