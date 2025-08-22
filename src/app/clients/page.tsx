'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ClientsListSkeleton } from '@/components/LoadingSkeletons'
import { ClientPreferences } from '@/types/database'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  household_size: number
  created_at: string
  client_preferences: ClientPreferences[]
}

export default function ClientsList() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadClients = async () => {
      if (!supabase) return

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/login')
          return
        }

        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select(`
            *,
            client_preferences (*)
          `)
          .eq('chef_id', user.id)
          .order('created_at', { ascending: false })

        if (clientsError) throw clientsError

        setClients(clientsData || [])

      } catch (error: any) {
        console.error('Error loading clients:', error)
        alert('Error loading clients: ' + error.message)
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [router])

  if (loading) {
    return <ClientsListSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900">
                Client Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage your clients and use AI menu assistant
              </p>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <button
                onClick={() => router.push('/onboard-client-form')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add New Client
              </button>
              <button
                onClick={() => router.push('/dashboard-client')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {clients.length === 0 ? (
          <div className="text-center">
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">No clients yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first client.
              </p>
              <button
                onClick={() => router.push('/onboard-client-form')}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add First Client
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <div key={client.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 text-sm">
                      <div>
                        <dt className="font-medium text-gray-500">Phone</dt>
                        <dd className="text-gray-900">{client.phone || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Household</dt>
                        <dd className="text-gray-900">{client.household_size} people</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Added</dt>
                        <dd className="text-gray-900">
                          {new Date(client.created_at).toLocaleDateString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Preferences</dt>
                        <dd className="text-gray-900">
                          {client.client_preferences && client.client_preferences.length > 0 ? 'Configured' : 'Not set'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Quick preferences summary */}
                  {client.client_preferences && client.client_preferences[0] && (() => {
                    const prefs = client.client_preferences[0];
                    return (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-xs font-medium text-gray-500 mb-1">Quick Summary</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          {prefs.dietary_restrictions?.length && prefs.dietary_restrictions.length > 0 && (
                            <div>Dietary: {prefs.dietary_restrictions.join(', ')}</div>
                          )}
                          {prefs.allergies?.length && prefs.allergies.length > 0 && (
                            <div>Allergies: {prefs.allergies.join(', ')}</div>
                          )}
                          {prefs.cuisine_preferences?.length && prefs.cuisine_preferences.length > 0 && (
                            <div>Cuisines: {prefs.cuisine_preferences.slice(0, 2).join(', ')}</div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => {
                        // TODO: Add edit client functionality
                        alert('Edit client functionality coming soon!')
                      }}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Edit Client
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}