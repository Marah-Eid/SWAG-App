import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerAPI from '../../api/customerAPI';

export const fetchCustomerProfile = createAsyncThunk(
  'customer/fetchProfile',
  async (_, { rejectWithValue }) => {
    const result = await customerAPI.getProfile();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const updateCustomerProfile = createAsyncThunk(
  'customer/updateProfile',
  async (data, { rejectWithValue }) => {
    const result = await customerAPI.updateProfile(data);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const fetchInterests = createAsyncThunk(
  'customer/fetchInterests',
  async (_, { rejectWithValue }) => {
    const result = await customerAPI.getInterests();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const saveInterests = createAsyncThunk(
  'customer/saveInterests',
  async (itemIds, { rejectWithValue }) => {
    const result = await customerAPI.setInterests(itemIds);
    if (result.success) return itemIds;
    return rejectWithValue(result.error);
  }
);

export const fetchFollowing = createAsyncThunk(
  'customer/fetchFollowing',
  async (_, { rejectWithValue }) => {
    const result = await customerAPI.getFollowing();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const followVendor = createAsyncThunk(
  'customer/followVendor',
  async (vendorId, { rejectWithValue }) => {
    const result = await customerAPI.followVendor(vendorId);
    if (result.success) return vendorId;
    return rejectWithValue(result.error);
  }
);

export const unfollowVendor = createAsyncThunk(
  'customer/unfollowVendor',
  async (vendorId, { rejectWithValue }) => {
    const result = await customerAPI.unfollowVendor(vendorId);
    if (result.success) return vendorId;
    return rejectWithValue(result.error);
  }
);

export const fetchSavedPosts = createAsyncThunk(
  'customer/fetchSavedPosts',
  async (_, { rejectWithValue }) => {
    const result = await customerAPI.getSavedPosts();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

const customerSlice = createSlice({
  name: 'customer',
  initialState: {
    profile: null,
    interests: [],
    following: [],
    savedPosts: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCustomer: (state) => {
      state.profile = null;
      state.interests = [];
      state.following = [];
      state.savedPosts = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(fetchCustomerProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => { state.profile = action.payload; })
      .addCase(fetchInterests.fulfilled, (state, action) => { state.interests = action.payload; })
      .addCase(saveInterests.fulfilled, (state, action) => { state.interests = action.payload; })
      .addCase(fetchFollowing.fulfilled, (state, action) => { state.following = action.payload; })
      .addCase(fetchSavedPosts.fulfilled, (state, action) => { state.savedPosts = action.payload; });
  },
});

export const { clearCustomer } = customerSlice.actions;
export default customerSlice.reducer;
