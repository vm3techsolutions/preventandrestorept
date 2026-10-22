import { createSlice } from '@reduxjs/toolkit';

// Public-site UI state shared between the header, mobile menu and route changes.
const siteSlice = createSlice({
  name: 'site',
  initialState: { mobileNavOpen: false },
  reducers: {
    toggleMobileNav: (s) => { s.mobileNavOpen = !s.mobileNavOpen; },
    closeMobileNav: (s) => { s.mobileNavOpen = false; },
  },
});

export const { toggleMobileNav, closeMobileNav } = siteSlice.actions;
export default siteSlice.reducer;
