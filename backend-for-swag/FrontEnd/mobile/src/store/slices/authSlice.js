import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authAPI from '../../api/authAPI';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await authAPI.login(credentials);
      if (result.success) {
        // Save token and user data
        await AsyncStorage.setItem('userToken', result.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(result.data.user));
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const result = await authAPI.register(userData);
      if (result.success) {
        // Save token and user data
        await AsyncStorage.setItem('userToken', result.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(result.data.user));
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    const result = await authAPI.changePassword(currentPassword, newPassword);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const sendChangeContactOtp = createAsyncThunk(
  'auth/sendChangeContactOtp',
  async (newContact, { rejectWithValue }) => {
    const result = await authAPI.sendChangeContactOtp(newContact);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const changeContact = createAsyncThunk(
  'auth/changeContact',
  async ({ newContact, code }, { rejectWithValue }) => {
    const result = await authAPI.changeContact(newContact, code);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        try {
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          if (Date.now() >= payload.exp * 1000) {
            await AsyncStorage.multiRemove(['userToken', 'userData']);
            return null;
          }
        } catch {
          await AsyncStorage.multiRemove(['userToken', 'userData']);
          return null;
        }
        return {
          token,
          user: JSON.parse(userData),
        };
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  rememberMe: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Check auth status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      });
  },
});

export const { clearError, setRememberMe } = authSlice.actions;
export default authSlice.reducer;