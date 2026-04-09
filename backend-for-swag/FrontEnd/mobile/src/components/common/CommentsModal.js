import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, Image,
    FlatList, TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import ProfilePopup from './ProfilePopup';
import { fetchComments, addComment, deleteComment as deleteCommentThunk } from '../../store/slices/postsSlice';

const CommentsModal = ({ visible, onClose, postId }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [newComment, setNewComment] = useState('');
    const [isProfileVisible, setProfileVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const { comments: allComments } = useSelector((state) => state.posts);
    const comments = (allComments[postId] || []);

    useEffect(() => {
        if (visible && postId) {
            dispatch(fetchComments(postId));
        }
    }, [visible, postId, dispatch]);

    const { user } = useSelector((state) => state.auth);

    const handleAddComment = () => {
        if (!newComment.trim() || !postId) return;
        dispatch(addComment({ postId, commentText: newComment.trim() }));
        setNewComment('');
    };

    const handleUserPress = (item) => {
        const type = item.commenterType || item.userType || item.type || 'customer';
        const id = item.commenterId || item.userId;
        if (type === 'vendor') {
            onClose();
            router.push({
                pathname: '/customer/VendorProfCust',
                params: { vendorId: id }
            });
        } else {
            setSelectedUser({
                name: item.commenterName || item.userName || item.user,
                id: id,
                image: item.commenterImage,
            });
            setProfileVisible(true);
        }
    };

    const confirmDelete = (commentId) => {
        Alert.alert(
            "Delete Comment",
            "Are you sure you want to delete this comment?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => dispatch(deleteCommentThunk({ postId, commentId })) }
            ]
        );
    };

    return (
        <View>
            <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
                <View style={styles.overlay}>
                    <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>

                        {/* HEADER */}
                        <View style={styles.header}>
                            <View style={styles.handle} />
                            <Text style={styles.title}>Comments</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                                <Ionicons name="close-circle" size={30} color="#E2E8F0" />
                            </TouchableOpacity>
                        </View>

                        {/* COMMENTS LIST */}
                        <FlatList
                            data={comments}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const displayName = item.commenterName || item.userName || item.user || 'User';
                                const displayTime = item.time || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '');
                                const isMe = item.isOwn || (user && String(item.commenterId) === String(user.id));
                                return (
                                    <View style={styles.commentItem}>

                                        {/* Avatar */}
                                        <TouchableOpacity
                                            style={[styles.avatarPlaceholder, isMe && { backgroundColor: '#8A1C27' }]}
                                            onPress={() => handleUserPress(item)}
                                            activeOpacity={0.8}
                                        >
                                            {item.commenterImage ? (
                                                <Image source={{ uri: item.commenterImage }} style={styles.avatarImage} />
                                            ) : (
                                                <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
                                            )}
                                        </TouchableOpacity>

                                        <View style={styles.textBubbleWrapper}>

                                            {/* Username & Time */}
                                            <View style={styles.bubbleHeader}>
                                                <TouchableOpacity onPress={() => handleUserPress(item)} activeOpacity={0.8}>
                                                    <Text style={styles.username}>{displayName}</Text>
                                                </TouchableOpacity>
                                                <Text style={styles.time}>{displayTime}</Text>
                                            </View>

                                            {/* Chat Bubble & Delete */}
                                            <View style={styles.bubbleRow}>
                                                <View style={[styles.bubble, isMe && styles.myBubble]}>
                                                    <Text style={[styles.commentText, isMe && styles.myCommentText]}>{item.commentText || item.text || item.content || ''}</Text>
                                                </View>

                                                {isMe && (
                                                    <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item.id)} activeOpacity={0.7}>
                                                        <Ionicons name="trash-outline" size={18} color="#E53E3E" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>

                                        </View>
                                    </View>
                                );
                            }}
                        />

                        {/* INPUT AREA */}
                        <View style={styles.inputArea}>
                            <TextInput
                                style={styles.input}
                                placeholder="Add a comment..."
                                value={newComment}
                                onChangeText={setNewComment}
                                placeholderTextColor="#8391A1"
                                multiline
                            />
                            <TouchableOpacity
                                onPress={handleAddComment}
                                style={[styles.postBtn, newComment.trim().length > 0 && styles.postBtnActive]}
                                activeOpacity={0.8}
                                disabled={newComment.trim().length === 0}
                            >
                                <Ionicons name="send" size={18} color={newComment.trim().length > 0 ? "#FFFFFF" : "#A0AEC0"} />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Profile Popup Overlay for Customers */}
            <ProfilePopup
                visible={isProfileVisible}
                onClose={() => setProfileVisible(false)}
                userName={selectedUser?.name}
                profileImage={selectedUser?.image ? { uri: selectedUser.image } : require('../../../assets/images/user-icon.png')}
                customerId={selectedUser?.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', // UI Polish: Darker backdrop
        justifyContent: 'flex-end'
    },
    backdrop: { ...StyleSheet.absoluteFillObject },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 35, // UI Polish: Matches global modal curves
        borderTopRightRadius: 35,
        height: '75%',
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    },

    header: {
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F4F9',
        position: 'relative'
    },
    handle: { width: 50, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, marginBottom: 15 },
    title: { fontSize: 18, fontWeight: '800', color: '#2D3E5E' },
    closeBtn: { position: 'absolute', right: 20, top: 20 },

    listContent: { padding: 20, paddingBottom: 40 },

    commentItem: { flexDirection: 'row', marginBottom: 20 },
    avatarPlaceholder: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: '#2D3E5E', // Brand Navy
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    avatarImage: { width: 40, height: 40, borderRadius: 20, resizeMode: 'cover' },
    avatarText: { fontWeight: '800', color: '#FFFFFF', fontSize: 16 },

    textBubbleWrapper: { flex: 1 },
    bubbleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, marginLeft: 2 },
    username: { fontWeight: '800', fontSize: 14, color: '#2D3E5E', marginRight: 8 },
    time: { fontSize: 11, color: '#8391A1', fontWeight: '600' },

    bubbleRow: { flexDirection: 'row', alignItems: 'center' },
    bubble: {
        backgroundColor: '#F1F4F9', // Light Gray-Blue
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 18,
        borderTopLeftRadius: 4, // Chat bubble tail effect
        maxWidth: '90%',
    },
    myBubble: {
        backgroundColor: '#FDF2F3', // Light Red for current user
        borderTopLeftRadius: 18,
        borderTopRightRadius: 4,
    },
    commentText: { fontSize: 14, color: '#4A5568', lineHeight: 20, fontWeight: '500' },
    myCommentText: { color: '#8A1C27' },

    deleteBtn: { padding: 8, marginLeft: 5 },

    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    input: {
        flex: 1,
        backgroundColor: '#F1F4F9',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingTop: 14, // Padding top/bottom required for multiline to look centered
        paddingBottom: 14,
        marginRight: 12,
        fontSize: 14,
        color: '#2D3E5E',
        maxHeight: 100, // Prevents input from growing too large
    },
    postBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E2E8F0', // Disabled state
        justifyContent: 'center',
        alignItems: 'center',
    },
    postBtnActive: {
        backgroundColor: '#8A1C27', // Brand Red when active
        shadowColor: '#8A1C27',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    }
});

export default CommentsModal;