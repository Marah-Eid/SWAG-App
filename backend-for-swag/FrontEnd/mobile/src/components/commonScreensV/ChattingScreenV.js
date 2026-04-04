import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    Image, KeyboardAvoidingView, Platform, Dimensions, Alert, StatusBar, ActivityIndicator, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system/next';
import { Video } from 'expo-av';
import ProfilePopupV from '../commonV/ProfilePopupV';
import InitialsAvatar from '../common/InitialsAvatar';
import { supabase } from '../../services/supabase';
import { fetchMessages, sendMessage, markConversationRead } from '../../store/slices/chatsSlice';

const { width, height } = Dimensions.get('window');

const ChattingScreenV = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { userName = "User", userType = "customer", chatId, conversationId, userImage } = useLocalSearchParams();
    const convId = conversationId || chatId;
    const flatListRef = useRef();

    const { user } = useSelector((state) => state.auth);
    const { messages: allMessages } = useSelector((state) => state.chats);
    const messages = allMessages[convId] || [];

    const [message, setMessage] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [pendingMedia, setPendingMedia] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isProfileVisible, setProfileVisible] = useState(false);
    const [previewMedia, setPreviewMedia] = useState(null);

    const cleanUserImage = (userImage && userImage !== 'undefined' && userImage !== 'null' && userImage !== '') ? userImage : null;

    useEffect(() => {
        if (convId) {
            dispatch(fetchMessages({ conversationId: convId }));
            dispatch(markConversationRead(convId));
        }
    }, [convId, dispatch]);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
        }
    }, [messages.length]);

    const handleBackPress = () => router.back();

    const [lastSeenTimestamp] = useState(new Date().getTime() - 1000 * 60 * 3);
    const onlineStatus = useMemo(() => {
        const now = new Date().getTime();
        const diffInMinutes = Math.floor((now - lastSeenTimestamp) / (1000 * 60));
        if (diffInMinutes < 5) return { text: 'Active Now', color: '#22C55E' };
        return { text: `Last seen ${diffInMinutes}m ago`, color: '#94A3B8' };
    }, [lastSeenTimestamp]);

    const handleProfilePress = () => {
        if (userType === 'vendor') {
            router.push({ pathname: '/commonScreensV/otherVendorProfile', params: { userName: userName } });
        } else {
            setProfileVisible(true);
        }
    };

    const pickMedia = async (type) => {
        setShowMenu(false);
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permission Required', 'Gallery access is needed to send media.');
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true, quality: 0.8,
            });
            if (!result.canceled && result.assets?.[0]) {
                setPendingMedia({ uri: result.assets[0].uri, type });
            }
        } catch (err) {
            Alert.alert('Error', 'Could not pick media.');
        }
    };

    const uploadMedia = async (localUri, mediaType) => {
        const ext = mediaType === 'video' ? 'mp4' : 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const contentType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';

        const file = new File(localUri);
        const base64 = await file.base64();
        const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

        console.log('Uploading to chat-media bucket, file:', fileName, 'size:', byteArray.length);

        const { data: uploadData, error } = await supabase.storage
            .from('chat-media')
            .upload(fileName, byteArray, { contentType, upsert: true });

        if (error) {
            console.error('Supabase upload error:', JSON.stringify(error));
            throw error;
        }

        console.log('Upload success:', uploadData);
        const { data } = supabase.storage.from('chat-media').getPublicUrl(fileName);
        return data.publicUrl;
    };

    const handleSend = async () => {
        if (!message.trim() && !pendingMedia) return;
        if (!convId) return;

        let mediaUrl = null;
        let messageType = 'text';

        if (pendingMedia) {
            setUploading(true);
            try {
                mediaUrl = await uploadMedia(pendingMedia.uri, pendingMedia.type);
                messageType = pendingMedia.type;
            } catch (err) {
                setUploading(false);
                console.error('Media upload failed:', err);
                Alert.alert('Upload Failed', err?.message || 'Could not upload media. Please try again.');
                return;
            }
            setUploading(false);
        }

        dispatch(sendMessage({
            conversationId: convId,
            messageText: message.trim() || (messageType === 'image' ? '' : ''),
            messageType,
            mediaUrl,
        }));
        setMessage('');
        setPendingMedia(null);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    };

    const renderMessage = ({ item }) => {
        const isMe = item.isMine === true || (user && String(item.senderId) === String(user.id));
        const msgText = item.messageText || '';
        const msgType = item.messageType || 'text';
        const mediaUri = item.mediaUrl || null;
        const timeStr = item.sentAt
            ? new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';

        return (
            <View style={[styles.msgWrapper, isMe ? styles.myMsgWrapper : styles.otherMsgWrapper]}>
                <Text style={[styles.timeText, isMe ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]}>{timeStr}</Text>
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble, msgType !== 'text' && styles.mediaBubble]}>
                    {msgType === 'image' && mediaUri ? (
                        <TouchableOpacity activeOpacity={0.85} onPress={() => setPreviewMedia({ uri: mediaUri, type: 'image' })}>
                            <Image source={{ uri: mediaUri }} style={styles.chatImage} resizeMode="cover" />
                        </TouchableOpacity>
                    ) : null}
                    {msgType === 'video' && mediaUri ? (
                        <TouchableOpacity activeOpacity={0.85} onPress={() => setPreviewMedia({ uri: mediaUri, type: 'video' })} style={styles.videoPlaceholder}>
                            <Image source={{ uri: mediaUri }} style={styles.chatImage} resizeMode="cover" />
                            <View style={styles.playIconOverlay}><Ionicons name="play-circle" size={56} color="white" /></View>
                        </TouchableOpacity>
                    ) : null}
                    {msgText !== '' && <Text style={[styles.msgText, isMe ? styles.myText : styles.otherText]}>{msgText}</Text>}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.headerIconBtn}>
                    <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerInfo} onPress={handleProfilePress} activeOpacity={0.7}>
                    <View style={styles.headerAvatarWrap}>
                        <InitialsAvatar name={userName} imageUri={cleanUserImage} size={44} />
                    </View>
                    <View>
                        <Text style={styles.headerName}>{userName}</Text>
                        <View style={styles.onlineRow}>
                            <View style={[styles.onlineDot, { backgroundColor: onlineStatus.color }]} />
                            <Text style={styles.onlineText}>{onlineStatus.text}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerIconBtn}>
                    <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => String(item.id)}
                    contentContainerStyle={styles.chatFeed}
                    showsVerticalScrollIndicator={false}
                />

                {showMenu && (
                    <View style={styles.mediaMenu}>
                        <TouchableOpacity style={styles.mediaOption} onPress={() => pickMedia('image')}>
                            <Ionicons name="image-outline" size={26} color="#5B7896" />
                            <Text style={styles.mediaOptionText}>Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.mediaOption} onPress={() => pickMedia('video')}>
                            <Ionicons name="videocam-outline" size={26} color="#5B7896" />
                            <Text style={styles.mediaOptionText}>Video</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {pendingMedia && (
                    <View style={styles.pendingMediaBar}>
                        <Image source={{ uri: pendingMedia.uri }} style={styles.pendingMediaThumb} />
                        <Text style={styles.pendingMediaText}>{pendingMedia.type === 'video' ? 'Video' : 'Photo'} ready to send</Text>
                        <TouchableOpacity onPress={() => setPendingMedia(null)}>
                            <Ionicons name="close-circle" size={24} color="#E53E3E" />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.inputArea}>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setShowMenu(!showMenu)}>
                        <Ionicons name={showMenu ? "close-circle" : "add-circle"} size={34} color={showMenu ? "#8A1C27" : "#5B7896"} />
                    </TouchableOpacity>
                    <View style={styles.inputWrapper}>
                        <TextInput style={styles.input} placeholder="Message..." value={message} onChangeText={setMessage} multiline />
                    </View>
                    <TouchableOpacity
                        style={[styles.sendBtn, (message.trim() || pendingMedia) && !uploading ? styles.sendBtnActive : styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Ionicons name="send" size={20} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Fullscreen media preview modal */}
            <Modal visible={!!previewMedia} transparent animationType="fade" onRequestClose={() => setPreviewMedia(null)}>
                <View style={styles.previewOverlay}>
                    <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewMedia(null)}>
                        <Ionicons name="close-circle" size={40} color="white" />
                    </TouchableOpacity>
                    {previewMedia?.type === 'image' && (
                        <Image source={{ uri: previewMedia.uri }} style={styles.previewImage} resizeMode="contain" />
                    )}
                    {previewMedia?.type === 'video' && (
                        <Video
                            source={{ uri: previewMedia.uri }}
                            style={styles.previewVideo}
                            resizeMode="contain"
                            useNativeControls
                            shouldPlay
                        />
                    )}
                </View>
            </Modal>

            <ProfilePopupV visible={isProfileVisible} onClose={() => setProfileVisible(false)} userName={userName} carName="" profileImage={cleanUserImage ? { uri: cleanUserImage } : require('../../../assets/images/prof-icon.png')} bannerImage={require('../../../assets/images/swag-pattern.png')} />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#F8FAFC' },
    container: { flex: 1 },
    header: { height: 110, backgroundColor: '#5B7896', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 45, justifyContent: 'space-between', elevation: 10 },
    headerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 10 },
    headerAvatarWrap: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF', overflow: 'hidden' },
    headerName: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginLeft: 12 },
    onlineRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 12, marginTop: 2 },
    onlineDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
    onlineText: { color: '#E2E8F0', fontSize: 11, fontWeight: '600' },
    headerIconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    chatFeed: { padding: 15, paddingBottom: 40 },
    msgWrapper: { marginBottom: 20, maxWidth: '85%' },
    myMsgWrapper: { alignSelf: 'flex-end' },
    otherMsgWrapper: { alignSelf: 'flex-start' },
    bubble: { padding: 14, borderRadius: 20 },
    myBubble: { backgroundColor: '#8A1C27', borderBottomRightRadius: 2 },
    otherBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 2, elevation: 2 },
    mediaBubble: { padding: 4, overflow: 'hidden' },
    msgText: { fontSize: 16, fontWeight: '500', lineHeight: 22 },
    myText: { color: '#FFFFFF' },
    otherText: { color: '#1E293B' },
    timeText: { fontSize: 10, color: '#94A3B8', marginBottom: 5, fontWeight: '600', paddingHorizontal: 5 },
    chatImage: { width: 220, height: 180, borderRadius: 16 },
    videoPlaceholder: { position: 'relative' },
    playIconOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16 },
    mediaMenu: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', gap: 20 },
    mediaOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F4F9', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, gap: 8 },
    mediaOptionText: { fontSize: 14, fontWeight: '700', color: '#2D3E5E' },
    pendingMediaBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F4F9', paddingHorizontal: 15, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#E2E8F0', gap: 12 },
    pendingMediaThumb: { width: 48, height: 48, borderRadius: 8 },
    pendingMediaText: { flex: 1, fontSize: 13, color: '#2D3E5E', fontWeight: '600' },
    inputArea: { flexDirection: 'row', paddingHorizontal: 10, paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 35 : 15, backgroundColor: '#FFFFFF', alignItems: 'flex-end', elevation: 20 },
    inputWrapper: { flex: 1, backgroundColor: '#F1F4F9', borderRadius: 25, marginHorizontal: 8, minHeight: 48, justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    input: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, fontSize: 16, color: '#1E293B' },
    sendBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    sendBtnActive: { backgroundColor: '#8A1C27' },
    sendBtnDisabled: { backgroundColor: '#E2E8F0' },

    // Fullscreen media preview
    previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
    previewClose: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
    previewImage: { width: width, height: height * 0.75 },
    previewVideo: { width: width, height: height * 0.75 },
});

export default ChattingScreenV;
