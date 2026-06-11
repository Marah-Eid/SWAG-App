import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Modal,
    FlatList,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { height: 100%; width: 100%; }
    .confirm-btn {
      position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
      background: #2D3E5E; color: #fff; border: none; border-radius: 30px;
      padding: 14px 40px; font-size: 16px; font-weight: 700; cursor: pointer;
      z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: none;
    }
    .hint {
      position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
      background: rgba(45,62,94,0.85); color: #fff; border-radius: 20px;
      padding: 8px 18px; font-size: 13px; font-weight: 600; z-index: 1000;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="hint" id="hint">Tap anywhere to drop a pin</div>
  <button class="confirm-btn" id="confirmBtn" onclick="confirmLocation()">Confirm Location</button>
  <script>
    var map = L.map('map', { zoomControl: true }).setView([31.9, 35.93], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '\\u00a9 OpenStreetMap'
    }).addTo(map);

    var marker = null;
    var pendingLat = null;
    var pendingLng = null;

    var redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    map.on('click', function(e) {
      pendingLat = e.latlng.lat;
      pendingLng = e.latlng.lng;
      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng, { icon: redIcon, draggable: true }).addTo(map);
        marker.on('dragend', function(ev) {
          pendingLat = ev.target.getLatLng().lat;
          pendingLng = ev.target.getLatLng().lng;
        });
      }
      document.getElementById('hint').style.display = 'none';
      document.getElementById('confirmBtn').style.display = 'block';
    });

    function confirmLocation() {
      if (pendingLat === null) return;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'confirm', lat: pendingLat, lng: pendingLng
      }));
    }
  </script>
</body>
</html>
`;

const LocationVendorScreen = () => {
    const router = useRouter();
    const vendorParams = useLocalSearchParams();

    const [city, setCity] = useState('');
    const [isCityModalVisible, setIsCityModalVisible] = useState(false);

    const [isMapModalVisible, setIsMapModalVisible] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [locationLat, setLocationLat] = useState(null);
    const [locationLng, setLocationLng] = useState(null);

    const webViewRef = useRef(null);

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

    const isMapSpotted = locationLat !== null && locationLng !== null;

    const handleNext = () => {
        if (!city) {
            showAlert('Error', 'Please select a city to continue.');
            return;
        }

        router.push({
            pathname: '/auth/VendorCertification',
            params: {
                ...vendorParams,
                city,
                locationLat: locationLat !== null ? String(locationLat) : '',
                locationLng: locationLng !== null ? String(locationLng) : '',
            }
        });
    };

    const handleWebViewMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'confirm') {
                setLocationLat(data.lat);
                setLocationLng(data.lng);
                setIsMapModalVisible(false);
                setMapReady(false);
            }
        } catch (_) {}
    };

    const openMapModal = () => {
        setMapReady(false);
        setIsMapModalVisible(true);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="light" />

            {/* --- TOP SECTION --- */}
            <View style={styles.topSection}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={28} color="#2D3E5E" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Location</Text>
                    <Text style={styles.headerSubtitle}>Add your location{"\n"}information</Text>
                </View>
            </View>

            {/* --- WHITE CARD --- */}
            <View style={styles.whiteCard}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <Text style={styles.cardTitle}>Choose your city &{"\n"}pin your location</Text>

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

                    {/* 2. MAP PICKER */}
                    <TouchableOpacity
                        style={[styles.mapPlaceholder, isMapSpotted && styles.mapPlaceholderSuccess]}
                        onPress={openMapModal}
                        activeOpacity={0.8}
                    >
                        {isMapSpotted ? (
                            <View style={styles.successMapContainer}>
                                <Ionicons name="checkmark-circle" size={40} color="#10B981" />
                                <Text style={styles.pendingLocationText}>Location pinned!</Text>
                                <Text style={styles.coordsText}>
                                    {locationLat.toFixed(5)}, {locationLng.toFixed(5)}
                                </Text>
                                <Text style={styles.reselectText}>Tap to change</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.mapText}>Tap to pin your location on the map</Text>
                                <View style={styles.mapGraphic}>
                                    <Ionicons name="location-sharp" size={32} color="#8A1C27" style={styles.mapPinStart} />
                                    <Ionicons name="radio-button-on" size={24} color="#2D3E5E" style={styles.mapPinEnd} />
                                    <View style={styles.pathLine} />
                                </View>
                            </>
                        )}
                    </TouchableOpacity>

                </ScrollView>

                <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
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
                                <TouchableOpacity
                                    style={styles.cityItem}
                                    onPress={() => { setCity(item); setIsCityModalVisible(false); }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.cityItemText, city === item && { color: '#8A1C27', fontWeight: '700' }]}>{item}</Text>
                                    {city === item && <Ionicons name="checkmark-circle" size={24} color="#8A1C27" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* --- LEAFLET MAP MODAL --- */}
            <Modal visible={isMapModalVisible} transparent={false} animationType="slide">
                <View style={styles.mapModalContainer}>
                    <View style={styles.mapModalHeader}>
                        <Text style={styles.modalTitle}>Pin Your Location</Text>
                        <TouchableOpacity onPress={() => { setIsMapModalVisible(false); setMapReady(false); }} style={{ padding: 5 }}>
                            <Ionicons name="close" size={28} color="#8A1C27" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.mapInstructions}>
                        Tap on the map to drop a pin, then drag to fine-tune. Press "Confirm Location" when done.
                    </Text>

                    <View style={styles.webViewContainer}>
                        {!mapReady && (
                            <View style={styles.mapLoading}>
                                <ActivityIndicator size="large" color="#2D3E5E" />
                                <Text style={styles.mapLoadingText}>Loading map...</Text>
                            </View>
                        )}
                        <WebView
                            ref={webViewRef}
                            source={{ html: LEAFLET_HTML }}
                            style={[styles.webView, !mapReady && { opacity: 0 }]}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            originWhitelist={['*']}
                            onLoad={() => setMapReady(true)}
                            onMessage={handleWebViewMessage}
                            mixedContentMode="always"
                        />
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
    cardTitle: { fontSize: 22, fontWeight: '800', color: '#8A1C27', textAlign: 'center', marginBottom: 25, lineHeight: 28 },

    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F4F9',
        borderRadius: 30, paddingHorizontal: 20, height: 55, marginBottom: 15,
        borderWidth: 1, borderColor: '#E2E8F0',
    },
    inputIcon: { width: 20, height: 20, marginRight: 12, tintColor: '#2D3E5E' },
    input: { flex: 1, fontSize: 14, color: '#2D3E5E', fontWeight: '500' },
    inputText: { flex: 1, fontSize: 14, fontWeight: '500' },
    chevronIcon: { marginLeft: 10 },

    orDividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 15, paddingHorizontal: 20 },
    orLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
    orText: { textAlign: 'center', color: '#8391A1', fontSize: 13, fontWeight: '700', marginHorizontal: 15 },

    mapPlaceholder: {
        height: 150, backgroundColor: '#E6EEF5', borderRadius: 20, padding: 15,
        marginBottom: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: '#BFCEDC',
        borderStyle: 'dashed', justifyContent: 'center',
    },
    mapPlaceholderSuccess: { backgroundColor: '#ECFDF5', borderColor: '#10B981', borderStyle: 'solid' },
    mapText: { position: 'absolute', top: 15, left: 15, color: '#5B7896', fontSize: 14, fontWeight: '700', zIndex: 5 },
    mapGraphic: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', opacity: 0.7 },
    mapPinStart: { position: 'absolute', bottom: 30, left: '25%' },
    mapPinEnd: { position: 'absolute', top: 30, right: '25%' },
    pathLine: { width: 120, height: 3, backgroundColor: '#8391A1', transform: [{ rotate: '-25deg' }], borderRadius: 2 },

    successMapContainer: { alignItems: 'center', justifyContent: 'center' },
    pendingLocationText: { color: '#10B981', fontSize: 16, fontWeight: '800', marginTop: 8 },
    coordsText: { color: '#5B7896', fontSize: 12, fontWeight: '600', marginTop: 4 },
    reselectText: { color: '#8391A1', fontSize: 12, fontWeight: '500', marginTop: 5, textDecorationLine: 'underline' },

    nextButton: {
        backgroundColor: '#2D3E5E', borderRadius: 30, height: 60,
        justifyContent: 'center', alignItems: 'center', marginTop: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
    },
    nextButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },

    // City modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '65%', padding: 25, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F4F9' },
    modalTitle: { fontSize: 22, fontWeight: '800', color: '#2D3E5E' },
    cityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F4F9' },
    cityItemText: { fontSize: 16, color: '#2D3E5E', fontWeight: '500' },

    // Leaflet map modal
    mapModalContainer: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'ios' ? 55 : 30 },
    mapModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 8 },
    mapInstructions: { color: '#8391A1', fontSize: 13, fontWeight: '500', paddingHorizontal: 25, marginBottom: 10 },
    webViewContainer: { flex: 1, position: 'relative' },
    webView: { flex: 1 },
    mapLoading: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F4F9', zIndex: 10 },
    mapLoadingText: { color: '#5B7896', marginTop: 12, fontWeight: '600' },
});

export default LocationVendorScreen;
