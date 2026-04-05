import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationsAPI from '../../api/notificationsAPI';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (page = 1, { rejectWithValue }) => {
    const result = await notificationsAPI.getNotifications(page);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    const result = await notificationsAPI.markAsRead(id);
    if (result.success) return id;
    return rejectWithValue(result.error);
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    const result = await notificationsAPI.markAllAsRead();
    if (result.success) return true;
    return rejectWithValue(result.error);
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    const result = await notificationsAPI.deleteNotification(id);
    if (result.success) return id;
    return rejectWithValue(result.error);
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAll',
  async (_, { rejectWithValue }) => {
    const result = await notificationsAPI.clearAll();
    if (result.success) return true;
    return rejectWithValue(result.error);
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications || action.payload;
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notif = state.notifications.find(n => n.id === action.payload);
        if (notif && !notif.isRead) {
          notif.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notif = state.notifications.find(n => n.id === action.payload);
        if (notif && !notif.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      });
  },
});

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
