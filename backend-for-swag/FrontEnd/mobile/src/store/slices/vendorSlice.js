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
  async (vendorId, { getState, rejectWithValue }) => {
    const result = await vendorAPI.followVendor(vendorId);
    if (result.success) {
      // Grab vendor data from state so we can add it to myFollowing list
      const state = getState();
      const vendorData =
        state.vendor.selectedVendor && String(state.vendor.selectedVendor.id) === String(vendorId)
          ? state.vendor.selectedVendor
          : state.vendor.vendors.find((v) => String(v.id) === String(vendorId)) || null;
      return { vendorId, vendorData };
    }
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

export const fetchVendorFollowingById = createAsyncThunk(
  'vendor/fetchVendorFollowingById',
  async (vendorId, { rejectWithValue }) => {
    const result = await vendorAPI.getVendorFollowingById(vendorId);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const fetchSavedPosts = createAsyncThunk(
  'vendor/fetchSavedPosts',
  async (_, { rejectWithValue }) => {
    const result = await vendorAPI.getSavedPosts();
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
    viewedFollowing: [],
    vendorFollowers: [],
    savedPosts: [],
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
      .addCase(fetchVendorFollowingById.fulfilled, (state, action) => { state.viewedFollowing = action.payload; })
      .addCase(fetchVendorFollowers.fulfilled, (state, action) => { state.vendorFollowers = Array.isArray(action.payload) ? action.payload : []; })
      .addCase(fetchSavedPosts.fulfilled, (state, action) => { state.savedPosts = Array.isArray(action.payload) ? action.payload : []; })
      .addCase(followVendor.fulfilled, (state, action) => {
        const { vendorId, vendorData } = action.payload;
        // Update selectedVendor so the profile screen reflects it immediately
        if (state.selectedVendor && String(state.selectedVendor.id) === String(vendorId)) {
          state.selectedVendor.isFollowed = true;
          state.selectedVendor.followerCount = (state.selectedVendor.followerCount || 0) + 1;
        }
        // Update the vendor in the vendors list too
        const v = state.vendors.find((v) => String(v.id) === String(vendorId));
        if (v) {
          v.isFollowed = true;
          v.followerCount = (v.followerCount || 0) + 1;
        }
        // Add to myFollowing list if not already present
        const alreadyIn = state.myFollowing.some((v) => String(v.id) === String(vendorId));
        if (!alreadyIn && vendorData) {
          state.myFollowing.push({ ...vendorData, isFollowed: true });
        }
        // Reflect new following count on my own profile
        if (state.myProfile) {
          state.myProfile.followingCount = (state.myProfile.followingCount || 0) + 1;
        }
      })
      .addCase(unfollowVendor.fulfilled, (state, action) => {
        const vendorId = action.payload;
        // Update selectedVendor
        if (state.selectedVendor && String(state.selectedVendor.id) === String(vendorId)) {
          state.selectedVendor.isFollowed = false;
          state.selectedVendor.followerCount = Math.max(0, (state.selectedVendor.followerCount || 0) - 1);
        }
        // Update vendors list
        const v = state.vendors.find((v) => String(v.id) === String(vendorId));
        if (v) {
          v.isFollowed = false;
          v.followerCount = Math.max(0, (v.followerCount || 0) - 1);
        }
        // Remove from myFollowing list
        state.myFollowing = state.myFollowing.filter((v) => String(v.id) !== String(vendorId));
        // Reflect new following count on my own profile
        if (state.myProfile) {
          state.myProfile.followingCount = Math.max(0, (state.myProfile.followingCount || 0) - 1);
        }
      })
      // Cross-slice: keep vendor list fresh when a customer follows/unfollows
      .addCase('customer/followVendor/fulfilled', (state, action) => {
        const vendorId = action.payload?.vendorId ?? action.payload;
        const v = state.vendors.find((v) => String(v.id) === String(vendorId));
        if (v) {
          v.isFollowed = true;
          v.followerCount = (v.followerCount || 0) + 1;
        }
        if (state.selectedVendor && String(state.selectedVendor.id) === String(vendorId)) {
          state.selectedVendor.isFollowed = true;
          state.selectedVendor.followerCount = (state.selectedVendor.followerCount || 0) + 1;
        }
      })
      .addCase('customer/unfollowVendor/fulfilled', (state, action) => {
        const vendorId = action.payload;
        const v = state.vendors.find((v) => String(v.id) === String(vendorId));
        if (v) {
          v.isFollowed = false;
          v.followerCount = Math.max(0, (v.followerCount || 0) - 1);
        }
        if (state.selectedVendor && String(state.selectedVendor.id) === String(vendorId)) {
          state.selectedVendor.isFollowed = false;
          state.selectedVendor.followerCount = Math.max(0, (state.selectedVendor.followerCount || 0) - 1);
        }
      });
  },
});

export const { clearVendor, clearSelectedVendor } = vendorSlice.actions;
export default vendorSlice.reducer;
