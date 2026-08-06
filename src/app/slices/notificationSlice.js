import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  isDropdownOpen: false
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAllRead: (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
    toggleDropdown: (state) => {
      state.isDropdownOpen = !state.isDropdownOpen;
    },
    setDropdownOpen: (state, action) => {
      state.isDropdownOpen = action.payload;
    }
  }
});

export const {
  setNotifications,
  addNotification,
  markAllRead,
  toggleDropdown,
  setDropdownOpen
} = notificationSlice.actions;

export default notificationSlice.reducer;
