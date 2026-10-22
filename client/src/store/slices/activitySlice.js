import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export const fetchActivity = createAsyncThunk('activity/fetch', async (query, { rejectWithValue }) => {
  try {
    return await api.activity.list(query);
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const slice = createSlice({
  name: 'activity',
  initialState: { items: [], pagination: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchActivity.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchActivity.fulfilled, (s, { payload }) => {
        s.items = payload.data;
        s.pagination = payload.pagination;
        s.status = payload.data.length ? 'succeeded' : 'empty';
      })
      .addCase(fetchActivity.rejected, (s, { payload }) => { s.status = 'failed'; s.error = payload; });
  },
});

export default slice.reducer;
