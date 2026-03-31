import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    Image, KeyboardAvoidingView, Platform, Modal, Dimensions, Alert, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import ProfilePopup from '../common/ProfilePopup';
import { fetchMessages, sendMessage, markConversationRead } from '../../store/slices/chatsSlice';

const { width, height } = Dimensions.get('window');

const ChattingScreenContent = ({ userName }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { userType, chatId, conversationId, vendorId } = useLocalSearchParams();
    const convId = conversationId || chatId;
    const flatListRef = useRef();

    const { user } = useSelector((state) => state.auth);
    const { messages: allMessages, sending } = useSelector((state) => state.chats);
    const messages = (allMessages[convId] || []);

    const [message, setMessage] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [pendingMedia, setPendingMedia] = useState(null);
    const [previewMedia, setPreviewMedia] = useState(null);
    const [isProfileVisible, setProfileVisible] = useState(false);

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

    // --- BACK ---
    const handleBackPress = () => router.back();

    // --- LOGIC: DYNAMIC PRESENCE TRACKING ---
    const [lastSeenTimestamp] = useState(new Date().getTime() - 1000 * 60 * 2);

    const onlineStatus = useMemo(() => {
        const now = new Date().getTime();
        const diffInMinutes = Math.floor((now - lastSeenTimestamp) / (1000 * 60));
        if (diffInMinutes < 5) return { text: 'Active Now', color: '#22C55E' };
        return { text: `Last seen ${diffInMinutes}m ago`, color: '#94A3B8' };
    }, [lastSeenTimestamp]);

    const handleHeaderPress = () => {
        if (userType === 'vendor') {
            router.push({ pathname: '/customer/VendorProfCust', params: { vendorName: userName } });
        } else {
            setProfileVisible(true);
        }
    };

    const pickMedia = async (type) => {
        setShowMenu(false);
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Error', 'Gallery access required');
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true, quality: 0.8,
        });
        if (!result.canceled) setPendingMedia({ uri: result.assets[0].uri, type: result.assets[0].type });
    };

    const handleSend = () => {
        if (!message.trim() && !pendingMedia) return;
        if (!convId) return;
        dispatch(sendMessage({
            conversationId: convId,
            messageText: message.trim(),
            messageType: pendingMedia?.type || 'text',
            mediaUrl: pendingMedia?.uri || null,
        }));
        setMessage('');
        setPendingMedia(null);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const renderMessage = ({ item }) => {
        // API uses senderId; local optimistic uses sender:'me'
        const isMe = item.sender === 'me' || (user && String(item.senderId) === String(user.id));
        const msgText = item.text || item.content || '';
        const msgType = item.type || (item.mediaUrl ? 'image' : 'text');
        const mediaUri = item.uri || item.mediaUrl;
        const timeStr = item.time || (item.sentAt ? new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
        return (
            <View style={[styles.msgWrapper, isMe ? styles.myMsgWrapper : styles.otherMsgWrapper]}>
                <Text style={[styles.timeText, isMe ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]}>{timeStr}</Text>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => (msgType !== 'text' ? setPreviewMedia(item) : null)}
                    style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble, msgType !== 'text' && styles.mediaBubble]}
                >
                    {msgType === 'image' && mediaUri && <Image source={{ uri: mediaUri }} style={styles.chatImage} />}
                    {msgType === 'video' && mediaUri && (
                        <View style={styles.videoPlaceholder}>
                            <Video source={{ uri: mediaUri }} style={styles.chatImage} resizeMode="cover" shouldPlay={false} />
                            <View style={styles.playIconOverlay}><Ionicons name="play" size={40} color="white" /></View>
                        </View>
                    )}
                    {msgText !== '' && <Text style={[styles.msgText, isMe ? styles.myText : styles.otherText]}>{msgText}</Text>}
                </TouchableOpacity>
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
                <TouchableOpacity style={styles.headerInfo} onPress={handleHeaderPress} activeOpacity={0.7}>
                    <Image source={require('../../../assets/images/gorg-icon.png')} style={styles.headerAvatar} />
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
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatFeed}
                    showsVerticalScrollIndicator={false}
                />
                <View style={styles.inputArea}>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setShowMenu(!showMenu)}>
                        <Ionicons name={showMenu ? "close-circle" : "add-circle"} size={34} color={showMenu ? "#8A1C27" : "#5B7896"} />
                    </TouchableOpacity>
                    <View style={styles.inputWrapper}>
                        <TextInput style={styles.input} placeholder="Message..." value={message} onChangeText={setMessage} multiline />
                    </View>
                    <TouchableOpacity
                        style={[styles.sendBtn, (message.trim() || pendingMedia) ? styles.sendBtnActive : styles.sendBtnDisabled]}
                        onPress={handleSend}
                    >
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <ProfilePopup visible={isProfileVisible} onClose={() => setProfileVisible(false)} userName={userName} carName="Mercedes E-Class (2025)" profileImage={require('../../../assets/images/gorg-icon.png')} bannerImage={require('../../../assets/images/toyotaback-photo.png')} />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#F8FAFC' },
    container: { flex: 1 },
    header: { height: 110, backgroundColor: '#5B7896', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 45, justifyContent: 'space-between', elevation: 10 },
    headerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 10 },
    headerAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF' },
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
    msgText: { fontSize: 16, fontWeight: '500', lineHeight: 22 },
    myText: { color: '#FFFFFF' },
    otherText: { color: '#1E293B' },
    timeText: { fontSize: 10, color: '#94A3B8', marginBottom: 5, fontWeight: '600', paddingHorizontal: 5 },
    inputArea: { flexDirection: 'row', paddingHorizontal: 10, paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 35 : 15, backgroundColor: '#FFFFFF', alignItems: 'flex-end', elevation: 20 },
    inputWrapper: { flex: 1, backgroundColor: '#F1F4F9', borderRadius: 25, marginHorizontal: 8, minHeight: 48, justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    input: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, fontSize: 16, color: '#1E293B' },
    sendBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    sendBtnActive: { backgroundColor: '#8A1C27' },
    sendBtnDisabled: { backgroundColor: '#E2E8F0' },
});

export default ChattingScreenContent;