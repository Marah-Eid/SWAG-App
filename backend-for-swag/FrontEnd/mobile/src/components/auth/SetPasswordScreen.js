import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

const lockIcon = require('../../../assets/images/lock-icon.png');

const SetPasswordScreen = () => {
    const router = useRouter();
    const { emailOrPhone, role, code } = useLocalSearchParams();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            showAlert('Error', 'Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            showAlert('Error', 'Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            showAlert('Error', 'Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/auth/reset-password', {
                emailOrPhone,
                role: role || 'Customer',
                code,
                newPassword: password,
            });
            setLoading(false);
            showAlert('Success', 'Password reset successfully!', () => {
                router.replace('/auth/Login');
            });
        } catch (error) {
            setLoading(false);
            const msg = error.response?.data?.message || 'Failed to reset password. Please try again.';
            showAlert('Error', msg);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="light" />

            <View style={styles.topSection}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={28} color="#2D3E5E" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Set New{"\n"}Password ..</Text>
                    <Text style={styles.headerSubtitle}>Create a unique Password.</Text>
                </View>
            </View>

            <View style={styles.whiteCard}>
                <View style={styles.contentContainer}>
                    <Text style={styles.cardTitle}>Enter your new password</Text>
                    <Text style={styles.cardSubtitle}>
                        Password must include characters{"\n"}and at least 8 digits
                    </Text>

                    <View style={styles.inputContainer}>
                        <Image source={lockIcon} style={styles.inputIcon} resizeMode="contain" />
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
                            placeholderTextColor="#8391A1"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Image source={lockIcon} style={styles.inputIcon} resizeMode="contain" />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            placeholderTextColor="#8391A1"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.resetButton} onPress={handleReset} disabled={loading} activeOpacity={0.8}>
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.resetButtonText}>Reset Password</Text>}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#8EACC5' },
    topSection: { flex: 0.35, justifyContent: 'center', alignItems: 'center', paddingTop: 40, position: 'relative' },
    backButton: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, justifyContent: 'center', zIndex: 10 },
    headerTextContainer: { alignItems: 'center' },
    headerTitle: { fontSize: 34, fontWeight: '800', color: '#2D3E5E', textAlign: 'center', marginBottom: 8, lineHeight: 40 },
    headerSubtitle: { fontSize: 15, color: '#2D3E5E', textAlign: 'center', opacity: 0.8, fontWeight: '500' },

    whiteCard: {
        flex: 0.65, backgroundColor: '#FFFFFF', borderTopLeftRadius: 35, borderTopRightRadius: 35,
        paddingHorizontal: 25, paddingTop: 40, paddingBottom: 40, justifyContent: 'space-between',
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10,
    },
    contentContainer: { alignItems: 'center', width: '100%' },
    cardTitle: { fontSize: 22, fontWeight: '800', color: '#8A1C27', marginBottom: 10, textAlign: 'center' },
    cardSubtitle: { fontSize: 14, color: '#8391A1', textAlign: 'center', marginBottom: 30, lineHeight: 22, fontWeight: '500' },

    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F4F9',
        borderRadius: 30, paddingHorizontal: 20, height: 55, marginBottom: 15,
        borderWidth: 1, borderColor: '#E2E8F0', width: '100%',
    },
    inputIcon: { width: 20, height: 20, marginRight: 12, tintColor: '#2D3E5E' },
    input: { flex: 1, fontSize: 14, color: '#2D3E5E', fontWeight: '500' },

    resetButton: {
        backgroundColor: '#2D3E5E', borderRadius: 30, height: 60, justifyContent: 'center', alignItems: 'center',
        width: '100%', shadowColor: '#2D3E5E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5,
    },
    resetButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
});

export default SetPasswordScreen;
