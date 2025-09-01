const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Role Key are required for the backend. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // It's important to set autoRefreshToken and persistSession to false
    // when using the service role key in a backend environment.
    // This prevents the client from trying to manage sessions, which is not needed for server-to-server calls.
    autoRefreshToken: false,
    persistSession: false,
  }
})

module.exports = supabase
