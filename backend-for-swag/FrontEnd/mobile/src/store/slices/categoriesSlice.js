import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoriesAPI from '../../api/categoriesAPI';

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    const result = await categoriesAPI.getCategories();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const fetchEventTypes = createAsyncThunk(
  'categories/fetchEventTypes',
  async (_, { rejectWithValue }) => {
    const result = await categoriesAPI.getEventTypes();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    sections: [],       // [{ id, name, items: [{ id, name }] }]
    eventTypes: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.loading = false; state.sections = action.payload; })
      .addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchEventTypes.fulfilled, (state, action) => { state.eventTypes = action.payload; });
  },
});

export default categoriesSlice.reducer;
