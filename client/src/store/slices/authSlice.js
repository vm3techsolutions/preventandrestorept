import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

const wrap = (fn) => async (arg, { rejectWithValue }) => {
  try {
    return (await fn(arg)).data;
  } catch (e) {
    return rejectWithValue({ message: e.message, status: e.status });
  }
};

export const fetchMe = createAsyncThunk('auth/me', wrap(() => api.auth.me()));
export const login = createAsyncThunk('auth/login', wrap((body) => api.auth.login(body)));
export const setupAdmin = createAsyncThunk('auth/setup', wrap((body) => api.auth.setup(body)));
export const checkSetup = createAsyncThunk('auth/setupStatus', wrap(() => api.auth.setupStatus()));
export const logout = createAsyncThunk('auth/logout', wrap(() => api.auth.logout()));
export const changePassword = createAsyncThunk('auth/changePassword', wrap((body) => api.auth.changePassword(body)));

const authed = (state, { payload }) => {
  state.admin = payload.admin;
  state.expiresAt = payload.expiresAt;
  state.status = 'authenticated';
  state.error = null;
};

const slice = createSlice({
  name: 'auth',
  initialState: { admin: null, expiresAt: null, status: 'idle', error: null, setupRequired: null, submitting: false },
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    sessionExpired(state) {
      state.admin = null;
      state.status = 'unauthenticated';
      state.error = 'Your session has expired. Please sign in again.';
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchMe.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchMe.fulfilled, authed)
      .addCase(fetchMe.rejected, (s) => { s.status = 'unauthenticated'; s.admin = null; })
      .addCase(checkSetup.fulfilled, (s, { payload }) => { s.setupRequired = payload.setupRequired; })
      .addCase(logout.fulfilled, (s) => { s.admin = null; s.status = 'unauthenticated'; s.error = null; })
      .addCase(changePassword.fulfilled, authed);
    [login, setupAdmin].forEach((t) => {
      b.addCase(t.pending, (s) => { s.submitting = true; s.error = null; })
        .addCase(t.fulfilled, (s, a) => { s.submitting = false; s.setupRequired = false; authed(s, a); })
        .addCase(t.rejected, (s, { payload }) => { s.submitting = false; s.error = payload?.message || 'Something went wrong'; });
    });
  },
});

export const { sessionExpired, clearAuthError } = slice.actions;
export default slice.reducer;
