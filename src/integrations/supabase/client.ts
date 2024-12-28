import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xvesmwpswyhylfzxqfdr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2ZXNtd3Bzd3loeWxmenhxZmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxNjQzNzcsImV4cCI6MjA0OTc0MDM3N30.qxHM5Ej86i2ASGegYkWEEeQwspMEfCBA32-5qR8Qhpk";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    }
  }
);