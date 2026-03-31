import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const ProfilePopupV = ({ visible, onClose, userName, carName, profileImage, bannerImage }) => {
    const router = useRouter();

    const handleFollowingPress = () => {
        onClose();
        router.push({
            pathname: '/commonScreensV/FollowingListV',
            params: { userName: userName }
        });
    };

    const handleMessagePress = () => {
        onClose();
        router.push({
            pathname: '/commonScreensV/ChattingV',
            params: { userName: userName }
        });
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.touchableArea} onPress={onClose} activeOpacity={1} />

                <View style={styles.popupContainer}>

                    {/* Close Button (Top Right over Banner) */}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                        <Ionicons name="close-circle" size={32} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* 1. Banner Image */}
                    <Image source={bannerImage} style={styles.banner} />

                    {/* 2. Profile Image with Offset */}
                    <View style={styles.profileImageContainer}>
                        <Image source={profileImage} style={styles.profilePic} />
                    </View>

                    {/* 3. Info Section */}
                    <View style={styles.infoSection}>
                        <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                        <Text style={styles.carName} numberOfLines={1}>{carName}</Text>
                    </View>

                    {/* 4. Action Buttons (Standardized Pill Design) */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleMessagePress} activeOpacity={0.8}>
                            <Image
                                source={require('../../../assets/images/message-icon.png')}
                                style={styles.btnIcon}
                            />
                            <Text style={styles.btnText}>Message</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleFollowingPress} activeOpacity={0.8}>
                            <Ionicons name="people-outline" size={18} color="#2D3E5E" style={{ marginRight: 8 }} />
                            <Text style={styles.btnText}>Following</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)', // UI Polish: Slightly deeper for focus
        justifyContent: 'center',
        alignItems: 'center'
    },
    touchableArea: { ...StyleSheet.absoluteFillObject },

    popupContainer: {
        width: width * 0.85,
        backgroundColor: '#FFFFFF', // UI Polish: Crisp white card
        borderRadius: 30, // UI Polish: Global premium curve
        overflow: 'hidden',
        alignItems: 'center',
        paddingBottom: 30,
        // UI Polish: Multi-layer depth shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    },

    closeBtn: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 10,
        // UI Polish: Drop shadow for visibility on light images
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 5,
    },

    banner: { width: '100%', height: 130, resizeMode: 'cover' },

    profileImageContainer: {
        marginTop: -45, // Pulls avatar up into banner
        backgroundColor: '#FFFFFF',
        borderRadius: 45,
        padding: 4, // Creates the sticker-style ring
    },
    profilePic: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: '#F1F4F9',
    },

    infoSection: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 20
    },
    userName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#2D3E5E', // Brand Navy
        letterSpacing: 0.3
    },
    carName: {
        fontSize: 13,
        color: '#8391A1',
        marginTop: 4,
        fontWeight: '500',
        letterSpacing: 0.5
    },

    buttonRow: {
        flexDirection: 'row',
        gap: 15,
        paddingHorizontal: 20
    },
    actionButton: {
        flex: 1, // UI Polish: Equal width buttons
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F4F9', // UI Polish: Soft pill action
        paddingVertical: 12,
        borderRadius: 25,
    },
    btnIcon: { width: 18, height: 18, marginRight: 8, tintColor: '#2D3E5E' },
    btnText: { color: '#2D3E5E', fontWeight: '700', fontSize: 13 },
});

export default ProfilePopupV;