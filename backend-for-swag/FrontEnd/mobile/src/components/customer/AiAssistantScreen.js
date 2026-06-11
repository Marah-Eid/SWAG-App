import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, Dimensions, Alert, StatusBar,
    ActivityIndicator, Modal, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAssistantConversations,
    createAssistantConversation,
    fetchAssistantMessages,
    sendAssistantMessage,
    deleteAssistantConversation,
} from '../../store/slices/assistantSlice';
import { formatChatTime } from '../../utils/timeUtils';

const CAR_ICON = require('../../../assets/images/carprof-icon.png');

const VehicleCard = ({ vehicle, vin }) => {
    if (!vehicle?.make) return null;
    return (
        <View style={styles.vehicleCard}>
            <Image source={CAR_ICON} style={styles.vehicleCardIcon} />
            <View style={{ flex: 1 }}>
                <Text style={styles.vehicleTitle}>{vehicle.year} {vehicle.make} {vehicle.model}</Text>
                {vehicle.trim ? <Text style={styles.vehicleSub}>{vehicle.trim}</Text> : null}
            </View>
            {vin ? <Text style={styles.vinBadge}>{vin}</Text> : null}
        </View>
    );
};

const AiAssistantScreen = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { conversations, messages, loadingConversations, sending } = useSelector(s => s.assistant);

    const [view, setView] = useState('list');
    const [activeConvId, setActiveConvId] = useState(null);
    const [inputText, setInputText] = useState('');
    const [vinInput, setVinInput] = useState('');
    const [vinModalVisible, setVinModalVisible] = useState(false);
    const [creatingConv, setCreatingConv] = useState(false);
    const [vinError, setVinError] = useState('');
    const flatListRef = useRef();

    useEffect(() => {
        dispatch(fetchAssistantConversations());
    }, []);

    const activeConv = conversations.find(c => c.id === activeConvId);
    const activeMessages = messages[activeConvId] || [];

    const openConversation = useCallback((convId) => {
        setActiveConvId(convId);
        setView('chat');
        dispatch(fetchAssistantMessages(convId));
    }, [dispatch]);

    useEffect(() => {
        if (activeMessages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 150);
        }
    }, [activeMessages.length]);

    const handleNewChat = () => {
        setVinInput('');
        setVinError('');
        setVinModalVisible(true);
    };

    const handleCreateConversation = async () => {
        const vin = vinInput.trim().toUpperCase();
        if (vin.length !== 17) {
            setVinError('VIN must be exactly 17 characters.');
            return;
        }
        setVinError('');
        setCreatingConv(true);
        const result = await dispatch(createAssistantConversation(vin));
        setCreatingConv(false);
        setVinModalVisible(false);
        if (result.meta.requestStatus === 'fulfilled') {
            openConversation(result.payload.id);
        } else {
            Alert.alert('Error', result.payload || 'Could not create conversation. Check your VIN and try again.');
        }
    };

    const handleSend = () => {
        if (!inputText.trim() || sending || !activeConvId) return;
        dispatch(sendAssistantMessage({ conversationId: activeConvId, message: inputText.trim() }));
        setInputText('');
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    };

    const handleDeleteConversation = (convId, title) => {
        Alert.alert('Delete Chat', `Delete "${title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: () => dispatch(deleteAssistantConversation(convId)),
            },
        ]);
    };

    const renderConversationItem = ({ item }) => (
        <TouchableOpacity
            style={styles.convItem}
            onPress={() => openConversation(item.id)}
            activeOpacity={0.75}
        >
            <View style={styles.convIconWrap}>
                <Image source={CAR_ICON} style={styles.convIcon} />
            </View>
            <View style={styles.convInfo}>
                <Text style={styles.convTitle} numberOfLines={1}>{item.title}</Text>
                {item.lastMessage ? (
                    <Text style={styles.convPreview} numberOfLines={2}>{item.lastMessage}</Text>
                ) : null}
                <Text style={styles.convDate}>{formatChatTime(item.updatedAt)}</Text>
            </View>
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteConversation(item.id, item.title)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="trash-outline" size={18} color="#CBD5E1" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderMessage = ({ item }) => {
        const isMe = item.role === 'user';
        return (
            <View style={[styles.msgWrapper, isMe ? styles.myMsgWrapper : styles.otherMsgWrapper]}>
                {!isMe && (
                    <View style={styles.botAvatar}>
                        <Image source={CAR_ICON} style={styles.botAvatarImg} />
                    </View>
                )}
                <View style={{ maxWidth: '80%' }}>
                    {!isMe && <Text style={styles.botLabel}>CarBot</Text>}
                    <Text style={[styles.timeText, isMe ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]}>
                        {formatChatTime(item.sentAt)}
                    </Text>
                    <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                        <Text style={[styles.msgText, isMe ? styles.myText : styles.otherText]}>{item.content}</Text>
                    </View>
                </View>
            </View>
        );
    };

    if (view === 'chat' && activeConv) {
        return (
            <View style={styles.mainContainer}>
                <StatusBar barStyle="light-content" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setView('list')} style={styles.headerIconBtn}>
                        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <View style={styles.headerBotIcon}>
                            <Image source={CAR_ICON} style={styles.headerCarImg} />
                        </View>
                        <View>
                            <Text style={styles.headerName} numberOfLines={1}>{activeConv.title}</Text>
                            <Text style={styles.headerSub}>CarBot • AI Car Assistant</Text>
                        </View>
                    </View>
                </View>

                {activeConv.vehicle?.make ? (
                    <VehicleCard vehicle={activeConv.vehicle} vin={activeConv.vin} />
                ) : null}

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.chatContainer}
                >
                    <FlatList
                        ref={flatListRef}
                        data={activeMessages}
                        renderItem={renderMessage}
                        keyExtractor={item => String(item.id)}
                        contentContainerStyle={styles.chatFeed}
                        showsVerticalScrollIndicator={false}
                    />

                    {sending && (
                        <View style={styles.typingBar}>
                            <ActivityIndicator size="small" color="#8A1C27" />
                            <Text style={styles.typingText}>CarBot is thinking...</Text>
                        </View>
                    )}

                    <View style={styles.inputArea}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ask about your car..."
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.sendBtn, inputText.trim() && !sending ? styles.sendBtnActive : styles.sendBtnDisabled]}
                            onPress={handleSend}
                            disabled={!inputText.trim() || sending}
                        >
                            <Ionicons name="send" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
                    <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <View style={styles.headerBotIcon}>
                        <Image source={CAR_ICON} style={styles.headerCarImg} />
                    </View>
                    <View>
                        <Text style={styles.headerName}>CarBot</Text>
                        <Text style={styles.headerSub}>VIN-powered car advisor</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.headerIconBtn} onPress={handleNewChat}>
                    <Ionicons name="add-circle-outline" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {loadingConversations ? (
                <View style={styles.centeredEmpty}>
                    <ActivityIndicator size="large" color="#8A1C27" />
                </View>
            ) : conversations.length === 0 ? (
                <View style={styles.centeredEmpty}>
                    <Image source={CAR_ICON} style={styles.emptyIcon} />
                    <Text style={styles.emptyTitle}>No conversations yet</Text>
                    <Text style={styles.emptySubtitle}>Tap + to start a new chat with your VIN</Text>
                    <TouchableOpacity style={styles.newChatBtn} onPress={handleNewChat}>
                        <Ionicons name="add" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.newChatBtnText}>New Chat</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderConversationItem}
                    keyExtractor={item => String(item.id)}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* VIN Modal with KeyboardAvoidingView so keyboard never covers the input */}
            <Modal visible={vinModalVisible} transparent animationType="slide" onRequestClose={() => setVinModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.vinModal}>
                        <View style={styles.vinModalHeader}>
                            <Text style={styles.vinModalTitle}>Enter Your VIN</Text>
                            <TouchableOpacity onPress={() => setVinModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.vinModalSub}>
                            Your 17-character Vehicle Identification Number is usually found on your dashboard or door jamb.
                        </Text>
                        <TextInput
                            style={[styles.vinInput, vinError ? styles.vinInputError : null]}
                            placeholder="e.g. 1HGBH41JXMN109186"
                            value={vinInput}
                            onChangeText={(t) => { setVinInput(t.toUpperCase()); setVinError(''); }}
                            maxLength={17}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            placeholderTextColor="#94A3B8"
                        />
                        <View style={styles.vinCounter}>
                            <Text style={[styles.vinCounterText, vinInput.length === 17 ? { color: '#22C55E' } : null]}>
                                {vinInput.length}/17
                            </Text>
                        </View>
                        {vinError ? <Text style={styles.vinErrorText}>{vinError}</Text> : null}
                        <TouchableOpacity
                            style={[styles.decodeBtn, (vinInput.length === 17 && !creatingConv) ? styles.decodeBtnActive : styles.decodeBtnDisabled]}
                            onPress={handleCreateConversation}
                            disabled={vinInput.length !== 17 || creatingConv}
                        >
                            {creatingConv ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="search" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.decodeBtnText}>Decode & Start Chat</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        height: 110,
        backgroundColor: '#5B7896',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 45,
        justifyContent: 'space-between',
        elevation: 10,
    },
    headerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 10 },
    headerBotIcon: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    headerCarImg: { width: 26, height: 26, resizeMode: 'contain' },
    headerName: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '500', marginTop: 1 },
    headerIconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

    vehicleCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FDF2F3', borderBottomWidth: 1, borderBottomColor: '#F5C6CB',
        paddingHorizontal: 18, paddingVertical: 10,
    },
    vehicleCardIcon: { width: 24, height: 24, resizeMode: 'contain', marginRight: 10, tintColor: '#8A1C27' },
    vehicleTitle: { fontSize: 14, fontWeight: '700', color: '#2D3E5E' },
    vehicleSub: { fontSize: 12, color: '#64748B', marginTop: 1 },
    vinBadge: {
        fontSize: 10, fontWeight: '700', color: '#8A1C27',
        backgroundColor: '#FDECEA', paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 8, overflow: 'hidden',
    },

    chatContainer: { flex: 1 },
    chatFeed: { padding: 15, paddingBottom: 30 },
    msgWrapper: { marginBottom: 20, flexDirection: 'row', alignItems: 'flex-end' },
    myMsgWrapper: { justifyContent: 'flex-end' },
    otherMsgWrapper: { justifyContent: 'flex-start' },
    botAvatar: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: '#FDF2F3', justifyContent: 'center', alignItems: 'center',
        marginRight: 8, borderWidth: 1.5, borderColor: '#F5C6CB',
    },
    botAvatarImg: { width: 20, height: 20, resizeMode: 'contain' },
    botLabel: { fontSize: 11, fontWeight: '700', color: '#8A1C27', marginBottom: 3, marginLeft: 2 },
    bubble: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12 },
    myBubble: { backgroundColor: '#8A1C27', borderBottomRightRadius: 4 },
    otherBubble: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        elevation: 1,
    },
    msgText: { fontSize: 15, fontWeight: '400', lineHeight: 23 },
    myText: { color: '#FFFFFF' },
    otherText: { color: '#1E293B' },
    timeText: { fontSize: 10, color: '#94A3B8', marginBottom: 4, fontWeight: '600', paddingHorizontal: 4 },

    typingBar: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 8,
        backgroundColor: '#F8FAFC', gap: 8,
    },
    typingText: { fontSize: 13, color: '#64748B', fontStyle: 'italic' },

    inputArea: {
        flexDirection: 'row', paddingHorizontal: 10,
        paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 35 : 14,
        backgroundColor: '#FFFFFF', alignItems: 'flex-end', elevation: 20,
    },
    inputWrapper: {
        flex: 1, backgroundColor: '#F1F4F9', borderRadius: 25, marginRight: 8,
        minHeight: 48, justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0',
    },
    input: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: '#1E293B' },
    sendBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    sendBtnActive: { backgroundColor: '#8A1C27' },
    sendBtnDisabled: { backgroundColor: '#E2E8F0' },

    listContent: { padding: 16 },
    convItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
        marginBottom: 12, elevation: 2,
    },
    convIconWrap: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: '#FDF2F3', justifyContent: 'center', alignItems: 'center',
        marginRight: 14, borderWidth: 1, borderColor: '#F5C6CB',
    },
    convIcon: { width: 28, height: 28, resizeMode: 'contain' },
    convInfo: { flex: 1 },
    convTitle: { fontSize: 15, fontWeight: '800', color: '#2D3E5E' },
    convPreview: { fontSize: 13, color: '#64748B', marginTop: 3, lineHeight: 18 },
    convDate: { fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: '600' },
    deleteBtn: { padding: 8 },

    centeredEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyIcon: { width: 80, height: 80, resizeMode: 'contain', opacity: 0.35 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#2D3E5E', marginTop: 20, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },
    newChatBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#8A1C27', borderRadius: 25, paddingHorizontal: 28, paddingVertical: 14,
        marginTop: 28, elevation: 4,
    },
    newChatBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    vinModal: {
        backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 28, paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    },
    vinModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    vinModalTitle: { fontSize: 22, fontWeight: '800', color: '#2D3E5E' },
    vinModalSub: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 20 },
    vinInput: {
        backgroundColor: '#F1F4F9', borderRadius: 16, height: 56,
        paddingHorizontal: 20, fontSize: 18, fontWeight: '700',
        color: '#2D3E5E', letterSpacing: 2,
        borderWidth: 1.5, borderColor: '#E2E8F0',
    },
    vinInputError: { borderColor: '#E53E3E', backgroundColor: '#FEF2F2' },
    vinCounter: { alignItems: 'flex-end', marginTop: 6 },
    vinCounterText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
    vinErrorText: { color: '#E53E3E', fontSize: 13, marginTop: 4, fontWeight: '600' },
    decodeBtn: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        borderRadius: 25, height: 56, marginTop: 20,
    },
    decodeBtnActive: { backgroundColor: '#8A1C27' },
    decodeBtnDisabled: { backgroundColor: '#CBD5E1' },
    decodeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});

export default AiAssistantScreen;
