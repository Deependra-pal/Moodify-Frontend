import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import authReducer from '../features/auth/slice/authSlice';
import playerReducer from '../features/home/slice/playerSlice';
import chatReducer from '../features/chat/slice/chatSlice';
import notificationReducer from '../features/notifications/slice/notificationSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    player: playerReducer,
    chat: chatReducer,
    notifications: notificationReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;
