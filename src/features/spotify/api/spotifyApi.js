import { apiSlice } from '../../../app/api/apiSlice';

export const spotifyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSpotifyToken: builder.query({
      query: () => '/spotify/token'
    }),
    searchSongs: builder.query({
      query: (query) => `/spotify/search?query=${encodeURIComponent(query)}`
    }),
    getRecommendations: builder.mutation({
      query: (emotion) => ({
        url: '/spotify/recommend',
        method: 'POST',
        body: { emotion }
      })
    }),
    connectSpotify: builder.mutation({
      query: () => ({
        url: '/spotify/connect',
        method: 'PUT'
      }),
      invalidatesTags: ['User', 'Profile']
    })
  })
});

export const {
  useGetSpotifyTokenQuery,
  useLazySearchSongsQuery,
  useGetRecommendationsMutation,
  useConnectSpotifyMutation
} = spotifyApi;
