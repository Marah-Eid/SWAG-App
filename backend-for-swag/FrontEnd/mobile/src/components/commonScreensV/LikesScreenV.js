import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyLikes, toggleLike, toggleSave } from '../../store/slices/postsSlice';
import CommentsModalV from '../commonV/CommentsModalV';

const likeIcon = require('../../../assets/images/like-icon.png');
const likedIcon = require('../../../assets/images/liked-icon.png');
const commentIcon = require('../../../assets/images/coment-icon.png');
const shareIcon = require('../../../assets/images/share-icon.png');
const saveIcon = require('../../../assets/images/saved-icon.png');
const savedIcon = require('../../../assets/images/save-icon.png');
const defaultLogo = require('../../../assets/images/user-icon.png');

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
                        <Text style={cardStyles.vendorName}>{item.vendorShopName}</Text>
                        {item.location ? <Text style={cardStyles.location}>Location: {item.location}</Text> : null}
                    </View>
                </View>

                <TouchableOpacity onPress={() => dispatch(toggleSave(item.id))}>
                    <Image
                        source={item.isSaved ? savedIcon : saveIcon}
                        style={cardStyles.saveIcon}
                    />
                </TouchableOpacity>
            </View>

            <View style={cardStyles.content}>
                {item.type === 'event' && <Text style={cardStyles.eventLabel}>Event</Text>}
                {item.description ? (
                    <Text style={cardStyles.desc}>
                        {item.description} <Text style={cardStyles.readMore}>Read more...</Text>
                    </Text>
                ) : null}
                {postImage && <Image source={postImage} style={cardStyles.postImg} resizeMode="cover" />}
            </View>

            <View style={cardStyles.footer}>
                <TouchableOpacity onPress={() => dispatch(toggleLike(item.id))}>
                    <Image
                        source={item.isLiked ? likedIcon : likeIcon}
                        style={cardStyles.icon}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowComments(true)}>
                    <Image source={commentIcon} style={cardStyles.icon} />
                </TouchableOpacity>

                <TouchableOpacity>
                    <Image source={shareIcon} style={cardStyles.icon} />
                </TouchableOpacity>
            </View>

            <CommentsModalV
                visible={showComments}
                onClose={() => setShowComments(false)}
                postId={item.id}
            />
        </View>
    );
};

const LikesScreenV = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { likedPosts, loading } = useSelector((state) => state.posts);

    useEffect(() => {
        dispatch(fetchMyLikes());
    }, [dispatch]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#FFFFFF', '#DDE5F0', '#BCC9DB']}
                style={styles.gradient}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            >
                <SafeAreaView style={styles.safeArea}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#2D3E5E" />
                        </TouchableOpacity>

                        <View style={styles.titleContainer}>
                            <Text style={styles.headerTitle}>Liked Posts</Text>
                            <View style={styles.pillContainer}>
                                <Text style={styles.pillText}>Newest to oldest</Text>
                            </View>
                        </View>

                        <View style={{ width: 40 }} />
                    </View>

                    {/* List */}
                    {loading ? (
                        <ActivityIndicator size="large" color="#2D3E5E" style={{ marginTop: 60 }} />
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
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: 15,
    },
    backBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
    },
    titleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D3E5E',
        textAlign: 'center',
    },
    pillContainer: {
        backgroundColor: '#3a3a3a',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 6,
    },
    pillText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '500'
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    emptyState: { alignItems: 'center', marginTop: 80 },
    emptyStateText: { color: '#8391A1', fontSize: 16, fontWeight: '600', marginTop: 15 },
});

const cardStyles = StyleSheet.create({
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    vendorInfo: { flexDirection: 'row', alignItems: 'center' },
    logo: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    vendorName: { fontWeight: 'bold', fontSize: 16, color: '#2D3E5E' },
    location: { color: '#800C1F', fontSize: 12 },

    // 4. Added Save Icon Style
    saveIcon: { width: 20, height: 20, resizeMode: 'contain', tintColor: '#2D3E5E' },

    content: { marginTop: 10 },
    eventLabel: { color: '#800C1F', fontWeight: 'bold' },
    desc: { fontSize: 13, color: '#444', marginVertical: 5 },
    readMore: { fontWeight: 'bold', color: '#800C1F' },
    postImg: { width: '100%', height: 180, borderRadius: 12, marginTop: 5 },
    footer: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, marginTop: 10 },
    icon: { width: 22, height: 22, resizeMode: 'contain' }
});

export default LikesScreenV;