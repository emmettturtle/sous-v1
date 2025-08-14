import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if environment variables are properly configured
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase')) {
  console.warn('⚠️  Supabase environment variables not configured. Please update .env.local with your Supabase project details.')
}

// Client-side Supabase client
export const supabase = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your_supabase') 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null