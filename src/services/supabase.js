import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qugdovsytjqjawsesdix.supabase.co';
const supabaseAnonKey = 'sb_publishable_DrPG1dGhbIWU2EARd9v88g_X3c_pPvX';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
