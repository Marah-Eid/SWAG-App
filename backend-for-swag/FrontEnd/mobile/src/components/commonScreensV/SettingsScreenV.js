import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform,
    Switch, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { changePassword } from '../../store/slices/authSlice';

const SettingsScreenV = () => {
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
            const confirmed = window.confirm("Are you sure you want to delete your shop account? This action cannot be undone.");
            if (confirmed) performAccountDeletion();
        } else {
            Alert.alert(
                "Delete Account",
                "Are you sure you want to delete your shop account? This action cannot be undone.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: performAccountDeletion }
                ]
            );
        }
    };

    const performAccountDeletion = () => {
        console.log("Vendor Account Deleted");
        router.replace('/auth/Login');
    };

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

    const handleVerifyContact = () => {
        if (!newContact) {
            Alert.alert("Error", "Please enter a valid email or mobile number.");
            return;
        }
        setContactModalVisible(false);
        setVerifyModalVisible(true);
    };

    const submitVerification = () => {
        setVerifyModalVisible(false);
        setNewContact('');
        Alert.alert("Success", "Your shop contact information has been updated successfully.");
    };

    // --- COMPONENTS ---
    const SettingItem = ({ icon, label, onPress, isToggle, value }) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={isToggle ? () => onPress(!value) : onPress}
            activeOpacity={isToggle ? 1 : 0.7}
        >
            <View style={styles.leftContent}>
                <View style={[styles.iconBadge, { backgroundColor: isToggle && value ? 'rgba(128, 12, 31, 0.1)' : '#F0F4F8' }]}>
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isToggle && value ? "#800C1F" : "#5B7896"}
                    />
                </View>
                <Text style={styles.settingLabel}>{label}</Text>
            </View>

            {isToggle ? (
                <Switch
                    trackColor={{ false: "#D1D1D6", true: "#800C1F" }}
                    thumbColor={value ? "#E57373" : "#fff"}
                    ios_backgroundColor="#E5E5EA"
                    onValueChange={onPress}
                    value={value}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            )}
        </TouchableOpacity>
    );

    const EnhancedLanguageSelector = () => (
        <View style={styles.langWrapper}>
            <TouchableOpacity
                style={[styles.langOption, language === 'en' && styles.langOptionActive]}
                onPress={() => setLanguage('en')}
            >
                <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.langOption, language === 'ar' && styles.langOptionActive]}
                onPress={() => setLanguage('ar')}
            >
                <Text style={[styles.langText, language === 'ar' && styles.langTextActive]}>العربية</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FFFFFF', '#DDE5F0', '#BCC9DB']} style={styles.gradient} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#2D3E5E" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Settings</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.sectionHeader}>Account</Text>
                        <View style={styles.sectionCard}>
                            <SettingItem icon="person-outline" label="Change Email / Mobile" onPress={() => setContactModalVisible(true)} />
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

                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
                            <Text style={styles.deleteText}>Delete Account</Text>
                        </TouchableOpacity>
                        <Text style={styles.versionText}>Version 1.2.0</Text>
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>

            {/* MODALS */}
            <Modal animationType="slide" transparent={true} visible={isContactModalVisible} onRequestClose={() => setContactModalVisible(false)}>
                <View style={styles.modalOverlay}><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContent}>
                    <View style={styles.modalHeader}><Text style={styles.modalTitle}>Update Contact Info</Text><TouchableOpacity onPress={() => setContactModalVisible(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity></View>
                    <Text style={styles.inputLabel}>New Email or Mobile Number</Text>
                    <TextInput style={styles.input} placeholder="e.g. shop@email.com" value={newContact} onChangeText={setNewContact} placeholderTextColor="#aaa" />
                    <TouchableOpacity style={styles.confirmBtn} onPress={handleVerifyContact}><Text style={styles.confirmBtnText}>Next (Verify)</Text></TouchableOpacity>
                </KeyboardAvoidingView></View>
            </Modal>

            <Modal animationType="slide" transparent={true} visible={isVerifyModalVisible} onRequestClose={() => setVerifyModalVisible(false)}>
                <View style={styles.modalOverlay}><View style={styles.modalContent}>
                    <View style={styles.modalHeader}><Text style={styles.modalTitle}>Verification</Text><TouchableOpacity onPress={() => setVerifyModalVisible(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity></View>
                    <Text style={styles.modalText}>We sent a code to: {newContact}</Text>
                    <TextInput style={[styles.input, { textAlign: 'center', letterSpacing: 5 }]} placeholder="000000" keyboardType="number-pad" maxLength={6} />
                    <TouchableOpacity style={styles.confirmBtn} onPress={submitVerification}><Text style={styles.confirmBtnText}>Confirm</Text></TouchableOpacity>
                </View></View>
            </Modal>

            <Modal animationType="slide" transparent={true} visible={isPasswordModalVisible} onRequestClose={() => setPasswordModalVisible(false)}>
                <View style={styles.modalOverlay}><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContent}>
                    <View style={styles.modalHeader}><Text style={styles.modalTitle}>Change Password</Text><TouchableOpacity onPress={() => setPasswordModalVisible(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity></View>
                    <Text style={styles.inputLabel}>Current Password</Text><TextInput style={styles.input} secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
                    <Text style={styles.inputLabel}>New Password</Text><TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} />
                    <Text style={styles.inputLabel}>Confirm New Password</Text><TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
                    <TouchableOpacity style={styles.confirmBtn} onPress={submitChangePassword} disabled={isChangingPassword}>
                        {isChangingPassword
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.confirmBtnText}>Update Password</Text>}
                    </TouchableOpacity>
                </KeyboardAvoidingView></View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 15 },
    backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D3E5E' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    sectionHeader: { fontSize: 14, fontWeight: '600', color: '#5B7896', marginTop: 25, marginBottom: 10, marginLeft: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
    sectionCard: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 15 },
    leftContent: { flexDirection: 'row', alignItems: 'center' },
    iconBadge: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    settingLabel: { fontSize: 16, color: '#2D3E5E', fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#F0F4F8', marginLeft: 64 },
    langWrapper: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 6, height: 55, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    langOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    langOptionActive: { backgroundColor: '#F0F4F8', borderWidth: 1, borderColor: '#E1E8ED' },
    langText: { fontSize: 15, color: '#A0B0C0', fontWeight: '600' },
    langTextActive: { color: '#2D3E5E', fontWeight: 'bold' },
    deleteBtn: { marginTop: 30, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: '#FF4D4D' },
    deleteText: { color: '#FF4D4D', fontSize: 16, fontWeight: '600' },
    versionText: { textAlign: 'center', color: '#A0B0C0', fontSize: 12, marginTop: 20 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3E5E' },
    modalText: { fontSize: 14, color: '#666', marginBottom: 15, textAlign: 'center' },
    inputLabel: { fontSize: 13, color: '#5B7896', marginBottom: 5, marginTop: 10, fontWeight: '600' },
    input: { backgroundColor: '#F5F7FA', borderRadius: 12, padding: 12, fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#E1E8ED' },
    confirmBtn: { backgroundColor: '#2D3E5E', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 25 },
    confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default SettingsScreenV;