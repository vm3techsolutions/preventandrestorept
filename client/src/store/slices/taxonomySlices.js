import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

// Categories, tags and authors share the same CRUD contract.
function createTaxonomySlice(name) {
  const client = api[name];
  const thunk = (type, fn) => createAsyncThunk(`${name}/${type}`, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (e) {
      return rejectWithValue({ message: e.message, status: e.status });
    }
  });
  const thunks = {
    fetchAll: thunk('fetchAll', (query = {}) => client.list({ limit: 200, ...query })),
    createItem: thunk('create', (body) => client.create(body).then((r) => r.data)),
    updateItem: thunk('update', ({ id, body }) => client.update(id, body).then((r) => r.data)),
    deleteItem: thunk('delete', (id) => client.remove(id).then(() => id)),
  };
  const slice = createSlice({
    name,
    initialState: { items: [], status: 'idle', error: null },
    reducers: {},
    extraReducers: (b) => {
      b.addCase(thunks.fetchAll.pending, (s) => { s.status = 'loading'; s.error = null; })
        .addCase(thunks.fetchAll.fulfilled, (s, { payload }) => { s.items = payload.data; s.status = payload.data.length ? 'succeeded' : 'empty'; })
        .addCase(thunks.fetchAll.rejected, (s, { payload }) => { s.status = 'failed'; s.error = payload?.message; })
        .addCase(thunks.createItem.fulfilled, (s, { payload }) => {
          s.items = [...s.items, payload].sort((a, c) => a.name.localeCompare(c.name));
          s.status = 'succeeded';
        })
        .addCase(thunks.updateItem.fulfilled, (s, { payload }) => { s.items = s.items.map((i) => (i.id === payload.id ? payload : i)); })
        .addCase(thunks.deleteItem.fulfilled, (s, { payload }) => {
          s.items = s.items.filter((i) => i.id !== payload);
          if (!s.items.length) s.status = 'empty';
        });
    },
  });
  return { reducer: slice.reducer, actions: thunks };
}

export const categories = createTaxonomySlice('categories');
export const tags = createTaxonomySlice('tags');
export const authors = createTaxonomySlice('authors');
export const taxonomySlices = { categories, tags, authors };
