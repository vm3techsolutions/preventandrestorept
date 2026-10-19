import { configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import dashboard from './slices/dashboardSlice';
import { blogs, services, conditions, pages } from './slices/contentSlices';
import { categories, tags, authors } from './slices/taxonomySlices';

export const makeStore = () =>
  configureStore({
    reducer: {
      auth,
      dashboard,
      blogs: blogs.reducer,
      services: services.reducer,
      conditions: conditions.reducer,
      pages: pages.reducer,
      categories: categories.reducer,
      tags: tags.reducer,
      authors: authors.reducer,
    },
  });
