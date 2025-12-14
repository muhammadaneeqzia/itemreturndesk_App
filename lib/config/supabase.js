import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zvxvfqxgyetuybonhgzn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2eHZmcXhneWV0dXlib25oZ3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDE4MzEsImV4cCI6MjA4MTIxNzgzMX0.iG6mWsvbqUYF-Bvu1LzUrwSvft05O1YcHRgbdygQ7Ww";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

