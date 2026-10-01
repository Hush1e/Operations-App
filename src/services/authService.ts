import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly');

let isSigningIn = false;

// Google access tokens last about an hour. Keep the token (and when it expires)
// in localStorage so a page reload doesn't silently drop the Google connection.
const TOKEN_KEY = 'academic_ops_google_token';
const TOKEN_TTL_MS = 55 * 60 * 1000;

function loadStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const { token, expiresAt } = JSON.parse(raw);
    if (!token || Date.now() >= expiresAt) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

function storeToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, expiresAt: Date.now() + TOKEN_TTL_MS }));
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* storage unavailable: token stays in memory only */
  }
}

let cachedAccessToken: string | null = loadStoredToken();

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const token = cachedAccessToken || loadStoredToken();
      if (token) {
        cachedAccessToken = token;
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token was not cached in this session yet or page refreshed
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token with requested scopes.');
    }

    cachedAccessToken = credential.accessToken;
    storeToken(cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  // Drop the token once it has expired so callers ask the user to reconnect.
  if (cachedAccessToken && !loadStoredToken()) {
    cachedAccessToken = null;
  }
  return cachedAccessToken;
};

/** Forget the Google token (e.g. after the API rejects it as expired). */
export const clearAccessToken = () => {
  cachedAccessToken = null;
  storeToken(null);
};

export const setAccessTokenManually = (token: string | null) => {
  cachedAccessToken = token;
  storeToken(token);
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  storeToken(null);
};
