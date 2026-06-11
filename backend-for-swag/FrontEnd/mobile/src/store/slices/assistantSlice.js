import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import assistantAPI from '../../api/assistantAPI';

export const fetchAssistantConversations = createAsyncThunk(
  'assistant/fetchConversations',
  async (_, { rejectWithValue }) => {
    const result = await assistantAPI.getConversations();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const createAssistantConversation = createAsyncThunk(
  'assistant/createConversation',
  async (vin, { rejectWithValue }) => {
    const result = await assistantAPI.createConversation(vin);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const fetchAssistantMessages = createAsyncThunk(
  'assistant/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    const result = await assistantAPI.getMessages(conversationId);
    if (result.success) return { conversationId, messages: result.data };
    return rejectWithValue(result.error);
  }
);

export const sendAssistantMessage = createAsyncThunk(
  'assistant/sendMessage',
  async ({ conversationId, message }, { rejectWithValue }) => {
    const result = await assistantAPI.sendMessage(conversationId, message);
    if (result.success) return { conversationId, ...result.data };
    return rejectWithValue(result.error);
  }
);

export const deleteAssistantConversation = createAsyncThunk(
  'assistant/deleteConversation',
  async (conversationId, { rejectWithValue }) => {
    const result = await assistantAPI.deleteConversation(conversationId);
    if (result.success) return conversationId;
    return rejectWithValue(result.error);
  }
);

const assistantSlice = createSlice({
  name: 'assistant',
  initialState: {
    conversations: [],
    messages: {},
    loadingConversations: false,
    loadingMessages: {},
    sending: false,
    error: null,
  },
  reducers: {
    clearAssistantError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssistantConversations.pending, (state) => { state.loadingConversations = true; })
      .addCase(fetchAssistantConversations.fulfilled, (state, action) => {
        state.loadingConversations = false;
        state.conversations = action.payload;
      })
      .addCase(fetchAssistantConversations.rejected, (state, action) => {
        state.loadingConversations = false;
        state.error = action.payload;
      })

      .addCase(createAssistantConversation.fulfilled, (state, action) => {
        const conv = action.payload;
        state.conversations.unshift(conv);
        if (conv.messages?.length) {
          state.messages[conv.id] = conv.messages;
        }
      })

      .addCase(fetchAssistantMessages.pending, (state, action) => {
        state.loadingMessages[action.meta.arg] = true;
      })
      .addCase(fetchAssistantMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.loadingMessages[conversationId] = false;
        state.messages[conversationId] = messages;
      })
      .addCase(fetchAssistantMessages.rejected, (state, action) => {
        state.loadingMessages[action.meta.arg] = false;
      })

      .addCase(sendAssistantMessage.pending, (state) => { state.sending = true; })
      .addCase(sendAssistantMessage.fulfilled, (state, action) => {
        state.sending = false;
        const { conversationId, userMessage, assistantReply } = action.payload;
        const msgs = state.messages[conversationId] || [];
        state.messages[conversationId] = [...msgs, userMessage, assistantReply];
        const conv = state.conversations.find(c => c.id === conversationId);
        if (conv) conv.lastMessage = assistantReply.content;
      })
      .addCase(sendAssistantMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })

      .addCase(deleteAssistantConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c.id !== action.payload);
        delete state.messages[action.payload];
      });
  },
});

export const { clearAssistantError } = assistantSlice.actions;
export default assistantSlice.reducer;
