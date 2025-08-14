import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Server-side Supabase client with cookie handling
export const createServerSupabaseClient = async () => {
  // Check if environment variables are properly configured
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase')) {
    throw new Error('Supabase environment variables not configured. Please update .env.local with your Supabase project details.')
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // More permissive cookie setting for server components
            cookieStore.set(name, value, {
              ...options,
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            })
          })
        } catch (error) {
          // Log the error for debugging but don't throw
          console.warn('Cookie setting failed in server component:', error)
        }
      },
    },
  })
}