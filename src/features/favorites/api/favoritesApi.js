import { apiSlice } from '../../../app/api/apiSlice';

export const favoritesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query({
      query: () => '/favorites',
      providesTags: ['Favorites']
    }),
    addFavorite: builder.mutation({
      query: (favoriteData) => ({
        url: '/favorites',
        method: 'POST',
        body: favoriteData
      }),
      invalidatesTags: ['Favorites']
    }),
    removeFavorite: builder.mutation({
      query: (favoriteId) => ({
        url: `/favorites/${favoriteId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Favorites']
    }),
    clearFavorites: builder.mutation({
      query: () => ({
        url: '/favorites/clear',
        method: 'DELETE'
      }),
      invalidatesTags: ['Favorites']
    })
  })
});

export const {
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useClearFavoritesMutation
} = favoritesApi;
