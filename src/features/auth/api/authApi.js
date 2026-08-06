import { apiSlice } from '../../../app/api/apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      }),
      invalidatesTags: ['User']
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData
      }),
      invalidatesTags: ['User']
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User']
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST'
      }),
      invalidatesTags: ['User']
    })
  })
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation
} = authApi;
