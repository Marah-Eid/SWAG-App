// 1. MANDATORY: Polyfill for React Native URL handling
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 2. Custom Storage logic for Web vs Mobile
const customStorage = Platform.OS === 'web' ? {
  getItem: (key) => {
    if (typeof window !== 'undefined') return window.localStorage.getItem(key);
    return null;
  },
  setItem: (key, value) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  },
} : AsyncStorage;

// 3. Create the client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Required for mobile deep linking compatibility
  },
});