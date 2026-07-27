import axios from 'axios';

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = window.crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values).map((x) => possible[x % possible.length]).join('');
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

const base64urlencode = (a) => {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const generateCodeChallenge = async (verifier) => {
  const hashed = await sha256(verifier);
  return base64urlencode(hashed);
};

const getRedirectUri = () => {
  const origin = window.location.origin.replace('localhost', '127.0.0.1');
  return `${origin}/callback`;
};

export const loginWithSpotify = async () => {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  window.localStorage.setItem('spotify_code_verifier', codeVerifier);

  const redirectUri = getRedirectUri();

  const params = {
    response_type: 'code',
    client_id: 'e5cabb5b267544fe83de156f9aeb760f',
    scope: 'streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state',
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri
  };

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
};

export const exchangeCodeForToken = async (code) => {
  const codeVerifier = window.localStorage.getItem('spotify_code_verifier');
  const redirectUri = getRedirectUri();

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        client_id: 'e5cabb5b267544fe83de156f9aeb760f',
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    const data = response.data;
    if (data.access_token) {
      window.localStorage.setItem('spotify_access_token', data.access_token);
      if (data.refresh_token) {
        window.localStorage.setItem('spotify_refresh_token', data.refresh_token);
      }
      const expiresAt = Date.now() + data.expires_in * 1000;
      window.localStorage.setItem('spotify_expires_at', expiresAt);
      return data.access_token;
    } else {
      throw new Error('Failed to exchange token');
    }
  } catch (err) {
    const errMessage = err.response?.data?.error_description || err.message;
    throw new Error(errMessage);
  }
};

export const getSpotifyAccessToken = async () => {
  const token = window.localStorage.getItem('spotify_access_token');
  const expiresAt = window.localStorage.getItem('spotify_expires_at');
  const refreshToken = window.localStorage.getItem('spotify_refresh_token');

  if (!token) {
    return null;
  }

  // Return token if still valid (using 1 minute buffer)
  if (Date.now() < parseInt(expiresAt, 10) - 60000) {
    return token;
  }

  if (!refreshToken) {
    return null;
  }

  // Refresh token
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        client_id: 'e5cabb5b267544fe83de156f9aeb760f',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    const data = response.data;
    if (data.access_token) {
      window.localStorage.setItem('spotify_access_token', data.access_token);
      if (data.refresh_token) {
        window.localStorage.setItem('spotify_refresh_token', data.refresh_token);
      }
      const newExpiresAt = Date.now() + data.expires_in * 1000;
      window.localStorage.setItem('spotify_expires_at', newExpiresAt);
      return data.access_token;
    }
  } catch (e) {
    // Silent fail
  }
  return null;
};

export const logoutSpotify = () => {
  window.localStorage.removeItem('spotify_access_token');
  window.localStorage.removeItem('spotify_refresh_token');
  window.localStorage.removeItem('spotify_expires_at');
  window.localStorage.removeItem('spotify_code_verifier');
};
