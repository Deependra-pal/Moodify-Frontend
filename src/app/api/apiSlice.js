import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token || localStorage.getItem('moodify_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: [
    'User',
    'Conversations',
    'Messages',
    'Friends',
    'Requests',
    'SentRequests',
    'Favorites',
    'History',
    'Notifications',
    'Profile'
  ],
  endpoints: () => ({})
});
