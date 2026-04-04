import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import carsAPI from '../../api/carsAPI';

export const fetchMyCars = createAsyncThunk(
  'cars/fetchMyCars',
  async (_, { rejectWithValue }) => {
    const result = await carsAPI.getMyCars();
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const addCar = createAsyncThunk(
  'cars/addCar',
  async (data, { rejectWithValue }) => {
    const result = await carsAPI.addCar(data);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const updateCar = createAsyncThunk(
  'cars/updateCar',
  async ({ id, data }, { rejectWithValue }) => {
    const result = await carsAPI.updateCar(id, data);
    if (result.success) return result.data;
    return rejectWithValue(result.error);
  }
);

export const deleteCar = createAsyncThunk(
  'cars/deleteCar',
  async (id, { rejectWithValue }) => {
    const result = await carsAPI.deleteCar(id);
    if (result.success) return id;
    return rejectWithValue(result.error);
  }
);

export const fetchMaintenanceRecords = createAsyncThunk(
  'cars/fetchMaintenance',
  async (carId, { rejectWithValue }) => {
    const result = await carsAPI.getMaintenanceRecords(carId);
    if (result.success) return { carId, records: result.data };
    return rejectWithValue(result.error);
  }
);

export const addMaintenanceRecord = createAsyncThunk(
  'cars/addMaintenance',
  async ({ carId, data }, { rejectWithValue }) => {
    const result = await carsAPI.addMaintenanceRecord(carId, data);
    if (result.success) return { carId, record: result.data };
    return rejectWithValue(result.error);
  }
);

export const updateMaintenanceRecord = createAsyncThunk(
  'cars/updateMaintenance',
  async ({ carId, recordId, data }, { rejectWithValue }) => {
    const result = await carsAPI.updateMaintenanceRecord(carId, recordId, data);
    if (result.success) return { carId, record: result.data };
    return rejectWithValue(result.error);
  }
);

export const deleteMaintenanceRecord = createAsyncThunk(
  'cars/deleteMaintenance',
  async ({ carId, recordId }, { rejectWithValue }) => {
    const result = await carsAPI.deleteMaintenanceRecord(carId, recordId);
    if (result.success) return { carId, recordId };
    return rejectWithValue(result.error);
  }
);

const carsSlice = createSlice({
  name: 'cars',
  initialState: {
    cars: [],
    maintenance: {},  // { [carId]: record[] }
    loading: false,
    error: null,
  },
  reducers: {
    clearCars: (state) => {
      state.cars = [];
      state.maintenance = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyCars.pending, (state) => { state.loading = true; })
      .addCase(fetchMyCars.fulfilled, (state, action) => { state.loading = false; state.cars = action.payload; })
      .addCase(fetchMyCars.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addCar.fulfilled, (state, action) => { state.cars.push(action.payload); })
      .addCase(updateCar.fulfilled, (state, action) => {
        const idx = state.cars.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.cars[idx] = action.payload;
      })
      .addCase(deleteCar.fulfilled, (state, action) => {
        state.cars = state.cars.filter(c => c.id !== action.payload);
      })
      .addCase(fetchMaintenanceRecords.fulfilled, (state, action) => {
        state.maintenance[action.payload.carId] = action.payload.records;
      })
      .addCase(addMaintenanceRecord.fulfilled, (state, action) => {
        const { carId, record } = action.payload;
        if (!state.maintenance[carId]) state.maintenance[carId] = [];
        state.maintenance[carId].push(record);
      })
      .addCase(updateMaintenanceRecord.fulfilled, (state, action) => {
        const { carId, record } = action.payload;
        if (state.maintenance[carId]) {
          const idx = state.maintenance[carId].findIndex(r => r.id === record.id);
          if (idx !== -1) state.maintenance[carId][idx] = record;
        }
      })
      .addCase(deleteMaintenanceRecord.fulfilled, (state, action) => {
        const { carId, recordId } = action.payload;
        if (state.maintenance[carId]) {
          state.maintenance[carId] = state.maintenance[carId].filter(r => r.id !== recordId);
        }
      });
  },
});

export const { clearCars } = carsSlice.actions;
export default carsSlice.reducer;
