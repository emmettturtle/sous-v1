'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { DashboardSkeleton } from '@/components/LoadingSkeletons'

export default function ClientDashboard() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
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
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-white to-gray-50 shadow-lg border-b border-gray-100">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-4 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
                    Sous Agent
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-600 font-medium">
                    Welcome back, <span className="text-indigo-600">{user?.email?.split('@')[0]}</span>
                  </p>
                  <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
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
                  href="/clients"
                  className="text-gray-600 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                >
                  Clients
                </a>
                <a
                  href="/menu-items"
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

                {/* AI Assistant - Prominent Section */}
                <div className="mt-8">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">🤖 AI Assistant</h2>
                        <p className="text-indigo-100 text-lg">
                          Get personalized menu recommendations, client management help, and operational guidance
                        </p>
                        <p className="text-indigo-200 text-sm mt-1">
                          Select a client and get instant AI-powered assistance with your chef business
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <span className="text-4xl">🧠</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button
                        onClick={() => router.push('/assistant')}
                        className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <span className="mr-2">🚀</span>
                        Launch AI Assistant
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="mt-8">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                  <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
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