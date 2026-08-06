import { apiSlice } from '../../../app/api/apiSlice';

export const historyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHistory: builder.query({
      query: () => '/history',
      providesTags: ['History']
    }),
    addHistory: builder.mutation({
      query: (historyData) => ({
        url: '/history',
        method: 'POST',
        body: historyData
      }),
      invalidatesTags: ['History']
    }),
    clearHistory: builder.mutation({
      query: () => ({
        url: '/history',
        method: 'DELETE'
      }),
      invalidatesTags: ['History']
    })
  })
});

export const {
  useGetHistoryQuery,
  useAddHistoryMutation,
  useClearHistoryMutation
} = historyApi;
