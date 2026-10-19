import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export const fetchDashboard = createAsyncThunk('dashboard/fetch', async (_, { rejectWithValue }) => {
  try {
    return (await api.dashboard.get()).data;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const slice = createSlice({
  name: 'dashboard',
  initialState: { stats: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDashboard.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchDashboard.fulfilled, (s, { payload }) => { s.status = 'succeeded'; s.stats = payload; })
      .addCase(fetchDashboard.rejected, (s, { payload }) => { s.status = 'failed'; s.error = payload; });
  },
});

export default slice.reducer;
