import { configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import dashboard from './slices/dashboardSlice';
import admins from './slices/adminsSlice';
import activity from './slices/activitySlice';
import { blogs, services, conditions, pages } from './slices/contentSlices';
import { categories, tags, authors } from './slices/taxonomySlices';

export const makeStore = () =>
  configureStore({
    reducer: {
      auth,
      dashboard,
      admins,
      activity,
      blogs: blogs.reducer,
      services: services.reducer,
      conditions: conditions.reducer,
      pages: pages.reducer,
      categories: categories.reducer,
      tags: tags.reducer,
      authors: authors.reducer,
    },
  });
