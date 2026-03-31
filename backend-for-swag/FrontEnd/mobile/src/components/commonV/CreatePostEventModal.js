import React from 'react';
import {
    View, Text, StyleSheet, ImageBackground, TouchableOpacity, Modal, Dimensions, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

const CreatePostEventModal = ({ visible, onClose }) => {
    const router = useRouter();

    const handleNavigation = (path) => {
        onClose();
        // Small delay ensures the modal closes smoothly before navigating
        setTimeout(() => {
            router.push(path);
        }, Platform.OS === 'ios' ? 300 : 150);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                {/* Clickable dark background to close the modal */}
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={styles.modalView}>

                    {/* Header Section */}
                    <View style={styles.headerContainer}>
                        <View style={styles.dragPill} />
                        <Text style={styles.headerTitle}>What would you like to share?</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
                            <Ionicons name="close-circle" size={28} color="#8391A1" />
                        </TouchableOpacity>
                    </View>

                    {/* Create Post Section */}
                    <View style={styles.cardWrapper}>
                        <ImageBackground
                            source={require('../../../assets/images/background-img-post.png')}
                            style={styles.imageBackground}
                            imageStyle={styles.imageBorder}
                            resizeMode="cover"
                        >
                            <View style={[styles.overlay, { backgroundColor: 'rgba(45, 62, 94, 0.65)' }]} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Share a Post</Text>
                                <Text style={styles.cardSubtitle}>Showcase parts, services, or updates</Text>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: '#5B7896', shadowColor: '#5B7896' }]}
                                    onPress={() => handleNavigation('/vendor/CreatePostVen')}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.buttonText}>Create Post</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </View>

                    {/* Create Event Section */}
                    <View style={styles.cardWrapper}>
                        <ImageBackground
                            source={require('../../../assets/images/background-img-event.png')}
                            style={styles.imageBackground}
                            imageStyle={styles.imageBorder}
                            resizeMode="cover"
                        >
                            <View style={[styles.overlay, { backgroundColor: 'rgba(138, 28, 39, 0.65)' }]} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Host an Event</Text>
                                <Text style={styles.cardSubtitle}>Car meets, dyno days, and tournaments</Text>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: '#8A1C27', shadowColor: '#8A1C27' }]}
                                    onPress={() => handleNavigation('/vendor/CreateEventVen')}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.buttonText}>Create Event</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.65)', // UI Polish: Cinematic contrast
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalView: {
        height: height * 0.75, // Slightly taller to breathe
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 35, // Global modal curves
        borderTopRightRadius: 35,
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
        width: '100%',
    },
    dragPill: {
        width: 50,
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2D3E5E', // Brand Navy
        marginTop: 5,
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        top: 15,
    },
    cardWrapper: {
        flex: 1,
        marginBottom: 20, // Increased gap between cards
        borderRadius: 25, // UI Polish: Premium card geometry
        overflow: 'hidden',
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    imageBackground: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    imageBorder: {
        borderRadius: 25,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    cardContent: {
        paddingHorizontal: 25,
        justifyContent: 'center',
        height: '100%',
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    cardSubtitle: {
        color: '#E2E8F0',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 20,
        lineHeight: 20,
    },
    actionButton: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 25, // UI Polish: Pill shape
        alignItems: 'center',
        alignSelf: 'flex-start',
        // UI Polish: Glowing colored shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 6,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '800',
        marginRight: 8,
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});

export default CreatePostEventModal;