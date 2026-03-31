import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import otpAPI from '../../api/otpAPI';
import apiClient from '../../api/client';

const VerifyCodeScreen = () => {
    const router = useRouter();
    const { emailOrPhone, role } = useLocalSearchParams();

    const [code, setCode] = useState(['', '', '', '', '']);
    const inputs = useRef([]);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let interval;
        if (!canResend && timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer, canResend]);

    const showAlert = (title, message, onSuccess = null) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
            if (onSuccess) onSuccess();
        } else {
            const buttons = onSuccess ? [{ text: 'OK', onPress: onSuccess }] : [{ text: 'OK' }];
            Alert.alert(title, message, buttons, { cancelable: false });
        }
    };

    const handleInput = (text, index) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);
        if (text && index < 4) inputs.current[index + 1].focus();
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length < 5) {
            showAlert('Error', 'Please enter the full 5-digit code.');
            return;
        }

        setLoading(true);
        const result = await otpAPI.verifyOtp(emailOrPhone, fullCode, 'forgot_password');
        setLoading(false);

        if (!result.success) {
            showAlert('Error', result.error);
            return;
        }

        router.push({
            pathname: '/auth/SetPassword',
            params: { emailOrPhone, role, code: fullCode },
        });
    };

    const handleResend = async () => {
        if (!canResend) return;
        try {
            await apiClient.post('/auth/forgot-password', { emailOrPhone, role });
            showAlert('Success', 'A new verification code has been sent.');
        } catch {
            showAlert('Error', 'Failed to resend code. Please try again.');
        }
        setTimer(30);
        setCanResend(false);
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
                    <Text style={styles.headerTitle}>Verification</Text>
                    <Text style={styles.headerSubtitle}>Enter the code{"\n"}to continue.</Text>
                </View>
            </View>

            <View style={styles.whiteCard}>
                <View style={styles.infoContainer}>
                    <Text style={styles.sentToText}>We sent code to</Text>
                    <Text style={styles.emailText}>{emailOrPhone || 'your contact'}</Text>
                </View>

                <View style={styles.otpContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(el) => (inputs.current[index] = el)}
                            style={[styles.otpInput, digit ? styles.otpInputActive : null]}
                            keyboardType="number-pad"
                            maxLength={1}
                            onChangeText={(text) => handleInput(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            value={digit}
                            textAlign="center"
                        />
                    ))}
                </View>

                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>{"Didn't receive the code? "}</Text>
                    <TouchableOpacity activeOpacity={0.7} onPress={handleResend} disabled={!canResend}>
                        <Text style={[styles.resendBold, !canResend && styles.resendDisabled]}>
                            {canResend ? 'Send Again' : `Send Again (${timer}s)`}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }} />

                <TouchableOpacity style={styles.verifyButton} onPress={handleVerify} disabled={loading} activeOpacity={0.8}>
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.verifyButtonText}>Verify</Text>}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#8EACC5' },
    topSection: { flex: 0.35, justifyContent: 'center', alignItems: 'center', paddingTop: 20, position: 'relative' },
    backButton: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, justifyContent: 'center', zIndex: 10 },
    headerTextContainer: { alignItems: 'center' },
    headerTitle: { fontSize: 34, fontWeight: '800', color: '#2D3E5E', marginBottom: 8 },
    headerSubtitle: { fontSize: 15, color: '#2D3E5E', textAlign: 'center', opacity: 0.8, fontWeight: '500', lineHeight: 22 },

    whiteCard: {
        flex: 0.65, backgroundColor: '#FFFFFF', borderTopLeftRadius: 35, borderTopRightRadius: 35,
        paddingHorizontal: 25, paddingTop: 40, paddingBottom: 40,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10,
    },

    infoContainer: { alignItems: 'center', marginBottom: 40 },
    sentToText: { fontSize: 22, fontWeight: '800', color: '#8A1C27', marginBottom: 8 },
    emailText: { fontSize: 14, color: '#8391A1', fontWeight: '500' },

    otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35, paddingHorizontal: 10 },
    otpInput: {
        width: 55, height: 55, backgroundColor: '#F1F4F9', borderRadius: 12,
        fontSize: 24, fontWeight: '800', color: '#2D3E5E', borderWidth: 1.5, borderColor: '#E2E8F0',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    },
    otpInputActive: { borderColor: '#5B7896', backgroundColor: '#FFFFFF' },

    resendContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    resendText: { color: '#8391A1', fontSize: 13, fontWeight: '500' },
    resendBold: { fontWeight: '800', color: '#8A1C27', fontSize: 13, textDecorationLine: 'underline' },
    resendDisabled: { color: '#A0AEC0', textDecorationLine: 'none' },

    verifyButton: {
        backgroundColor: '#2D3E5E', borderRadius: 30, height: 60, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#2D3E5E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5,
    },
    verifyButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
});

export default VerifyCodeScreen;
