import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    StatusBar,
    Modal,
    Linking,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingVendors, approveVendor, rejectVendor } from '../../store/slices/adminSlice';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Uncomment if you need to clear storage!

const AdminApprovalScreen = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { pendingVendors, loading, actionLoading } = useSelector((state) => state.admin);

    const [selectedVendor, setSelectedVendor] = useState(null);
    const [viewingImage, setViewingImage] = useState(null);

    useEffect(() => {
        dispatch(fetchPendingVendors());
    }, [dispatch]);

    // --- NEW LOGOUT FUNCTION ---
    const handleLogout = () => {
        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to log out?")) {
                // If you use AsyncStorage or Redux for auth, clear it here! e.g., AsyncStorage.removeItem('userToken');
                router.replace('/auth/login'); // UPDATE THIS PATH if your login screen is somewhere else (like '/')
            }
        } else {
            Alert.alert(
                "Log Out",
                "Are you sure you want to log out?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Log Out",
                        style: "destructive",
                        onPress: () => {
                            // If you use AsyncStorage or Redux for auth, clear it here! e.g., AsyncStorage.removeItem('userToken');
                            router.replace('/auth/Login'); // UPDATE THIS PATH if your login screen is somewhere else (like '/')
                        }
                    }
                ]
            );
        }
    };

    const openInMaps = (address) => {
        const query = encodeURIComponent(address);
        const url = Platform.select({
            ios: `maps:0,0?q=${query}`,
            android: `geo:0,0?q=${query}`,
            web: `https://www.google.com/maps/search/?api=1&query=${query}`
        });

        if (Platform.OS === 'web') {
            window.open(url, '_blank');
        } else {
            Linking.openURL(url).catch(() => Alert.alert("Error", "Could not open map application."));
        }
    };

    const handleApprove = (vendor) => {
        const confirmAction = async () => {
            await dispatch(approveVendor(vendor.id));
            setSelectedVendor(null);
            const message = `${vendor.shopName || vendor.fullName} has been approved.`;
            if (Platform.OS === 'web') window.alert(message);
            else Alert.alert("Approval Successful", message);
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Approve ${vendor.shopName || vendor.fullName} for full access?`)) confirmAction();
        } else {
            Alert.alert(
                "Approve Vendor",
                `Are you sure you want to approve ${vendor.shopName || vendor.fullName}?`,
                [{ text: "Cancel", style: "cancel" }, { text: "Approve", style: "default", onPress: confirmAction }]
            );
        }
    };

    const handleReject = (vendor) => {
        const confirmAction = async () => {
            await dispatch(rejectVendor({ id: vendor.id, reason: '' }));
            setSelectedVendor(null);
            const message = `${vendor.shopName || vendor.fullName} has been rejected.`;
            if (Platform.OS === 'web') window.alert(message);
            else Alert.alert("Vendor Rejected", message);
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Reject ${vendor.shopName || vendor.fullName}? This cannot be undone.`)) confirmAction();
        } else {
            Alert.alert(
                "Reject Vendor",
                `Are you sure you want to reject ${vendor.shopName || vendor.fullName}?`,
                [{ text: "Cancel", style: "cancel" }, { text: "Reject", style: "destructive", onPress: confirmAction }]
            );
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#8A1C27" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.headerContainer}>
                <View style={styles.titleRow}>

                    {/* CHANGED THIS BUTTON TO LOGOUT */}
                    <TouchableOpacity onPress={handleLogout} style={styles.backButton} activeOpacity={0.7}>
                        <Ionicons name="log-out-outline" size={30} color="#E74C3C" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Approvals</Text>

                    <View style={styles.countBadge}>
                        <Text style={styles.headerCount}>{pendingVendors.length}</Text>
                    </View>
                </View>
                <Text style={styles.headerSubtitle}>Review pending vendor accounts</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.listContainer}>
                    {pendingVendors.map((vendor) => (
                        <TouchableOpacity
                            key={vendor.id}
                            style={styles.vendorCard}
                            onPress={() => setSelectedVendor(vendor)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cardTopRow}>
                                {vendor.profileImage ? (
                                    <Image source={{ uri: vendor.profileImage }} style={styles.vendorLogo} />
                                ) : (
                                    <View style={[styles.vendorLogo, { backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }]}>
                                        <Ionicons name="storefront-outline" size={28} color="#8391A1" />
                                    </View>
                                )}
                                <View style={styles.vendorInfo}>
                                    <Text style={styles.vendorName}>{vendor.shopName || vendor.fullName}</Text>
                                    <Text style={styles.vendorCategory}>{vendor.shopType || 'General'}</Text>
                                    <Text style={styles.vendorDetails}>
                                        <Ionicons name="time-outline" size={12} /> Applied: {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" style={{ alignSelf: 'center' }} />
                            </View>

                            <View style={styles.reviewBanner}>
                                <Text style={styles.reviewBannerText}>Tap to Review Full Application</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {pendingVendors.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="checkmark-done-circle-outline" size={60} color="#5B7896" />
                            <Text style={styles.emptyTitle}>All Caught Up!</Text>
                            <Text style={styles.emptyText}>There are no pending vendor approvals at this time.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={!!selectedVendor}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setSelectedVendor(null)}
            >
                {selectedVendor && (
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Application Review</Text>
                            <TouchableOpacity onPress={() => setSelectedVendor(null)} style={styles.closeModalBtn}>
                                <Ionicons name="close-circle" size={32} color="#7F8C8D" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            <View style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Shop Information</Text>
                                <View style={styles.infoRow}><Text style={styles.infoLabel}>Shop Name:</Text><Text style={styles.infoValue}>{selectedVendor.shopName}</Text></View>
                                <View style={styles.infoRow}><Text style={styles.infoLabel}>Service Type:</Text><Text style={styles.infoValue}>{selectedVendor.shopType}</Text></View>
                                <View style={styles.infoRow}><Text style={styles.infoLabel}>User Name:</Text><Text style={styles.infoValue}>{selectedVendor.fullName}</Text></View>
                                <View style={styles.infoRow}><Text style={styles.infoLabel}>Email / Phone:</Text><Text style={styles.infoValue}>{selectedVendor.email || selectedVendor.phone}</Text></View>
                                <View style={styles.infoRow}><Text style={styles.infoLabel}>Commercial No:</Text><Text style={styles.infoValue}>{selectedVendor.document?.commercialRegNumber || 'N/A'}</Text></View>
                            </View>

                            <View style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Location Information</Text>
                                <View style={styles.infoRow}><Text style={styles.infoLabel}>City:</Text><Text style={styles.infoValue}>{selectedVendor.city || 'N/A'}</Text></View>
                                {selectedVendor.profileDetail?.address && (
                                    <Text style={styles.addressText}>{selectedVendor.profileDetail.address}</Text>
                                )}
                                {selectedVendor.locationUrl && (
                                    <TouchableOpacity style={styles.mapButton} onPress={() => openInMaps(selectedVendor.locationUrl)}>
                                        <Ionicons name="map-outline" size={18} color="#FFFFFF" />
                                        <Text style={styles.mapButtonText}>View on Maps</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {selectedVendor.document && (
                                <View style={styles.sectionCard}>
                                    <Text style={styles.sectionTitle}>Uploaded Documents</Text>

                                    {selectedVendor.document.licenseFile && (
                                        <>
                                            <Text style={styles.docLabel}>Vocational License</Text>
                                            <TouchableOpacity onPress={() => setViewingImage({ uri: selectedVendor.document.licenseFile })} activeOpacity={0.8}>
                                                <Image source={{ uri: selectedVendor.document.licenseFile }} style={styles.docThumbnail} />
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    {selectedVendor.document.idFrontFile && (
                                        <>
                                            <Text style={styles.docLabel}>User ID (Front)</Text>
                                            <TouchableOpacity onPress={() => setViewingImage({ uri: selectedVendor.document.idFrontFile })} activeOpacity={0.8}>
                                                <Image source={{ uri: selectedVendor.document.idFrontFile }} style={styles.docThumbnail} />
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    {selectedVendor.document.idBackFile && (
                                        <>
                                            <Text style={styles.docLabel}>User ID (Back)</Text>
                                            <TouchableOpacity onPress={() => setViewingImage({ uri: selectedVendor.document.idBackFile })} activeOpacity={0.8}>
                                                <Image source={{ uri: selectedVendor.document.idBackFile }} style={styles.docThumbnail} />
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleReject(selectedVendor)} disabled={actionLoading}>
                                <Ionicons name="close-circle-outline" size={20} color="#E74C3C" />
                                <Text style={styles.rejectButtonText}>Reject</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => handleApprove(selectedVendor)} disabled={actionLoading}>
                                {actionLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                                        <Text style={styles.approveButtonText}>Approve</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {viewingImage && (
                            <View style={styles.imageViewerOverlay}>
                                <TouchableOpacity style={styles.closeImageBtn} onPress={() => setViewingImage(null)}>
                                    <Ionicons name="close" size={40} color="#FFFFFF" />
                                </TouchableOpacity>
                                <Image source={viewingImage} style={styles.fullscreenImage} resizeMode="contain" />
                            </View>
                        )}
                    </View>
                )}
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#AFC6D8' },

    headerContainer: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#AFC6D8' },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    backButton: { marginRight: 10, paddingVertical: 5 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50' },
    countBadge: { backgroundColor: '#8A1C27', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12, marginLeft: 10 },
    headerCount: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
    headerSubtitle: { fontSize: 14, color: '#5B7896', marginTop: 5, marginLeft: 40, fontWeight: '500' },

    scroll: { paddingBottom: 40 },
    listContainer: { paddingHorizontal: 15, paddingTop: 10 },

    vendorCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
    cardTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
    vendorLogo: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F0F2F5', borderWidth: 1, borderColor: '#E2E8F0' },
    vendorInfo: { flex: 1, marginLeft: 15 },
    vendorName: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 2 },
    vendorCategory: { fontSize: 12, color: '#5B7896', fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
    vendorDetails: { fontSize: 13, color: '#7F8C8D', marginBottom: 2 },

    reviewBanner: { marginTop: 15, backgroundColor: '#F1F4F9', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    reviewBannerText: { color: '#5B7896', fontWeight: '700', fontSize: 13 },

    emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
    emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#2C3E50', marginTop: 15 },
    emptyText: { marginTop: 10, textAlign: 'center', color: '#7F8C8D', fontSize: 15, fontWeight: '500', lineHeight: 22 },

    modalContainer: { flex: 1, backgroundColor: '#F4F7FA' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
    closeModalBtn: { padding: 5 },
    modalScroll: { padding: 15, paddingBottom: 120 },

    sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#2C3E50', borderBottomWidth: 1, borderBottomColor: '#F0F2F5', paddingBottom: 10, marginBottom: 15 },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    infoLabel: { fontSize: 14, color: '#7F8C8D', fontWeight: '500' },
    infoValue: { fontSize: 14, color: '#2C3E50', fontWeight: '700', textAlign: 'right', flex: 1, marginLeft: 10 },

    addressText: { fontSize: 14, color: '#2C3E50', lineHeight: 20, marginBottom: 15, marginTop: 5 },
    mapButton: { flexDirection: 'row', backgroundColor: '#5B7896', paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    mapButtonText: { color: '#FFFFFF', fontWeight: '700', marginLeft: 8 },

    docLabel: { fontSize: 13, color: '#7F8C8D', fontWeight: '600', marginBottom: 5, marginTop: 10 },
    docThumbnail: { width: '100%', height: 180, borderRadius: 12, backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 10 },

    modalFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5 },

    actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
    rejectButton: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E74C3C', marginRight: 8 },
    rejectButtonText: { color: '#E74C3C', fontWeight: '800', fontSize: 16, marginLeft: 8 },
    approveButton: { backgroundColor: '#22C55E', marginLeft: 8, shadowColor: '#22C55E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
    approveButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, marginLeft: 8 },

    imageViewerOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    },
    closeImageBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, right: 20, zIndex: 10, padding: 15 },
    fullscreenImage: { width: '100%', height: '80%' }
});

export default AdminApprovalScreen;