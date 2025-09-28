import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://jaaetwlmiyccaaqmjymf.supabase.co';
const supabaseKey = 'sb_publishable_yT-phm8DDID9_AB9ql3vaA_3mmBp9-q';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };