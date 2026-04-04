import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatsAPI from '../../api/chatsAPI';

export const fetchConversations = createAsyncThunk(
  'chats/fetchConversations',
  async (_, { rejectWithValue }) => {
    const result = await chatsAPI.getConversations();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const startConversation = createAsyncThunk(
  'chats/startConversation',
  async ({ otherUserId, otherUserType }, { rejectWithValue }) => {
    const result = await chatsAPI.startConversation(otherUserId, otherUserType);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const fetchMessages = createAsyncThunk(
  'chats/fetchMessages',
  async ({ conversationId, page = 1 }, { rejectWithValue }) => {
    const result = await chatsAPI.getMessages(conversationId, page);
    if (result.success) return { conversationId, messages: result.data };
    return rejectWithValue(result.error);
  }
);

export const sendMessage = createAsyncThunk(
  'chats/sendMessage',
  async ({ conversationId, messageText, messageType = 'text', mediaUrl }, { rejectWithValue }) => {
    const result = await chatsAPI.sendMessage(conversationId, { messageText, messageType, mediaUrl });
    if (result.success) return { conversationId, message: result.data };
    return rejectWithValue(result.error);
  }
);

export const searchUsers = createAsyncThunk(
  'chats/searchUsers',
  async (query, { rejectWithValue }) => {
    const result = await chatsAPI.searchUsers(query);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const deleteConversation = createAsyncThunk(
  'chats/deleteConversation',
  async (conversationId, { rejectWithValue }) => {
    const result = await chatsAPI.deleteConversation(conversationId);
    if (result.success) return conversationId;
    return rejectWithValue(result.error);
  }
);

export const markConversationRead = createAsyncThunk(
  'chats/markRead',
  async (conversationId, { rejectWithValue }) => {
    const result = await chatsAPI.markAsRead(conversationId);
    if (result.success) return conversationId;
    return rejectWithValue(result.error);
  }
);

const chatsSlice = createSlice({
  name: 'chats',
  initialState: {
    conversations: [],
    messages: {},   // { [conversationId]: message[] }
    searchResults: [],
    searching: false,
    loading: false,
    sending: false,
    error: null,
  },
  reducers: {
    clearChats: (state) => {
      state.conversations = [];
      state.messages = {};
      state.searchResults = [];
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => { state.loading = true; })
      .addCase(fetchConversations.fulfilled, (state, action) => { state.loading = false; state.conversations = action.payload; })
      .addCase(fetchConversations.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(startConversation.fulfilled, (state, action) => {
        const exists = state.conversations.find(c => c.id === action.payload.id);
        if (!exists) state.conversations.unshift(action.payload);
      })
      .addCase(fetchMessages.pending, (state) => { state.loading = true; })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages[action.payload.conversationId] = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(sendMessage.pending, (state) => { state.sending = true; })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        const { conversationId, message } = action.payload;
        if (!state.messages[conversationId]) state.messages[conversationId] = [];
        state.messages[conversationId].push(message);
        // Update last message in conversation list
        const conv = state.conversations.find(c => c.id === conversationId);
        if (conv) {
          conv.lastMessage = message.messageText;
          conv.lastMessageTime = message.sentAt;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => { state.sending = false; state.error = action.payload; })
      .addCase(searchUsers.pending, (state) => { state.searching = true; })
      .addCase(searchUsers.fulfilled, (state, action) => { state.searching = false; state.searchResults = action.payload; })
      .addCase(searchUsers.rejected, (state) => { state.searching = false; state.searchResults = []; })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c.id !== action.payload);
        delete state.messages[action.payload];
      })
      .addCase(markConversationRead.fulfilled, (state, action) => {
        const conv = state.conversations.find(c => c.id === action.payload);
        if (conv) conv.unreadCount = 0;
      });
  },
});

export const { clearChats, clearSearchResults } = chatsSlice.actions;
export default chatsSlice.reducer;
