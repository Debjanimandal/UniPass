import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://avnghprolwvesapofgze.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bmdocHJvbHd2ZXNhcG9mZ3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMzU5ODQsImV4cCI6MjEwNDcxMTk4NH0.fMmQlgtA2bAm9dWzPDSaBNc4VvbdCOdul3agHcf-Q_4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
