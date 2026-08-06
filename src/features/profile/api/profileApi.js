import { apiSlice } from '../../../app/api/apiSlice';

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => '/profile',
      providesTags: ['Profile']
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/profile',
        method: 'PUT',
        body: profileData
      }),
      invalidatesTags: ['Profile', 'User']
    })
  })
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation
} = profileApi;
