import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const ProfilePopup = ({ visible, onClose, userName, carName, profileImage, bannerImage }) => {
    const router = useRouter();

    // State for full-screen image preview
    const [previewImage, setPreviewImage] = useState(null);

    const handleFollowingPress = () => {
        onClose();
        router.push({
            pathname: '/commonScreens/FollowingList',
            params: { userName: userName }
        });
    };

    const handleMessagePress = () => {
        onClose();
        router.push({
            pathname: '/commonScreens/Chatting',
            params: { userName: userName }
        });
    };

    const handleClose = () => {
        setPreviewImage(null); // Clear preview state if closed
        onClose();
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.touchableArea} onPress={handleClose} activeOpacity={1} />

                <View style={styles.popupContainer}>

                    {/* Close Button (Top Right over Banner) */}
                    <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.8}>
                        <Ionicons name="close-circle" size={32} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* 1. Banner Image (Now Touchable) */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setPreviewImage(bannerImage)}
                        style={{ width: '100%' }}
                    >
                        <Image source={bannerImage} style={styles.banner} />
                    </TouchableOpacity>

                    {/* 2. Profile Image (Now Touchable) */}
                    <View style={styles.profileImageContainer}>
                        <TouchableOpacity activeOpacity={0.9} onPress={() => setPreviewImage(profileImage)}>
                            <Image source={profileImage} style={styles.profilePic} />
                        </TouchableOpacity>
                    </View>

                    {/* 3. Names Section */}
                    <View style={styles.infoSection}>
                        <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                        <Text style={styles.carName} numberOfLines={1}>{carName}</Text>
                    </View>

                    {/* 4. Action Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleMessagePress} activeOpacity={0.8}>
                            <Image source={require('../../../assets/images/message-icon.png')} style={styles.btnIcon} />
                            <Text style={styles.btnText}>Message</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleFollowingPress} activeOpacity={0.8}>
                            <Ionicons name="people-outline" size={20} color="#2D3E5E" style={{ marginRight: 8 }} />
                            <Text style={styles.btnText}>Following</Text>
                        </TouchableOpacity>
                    </View>

                </View>

                {/* Fullscreen Image Preview Overlay */}
                {previewImage && (
                    <View style={styles.fullscreenContainer}>
                        <TouchableOpacity style={styles.closeFullscreen} onPress={() => setPreviewImage(null)}>
                            <Ionicons name="close-circle" size={40} color="white" />
                        </TouchableOpacity>
                        <Image source={previewImage} style={styles.fullscreenImage} resizeMode="contain" />
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)', // UI Polish: Slightly darker for premium contrast
        justifyContent: 'center',
        alignItems: 'center'
    },
    touchableArea: { ...StyleSheet.absoluteFillObject },

    popupContainer: {
        width: width * 0.85,
        backgroundColor: '#FFFFFF', // UI Polish: Crisp white background
        borderRadius: 30, // UI Polish: Modern curves
        overflow: 'hidden',
        alignItems: 'center',
        paddingBottom: 30,
        // UI Polish: Premium depth shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
    },

    closeBtn: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 10,
        // UI Polish: Add drop shadow so white X shows up on light banners
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 5,
    },

    banner: { width: '100%', height: 140, resizeMode: 'cover' },

    profileImageContainer: {
        marginTop: -45, // Pulls avatar up into the banner
        backgroundColor: '#FFFFFF',
        borderRadius: 45,
        padding: 4, // Creates the white ring effect
    },
    profilePic: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: '#F1F4F9'
    },

    infoSection: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 20
    },
    userName: { fontSize: 22, fontWeight: '800', color: '#2D3E5E' }, // Brand Navy
    carName: { fontSize: 13, color: '#8391A1', marginTop: 4, fontWeight: '500', letterSpacing: 0.5 },

    buttonRow: { flexDirection: 'row', gap: 15, paddingHorizontal: 20 },
    actionButton: {
        flex: 1, // UI Polish: Makes buttons equal width
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F4F9', // UI Polish: Clean, clickable pill
        paddingVertical: 12,
        borderRadius: 25,
    },
    btnIcon: { width: 18, height: 18, marginRight: 8, tintColor: '#2D3E5E' },
    btnText: { color: '#2D3E5E', fontWeight: '700', fontSize: 13 },

    // Styles for the Image Preview
    fullscreenContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.95)', // UI Polish: Darker theater mode
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100
    },
    closeFullscreen: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 110
    },
    fullscreenImage: {
        width: width,
        height: height * 0.8
    },
});

export default ProfilePopup;