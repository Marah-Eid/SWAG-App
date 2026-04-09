import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vendorAPI from '../../api/vendorAPI';

export const fetchVendors = createAsyncThunk(
  'vendor/fetchVendors',
  async (params, { rejectWithValue }) => {
    const result = await vendorAPI.getVendors(params);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const fetchVendorById = createAsyncThunk(
  'vendor/fetchById',
  async (id, { rejectWithValue }) => {
    const result = await vendorAPI.getVendorById(id);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const fetchMyVendorProfile = createAsyncThunk(
  'vendor/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    const result = await vendorAPI.getMyProfile();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const updateMyVendorProfile = createAsyncThunk(
  'vendor/updateMyProfile',
  async (data, { rejectWithValue }) => {
    const result = await vendorAPI.updateMyProfile(data);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const fetchMyVendorCategories = createAsyncThunk(
  'vendor/fetchMyCategories',
  async (_, { rejectWithValue }) => {
    const result = await vendorAPI.getMyCategories();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const fetchVendorReviews = createAsyncThunk(
  'vendor/fetchReviews',
  async (id, { rejectWithValue }) => {
    const result = await vendorAPI.getVendorReviews(id);
    if (result.success) return result.data.reviews || result.data;
    return rejectWithValue(result.error);
  }
);

export const followVendor = createAsyncThunk(
  'vendor/followVendor',
  async (vendorId, { rejectWithValue }) => {
    const result = await vendorAPI.followVendor(vendorId);
    if (result.success) return vendorId;
    return rejectWithValue(result.error);
  }
);

export const unfollowVendor = createAsyncThunk(
  'vendor/unfollowVendor',
  async (vendorId, { rejectWithValue }) => {
    const result = await vendorAPI.unfollowVendor(vendorId);
    if (result.success) return vendorId;
    return rejectWithValue(result.error);
  }
);

export const fetchMyFollowing = createAsyncThunk(
  'vendor/fetchMyFollowing',
  async (_, { rejectWithValue }) => {
    const result = await vendorAPI.getMyFollowing();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const fetchVendorFollowers = createAsyncThunk(
  'vendor/fetchFollowers',
  async (vendorId, { rejectWithValue }) => {
    const result = await vendorAPI.getVendorFollowers(vendorId);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

const vendorSlice = createSlice({
  name: 'vendor',
  initialState: {
    vendors: [],
    selectedVendor: null,
    myProfile: null,
    myCategories: [],
    myFollowing: [],
    vendorFollowers: [],
    reviews: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearVendor: (state) => {
      state.myProfile = null;
      state.myCategories = [];
      state.myFollowing = [];
      state.vendorFollowers = [];
      state.error = null;
    },
    clearSelectedVendor: (state) => {
      state.selectedVendor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => { state.loading = true; })
      .addCase(fetchVendors.fulfilled, (state, action) => { state.loading = false; state.vendors = action.payload; })
      .addCase(fetchVendors.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchVendorById.fulfilled, (state, action) => { state.selectedVendor = action.payload; })
      .addCase(fetchMyVendorProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchMyVendorProfile.fulfilled, (state, action) => { state.loading = false; state.myProfile = action.payload; })
      .addCase(fetchMyVendorProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateMyVendorProfile.fulfilled, (state, action) => { state.myProfile = action.payload; })
      .addCase(fetchMyVendorCategories.fulfilled, (state, action) => { state.myCategories = action.payload; })
      .addCase(fetchVendorReviews.fulfilled, (state, action) => { state.reviews = Array.isArray(action.payload) ? action.payload : []; })
      .addCase(fetchMyFollowing.fulfilled, (state, action) => { state.myFollowing = action.payload; })
      .addCase(fetchVendorFollowers.fulfilled, (state, action) => { state.vendorFollowers = Array.isArray(action.payload) ? action.payload : []; });
  },
});

export const { clearVendor, clearSelectedVendor } = vendorSlice.actions;
export default vendorSlice.reducer;
