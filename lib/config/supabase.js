import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zvxvfqxgyetuybonhgzn.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2eHZmcXhneWV0dXlib25oZ3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDE4MzEsImV4cCI6MjA4MTIxNzgzMX0.iG6mWsvbqUYF-Bvu1LzUrwSvft05O1YcHRgbdygQ7Ww';

/** Required on React Native: session persistence + stable auth networking */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

