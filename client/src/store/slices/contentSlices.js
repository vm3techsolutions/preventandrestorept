import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

// One factory shared by blogs, services, conditions (What We Treat) and CMS pages.
function createContentSlice(name) {
  const client = api.content(name);
  const thunk = (type, fn) => createAsyncThunk(`${name}/${type}`, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (e) {
      return rejectWithValue({ message: e.message, status: e.status, details: e.details });
    }
  });

  const thunks = {
    fetchList: thunk('fetchList', (query) => client.list(query)),
    fetchOne: thunk('fetchOne', (id) => client.get(id).then((r) => r.data)),
    saveItem: thunk('save', ({ id, body }) => (id ? client.update(id, body) : client.create(body)).then((r) => r.data)),
    changeStatus: thunk('changeStatus', ({ id, action }) => client[action](id).then((r) => r.data)),
    removeItem: thunk('remove', (id) => client.remove(id).then(() => id)),
    restoreItem: thunk('restore', (id) => client.restore(id).then((r) => r.data)),
    reorderItems: thunk('reorder', (ids) => client.reorder(ids).then((r) => r.data)),
  };

  const slice = createSlice({
    name,
    initialState: {
      items: [], pagination: null, listStatus: 'idle', listError: null,
      current: null, currentStatus: 'idle', currentError: null, saving: false, saveError: null,
    },
    reducers: {
      setOrder(state, { payload }) {
        const byId = Object.fromEntries(state.items.map((i) => [i.id, i]));
        state.items = payload.map((id) => byId[id]);
      },
      clearCurrent(state) {
        state.current = null;
        state.currentStatus = 'idle';
        state.currentError = null;
      },
    },
    extraReducers: (b) => {
      const replace = (state, item) => {
        state.current = item;
        state.items = state.items.map((i) => (i.id === item.id ? { ...i, ...item } : i));
      };
      b.addCase(thunks.fetchList.pending, (s) => { s.listStatus = 'loading'; s.listError = null; })
        .addCase(thunks.fetchList.fulfilled, (s, { payload }) => {
          s.items = payload.data;
          s.pagination = payload.pagination;
          s.listStatus = payload.data.length ? 'succeeded' : 'empty';
        })
        .addCase(thunks.fetchList.rejected, (s, { payload }) => { s.listStatus = 'failed'; s.listError = payload?.message; })
        .addCase(thunks.fetchOne.pending, (s) => { s.currentStatus = 'loading'; s.currentError = null; })
        .addCase(thunks.fetchOne.fulfilled, (s, { payload }) => { s.currentStatus = 'succeeded'; s.current = payload; })
        .addCase(thunks.fetchOne.rejected, (s, { payload }) => { s.currentStatus = 'failed'; s.currentError = payload?.message; })
        .addCase(thunks.saveItem.pending, (s) => { s.saving = true; s.saveError = null; })
        .addCase(thunks.saveItem.fulfilled, (s, { payload }) => { s.saving = false; replace(s, payload); })
        .addCase(thunks.saveItem.rejected, (s, { payload }) => { s.saving = false; s.saveError = payload?.message; })
        .addCase(thunks.changeStatus.fulfilled, (s, { payload }) => replace(s, payload))
        .addCase(thunks.restoreItem.fulfilled, (s, { payload }) => { s.items = s.items.filter((i) => i.id !== payload.id); })
        .addCase(thunks.removeItem.fulfilled, (s, { payload }) => { s.items = s.items.filter((i) => i.id !== payload); });
    },
  });

  return { reducer: slice.reducer, actions: { ...slice.actions, ...thunks } };
}

export const blogs = createContentSlice('blogs');
export const services = createContentSlice('services');
export const conditions = createContentSlice('conditions');
export const pages = createContentSlice('pages');
export const contentSlices = { blogs, services, conditions, pages };
