'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        router.push('/login')
        return
      }

      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      setLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login')
      } else if (session?.user) {
        setUser(session.user)
        setLoading(false)
      }
    }) || { data: { subscription: null } }

    return () => {
      subscription?.unsubscribe()
    }
  }, [router])

  const handleSignOut = async () => {
    await supabase?.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <div>
                  <div className="flex items-center">
                    <h1 className="ml-3 text-2xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
                      Sous Chef AI Dashboard (Client-Side)
                    </h1>
                  </div>
                  <dl className="mt-6 flex flex-col sm:ml-3 sm:mt-1 sm:flex-row sm:flex-wrap">
                    <dt className="sr-only">Account</dt>
                    <dd className="flex items-center text-sm text-gray-500 font-medium capitalize sm:mr-6">
                      Welcome, {user?.email}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-10">
        <div className="max-w-3xl mx-auto sm:px-6 lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="hidden lg:block lg:col-span-3 xl:col-span-2">
            <nav aria-label="Sidebar" className="sticky top-4 divide-y divide-gray-300">
              <div className="pb-8 space-y-1">
                <a
                  href="#"
                  className="bg-gray-200 text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                >
                  Clients
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                >
                  Menu Items
                </a>
                <a
                  href="/assistant"
                  className="text-gray-600 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                >
                  AI Assistant
                </a>
              </div>
            </nav>
          </div>
          <main className="lg:col-span-9 xl:col-span-10">
            <div className="mt-4">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Overview</h2>
                <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Stats cards */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                            <span className="text-white text-sm font-medium">C</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                            <dd className="text-lg font-medium text-gray-900">0</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                            <span className="text-white text-sm font-medium">M</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Menu Items</dt>
                            <dd className="text-lg font-medium text-gray-900">0</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                            <span className="text-white text-sm font-medium">🤖</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">AI Assistant</dt>
                            <dd className="text-lg font-medium text-gray-900">Ready</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User info for debugging */}
                <div className="mt-8 bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900">Auth Status</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Logged in as: {user?.email} (ID: {user?.id})
                  </p>
                  <p className="text-sm text-blue-700">
                    This is a client-side rendered dashboard that works with your current session.
                  </p>
                </div>

                {/* Quick actions */}
                <div className="mt-8">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                  <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 cursor-pointer"
                         onClick={() => router.push('/onboard-client-form')}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Add New Client</p>
                        <p className="text-sm text-gray-500 truncate">Quick form-based client onboarding</p>
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 cursor-pointer"
                         onClick={() => router.push('/create-menu-item')}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Create Menu Item</p>
                        <p className="text-sm text-gray-500 truncate">Add a new dish to your repertoire</p>
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 cursor-pointer"
                         onClick={() => router.push('/assistant')}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">AI Assistant</p>
                        <p className="text-sm text-gray-500 truncate">Get help with menus, clients, and operations</p>
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 cursor-pointer"
                         onClick={() => router.push('/clients')}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">View Clients</p>
                        <p className="text-sm text-gray-500 truncate">Manage client information</p>
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}