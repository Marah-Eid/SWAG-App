import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

const ForgotPasswordScreen = () => {
    const router = useRouter();

    const [isEmailMode, setIsEmailMode] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [role, setRole] = useState('Customer');
    const [loading, setLoading] = useState(false);

    const showAlert = (title, message, onSuccess = null) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
            if (onSuccess) onSuccess();
        } else {
            const buttons = onSuccess ? [{ text: 'OK', onPress: onSuccess }] : [{ text: 'OK' }];
            Alert.alert(title, message, buttons, { cancelable: false });
        }
    };

    const handleSendCode = async () => {
        if (!inputValue.trim()) {
            showAlert('Error', `Please enter your ${isEmailMode ? 'email address' : 'mobile number'}`);
            return;
        }

        if (isEmailMode) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(inputValue)) {
                showAlert('Error', 'Please enter a valid email address');
                return;
            }
        } else {
            if (inputValue.length < 8) {
                showAlert('Error', 'Please enter a valid mobile number');
                return;
            }
        }

        setLoading(true);
        try {
            await apiClient.post('/auth/forgot-password', {
                emailOrPhone: inputValue.trim(),
                role,
            });
            setLoading(false);
            showAlert('Success', `Verification code sent to your ${isEmailMode ? 'email' : 'mobile'}!`, () => {
                router.push({
                    pathname: '/auth/verify_Code',
                    params: { emailOrPhone: inputValue.trim(), role },
                });
            });
        } catch (error) {
            setLoading(false);
            const msg = error.response?.data?.message || 'No account found with this contact.';
            showAlert('Error', msg);
        }
    };

    const toggleSearchMode = () => {
        setIsEmailMode(!isEmailMode);
        setInputValue('');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="light" />

            <View style={styles.topSection}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.logoContainer}>
                    <Text style={styles.headerTitle}>Forgot{"\n"}Password ?</Text>
                    <Text style={styles.headerSubtitle}>No worries, we got you...</Text>
                </View>
            </View>

            <View style={styles.whiteCard}>
                <Text style={styles.formTitle}>Find your account</Text>

                <Text style={styles.formSubtitle}>
                    {isEmailMode ? "Enter your email address." : "Enter your mobile number."}
                </Text>

                {/* Role selector */}
                <View style={styles.roleRow}>
                    {['Customer', 'Vendor'].map((r) => (
                        <TouchableOpacity key={r} style={styles.roleOption} onPress={() => setRole(r)} activeOpacity={0.7}>
                            <View style={styles.radioOuter}>
                                {role === r && <View style={styles.radioInner} />}
                            </View>
                            <Text style={[styles.roleText, role === r && styles.roleTextActive]}>{r}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.inputContainer}>
                    <Image
                        source={isEmailMode ? require('../../../assets/images/email-icon.png') : require('../../../assets/images/phone-icon.png')}
                        style={styles.inputIcon}
                        resizeMode="contain"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={isEmailMode ? "Email Address" : "Mobile Number"}
                        placeholderTextColor="#8391A1"
                        value={inputValue}
                        onChangeText={setInputValue}
                        keyboardType={isEmailMode ? "email-address" : "phone-pad"}
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity style={styles.toggleTextBtn} activeOpacity={0.7} onPress={toggleSearchMode}>
                    <Text style={styles.toggleText}>
                        {isEmailMode ? "Search by mobile number instead" : "Search by email address instead"}
                    </Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                <TouchableOpacity style={styles.sendButton} onPress={handleSendCode} disabled={loading} activeOpacity={0.8}>
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.sendButtonText}>Send Code</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#5B7896' },
    topSection: {
        flex: 0.35, backgroundColor: '#5B7896', justifyContent: 'center',
        alignItems: 'center', paddingTop: 40, position: 'relative'
    },
    backButton: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, justifyContent: 'center', zIndex: 10 },
    logoContainer: { alignItems: 'center' },
    headerTitle: { fontSize: 34, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', lineHeight: 40 },
    headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 8, fontWeight: '500' },

    whiteCard: {
        flex: 0.65, backgroundColor: '#FFFFFF', borderTopLeftRadius: 35, borderTopRightRadius: 35,
        paddingHorizontal: 25, paddingTop: 40, paddingBottom: 40,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10,
    },
    formTitle: { fontSize: 24, fontWeight: '800', color: '#8A1C27', textAlign: 'center', marginBottom: 8 },
    formSubtitle: { fontSize: 14, color: '#8391A1', textAlign: 'center', marginBottom: 15 },

    roleRow: { flexDirection: 'row', justifyContent: 'center', gap: 30, marginBottom: 20 },
    roleOption: { flexDirection: 'row', alignItems: 'center' },
    radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#5B7896', marginRight: 8, justifyContent: 'center', alignItems: 'center' },
    radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#5B7896' },
    roleText: { color: '#8391A1', fontSize: 14, fontWeight: '600' },
    roleTextActive: { color: '#2D3E5E', fontWeight: '800' },

    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F4F9',
        borderRadius: 30, paddingHorizontal: 20, height: 55, marginBottom: 15,
        borderWidth: 1, borderColor: '#E2E8F0',
    },
    inputIcon: { width: 20, height: 20, marginRight: 12, tintColor: '#2D3E5E' },
    input: { flex: 1, fontSize: 14, color: '#2D3E5E', fontWeight: '500' },

    toggleTextBtn: { alignSelf: 'center', paddingVertical: 10 },
    toggleText: { color: '#5B7896', fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },

    sendButton: {
        backgroundColor: '#2D3E5E', borderRadius: 30, height: 60, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#2D3E5E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5,
    },
    sendButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
});

export default ForgotPasswordScreen;
