import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  Animated
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { loginUser, clearError, setRememberMe } from '../../store/slices/authSlice';

const LoginScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('login');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [role, setRole] = useState('Customer');

  // --- Animation Ref for Login/SignUp Toggle ---
  // Starts at 1 because this is the Login screen (Right side)
  const slideAnim = useRef(new Animated.Value(1)).current;

  const showAlert = (title, message, onSuccess = null) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
      if (onSuccess) onSuccess();
    } else {
      const buttons = onSuccess ? [{ text: 'OK', onPress: onSuccess }] : [{ text: 'OK' }];
      Alert.alert(title, message, buttons, { cancelable: false });
    }
  };

  useEffect(() => {
    if (error) {
      showAlert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // --- UPDATED NAVIGATION LOGIC ---
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'Vendor') {
        const vendorStatus = user?.status || 'pending';
        if (vendorStatus === 'active') {
          router.replace('/vendor/HomeVen');
        } else {
          router.replace('/vendor/HomeVen');
        }
      } else if (role === 'Customer') {
        router.replace('/customer/HomeCust');
      } else if (role === 'Admin') {
        // Routes to the new Admin screen you just built
        router.replace('/admin/AdminApproval');
      }
    }
  }, [isAuthenticated, user, role, router]);

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }
    dispatch(setRememberMe(remember));
    dispatch(loginUser({ emailOrPhone: emailOrPhone.trim(), password, role }));
  };

  // --- Toggle Animation Logic ---
  const handleAuthSwitch = (tab) => {
    if (tab === 'signup' && activeTab !== 'signup') {
      setActiveTab('signup'); // Update text color instantly
      Animated.timing(slideAnim, {
        toValue: 0, // Slide left
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        router.replace('/auth/SignUp');
      });
    }
  };

  const RoleOption = ({ label }) => (
    <TouchableOpacity style={styles.roleOption} onPress={() => setRole(label)} activeOpacity={0.7}>
      <View style={styles.radioOuter}>
        {role === label && <View style={styles.radioInner} />}
      </View>
      <Text style={[styles.roleText, role === label && styles.roleTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />

      <ImageBackground source={require('../../../assets/images/swag-pattern.png')} style={styles.backgroundImage} resizeMode="cover">

        {/* --- TOP SECTION --- */}
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.helloText}>Hello,</Text>
            <Text style={styles.welcomeText}>Welcome To</Text>
            <Image source={require('../../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
        </View>

        {/* --- BOTTOM CARD --- */}
        <View style={styles.blueCard}>

          {/* --- ANIMATED AUTH SWITCH --- */}
          <View style={styles.tabsWrapper}>
            <Animated.View
              style={[
                styles.activeSlider,
                {
                  left: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['1%', '50%'], // 50% = Right Side (Login)
                  }),
                },
              ]}
            />
            <TouchableOpacity style={styles.tab} onPress={() => handleAuthSwitch('signup')} activeOpacity={0.9}>
              <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('login')} activeOpacity={0.9}>
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Login as:</Text>
          <View style={styles.roleSelectorRow}>
            <RoleOption label="Customer" />
            <RoleOption label="Vendor" />
            <RoleOption label="Admin" />
          </View>

          <View style={styles.inputContainer}>
            <Image source={require('../../../assets/images/email-icon.png')} style={styles.inputIcon} resizeMode="contain" />
            <TextInput style={styles.input} placeholder="Email Address / Phone Number" placeholderTextColor="#8391A1" value={emailOrPhone} onChangeText={setEmailOrPhone} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.inputContainer}>
            <Image source={require('../../../assets/images/lock-icon.png')} style={styles.inputIcon} resizeMode="contain" />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#8391A1" value={password} onChangeText={setPassword} secureTextEntry={true} autoCapitalize="none" />
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.rememberMe} onPress={() => setRemember(!remember)} activeOpacity={0.7}>
              <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                {remember && <View style={styles.checkboxInner} />}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/auth/forgot-password')} activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
          </TouchableOpacity>

        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, backgroundColor: '#FFFFFF' },
  topSection: { flex: 0.35, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  logoContainer: { alignItems: 'center' },
  helloText: { fontSize: 26, fontWeight: '700', color: '#2D3E5E' },
  welcomeText: { fontSize: 26, fontWeight: '800', color: '#800C1F', marginBottom: 10 },
  logo: { width: 140, height: 55 },

  blueCard: {
    flex: 0.65,
    backgroundColor: '#5B7896',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },

  // ANIMATED SWITCH STYLES
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 4,
    height: 55,
    marginBottom: 20,
    position: 'relative',
  },
  activeSlider: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '49%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  tabText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  activeTabText: { color: '#5B7896', fontWeight: '800' },

  sectionLabel: { color: '#FFFFFF', fontSize: 13, marginBottom: 10, fontWeight: '600', opacity: 0.9 },
  roleSelectorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 5 },
  roleOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#FFFFFF', marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  roleText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  roleTextActive: { color: '#FFFFFF', fontWeight: '800' },

  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 30, paddingHorizontal: 20, height: 55, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  inputIcon: { width: 20, height: 20, marginRight: 12, tintColor: '#5B7896' },
  input: { flex: 1, fontSize: 14, color: '#2D3E5E', fontWeight: '500' },

  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 25, paddingHorizontal: 5 },
  rememberMe: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: 2, borderColor: '#FFFFFF', marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#FFFFFF' },
  checkboxInner: { width: 8, height: 8, borderRadius: 2, backgroundColor: '#800C1F' },
  rememberText: { fontSize: 12, color: '#FFFFFF', fontWeight: '500' },
  forgotPasswordText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600', textDecorationLine: 'underline' },

  loginButton: { backgroundColor: '#FFFFFF', borderRadius: 30, height: 60, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  loginButtonText: { color: '#800C1F', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
});

export default LoginScreen;