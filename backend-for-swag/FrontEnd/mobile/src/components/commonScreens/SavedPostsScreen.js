import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useDispatch, useSelector } from 'react-redux';

// Import the Customer version
import CustomerPosts from '../common/CustomerPosts';
import { fetchSavedPosts } from '../../store/slices/customerSlice';

const defaultLogo = require('../../../assets/images/default-user-pfp.png');
const defaultBg = require('../../../assets/images/default-banner.png');

const SavedPostsScreen = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const rawSaved = useSelector((state) => state.customer.savedPosts) || [];

    useEffect(() => {
        dispatch(fetchSavedPosts());
    }, [dispatch]);

    const savedPosts = (Array.isArray(rawSaved) ? rawSaved : []).map((p) => ({
        id: p.id,
        vendorId: p.vendorId,
        vendorName: p.vendorShopName || 'User Name',
        vendorLogo: p.vendorProfileImage ? { uri: p.vendorProfileImage } : defaultLogo,
        location: p.location || '',
        description: p.description || '',
        postImage: p.postImage ? { uri: p.postImage } : null,
        isLiked: p.isLiked,
        likeCount: p.likeCount,
        commentCount: p.commentCount,
    }));

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
                        <Text style={styles.headerTitle}>Saved Posts</Text>
                        <View style={styles.pillContainer}>
                            <Text style={styles.pillText}>All posts</Text>
                        </View>
                    </View>

                    <View style={{ width: 44 }} />
                </View>

                {/* CONTENT */}
                <View style={styles.contentWrapper}>
                    <FlatList
                        data={savedPosts}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <CustomerPosts
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
                                    pathname: '/customer/VendorProfCust',
                                    params: { vendorId: item.vendorId }
                                })}
                            />
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="bookmark-outline" size={60} color="#CBD5E1" />
                                <Text style={styles.emptyStateText}>No saved posts yet.</Text>
                            </View>
                        }
                    />
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
        paddingHorizontal: 16,
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

export default SavedPostsScreen;