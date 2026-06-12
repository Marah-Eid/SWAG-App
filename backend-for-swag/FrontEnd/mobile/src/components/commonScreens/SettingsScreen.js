import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform,
    Switch, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useDispatch } from 'react-redux';
import { changePassword, sendChangeContactOtp, changeContact } from '../../store/slices/authSlice';

const SettingsScreen = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    // --- STATE MANAGEMENT ---
    const [language, setLanguage] = useState('en');
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Modal Visibility States
    const [isContactModalVisible, setContactModalVisible] = useState(false);
    const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
    const [isVerifyModalVisible, setVerifyModalVisible] = useState(false);

    // Input States
    const [newContact, setNewContact] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // --- LOGIC HANDLERS ---
    const toggleDarkMode = (value) => setDarkModeEnabled(value);
    const toggleNotifications = (value) => setNotificationsEnabled(value);

    const handleDeleteAccount = () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
            if (confirmed) performAccountDeletion();
        } else {
            Alert.alert(
                "Delete Account",
                "Are you sure you want to delete your account? This action cannot be undone.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: performAccountDeletion }
                ]
            );
        }
    };

    const performAccountDeletion = () => {
        console.log("Account Deleted");
        router.replace('/auth/Login');
    };

    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isChangingContact, setIsChangingContact] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const submitChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match.");
            return;
        }
        setIsChangingPassword(true);
        const result = await dispatch(changePassword({ currentPassword, newPassword }));
        setIsChangingPassword(false);
        if (changePassword.fulfilled.match(result)) {
            setPasswordModalVisible(false);
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            Alert.alert("Success", "Password changed successfully.");
        } else {
            Alert.alert("Error", result.payload || "Failed to change password.");
        }
    };

    const handleVerifyContact = async () => {
        if (!newContact.trim()) {
            Alert.alert("Error", "Please enter a valid email or mobile number.");
            return;
        }
        setIsSendingOtp(true);
        const result = await dispatch(sendChangeContactOtp(newContact.trim()));
        setIsSendingOtp(false);
        if (sendChangeContactOtp.fulfilled.match(result)) {
            setContactModalVisible(false);
            setOtpCode('');
            setVerifyModalVisible(true);
        } else {
            Alert.alert("Error", result.payload || "Failed to send verification code.");
        }
    };

    const submitVerification = async () => {
        if (!otpCode.trim()) {
            Alert.alert("Error", "Please enter the verification code.");
            return;
        }
        setIsChangingContact(true);
        const result = await dispatch(changeContact({ newContact: newContact.trim(), code: otpCode.trim() }));
        setIsChangingContact(false);
        if (changeContact.fulfilled.match(result)) {
            setVerifyModalVisible(false);
            setNewContact('');
            setOtpCode('');
            Alert.alert("Success", "Your contact information has been updated successfully.");
        } else {
            Alert.alert("Error", result.payload || "Failed to update contact.");
        }
    };

    // --- COMPONENTS ---
    const SettingItem = ({ icon, label, onPress, isToggle, value }) => {
        const isActive = isToggle && value;
        return (
            <TouchableOpacity
                style={styles.settingItem}
                onPress={isToggle ? () => onPress(!value) : onPress}
                activeOpacity={isToggle ? 1 : 0.7}
            >
                <View style={styles.leftContent}>
                    <View style={[styles.iconBadge, isActive && styles.iconBadgeActive]}>
                        <Ionicons
                            name={icon}
                            size={20}
                            color={isActive ? "#8A1C27" : "#5B7896"} // Brand Red or Secondary Navy
                        />
                    </View>
                    <Text style={styles.settingLabel}>{label}</Text>
                </View>

                {isToggle ? (
                    <Switch
                        trackColor={{ false: "#E2E8F0", true: "#8A1C27" }} // Brand Red track
                        thumbColor={value ? "#FFFFFF" : "#FFFFFF"}
                        ios_backgroundColor="#E2E8F0"
                        onValueChange={onPress}
                        value={value}
                    />
                ) : (
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                )}
            </TouchableOpacity>
        );
    };

    const EnhancedLanguageSelector = () => (
        <View style={styles.langWrapper}>
            <TouchableOpacity
                style={[styles.langOption, language === 'en' && styles.langOptionActive]}
                onPress={() => setLanguage('en')}
                activeOpacity={0.8}
            >
                <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.langOption, language === 'ar' && styles.langOptionActive]}
                onPress={() => setLanguage('ar')}
                activeOpacity={0.8}
            >
                <Text style={[styles.langText, language === 'ar' && styles.langTextActive]}>العربية</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Solid Navy Header Background */}
            <View style={styles.headerBackground} />

            <SafeAreaView style={styles.safeArea}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Settings</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* CONTENT */}
                <View style={styles.contentWrapper}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        <Text style={styles.sectionHeader}>Account</Text>
                        <View style={styles.sectionCard}>
                            <SettingItem icon="mail-outline" label="Change Email / Mobile" onPress={() => setContactModalVisible(true)} />
                            <View style={styles.divider} />
                            <SettingItem icon="lock-closed-outline" label="Change Password" onPress={() => setPasswordModalVisible(true)} />
                        </View>

                        <Text style={styles.sectionHeader}>Preferences</Text>
                        <View style={styles.sectionCard}>
                            <SettingItem icon="moon-outline" label="Dark Mode" isToggle={true} value={darkModeEnabled} onPress={toggleDarkMode} />
                            <View style={styles.divider} />
                            <SettingItem icon="notifications-outline" label="Push Notifications" isToggle={true} value={notificationsEnabled} onPress={toggleNotifications} />
                        </View>

                        <Text style={styles.sectionHeader}>Language</Text>
                        <EnhancedLanguageSelector />

                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.8}>
                            <Text style={styles.deleteText}>Delete Account</Text>
                        </TouchableOpacity>

                        <Text style={styles.versionText}>Version 1.2.0</Text>
                    </ScrollView>
                </View>

            </SafeAreaView>

            {/* MODALS */}

            {/* 1. Contact Update Modal */}
            <Modal animationType="fade" transparent={true} visible={isContactModalVisible} onRequestClose={() => setContactModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.backdrop} onPress={() => setContactModalVisible(false)} activeOpacity={1} />
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Contact Info</Text>
                            <TouchableOpacity onPress={() => setContactModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#8391A1" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>New Email or Mobile Number</Text>
                        <TextInput style={styles.input} placeholder="e.g. name@email.com" value={newContact} onChangeText={setNewContact} placeholderTextColor="#8391A1" />

                        <TouchableOpacity style={styles.confirmBtn} onPress={handleVerifyContact} activeOpacity={0.8} disabled={isSendingOtp}>
                            {isSendingOtp ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Next (Verify)</Text>}
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* 2. Verification Modal */}
            <Modal animationType="fade" transparent={true} visible={isVerifyModalVisible} onRequestClose={() => setVerifyModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.backdrop} onPress={() => setVerifyModalVisible(false)} activeOpacity={1} />
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Verification</Text>
                            <TouchableOpacity onPress={() => setVerifyModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#8391A1" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalText}>We sent a code to: <Text style={{ fontWeight: '700', color: '#2D3E5E' }}>{newContact}</Text></Text>
                        <TextInput style={[styles.input, { textAlign: 'center', letterSpacing: 8, fontSize: 24, fontWeight: '700' }]} placeholder="000000" keyboardType="number-pad" maxLength={6} placeholderTextColor="#CBD5E1" value={otpCode} onChangeText={setOtpCode} />

                        <TouchableOpacity style={styles.confirmBtn} onPress={submitVerification} activeOpacity={0.8} disabled={isChangingContact}>
                            {isChangingContact ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirm</Text>}
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* 3. Password Modal */}
            <Modal animationType="fade" transparent={true} visible={isPasswordModalVisible} onRequestClose={() => setPasswordModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.backdrop} onPress={() => setPasswordModalVisible(false)} activeOpacity={1} />
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Change Password</Text>
                            <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#8391A1" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Current Password</Text>
                        <TextInput style={styles.input} secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} placeholder="••••••••" placeholderTextColor="#8391A1" />

                        <Text style={styles.inputLabel}>New Password</Text>
                        <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} placeholder="••••••••" placeholderTextColor="#8391A1" />

                        <Text style={styles.inputLabel}>Confirm New Password</Text>
                        <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} placeholder="••••••••" placeholderTextColor="#8391A1" />

                        <TouchableOpacity style={styles.confirmBtn} onPress={submitChangePassword} activeOpacity={0.8} disabled={isChangingPassword}>
                            {isChangingPassword
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.confirmBtnText}>Update Password</Text>}
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#5B7896' }, // Brand Navy Base
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 150,
        backgroundColor: '#5B7896',
        zIndex: 0,
    },
    safeArea: { flex: 1, zIndex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: 25,
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 0.5,
    },

    contentWrapper: {
        flex: 1,
        backgroundColor: '#F1F4F9', // Premium Off-White
        borderTopLeftRadius: 35, // Global sweeping curves
        borderTopRightRadius: 35,
        overflow: 'hidden',
    },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 10 },

    sectionHeader: {
        fontSize: 13,
        fontWeight: '800',
        color: '#8391A1',
        marginTop: 25,
        marginBottom: 10,
        marginLeft: 15,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20, // Global Card radius
        paddingVertical: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3
    },
    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 15 },
    leftContent: { flexDirection: 'row', alignItems: 'center' },
    iconBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F4F9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    iconBadgeActive: { backgroundColor: '#FDF2F3' }, // Light red tint when active
    settingLabel: { fontSize: 16, color: '#2D3E5E', fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#F1F4F9', marginLeft: 65 }, // Aligns with text

    langWrapper: {
        flexDirection: 'row',
        backgroundColor: '#E2E8F0', // Soft track
        borderRadius: 30, // Pill shape
        padding: 4,
        height: 55,
    },
    langOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 26 },
    langOptionActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
    langText: { fontSize: 14, color: '#8391A1', fontWeight: '600' },
    langTextActive: { color: '#2D3E5E', fontWeight: '800' },

    deleteBtn: {
        marginTop: 35,
        backgroundColor: '#FEF2F2', // Light red background 
        borderRadius: 30, // Pill CTA
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FECACA'
    },
    deleteText: { color: '#E53E3E', fontSize: 16, fontWeight: '800' },
    versionText: { textAlign: 'center', color: '#A0AEC0', fontSize: 12, marginTop: 20, fontWeight: '500' },

    // --- MODAL STYLES ---
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', paddingHorizontal: 20 },
    backdrop: { ...StyleSheet.absoluteFillObject },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 35, // Global Modal Curves
        padding: 25,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#2D3E5E' },
    modalText: { fontSize: 15, color: '#4A5568', marginBottom: 20, textAlign: 'center', lineHeight: 22 },

    inputLabel: { fontSize: 13, color: '#8391A1', marginBottom: 8, marginLeft: 5, fontWeight: '700' },
    input: {
        backgroundColor: '#F1F4F9', // Premium off-white input
        borderRadius: 30, // Pill shape
        paddingHorizontal: 20,
        height: 55, // Ergonomic
        fontSize: 15,
        color: '#2D3E5E',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 15,
        fontWeight: '500',
    },
    confirmBtn: {
        backgroundColor: '#2D3E5E', // Brand Navy
        borderRadius: 30, // Pill CTA
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#2D3E5E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    confirmBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
});

export default SettingsScreen;