// ARCHIVO: src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Reemplaza esto con tus datos REALES de Supabase
const SUPABASE_URL = 'https://esgqzyxklmyhukhelqha.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Oq8H0hbxkVD-MwEQX7O9Tw_OPKzq3cB';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);