import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, SafeAreaView,
  TouchableOpacity, Image, Alert, Dimensions, Platform, StatusBar, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import BottomTabs from '../common/BottomTabs';
import { fetchConversations } from '../../store/slices/chatsSlice';

const { width } = Dimensions.get('window');

const ChatRow = ({ userName, lastMessage, time, onPress, onLongPress, hasUnread }) => (
  <TouchableOpacity style={styles.rowContainer} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
    <View style={styles.avatarWrapper}>
      <View style={styles.avatarBorder}>
        <Image source={require('../../../assets/images/prof-icon.png')} style={styles.avatar} />
      </View>
      {hasUnread && <View style={styles.unreadBadge} />}
    </View>
    <View style={styles.rowContent}>
      <View style={styles.rowTop}>
        <Text style={styles.userNameText} numberOfLines={1}>{userName}</Text>
        <Text style={[styles.timeText, hasUnread && styles.unreadTimeText]}>{time}</Text>
      </View>
      <View style={styles.rowBottom}>
        <Text style={[styles.messageText, hasUnread && styles.unreadMessageText]} numberOfLines={1}>{lastMessage}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function ChatsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useLocalSearchParams();
  const [search, setSearch] = useState('');

  const { conversations, loading } = useSelector((state) => state.chats);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const filteredData = useMemo(() => {
    return conversations.filter(item =>
      (item.otherUserName || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  const openChat = (item) => {
    router.push({
      pathname: '/commonScreens/Chatting',
      params: {
        userName: item.otherUserName,
        userType: item.otherUserType,
        chatId: item.id,
        conversationId: item.id,
      }
    });
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={28} color="white" /></TouchableOpacity>
              <Text style={styles.headerTitle}>Messages</Text>
              <TouchableOpacity onPress={() => setChatData([])}><Text style={styles.clearText}>Clear</Text></TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#8391A1" />
              <TextInput style={styles.searchInput} placeholder="Search..." value={search} onChangeText={setSearch} />
            </View>
          </View>
        </SafeAreaView>
      </View>

      {loading && conversations.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#5B7896" />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listPadding}
          renderItem={({ item }) => (
            <ChatRow
              userName={item.otherUserName || 'Unknown'}
              lastMessage={item.lastMessage || ''}
              time={item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              hasUnread={(item.unreadCount || 0) > 0}
              onPress={() => openChat(item)}
            />
          )}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="chatbubbles-outline" size={60} color="#8391A1" />
              <Text style={{ color: '#8391A1', marginTop: 10, fontWeight: '600' }}>No conversations yet</Text>
            </View>
          }
        />
      )}
      <View style={styles.footerWrapper}><BottomTabs /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#AFC6D8' },
  headerBackground: { backgroundColor: '#5B7896', borderBottomLeftRadius: 35, borderBottomRightRadius: 35, zIndex: 10 },
  headerContent: { paddingHorizontal: 20, paddingBottom: 25 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 15 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: '800' },
  clearText: { color: 'white', fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 25, paddingHorizontal: 18, height: 50 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15 },
  listPadding: { paddingBottom: 120, paddingTop: 10 },
  rowContainer: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center', backgroundColor: 'white', marginBottom: 1 },
  avatarWrapper: { position: 'relative' },
  avatarBorder: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#F1F4F9', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  unreadBadge: { position: 'absolute', right: 2, top: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#8A1C27', borderWidth: 2, borderColor: 'white' },
  rowContent: { flex: 1, marginLeft: 16 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  userNameText: { fontSize: 16, fontWeight: '800', color: '#2D3E5E' },
  timeText: { fontSize: 12, color: '#A0AEC0' },
  unreadTimeText: { color: '#8A1C27' },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messageText: { fontSize: 14, color: '#718096', flex: 1 },
  unreadMessageText: { color: '#2D3E5E', fontWeight: '700' },
  footerWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 }
});