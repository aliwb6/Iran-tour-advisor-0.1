// Supabase Configuration
// Replace these values with your actual Supabase URL and anon key
const supabaseUrl = ''; // Your Supabase URL
const supabaseAnonKey = ''; // Your Supabase anon key

// Create Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// Export for use in other files
window.supabaseClient = supabase;