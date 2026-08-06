import { createSlice } from '@reduxjs/toolkit';

const initialToken = localStorage.getItem('moodify_token') || null;

const initialState = {
  user: null,
  token: initialToken,
  isAuthenticated: false,
  loading: true,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token || state.token;
      state.isAuthenticated = !!user;
      state.loading = false;
      state.error = null;
      if (token) {
        localStorage.setItem('moodify_token', token);
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('moodify_token');
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { setCredentials, updateUser, logoutUser, setAuthLoading, setAuthError } = authSlice.actions;

export default authSlice.reducer;
