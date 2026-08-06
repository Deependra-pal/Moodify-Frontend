import { apiSlice } from '../../../app/api/apiSlice';

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: () => '/conversations',
      providesTags: ['Conversations']
    }),
    getOrCreateConversation: builder.mutation({
      query: (receiverId) => ({
        url: '/conversations',
        method: 'POST',
        body: { receiverId }
      }),
      invalidatesTags: ['Conversations']
    }),
    getMessages: builder.query({
      query: (conversationId) => `/messages/${conversationId}`,
      providesTags: (result, error, conversationId) => [{ type: 'Messages', id: conversationId }]
    }),
    sendMessage: builder.mutation({
      query: ({ conversationId, text, image }) => ({
        url: '/messages',
        method: 'POST',
        body: { conversationId, text, image }
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
        'Conversations'
      ]
    }),
    markAsRead: builder.mutation({
      query: (conversationId) => ({
        url: `/messages/read/${conversationId}`,
        method: 'PUT'
      }),
      invalidatesTags: ['Conversations']
    }),
    getFriends: builder.query({
      query: () => '/friends',
      providesTags: ['Friends']
    }),
    getPendingRequests: builder.query({
      query: () => '/friends/requests',
      providesTags: ['Requests']
    }),
    getSentRequests: builder.query({
      query: () => '/friends/sent',
      providesTags: ['SentRequests']
    }),
    sendFriendRequest: builder.mutation({
      query: (receiverId) => ({
        url: '/friends/request',
        method: 'POST',
        body: { receiverId }
      }),
      invalidatesTags: ['SentRequests']
    }),
    acceptFriendRequest: builder.mutation({
      query: (requestId) => ({
        url: '/friends/accept',
        method: 'POST',
        body: { requestId }
      }),
      invalidatesTags: ['Requests', 'Friends', 'Conversations']
    }),
    rejectFriendRequest: builder.mutation({
      query: (requestId) => ({
        url: '/friends/reject',
        method: 'POST',
        body: { requestId }
      }),
      invalidatesTags: ['Requests']
    }),
    cancelSentRequest: builder.mutation({
      query: (requestId) => ({
        url: `/friends/sent/${requestId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['SentRequests']
    }),
    removeFriend: builder.mutation({
      query: (friendId) => ({
        url: `/friends/${friendId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Friends', 'Conversations', 'Requests', 'SentRequests']
    }),
    searchUsers: builder.query({
      query: (query) => `/users/search?q=${encodeURIComponent(query)}`
    })
  })
});

export const {
  useGetConversationsQuery,
  useGetOrCreateConversationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useGetFriendsQuery,
  useGetPendingRequestsQuery,
  useGetSentRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useCancelSentRequestMutation,
  useRemoveFriendMutation,
  useLazySearchUsersQuery
} = chatApi;
