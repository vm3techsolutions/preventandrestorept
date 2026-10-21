import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

const thunk = (type, fn) => createAsyncThunk(`admins/${type}`, async (arg, { rejectWithValue }) => {
  try {
    return await fn(arg);
  } catch (e) {
    return rejectWithValue({ message: e.message, status: e.status, details: e.details });
  }
});

export const fetchAdmins = thunk('fetch', (query) => api.admins.list(query));
export const createAdmin = thunk('create', (body) => api.admins.create(body).then((r) => r.data));
export const setAdminStatus = thunk('setStatus', ({ id, isActive }) => api.admins.setStatus(id, isActive).then((r) => r.data));

const slice = createSlice({
  name: 'admins',
  initialState: { items: [], pagination: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAdmins.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchAdmins.fulfilled, (s, { payload }) => {
        s.items = payload.data;
        s.pagination = payload.pagination;
        s.status = payload.data.length ? 'succeeded' : 'empty';
      })
      .addCase(fetchAdmins.rejected, (s, { payload }) => { s.status = 'failed'; s.error = payload?.message; })
      .addCase(createAdmin.fulfilled, (s, { payload }) => { s.items.push(payload); s.status = 'succeeded'; })
      .addCase(setAdminStatus.fulfilled, (s, { payload }) => { s.items = s.items.map((a) => (a.id === payload.id ? payload : a)); });
  },
});

export default slice.reducer;
