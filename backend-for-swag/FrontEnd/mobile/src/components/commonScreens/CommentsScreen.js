import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyComments, deleteComment } from '../../store/slices/postsSlice';

const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const CommentsScreen = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { myComments, loading } = useSelector((state) => state.posts);

    useEffect(() => {
        dispatch(fetchMyComments());
    }, [dispatch]);

    const handleDelete = (item) => {
        Alert.alert(
            "Delete Comment",
            "Are you sure you want to delete this comment?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => dispatch(deleteComment({ postId: item.postId, commentId: item.id }))
                }
            ]
        );
    };

    const renderCommentItem = ({ item }) => (
        <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
                <Text style={styles.headerText}>
                    You commented on <Text style={styles.ownerName}>{item.vendorName}s</Text> post
                </Text>

                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={18} color="#E53E3E" />
                </TouchableOpacity>
            </View>

            <View style={styles.commentBody}>
                <View style={styles.bubble}>
                    <Text style={styles.commentText}>{item.commentText}</Text>
                </View>
                <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Solid Navy Header Background */}
            <View style={styles.headerBackground} />

            <SafeAreaView style={styles.safeArea}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View style={styles.titleContainer}>
                        <Text style={styles.screenTitle}>Your Comments</Text>
                        <View style={styles.pillContainer}>
                            <Text style={styles.pillText}>Newest to oldest</Text>
                        </View>
                    </View>

                    <View style={{ width: 44 }} />
                </View>

                {/* CONTENT */}
                <View style={styles.contentWrapper}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#5B7896" style={{ marginTop: 60 }} />
                    ) : (
                        <FlatList
                            data={myComments}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderCommentItem}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={60} color="#CBD5E1" />
                                    <Text style={styles.emptyStateText}>No comments yet.</Text>
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
    screenTitle: {
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

    commentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 4,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerText: { fontSize: 14, color: '#8391A1', fontWeight: '500', flex: 1, marginRight: 10 },
    ownerName: { fontWeight: '800', color: '#2D3E5E' }, // Brand Navy
    deleteBtn: {
        padding: 6,
        backgroundColor: '#FEF2F2', // Light red tint for touch area
        borderRadius: 12,
    },

    commentBody: {
        alignItems: 'flex-start',
    },
    bubble: {
        backgroundColor: '#F1F4F9', // Light chat bubble
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 16,
        borderTopLeftRadius: 4, // Chat tail effect
        marginBottom: 8,
        width: '100%',
    },
    commentText: { fontSize: 15, color: '#4A5568', lineHeight: 22, fontWeight: '500' },
    dateText: { fontSize: 11, color: '#A0AEC0', fontWeight: '600', marginLeft: 4 },

    emptyState: { alignItems: 'center', marginTop: 80 },
    emptyStateText: { color: '#8391A1', fontSize: 16, fontWeight: '600', marginTop: 15 }
});

export default CommentsScreen;