import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminAPI from '../../api/adminAPI';

export const fetchPendingVendors = createAsyncThunk(
  'admin/fetchPendingVendors',
  async (_, { rejectWithValue }) => {
    const result = await adminAPI.getPendingVendors();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const approveVendor = createAsyncThunk(
  'admin/approveVendor',
  async (id, { rejectWithValue }) => {
    const result = await adminAPI.approveVendor(id);
    if (result.success) return id;
    return rejectWithValue(result.error);
  }
);

export const rejectVendor = createAsyncThunk(
  'admin/rejectVendor',
  async ({ id, reason }, { rejectWithValue }) => {
    const result = await adminAPI.rejectVendor(id, reason);
    if (result.success) return id;
    return rejectWithValue(result.error);
  }
);

export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    const result = await adminAPI.getStats();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    pendingVendors: [],
    stats: null,
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingVendors.pending, (state) => { state.loading = true; })
      .addCase(fetchPendingVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingVendors = action.payload;
      })
      .addCase(fetchPendingVendors.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(approveVendor.pending, (state) => { state.actionLoading = true; })
      .addCase(approveVendor.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.pendingVendors = state.pendingVendors.filter(v => v.id !== action.payload);
      })
      .addCase(approveVendor.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      .addCase(rejectVendor.pending, (state) => { state.actionLoading = true; })
      .addCase(rejectVendor.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.pendingVendors = state.pendingVendors.filter(v => v.id !== action.payload);
      })
      .addCase(rejectVendor.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      .addCase(fetchAdminStats.fulfilled, (state, action) => { state.stats = action.payload; });
  },
});

export default adminSlice.reducer;
