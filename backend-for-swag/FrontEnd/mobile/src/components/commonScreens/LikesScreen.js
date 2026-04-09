import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyLikes, toggleLike, toggleSave } from '../../store/slices/postsSlice';

// Import your Customer Comments Modal (adjust path if needed)
import CommentsModal from '../common/CommentsModal';

// Import Icons
const likeIcon = require('../../../assets/images/like-icon.png');
const likedIcon = require('../../../assets/images/liked-icon.png');
const commentIcon = require('../../../assets/images/coment-icon.png');
const shareIcon = require('../../../assets/images/share-icon.png');
const saveIcon = require('../../../assets/images/saved-icon.png');
const savedIcon = require('../../../assets/images/save-icon.png');
const defaultLogo = require('../../../assets/images/user-icon.png');

// --- LOCAL "LIKED" POST COMPONENT (Customer Version) ---
const LikedPostItem = ({ item }) => {
    const dispatch = useDispatch();
    const [showComments, setShowComments] = useState(false);

    const vendorLogo = item.vendorProfileImage ? { uri: item.vendorProfileImage } : defaultLogo;
    const postImage = item.postImage ? { uri: item.postImage } : null;

    return (
        <View style={cardStyles.card}>
            <View style={cardStyles.header}>
                <View style={cardStyles.vendorInfo}>
                    <Image source={vendorLogo} style={cardStyles.logo} />
                    <View>
                        <Text style={cardStyles.vendorName}>{item.vendorShopName || ''}</Text>
                        {item.location ? <Text style={cardStyles.location}>{'Location: ' + item.location}</Text> : null}
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity onPress={() => dispatch(toggleSave(item.id))} activeOpacity={0.7} style={cardStyles.iconButton}>
                    <Image
                        source={item.isSaved ? savedIcon : saveIcon}
                        style={cardStyles.saveIcon}
                    />
                </TouchableOpacity>
            </View>

            <View style={cardStyles.content}>
                {item.type === 'event' ? <Text style={cardStyles.eventLabel}>Event</Text> : null}
                {item.description ? (
                    <Text style={cardStyles.desc}>
                        {item.description}{' '}<Text style={cardStyles.readMore}>Read more...</Text>
                    </Text>
                ) : null}
                {postImage && <Image source={postImage} style={cardStyles.postImg} resizeMode="cover" />}
            </View>

            <View style={cardStyles.footer}>
                <TouchableOpacity onPress={() => dispatch(toggleLike(item.id))} activeOpacity={0.7} style={cardStyles.footerAction}>
                    <Image
                        source={item.isLiked ? likedIcon : likeIcon}
                        style={cardStyles.icon}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowComments(true)} activeOpacity={0.7} style={cardStyles.footerAction}>
                    <Image source={commentIcon} style={cardStyles.icon} />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} style={cardStyles.footerAction}>
                    <Image source={shareIcon} style={cardStyles.icon} />
                </TouchableOpacity>
            </View>

            <CommentsModal
                visible={showComments}
                onClose={() => setShowComments(false)}
                postId={item.id}
            />
        </View>
    );
};

const LikesScreen = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { likedPosts: rawLikedPosts, loading } = useSelector((state) => state.posts);
    const likedPosts = Array.isArray(rawLikedPosts) ? rawLikedPosts : [];

    useEffect(() => {
        dispatch(fetchMyLikes());
    }, [dispatch]);

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

                    <View style={styles.titleContainer}>
                        <Text style={styles.headerTitle}>Liked Posts</Text>
                        <View style={styles.pillContainer}>
                            <Text style={styles.pillText}>Newest to oldest</Text>
                        </View>
                    </View>

                    <View style={{ width: 44 }} /> {/* Spacer for centering */}
                </View>

                {/* CONTENT */}
                <View style={styles.contentWrapper}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#5B7896" style={{ marginTop: 60 }} />
                    ) : (
                        <FlatList
                            data={likedPosts}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => <LikedPostItem item={item} />}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Ionicons name="heart-outline" size={60} color="#CBD5E1" />
                                    <Text style={styles.emptyStateText}>No liked posts yet.</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </SafeAreaView>
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
    titleContainer: { alignItems: 'center' },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    pillContainer: {
        backgroundColor: '#8A1C27', // Brand Red
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15, // UI Polish: Pill shape
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    pillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

    contentWrapper: {
        flex: 1,
        backgroundColor: '#F1F4F9', // Premium Off-White
        borderTopLeftRadius: 35, // Global sweeping curves
        borderTopRightRadius: 35,
        overflow: 'hidden',
    },
    listContent: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 40 },

    emptyState: { alignItems: 'center', marginTop: 80 },
    emptyStateText: { color: '#8391A1', fontSize: 16, fontWeight: '600', marginTop: 15 }
});

const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 4
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    vendorInfo: { flexDirection: 'row', alignItems: 'center' },
    logo: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#F1F4F9' },
    vendorName: { fontWeight: '800', fontSize: 16, color: '#2D3E5E' }, // Brand Navy
    location: { color: '#8391A1', fontSize: 12, fontWeight: '500', marginTop: 2 },
    iconButton: { padding: 4 },
    saveIcon: { width: 22, height: 22, resizeMode: 'contain', tintColor: '#2D3E5E' },

    content: { marginTop: 5 },
    eventLabel: { color: '#8A1C27', fontWeight: '800', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }, // Brand Red
    desc: { fontSize: 14, color: '#4A5568', marginVertical: 8, lineHeight: 22, fontWeight: '500' },
    readMore: { fontWeight: '800', color: '#8A1C27' },
    postImg: { width: '100%', height: 200, borderRadius: 16, marginTop: 10 },

    footer: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 15, marginTop: 15 },
    footerAction: { paddingHorizontal: 20, paddingVertical: 5 },
    icon: { width: 24, height: 24, resizeMode: 'contain' }
});

export default LikesScreen;