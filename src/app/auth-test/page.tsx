'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthTest() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        console.log('Supabase not configured')
        setLoading(false)
        return
      }

      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Session:', session)
      console.log('Session error:', sessionError)
      setSession(session)

      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('User:', user)
      console.log('User error:', userError)
      setUser(user)

      setLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session)
      setSession(session)
      setUser(session?.user || null)
    }) || { data: { subscription: null } }

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Client-Side Auth Test</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold">Session:</h2>
              <pre className="bg-gray-100 p-2 rounded text-sm max-h-40 overflow-auto">
                {session ? JSON.stringify(session, null, 2) : 'No session'}
              </pre>
            </div>

            <div>
              <h2 className="font-semibold">User:</h2>
              <pre className="bg-gray-100 p-2 rounded text-sm max-h-40 overflow-auto">
                {user ? JSON.stringify(user, null, 2) : 'No user'}
              </pre>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back to Login
              </button>
              
              {user && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Try Dashboard
                </button>
              )}
              
              {user && (
                <button
                  onClick={async () => {
                    await supabase?.auth.signOut()
                    router.push('/login')
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}