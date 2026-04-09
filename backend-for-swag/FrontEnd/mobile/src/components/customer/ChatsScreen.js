import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Dimensions, StatusBar, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import BottomTabs from '../common/BottomTabs';
import InitialsAvatar from '../common/InitialsAvatar';
import { fetchConversations, searchUsers, startConversation, deleteConversation, clearSearchResults } from '../../store/slices/chatsSlice';

const { width } = Dimensions.get('window');

const ChatRow = ({ userName, lastMessage, time, avatar, onPress, onLongPress, hasUnread }) => (
  <TouchableOpacity style={styles.rowContainer} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
    <View style={styles.avatarWrapper}>
      <View style={styles.avatarBorder}>
        <InitialsAvatar name={userName} imageUri={avatar} size={60} />
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

const SearchResultRow = ({ item, onPress }) => (
  <TouchableOpacity style={styles.searchRow} onPress={onPress} activeOpacity={0.7}>
    <InitialsAvatar name={item.name} imageUri={item.profileImage} size={48} />
    <View style={styles.searchRowInfo}>
      <Text style={styles.searchRowName}>{item.name}</Text>
      <Text style={styles.searchRowType}>{item.userType}</Text>
    </View>
    <Ionicons name="chatbubble-outline" size={20} color="#5B7896" />
  </TouchableOpacity>
);

export default function ChatsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  const { conversations, loading, searchResults, searching } = useSelector((state) => state.chats);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Debounced user search
  useEffect(() => {
    if (!isSearchMode || search.trim().length < 2) {
      dispatch(clearSearchResults());
      return;
    }
    const timer = setTimeout(() => {
      dispatch(searchUsers(search.trim()));
    }, 400);
    return () => clearTimeout(timer);
  }, [search, isSearchMode, dispatch]);

  const filteredConversations = useMemo(() => {
    if (!search.trim() || isSearchMode) return conversations;
    return conversations.filter(item =>
      (item.otherParticipantName || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search, isSearchMode]);

  const openChat = (item) => {
    router.push({
      pathname: '/commonScreens/Chatting',
      params: {
        userName: item.otherParticipantName,
        userType: item.otherParticipantType,
        userImage: item.otherParticipantImage || '',
        otherUserId: item.otherParticipantId,
        chatId: item.id,
        conversationId: item.id,
      }
    });
  };

  const openSearchResult = async (user) => {
    const result = await dispatch(startConversation({
      otherUserId: user.id,
      otherUserType: user.userType,
    })).unwrap();

    setSearch('');
    setIsSearchMode(false);
    dispatch(clearSearchResults());

    router.push({
      pathname: '/commonScreens/Chatting',
      params: {
        userName: user.name,
        userType: user.userType.toLowerCase(),
        userImage: user.profileImage || '',
        otherUserId: user.id,
        conversationId: result.conversationId,
        chatId: result.conversationId,
      }
    });
  };

  const handleDeleteChat = (item) => {
    Alert.alert(
      'Delete Chat',
      `Delete conversation with ${item.otherParticipantName || 'this user'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteConversation(item.id)).unwrap();
            } catch (err) {
              Alert.alert('Error', err || 'Failed to delete conversation');
            }
          }
        },
      ]
    );
  };

  const handleSearchFocus = () => setIsSearchMode(true);
  const handleSearchCancel = () => {
    setSearch('');
    setIsSearchMode(false);
    dispatch(clearSearchResults());
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Messages</Text>
              {isSearchMode ? (
                <TouchableOpacity onPress={handleSearchCancel}>
                  <Text style={styles.clearText}>Cancel</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ width: 50 }} />
              )}
            </View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#8391A1" />
              <TextInput
                style={styles.searchInput}
                placeholder={isSearchMode ? "Search users by name..." : "Search conversations..."}
                placeholderTextColor="#A0AEC0"
                value={search}
                onChangeText={setSearch}
                onFocus={handleSearchFocus}
              />
              {isSearchMode && (
                <TouchableOpacity onPress={() => setIsSearchMode(false)} style={styles.modeToggle}>
                  <Ionicons name="people-outline" size={18} color="#5B7896" />
                </TouchableOpacity>
              )}
              {!isSearchMode && (
                <TouchableOpacity onPress={() => setIsSearchMode(true)} style={styles.modeToggle}>
                  <Ionicons name="person-add-outline" size={18} color="#5B7896" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Search Results */}
      {isSearchMode && search.trim().length >= 2 ? (
        <View style={{ flex: 1 }}>
          {searching ? (
            <View style={styles.centeredState}>
              <ActivityIndicator size="large" color="#5B7896" />
              <Text style={styles.stateText}>Searching...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => `${item.userType}-${item.id}`}
              contentContainerStyle={styles.listPadding}
              renderItem={({ item }) => (
                <SearchResultRow item={item} onPress={() => openSearchResult(item)} />
              )}
            />
          ) : (
            <View style={styles.centeredState}>
              <Ionicons name="search-outline" size={50} color="#CBD5E1" />
              <Text style={styles.stateText}>No users found</Text>
              <Text style={styles.stateSubText}>Try a different name</Text>
            </View>
          )}
        </View>
      ) : isSearchMode && search.trim().length < 2 ? (
        <View style={styles.centeredState}>
          <Ionicons name="person-add-outline" size={50} color="#CBD5E1" />
          <Text style={styles.stateText}>Find someone to chat with</Text>
          <Text style={styles.stateSubText}>Type at least 2 characters to search</Text>
        </View>
      ) : (
        /* Conversation List */
        loading && conversations.length === 0 ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#5B7896" />
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <ChatRow
                userName={item.otherParticipantName || 'Unknown'}
                avatar={item.otherParticipantImage}
                lastMessage={item.lastMessage || 'No messages yet'}
                time={item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                hasUnread={(item.unreadCount || 0) > 0}
                onPress={() => openChat(item)}
                onLongPress={() => handleDeleteChat(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.centeredState}>
                <Ionicons name="chatbubbles-outline" size={60} color="#CBD5E1" />
                <Text style={styles.stateText}>No conversations yet</Text>
                <Text style={styles.stateSubText}>Tap the icon above to find someone to chat with</Text>
              </View>
            }
          />
        )
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
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#2D3E5E' },
  modeToggle: { padding: 8, backgroundColor: '#F1F4F9', borderRadius: 20 },
  listPadding: { paddingBottom: 120, paddingTop: 10 },
  rowContainer: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center', backgroundColor: 'white', marginBottom: 1 },
  avatarWrapper: { position: 'relative' },
  avatarBorder: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#F1F4F9', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  unreadBadge: { position: 'absolute', right: 2, top: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#8A1C27', borderWidth: 2, borderColor: 'white' },
  rowContent: { flex: 1, marginLeft: 16 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  userNameText: { fontSize: 16, fontWeight: '800', color: '#2D3E5E', flex: 1, marginRight: 8 },
  timeText: { fontSize: 12, color: '#A0AEC0' },
  unreadTimeText: { color: '#8A1C27' },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  messageText: { fontSize: 14, color: '#718096', flex: 1 },
  unreadMessageText: { color: '#2D3E5E', fontWeight: '700' },

  // Search results
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingVertical: 14, paddingHorizontal: 20, marginBottom: 1 },
  searchRowInfo: { flex: 1, marginLeft: 14 },
  searchRowName: { fontSize: 16, fontWeight: '700', color: '#2D3E5E' },
  searchRowType: { fontSize: 12, color: '#8391A1', marginTop: 2, textTransform: 'capitalize' },

  // Empty/loading states
  centeredState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  stateText: { color: '#2D3E5E', fontSize: 16, fontWeight: '700', marginTop: 12 },
  stateSubText: { color: '#8391A1', fontSize: 13, marginTop: 4 },

  footerWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 }
});
