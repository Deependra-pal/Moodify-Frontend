import { apiSlice } from '../../../app/api/apiSlice';

export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notifications']
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT'
      }),
      invalidatesTags: ['Notifications']
    })
  })
});

export const {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation
} = notificationsApi;
