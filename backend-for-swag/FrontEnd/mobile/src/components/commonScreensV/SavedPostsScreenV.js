import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';

import VendorPosts from '../commonV/VendorPosts';
import { fetchSavedPosts } from '../../store/slices/vendorSlice';

const defaultLogo = require('../../../assets/images/user-icon.png');
const defaultBg = require('../../../assets/images/nmk-pic.png');

const SavedPostsScreenV = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const rawSaved = useSelector((state) => state.vendor.savedPosts) || [];

    useEffect(() => {
        dispatch(fetchSavedPosts());
    }, [dispatch]);

    const posts = (Array.isArray(rawSaved) ? rawSaved : []).map((p) => ({
        id: p.id,
        vendorId: p.vendorId,
        vendorName: p.vendorShopName || '',
        vendorLogo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
        location: p.location || '',
        description: p.description || '',
        postImage: p.postImage ? { uri: p.postImage } : defaultBg,
        isLiked: p.isLiked,
        likeCount: p.likeCount,
        commentCount: p.commentCount,
    }));

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
                            <Text style={styles.headerTitle}>Saved Posts</Text>
                            <View style={styles.pillContainer}>
                                <Text style={styles.pillText}>All posts</Text>
                            </View>
                        </View>

                        <View style={{ width: 40 }} />
                    </View>

                    {/* List of Saved Posts */}
                    <FlatList
                        data={posts}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <VendorPosts
                                postId={item.id}
                                vendorName={item.vendorName}
                                vendorLogo={item.vendorLogo}
                                location={item.location}
                                description={item.description}
                                postImage={item.postImage}
                                initialLiked={item.isLiked}
                                initialSaved={true}
                                likeCount={item.likeCount}
                                commentCount={item.commentCount}
                                onVendorPress={() => router.push({
                                    pathname: '/vendor/otherVendorProfile',
                                    params: { vendorId: item.vendorId }
                                })}
                            />
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="bookmark-outline" size={50} color="#7F8C8D" />
                                <Text style={styles.emptyText}>No saved posts yet.</Text>
                            </View>
                        }
                    />
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
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#718096',
        fontSize: 16,
        marginTop: 12,
    }
});

export default SavedPostsScreenV;
