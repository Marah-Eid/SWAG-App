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
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useDispatch } from 'react-redux';
import authAPI from '../../api/authAPI';
import { loginUser } from '../../store/slices/authSlice';

const VendorCertificationScreen = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const params = useLocalSearchParams();
    const { emailOrPhone, fullName, shopName, shopType, password, categories, city, locationUrl } = params;

    const [regNumber, setRegNumber] = useState('');
    const [licenseFile, setLicenseFile] = useState(null);
    const [idFrontFile, setIdFrontFile] = useState(null);
    const [idBackFile, setIdBackFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const showAlert = (title, message, onSuccess = null) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
            if (onSuccess) onSuccess();
        } else {
            const buttons = onSuccess ? [{ text: 'OK', onPress: onSuccess }] : [{ text: 'OK' }];
            Alert.alert(title, message, buttons, { cancelable: false });
        }
    };

    const handleSubmit = async () => {
        if (!regNumber.trim()) {
            showAlert('Error', 'Please enter your Commercial Registration Number.');
            return;
        }
        if (!licenseFile || !idFrontFile || !idBackFile) {
            showAlert('Missing Documents', 'Please upload your License and both sides of your ID.');
            return;
        }

        setSubmitting(true);

        const selectedCategories = categories ? JSON.parse(categories) : [];

        const result = await authAPI.register({
            role: 'Vendor',
            fullName,
            emailOrPhone,
            password,
            shopName,
            shopType,
            city,
            locationUrl,
            licenseFile,
            idFrontFile,
            idBackFile,
            commercialRegNumber: regNumber.trim(),
        });

        if (!result.success) {
            setSubmitting(false);
            showAlert('Error', result.error);
            return;
        }

        // Dispatch login to update auth state
        await dispatch(loginUser({ emailOrPhone, password, role: 'Vendor' }));
        setSubmitting(false);

        router.replace('/vendor/HomeVen');
    };

    const pickDocument = async (type) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                if (type === 'License') setLicenseFile(file.name);
                else if (type === 'IDFront') setIdFrontFile(file.name);
                else if (type === 'IDBack') setIdBackFile(file.name);
            }
        } catch (error) {
            console.error("Error picking document:", error);
            showAlert('Upload Error', 'Something went wrong while selecting the file.');
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
                    <Text style={styles.headerTitle}>Certification</Text>
                    <Text style={styles.headerSubtitle}>
                        Add your location{"\n"}informations
                    </Text>
                </View>
            </View>

            <View style={styles.whiteCard}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <Text style={styles.sectionTitle}>Upload documents here</Text>

                    <TouchableOpacity
                        style={[styles.uploadButton, licenseFile && styles.uploadButtonSuccess]}
                        onPress={() => pickDocument('License')}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={require('../../../assets/images/document-icon.png')}
                            style={[styles.uploadIcon, licenseFile && { tintColor: '#8A1C27' }]}
                            resizeMode="contain"
                        />
                        <Text
                            style={[styles.uploadText, licenseFile && styles.uploadedFileText]}
                            numberOfLines={1}
                            ellipsizeMode="middle"
                        >
                            {licenseFile ? licenseFile : "Upload License here"}
                        </Text>
                        {licenseFile && <Ionicons name="checkmark-circle" size={22} color="#8A1C27" style={{ marginLeft: 'auto' }} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.uploadButton, idFrontFile && styles.uploadButtonSuccess]}
                        onPress={() => pickDocument('IDFront')}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={require('../../../assets/images/document-icon.png')}
                            style={[styles.uploadIcon, idFrontFile && { tintColor: '#8A1C27' }]}
                            resizeMode="contain"
                        />
                        <Text
                            style={[styles.uploadText, idFrontFile && styles.uploadedFileText]}
                            numberOfLines={1}
                            ellipsizeMode="middle"
                        >
                            {idFrontFile ? idFrontFile : "Upload your ID (Front) here"}
                        </Text>
                        {idFrontFile && <Ionicons name="checkmark-circle" size={22} color="#8A1C27" style={{ marginLeft: 'auto' }} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.uploadButton, idBackFile && styles.uploadButtonSuccess]}
                        onPress={() => pickDocument('IDBack')}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={require('../../../assets/images/document-icon.png')}
                            style={[styles.uploadIcon, idBackFile && { tintColor: '#8A1C27' }]}
                            resizeMode="contain"
                        />
                        <Text
                            style={[styles.uploadText, idBackFile && styles.uploadedFileText]}
                            numberOfLines={1}
                            ellipsizeMode="middle"
                        >
                            {idBackFile ? idBackFile : "Upload your ID (Back) here"}
                        </Text>
                        {idBackFile && <Ionicons name="checkmark-circle" size={22} color="#8A1C27" style={{ marginLeft: 'auto' }} />}
                    </TouchableOpacity>

                    <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Shop information</Text>

                    <Text style={styles.label}>Commercial Registration Number</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 123456789"
                            placeholderTextColor="#8391A1"
                            value={regNumber}
                            onChangeText={setRegNumber}
                            keyboardType="number-pad"
                        />
                    </View>

                </ScrollView>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={submitting}
                    activeOpacity={0.8}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit for Review</Text>
                    )}
                </TouchableOpacity>
            </View>

        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#8EACC5' },
    topSection: {
        flex: 0.35,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
        position: 'relative'
    },
    backButton: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, justifyContent: 'center', zIndex: 10 },
    headerTextContainer: { alignItems: 'center' },
    headerTitle: { fontSize: 34, fontWeight: '800', color: '#2D3E5E', marginBottom: 8 },
    headerSubtitle: { fontSize: 15, color: '#2D3E5E', textAlign: 'center', opacity: 0.8, lineHeight: 22, fontWeight: '500' },

    whiteCard: {
        flex: 0.65,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        paddingHorizontal: 25,
        paddingTop: 40,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    scrollContent: { paddingBottom: 20 },

    sectionTitle: { fontSize: 20, fontWeight: '800', color: '#8A1C27', marginBottom: 20, textAlign: 'center' },

    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 30,
        height: 60,
        marginBottom: 15,
        paddingHorizontal: 20,
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
    },
    uploadButtonSuccess: { borderColor: '#8A1C27', borderStyle: 'solid', backgroundColor: '#FDF2F3' },
    uploadIcon: { width: 24, height: 24, marginRight: 15, tintColor: '#8391A1' },
    uploadText: { fontSize: 14, color: '#8391A1', fontWeight: '500', flex: 1 },
    uploadedFileText: { color: '#8A1C27', fontWeight: '700' },

    label: { fontSize: 13, color: '#8391A1', marginBottom: 8, marginLeft: 5, fontWeight: '600' },
    inputContainer: {
        backgroundColor: '#F1F4F9', borderRadius: 30, height: 55,
        justifyContent: 'center', paddingHorizontal: 20, marginBottom: 20,
        borderWidth: 1, borderColor: '#E2E8F0',
    },
    input: { fontSize: 15, color: '#2D3E5E', fontWeight: '500' },

    submitButton: {
        backgroundColor: '#2D3E5E', borderRadius: 30, height: 60, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
    },
    submitButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
});

export default VendorCertificationScreen;
