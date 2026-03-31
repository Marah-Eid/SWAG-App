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
    Modal,
    FlatList,
    Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const LocationVendorScreen = () => {
    const router = useRouter();
    const vendorParams = useLocalSearchParams();

    // State
    const [city, setCity] = useState('');
    const [locationUrl, setLocationUrl] = useState('');
    const [isCityModalVisible, setIsCityModalVisible] = useState(false);

    // Map State
    const [isMapModalVisible, setIsMapModalVisible] = useState(false);
    const [isMapSpotted, setIsMapSpotted] = useState(false); // Tracks if location was pinned

    // Jordan Cities List
    const cities = [
        "Amman", "Zarqa", "Irbid", "Ma'an", "Aqaba",
        "Mafraq", "Balqa", "Karak", "Tafilah",
        "Jerash", "Ajloun", "Madaba"
    ];

    // --- Helper function for cross-platform alerts ---
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

    const handleNext = () => {
        // 1. MUST select a city
        if (!city) {
            showAlert('Error', 'Please select a city to continue.');
            return;
        }

        // 2. MUST provide either a URL OR a Map Spot
        if (!locationUrl.trim() && !isMapSpotted) {
            showAlert('Error', 'Please provide your Location URL OR tap to spot your location on the map.');
            return;
        }

        // Proceed to the next screen with all accumulated data
        router.push({
            pathname: '/auth/VendorCertification',
            params: {
                ...vendorParams,
                city,
                locationUrl: locationUrl.trim(),
            }
        });
    };

    const selectCity = (item) => {
        setCity(item);
        setIsCityModalVisible(false);
    };

    const confirmMapLocation = () => {
        setIsMapSpotted(true);
        setIsMapModalVisible(false);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="light" />

            {/* --- TOP BLUE SECTION --- */}
            <View style={styles.topSection}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={28} color="#2D3E5E" />
                </TouchableOpacity>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Location</Text>
                    <Text style={styles.headerSubtitle}>
                        Add your location{"\n"}informations
                    </Text>
                </View>
            </View>

            {/* --- WHITE CARD SECTION --- */}
            <View style={styles.whiteCard}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <Text style={styles.cardTitle}>Choose city & spot{"\n"}location</Text>

                    {/* 1. CITY DROPDOWN */}
                    <TouchableOpacity
                        style={styles.inputContainer}
                        onPress={() => setIsCityModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={require('../../../assets/images/cityVendor-icon.png')}
                            style={styles.inputIcon}
                            resizeMode="contain"
                        />
                        <Text style={[styles.inputText, { color: city ? '#2D3E5E' : '#8391A1' }]}>
                            {city || "City"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#5B7896" style={styles.chevronIcon} />
                    </TouchableOpacity>

                    {/* 2. LOCATION URL INPUT */}
                    <View style={styles.inputContainer}>
                        <Image
                            source={require('../../../assets/images/locationVendor-icon.png')}
                            style={styles.inputIcon}
                            resizeMode="contain"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Location URL"
                            placeholderTextColor="#8391A1"
                            value={locationUrl}
                            onChangeText={setLocationUrl}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* OR DIVIDER */}
                    <View style={styles.orDividerContainer}>
                        <View style={styles.orLine} />
                        <Text style={styles.orText}>OR</Text>
                        <View style={styles.orLine} />
                    </View>

                    {/* 3. MAP SPOTTER */}
                    <TouchableOpacity
                        style={[styles.mapPlaceholder, isMapSpotted && styles.mapPlaceholderSuccess]}
                        onPress={() => setIsMapModalVisible(true)}
                        activeOpacity={0.8}
                    >
                        {isMapSpotted ? (
                            // SUCCESS STATE
                            <View style={styles.successMapContainer}>
                                <Ionicons name="checkmark-circle" size={40} color="#10B981" />
                                <Text style={styles.pendingLocationText}>Pending location</Text>
                                <Text style={styles.reselectText}>Tap to change</Text>
                            </View>
                        ) : (
                            // DEFAULT STATE
                            <>
                                <Text style={styles.mapText}>Tap to spot your location</Text>
                                <View style={styles.mapGraphic}>
                                    <Ionicons name="location-sharp" size={32} color="#8A1C27" style={styles.mapPinStart} />
                                    <Ionicons name="radio-button-on" size={24} color="#2D3E5E" style={styles.mapPinEnd} />
                                    <View style={styles.pathLine} />
                                </View>
                            </>
                        )}
                    </TouchableOpacity>

                </ScrollView>

                {/* NEXT BUTTON */}
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
            </View>

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

            {/* --- MAP SELECTION MODAL (Placeholder) --- */}
            <Modal visible={isMapModalVisible} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { height: '80%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Pin Location</Text>
                            <TouchableOpacity onPress={() => setIsMapModalVisible(false)} style={{ padding: 5 }}>
                                <Ionicons name="close" size={28} color="#8A1C27" />
                            </TouchableOpacity>
                        </View>

                        {/* Placeholder for react-native-maps <MapView> */}
                        <View style={styles.fakeMapArea}>
                            <Ionicons name="map-outline" size={60} color="#8391A1" opacity={0.5} />
                            <Text style={styles.fakeMapText}>Map View Library Goes Here</Text>
                            <Ionicons name="location-sharp" size={40} color="#8A1C27" style={{ marginTop: 10 }} />
                        </View>

                        <TouchableOpacity style={styles.confirmLocationButton} onPress={confirmMapLocation} activeOpacity={0.8}>
                            <Text style={styles.confirmLocationText}>Confirm Location</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#2D3E5E',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#2D3E5E',
        textAlign: 'center',
        opacity: 0.8,
        lineHeight: 22,
        fontWeight: '500'
    },

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
    cardTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#8A1C27',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 28
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F4F9',
        borderRadius: 30,
        paddingHorizontal: 20,
        height: 55,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputIcon: { width: 20, height: 20, marginRight: 12, tintColor: '#2D3E5E' },
    input: { flex: 1, fontSize: 14, color: '#2D3E5E', fontWeight: '500' },
    inputText: { flex: 1, fontSize: 14, fontWeight: '500' },
    chevronIcon: { marginLeft: 10 },

    orDividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 15, paddingHorizontal: 20 },
    orLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
    orText: { textAlign: 'center', color: '#8391A1', fontSize: 13, fontWeight: '700', marginHorizontal: 15 },

    // --- MAP SPOTTER STYLES ---
    mapPlaceholder: {
        height: 150,
        backgroundColor: '#E6EEF5',
        borderRadius: 20,
        padding: 15,
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#BFCEDC',
        borderStyle: 'dashed',
        justifyContent: 'center',
    },
    mapPlaceholderSuccess: {
        backgroundColor: '#ECFDF5', // Light green background
        borderColor: '#10B981', // Emerald green border
        borderStyle: 'solid',
    },
    mapText: { position: 'absolute', top: 15, left: 15, color: '#5B7896', fontSize: 14, fontWeight: '700', zIndex: 5 },
    mapGraphic: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', opacity: 0.7 },
    mapPinStart: { position: 'absolute', bottom: 30, left: '25%' },
    mapPinEnd: { position: 'absolute', top: 30, right: '25%' },
    pathLine: { width: 120, height: 3, backgroundColor: '#8391A1', transform: [{ rotate: '-25deg' }], borderRadius: 2 },

    // Success State Info
    successMapContainer: { alignItems: 'center', justifyContent: 'center' },
    pendingLocationText: { color: '#10B981', fontSize: 16, fontWeight: '800', marginTop: 8 },
    reselectText: { color: '#8391A1', fontSize: 12, fontWeight: '500', marginTop: 5, textDecorationLine: 'underline' },

    nextButton: {
        backgroundColor: '#2D3E5E',
        borderRadius: 30,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    nextButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },

    // --- MODAL STYLES ---
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '65%', padding: 25, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F4F9' },
    modalTitle: { fontSize: 22, fontWeight: '800', color: '#2D3E5E' },
    cityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F4F9' },
    cityItemText: { fontSize: 16, color: '#2D3E5E', fontWeight: '500' },

    // Map Specific Modal UI
    fakeMapArea: { flex: 1, backgroundColor: '#F1F4F9', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
    fakeMapText: { color: '#8391A1', fontWeight: '600', marginTop: 10 },
    confirmLocationButton: { backgroundColor: '#8A1C27', borderRadius: 30, height: 60, justifyContent: 'center', alignItems: 'center' },
    confirmLocationText: { color: '#FFF', fontSize: 18, fontWeight: '800' }
});

export default LocationVendorScreen;