/**
 * Pristine Mock/Demo Datasets for Moodify Chat Module UI.
 * Provides 20+ conversations, 20-50 messages per chat, 20+ friends,
 * 20 incoming friend requests, 20 sent friend requests, and 20+ search users.
 */

export const mockConversations = [
  {
    _id: 'conv_1',
    participants: [{ _id: 'user_1', username: 'Alex Vance', email: 'alex@moodify.com', fullName: 'Alex Vance' }],
    lastMessage: 'Check out this amazing synthwave track I found!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unreadCount: 3
  },
  {
    _id: 'conv_2',
    participants: [{ _id: 'user_2', username: 'Sarah Jenkins', email: 'sarah.j@moodify.com', fullName: 'Sarah Jenkins' }],
    lastMessage: 'Are we still listening to the new album release tonight?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    unreadCount: 1
  },
  {
    _id: 'conv_3',
    participants: [{ _id: 'user_3', username: 'Marcus Chen', email: 'marcus@moodify.com', fullName: 'Marcus Chen' }],
    lastMessage: 'That bassline is absolutely insane 🔥',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_4',
    participants: [{ _id: 'user_4', username: 'Elena Rostova', email: 'elena@moodify.com', fullName: 'Elena Rostova' }],
    lastMessage: 'Thanks for sending over that playlist recommendation!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    unreadCount: 2
  },
  {
    _id: 'conv_5',
    participants: [{ _id: 'user_5', username: 'Liam O\'Connor', email: 'liam@moodify.com', fullName: 'Liam O\'Connor' }],
    lastMessage: 'Let me know when you drop your new beat compilation.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 340).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_6',
    participants: [{ _id: 'user_6', username: 'Maya Lin', email: 'maya@moodify.com', fullName: 'Maya Lin' }],
    lastMessage: 'Indie pop playlist has been updated for August!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_7',
    participants: [{ _id: 'user_7', username: 'Devon Brooks', email: 'devon@moodify.com', fullName: 'Devon Brooks' }],
    lastMessage: 'Have you listened to the acoustic cover of that song?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_8',
    participants: [{ _id: 'user_8', username: 'Chloe Kim', email: 'chloe@moodify.com', fullName: 'Chloe Kim' }],
    lastMessage: 'Sent you the link to the live concert livestream!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_9',
    participants: [{ _id: 'user_9', username: 'Julian Rossi', email: 'julian@moodify.com', fullName: 'Julian Rossi' }],
    lastMessage: 'Jazz vibes all day long 🎷',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_10',
    participants: [{ _id: 'user_10', username: 'Sophia Martinez', email: 'sophia@moodify.com', fullName: 'Sophia Martinez' }],
    lastMessage: 'Which headphone brand do you recommend for heavy bass?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_11',
    participants: [{ _id: 'user_11', username: 'Noah Thorne', email: 'noah@moodify.com', fullName: 'Noah Thorne' }],
    lastMessage: 'Lofi beats for studying are saving my week.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_12',
    participants: [{ _id: 'user_12', username: 'Aaliyah Patel', email: 'aaliyah@moodify.com', fullName: 'Aaliyah Patel' }],
    lastMessage: 'Let\'s collaborate on a public Moodify playlist!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_13',
    participants: [{ _id: 'user_13', username: 'Ethan Wright', email: 'ethan@moodify.com', fullName: 'Ethan Wright' }],
    lastMessage: 'Did you get the tickets for the electronic festival?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_14',
    participants: [{ _id: 'user_14', username: 'Isabella Silva', email: 'isabella@moodify.com', fullName: 'Isabella Silva' }],
    lastMessage: 'That guitar solo in track 4 was mind blowing.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_15',
    participants: [{ _id: 'user_15', username: 'Gabriel Santos', email: 'gabriel@moodify.com', fullName: 'Gabriel Santos' }],
    lastMessage: 'Catch you later at the sound studio session!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_16',
    participants: [{ _id: 'user_16', username: 'Hannah Novak', email: 'hannah@moodify.com', fullName: 'Hannah Novak' }],
    lastMessage: 'Your facial expression mood detector recommended exact song matches!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 140).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_17',
    participants: [{ _id: 'user_17', username: 'Oliver Queen', email: 'oliver@moodify.com', fullName: 'Oliver Queen' }],
    lastMessage: 'Rock classics never get old 🎸',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 160).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_18',
    participants: [{ _id: 'user_18', username: 'Zoe Kravitz', email: 'zoe@moodify.com', fullName: 'Zoe Kravitz' }],
    lastMessage: 'Added 10 new tracks to our joint listening queue.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 180).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_19',
    participants: [{ _id: 'user_19', username: 'Mateo Rossi', email: 'mateo@moodify.com', fullName: 'Mateo Rossi' }],
    lastMessage: 'Deep house music session starting in 5 minutes.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_20',
    participants: [{ _id: 'user_20', username: 'Camila Rodriguez', email: 'camila@moodify.com', fullName: 'Camila Rodriguez' }],
    lastMessage: 'Let\'s catch up over coffee and talk about music production!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
    unreadCount: 0
  },
  {
    _id: 'conv_21',
    participants: [{ _id: 'user_21', username: 'Dominic Sterling', email: 'dominic@moodify.com', fullName: 'Dominic Sterling' }],
    lastMessage: 'Vinyl records arrived today! Sounds so crisp.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 280).toISOString(),
    unreadCount: 0
  }
];

export const generateMockMessages = (convId, friendUser, currentUser) => {
  const friendId = friendUser?._id || friendUser?.id || 'user_1';
  const friendName = friendUser?.username || 'Alex';
  const myId = currentUser?._id || currentUser?.id || 'me';

  const baseDate = new Date();

  return [
    // --- 3 DAYS AGO ---
    {
      _id: `${convId}_msg_1`,
      sender: { _id: friendId, username: friendName },
      text: `Hey there! Hope you are having an awesome day listening to good music 🎵`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 72).toISOString()
    },
    {
      _id: `${convId}_msg_2`,
      sender: { _id: myId, username: 'Me' },
      text: `Hey ${friendName}! I am doing great! Just testing out Moodify's facial mood detector feature. It picked energetic synthwave for me today!`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 71.5).toISOString()
    },
    {
      _id: `${convId}_msg_3`,
      sender: { _id: friendId, username: friendName },
      text: `No way! That feature is so slick. What song did it recommend first?`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 71).toISOString()
    },
    {
      _id: `${convId}_msg_4`,
      sender: { _id: myId, username: 'Me' },
      text: `Midnight City by M83 and Resonance by HOME! Absolute classics.`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 70).toISOString()
    },
    {
      _id: `${convId}_msg_5`,
      sender: { _id: friendId, username: friendName },
      text: `Resonance is unmatched! Perfect late night drive vibes 🌃`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 69).toISOString()
    },

    // --- YESTERDAY ---
    {
      _id: `${convId}_msg_6`,
      sender: { _id: friendId, username: friendName },
      text: `Did you check out the new album release from Daft Punk anniversary edition?`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 26).toISOString()
    },
    {
      _id: `${convId}_msg_7`,
      sender: { _id: myId, username: 'Me' },
      text: `Yes! The unreleased studio outtakes are incredible. The synth design holds up so well after all these years.`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 25.5).toISOString()
    },
    {
      _id: `${convId}_msg_8`,
      sender: { _id: friendId, username: friendName },
      text: `Agreed! Track 3 has been on loop in my headphones all afternoon.`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 25).toISOString()
    },
    {
      _id: `${convId}_msg_9`,
      sender: { _id: myId, username: 'Me' },
      text: `I added it straight into my Favorites playlist on Moodify!`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24.5).toISOString()
    },
    {
      _id: `${convId}_msg_10`,
      sender: { _id: friendId, username: friendName },
      text: `Awesome! Can you share your Moodify favorites playlist link with me?`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24).toISOString()
    },

    // --- TODAY ---
    {
      _id: `${convId}_msg_11`,
      sender: { _id: myId, username: 'Me' },
      text: `Here is the mood list! I added 20 new indie rock and chill hop tracks to it today.`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 180).toISOString()
    },
    {
      _id: `${convId}_msg_12`,
      sender: { _id: friendId, username: friendName },
      text: `Listening right now! The transitions between songs are super smooth.`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 120).toISOString()
    },
    {
      _id: `${convId}_msg_13`,
      sender: { _id: friendId, username: friendName },
      text: `What audio gear are you using to produce these tracks?`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60).toISOString()
    },
    {
      _id: `${convId}_msg_14`,
      sender: { _id: myId, username: 'Me' },
      text: `Using studio monitor headphones with custom EQ profiles tailored for Moodify playback!`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 30).toISOString()
    },
    {
      _id: `${convId}_msg_15`,
      sender: { _id: friendId, username: friendName },
      text: `Check out this amazing synthwave track I found! Let's jam together on Moodify sound rooms soon 🚀`,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 5).toISOString()
    }
  ];
};

export const mockFriendsList = [
  { friendshipId: 'f_1', user: { _id: 'user_1', username: 'Alex Vance', fullName: 'Alex Vance', email: 'alex@moodify.com' }, mutualCount: 14 },
  { friendshipId: 'f_2', user: { _id: 'user_2', username: 'Sarah Jenkins', fullName: 'Sarah Jenkins', email: 'sarah.j@moodify.com' }, mutualCount: 8 },
  { friendshipId: 'f_3', user: { _id: 'user_3', username: 'Marcus Chen', fullName: 'Marcus Chen', email: 'marcus@moodify.com' }, mutualCount: 22 },
  { friendshipId: 'f_4', user: { _id: 'user_4', username: 'Elena Rostova', fullName: 'Elena Rostova', email: 'elena@moodify.com' }, mutualCount: 5 },
  { friendshipId: 'f_5', user: { _id: 'user_5', username: 'Liam O\'Connor', fullName: 'Liam O\'Connor', email: 'liam@moodify.com' }, mutualCount: 19 },
  { friendshipId: 'f_6', user: { _id: 'user_6', username: 'Maya Lin', fullName: 'Maya Lin', email: 'maya@moodify.com' }, mutualCount: 11 },
  { friendshipId: 'f_7', user: { _id: 'user_7', username: 'Devon Brooks', fullName: 'Devon Brooks', email: 'devon@moodify.com' }, mutualCount: 6 },
  { friendshipId: 'f_8', user: { _id: 'user_8', username: 'Chloe Kim', fullName: 'Chloe Kim', email: 'chloe@moodify.com' }, mutualCount: 17 },
  { friendshipId: 'f_9', user: { _id: 'user_9', username: 'Julian Rossi', fullName: 'Julian Rossi', email: 'julian@moodify.com' }, mutualCount: 9 },
  { friendshipId: 'f_10', user: { _id: 'user_10', username: 'Sophia Martinez', fullName: 'Sophia Martinez', email: 'sophia@moodify.com' }, mutualCount: 13 },
  { friendshipId: 'f_11', user: { _id: 'user_11', username: 'Noah Thorne', fullName: 'Noah Thorne', email: 'noah@moodify.com' }, mutualCount: 4 },
  { friendshipId: 'f_12', user: { _id: 'user_12', username: 'Aaliyah Patel', fullName: 'Aaliyah Patel', email: 'aaliyah@moodify.com' }, mutualCount: 27 },
  { friendshipId: 'f_13', user: { _id: 'user_13', username: 'Ethan Wright', fullName: 'Ethan Wright', email: 'ethan@moodify.com' }, mutualCount: 15 },
  { friendshipId: 'f_14', user: { _id: 'user_14', username: 'Isabella Silva', fullName: 'Isabella Silva', email: 'isabella@moodify.com' }, mutualCount: 10 },
  { friendshipId: 'f_15', user: { _id: 'user_15', username: 'Gabriel Santos', fullName: 'Gabriel Santos', email: 'gabriel@moodify.com' }, mutualCount: 7 },
  { friendshipId: 'f_16', user: { _id: 'user_16', username: 'Hannah Novak', fullName: 'Hannah Novak', email: 'hannah@moodify.com' }, mutualCount: 21 },
  { friendshipId: 'f_17', user: { _id: 'user_17', username: 'Oliver Queen', fullName: 'Oliver Queen', email: 'oliver@moodify.com' }, mutualCount: 12 },
  { friendshipId: 'f_18', user: { _id: 'user_18', username: 'Zoe Kravitz', fullName: 'Zoe Kravitz', email: 'zoe@moodify.com' }, mutualCount: 16 },
  { friendshipId: 'f_19', user: { _id: 'user_19', username: 'Mateo Rossi', fullName: 'Mateo Rossi', email: 'mateo@moodify.com' }, mutualCount: 3 },
  { friendshipId: 'f_20', user: { _id: 'user_20', username: 'Camila Rodriguez', fullName: 'Camila Rodriguez', email: 'camila@moodify.com' }, mutualCount: 18 },
  { friendshipId: 'f_21', user: { _id: 'user_21', username: 'Dominic Sterling', fullName: 'Dominic Sterling', email: 'dominic@moodify.com' }, mutualCount: 25 }
];

export const mockIncomingRequests = [
  { _id: 'req_in_1', sender: { _id: 'user_req_1', username: 'Lucas Meyer', fullName: 'Lucas Meyer', email: 'lucas@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), mutualFriends: 12 },
  { _id: 'req_in_2', sender: { _id: 'user_req_2', username: 'Emma Watson', fullName: 'Emma Watson', email: 'emma@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), mutualFriends: 7 },
  { _id: 'req_in_3', sender: { _id: 'user_req_3', username: 'Carlos Mendez', fullName: 'Carlos Mendez', email: 'carlos@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 130).toISOString(), mutualFriends: 19 },
  { _id: 'req_in_4', sender: { _id: 'user_req_4', username: 'Nina Petrova', fullName: 'Nina Petrova', email: 'nina@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(), mutualFriends: 4 },
  { _id: 'req_in_5', sender: { _id: 'user_req_5', username: 'Benjamin Cole', fullName: 'Benjamin Cole', email: 'ben@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 500).toISOString(), mutualFriends: 15 },
  { _id: 'req_in_6', sender: { _id: 'user_req_6', username: 'Victoria Secret', fullName: 'Victoria Secret', email: 'victoria@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 800).toISOString(), mutualFriends: 9 },
  { _id: 'req_in_7', sender: { _id: 'user_req_7', username: 'Sebastian Shaw', fullName: 'Sebastian Shaw', email: 'sebastian@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 1200).toISOString(), mutualFriends: 21 },
  { _id: 'req_in_8', sender: { _id: 'user_req_8', username: 'Harper Lee', fullName: 'Harper Lee', email: 'harper@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 1500).toISOString(), mutualFriends: 11 },
  { _id: 'req_in_9', sender: { _id: 'user_req_9', username: 'Mason Mount', fullName: 'Mason Mount', email: 'mason@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 2000).toISOString(), mutualFriends: 6 },
  { _id: 'req_in_10', sender: { _id: 'user_req_10', username: 'Amara Diop', fullName: 'Amara Diop', email: 'amara@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 2500).toISOString(), mutualFriends: 14 },
  { _id: 'req_in_11', sender: { _id: 'user_req_11', username: 'Kai Takahashi', fullName: 'Kai Takahashi', email: 'kai@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 3000).toISOString(), mutualFriends: 8 },
  { _id: 'req_in_12', sender: { _id: 'user_req_12', username: 'Freja Lindqvist', fullName: 'Freja Lindqvist', email: 'freja@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 3500).toISOString(), mutualFriends: 16 },
  { _id: 'req_in_13', sender: { _id: 'user_req_13', username: 'Oscar Wilde', fullName: 'Oscar Wilde', email: 'oscar@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 4000).toISOString(), mutualFriends: 3 },
  { _id: 'req_in_14', sender: { _id: 'user_req_14', username: 'Penelope Cruz', fullName: 'Penelope Cruz', email: 'penelope@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 4500).toISOString(), mutualFriends: 20 },
  { _id: 'req_in_15', sender: { _id: 'user_req_15', username: 'Felix Kjellberg', fullName: 'Felix Kjellberg', email: 'felix@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 5000).toISOString(), mutualFriends: 10 },
  { _id: 'req_in_16', sender: { _id: 'user_req_16', username: 'Charlotte Brontë', fullName: 'Charlotte Brontë', email: 'charlotte@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 5500).toISOString(), mutualFriends: 5 },
  { _id: 'req_in_17', sender: { _id: 'user_req_17', username: 'Xavier Woods', fullName: 'Xavier Woods', email: 'xavier@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 6000).toISOString(), mutualFriends: 18 },
  { _id: 'req_in_18', sender: { _id: 'user_req_18', username: 'Yuki Tanaka', fullName: 'Yuki Tanaka', email: 'yuki@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 6500).toISOString(), mutualFriends: 13 },
  { _id: 'req_in_19', sender: { _id: 'user_req_19', username: 'Zara Larsson', fullName: 'Zara Larsson', email: 'zara@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 7000).toISOString(), mutualFriends: 22 },
  { _id: 'req_in_20', sender: { _id: 'user_req_20', username: 'Zack Snyder', fullName: 'Zack Snyder', email: 'zack@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 7500).toISOString(), mutualFriends: 9 }
];

export const mockSentRequests = [
  { _id: 'req_sent_1', receiver: { _id: 'user_s_1', username: 'Adrian Smith', fullName: 'Adrian Smith', email: 'adrian@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'pending' },
  { _id: 'req_sent_2', receiver: { _id: 'user_s_2', username: 'Bella Thorne', fullName: 'Bella Thorne', email: 'bella@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), status: 'pending' },
  { _id: 'req_sent_3', receiver: { _id: 'user_s_3', username: 'Caleb Landry', fullName: 'Caleb Landry', email: 'caleb@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(), status: 'pending' },
  { _id: 'req_sent_4', receiver: { _id: 'user_s_4', username: 'Diana Prince', fullName: 'Diana Prince', email: 'diana@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 400).toISOString(), status: 'pending' },
  { _id: 'req_sent_5', receiver: { _id: 'user_s_5', username: 'Elijah Wood', fullName: 'Elijah Wood', email: 'elijah@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(), status: 'pending' },
  { _id: 'req_sent_6', receiver: { _id: 'user_s_6', username: 'Fiona Apple', fullName: 'Fiona Apple', email: 'fiona@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 900).toISOString(), status: 'pending' },
  { _id: 'req_sent_7', receiver: { _id: 'user_s_7', username: 'Gareth Bale', fullName: 'Gareth Bale', email: 'gareth@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 1400).toISOString(), status: 'pending' },
  { _id: 'req_sent_8', receiver: { _id: 'user_s_8', username: 'Hailey Bieber', fullName: 'Hailey Bieber', email: 'hailey@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 1800).toISOString(), status: 'pending' },
  { _id: 'req_sent_9', receiver: { _id: 'user_s_9', username: 'Ian McKellen', fullName: 'Ian McKellen', email: 'ian@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 2200).toISOString(), status: 'pending' },
  { _id: 'req_sent_10', receiver: { _id: 'user_s_10', username: 'Jasmine Guy', fullName: 'Jasmine Guy', email: 'jasmine@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 2600).toISOString(), status: 'pending' },
  { _id: 'req_sent_11', receiver: { _id: 'user_s_11', username: 'Kevin Hart', fullName: 'Kevin Hart', email: 'kevin@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 3100).toISOString(), status: 'pending' },
  { _id: 'req_sent_12', receiver: { _id: 'user_s_12', username: 'Lana Del Rey', fullName: 'Lana Del Rey', email: 'lana@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 3600).toISOString(), status: 'pending' },
  { _id: 'req_sent_13', receiver: { _id: 'user_s_13', username: 'Michael Scott', fullName: 'Michael Scott', email: 'michael@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 4100).toISOString(), status: 'pending' },
  { _id: 'req_sent_14', receiver: { _id: 'user_s_14', username: 'Nora Jones', fullName: 'Nora Jones', email: 'nora@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 4600).toISOString(), status: 'pending' },
  { _id: 'req_sent_15', receiver: { _id: 'user_s_15', username: 'Owen Wilson', fullName: 'Owen Wilson', email: 'owen@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 5100).toISOString(), status: 'pending' },
  { _id: 'req_sent_16', receiver: { _id: 'user_s_16', username: 'Paige Spiranac', fullName: 'Paige Spiranac', email: 'paige@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 5600).toISOString(), status: 'pending' },
  { _id: 'req_sent_17', receiver: { _id: 'user_s_17', username: 'Quentin Tarantino', fullName: 'Quentin Tarantino', email: 'quentin@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 6100).toISOString(), status: 'pending' },
  { _id: 'req_sent_18', receiver: { _id: 'user_s_18', username: 'Rachel McAdams', fullName: 'Rachel McAdams', email: 'rachel@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 6600).toISOString(), status: 'pending' },
  { _id: 'req_sent_19', receiver: { _id: 'user_s_19', username: 'Steven Spielberg', fullName: 'Steven Spielberg', email: 'steven@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 7100).toISOString(), status: 'pending' },
  { _id: 'req_sent_20', receiver: { _id: 'user_s_20', username: 'Taylor Swift', fullName: 'Taylor Swift', email: 'taylor@moodify.com' }, createdAt: new Date(Date.now() - 1000 * 60 * 7600).toISOString(), status: 'pending' }
];

export const mockSearchUsers = [
  { _id: 'search_1', username: 'Aria Montgomery', fullName: 'Aria Montgomery', email: 'aria@moodify.com' },
  { _id: 'search_2', username: 'Brandon Stark', fullName: 'Brandon Stark', email: 'bran@moodify.com' },
  { _id: 'search_3', username: 'Cassandra Cain', fullName: 'Cassandra Cain', email: 'cassandra@moodify.com' },
  { _id: 'search_4', username: 'Damian Wayne', fullName: 'Damian Wayne', email: 'damian@moodify.com' },
  { _id: 'search_5', username: 'Eleanor Vance', fullName: 'Eleanor Vance', email: 'eleanor@moodify.com' },
  { _id: 'search_6', username: 'Finnick Odair', fullName: 'Finnick Odair', email: 'finnick@moodify.com' },
  { _id: 'search_7', username: 'Gwen Stacy', fullName: 'Gwen Stacy', email: 'gwen@moodify.com' },
  { _id: 'search_8', username: 'Holden Caulfield', fullName: 'Holden Caulfield', email: 'holden@moodify.com' },
  { _id: 'search_9', username: 'Iris West', fullName: 'Iris West', email: 'iris@moodify.com' },
  { _id: 'search_10', username: 'Jonathan Byers', fullName: 'Jonathan Byers', email: 'jonathan@moodify.com' },
  { _id: 'search_11', username: 'Katniss Everdeen', fullName: 'Katniss Everdeen', email: 'katniss@moodify.com' },
  { _id: 'search_12', username: 'Loki Laufeyson', fullName: 'Loki Laufeyson', email: 'loki@moodify.com' },
  { _id: 'search_13', username: 'Miles Morales', fullName: 'Miles Morales', email: 'miles@moodify.com' },
  { _id: 'search_14', username: 'Natasha Romanoff', fullName: 'Natasha Romanoff', email: 'natasha@moodify.com' },
  { _id: 'search_15', username: 'Ophelia Hamlet', fullName: 'Ophelia Hamlet', email: 'ophelia@moodify.com' },
  { _id: 'search_16', username: 'Peter Parker', fullName: 'Peter Parker', email: 'peter@moodify.com' },
  { _id: 'search_17', username: 'Quinn Fabray', fullName: 'Quinn Fabray', email: 'quinn@moodify.com' },
  { _id: 'search_18', username: 'River Tam', fullName: 'River Tam', email: 'river@moodify.com' },
  { _id: 'search_19', username: 'Steve Rogers', fullName: 'Steve Rogers', email: 'steve@moodify.com' },
  { _id: 'search_20', username: 'Tony Stark', fullName: 'Tony Stark', email: 'tony@moodify.com' },
  { _id: 'search_21', username: 'Wanda Maximoff', fullName: 'Wanda Maximoff', email: 'wanda@moodify.com' }
];

export const mockOnlineUserIds = [
  'user_1', 'user_2', 'user_3', 'user_5', 'user_8', 'user_12', 'user_16', 'user_20'
];

export const mockTypingUsers = {
  conv_1: { userId: 'user_1', username: 'Alex Vance' }
};
