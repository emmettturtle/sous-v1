'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Message {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  suggestedMenuItems?: any[]
}

interface Client {
  id: string
  name: string
  email: string
  client_preferences: any[]
}

export default function AIAssistant() {
  const router = useRouter()
  
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingClients, setLoadingClients] = useState(true)

  // Load clients on component mount
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
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: '1',
          type: 'assistant',
          content: `Hello! I'm your AI chef assistant. I can help you with various tasks including:

🍽️ **Menu Planning** - Get personalized menu recommendations for your clients
📋 **Client Management** - Review client preferences and dietary requirements  
📊 **Administrative Tasks** - Help with planning and organization (more features coming soon!)

To get started, please select a client from the dropdown above that you'd like me to focus on, or ask me any general questions about your chef business.

What would you like help with today?`,
          timestamp: new Date()
        }
        
        setMessages([welcomeMessage])

      } catch (error: any) {
        console.error('Error loading clients:', error)
        alert('Error loading clients: ' + error.message)
      } finally {
        setLoadingClients(false)
      }
    }

    loadClients()
  }, [router])

  const selectClient = (client: Client) => {
    setSelectedClient(client)
    
    const selectionMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: `✅ Selected client: ${client.name}`,
      timestamp: new Date()
    }

    const contextMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: `Perfect! I'm now focused on ${client.name}. I have their dietary preferences and requirements loaded.

Here's what I can help you with for ${client.name}:

🍽️ **Menu Recommendations** - "What should I cook for ${client.name} this week?"
🥗 **Dietary Considerations** - "Show me ${client.name}'s dietary restrictions"
🛒 **Meal Planning** - "Plan a 3-day menu for ${client.name}"
⭐ **Special Occasions** - "Suggest a birthday dinner for ${client.name}"

What would you like to do for ${client.name}?`,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, selectionMessage, contextMessage])
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)

    try {
      if (!selectedClient) {
        // Handle general questions without a selected client
        const generalResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `I'd be happy to help! However, for the best personalized advice, please select a client from the dropdown above first. 

If you have general questions about chef business management, menu planning techniques, or need help with administrative tasks, I can certainly assist with those as well.

Could you either:
1. Select a client from the dropdown, or 
2. Let me know if you have a general question I can help with?`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, generalResponse])
        setLoading(false)
        return
      }

      // Get the auth token
      const { data: { session } } = await supabase!.auth.getSession()
      const token = session?.access_token

      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch('/api/menu-assistant', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: selectedClient.id,
          userMessage: inputMessage
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.message,
          timestamp: new Date(),
          suggestedMenuItems: data.suggestedMenuItems
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `Sorry, I encountered an error: ${data.error}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }

    } catch (error: any) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered a network error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearClient = () => {
    setSelectedClient(null)
    const clearMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: '🔄 Client selection cleared - ready for new selection',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, clearMessage])
  }

  if (loadingClients) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your AI assistant...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900">
                🤖 AI Chef Assistant
              </h1>
              <p className="text-sm text-gray-500">
                Your intelligent assistant for menu planning, client management, and chef operations
              </p>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
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

      {/* Client Selection Bar */}
      <div className="bg-indigo-50 border-b border-indigo-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-indigo-900">Client Focus:</label>
              <select
                value={selectedClient?.id || ''}
                onChange={(e) => {
                  const client = clients.find(c => c.id === e.target.value)
                  if (client) selectClient(client)
                }}
                className="block w-64 px-3 py-2 border border-indigo-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
              {selectedClient && (
                <button
                  onClick={clearClient}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Clear Selection
                </button>
              )}
            </div>
            {selectedClient && (
              <div className="text-sm text-indigo-700">
                ✅ Focused on: <span className="font-medium">{selectedClient.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-400px)] min-h-96 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 
                  message.type === 'system' ? 'justify-center' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-md lg:max-w-2xl px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-indigo-600 text-white'
                      : message.type === 'system'
                      ? 'bg-yellow-100 text-yellow-800 text-sm'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  
                  {/* Suggested Menu Items */}
                  {message.suggestedMenuItems && message.suggestedMenuItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className="text-xs font-medium mb-2">Suggested Menu Items:</p>
                      <div className="space-y-1">
                        {message.suggestedMenuItems.map((item: any) => (
                          <div key={item.id} className="text-xs bg-white bg-opacity-20 rounded p-2">
                            <div className="font-medium">{item.name}</div>
                            <div className="opacity-80">{item.cuisine_type} • {item.prep_time_minutes} min</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  selectedClient 
                    ? `Ask me about ${selectedClient.name} or general chef topics...`
                    : "Select a client above or ask me general questions..."
                }
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                rows={2}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section - Client Info and No Clients Message */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Client Info Panel */}
        {selectedClient && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Current Client: {selectedClient.name}
            </h3>
            {selectedClient.client_preferences && selectedClient.client_preferences[0] && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Dietary Restrictions:</span> {
                    selectedClient.client_preferences[0].dietary_restrictions?.join(', ') || 'None'
                  }
                </div>
                <div>
                  <span className="font-medium">Allergies:</span> {
                    selectedClient.client_preferences[0].allergies?.join(', ') || 'None'
                  }
                </div>
                <div>
                  <span className="font-medium">Cuisine Preferences:</span> {
                    selectedClient.client_preferences[0].cuisine_preferences?.join(', ') || 'Any'
                  }
                </div>
                <div>
                  <span className="font-medium">Spice Tolerance:</span> {
                    selectedClient.client_preferences[0].spice_tolerance || 'Medium'
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Clients Message */}
        {clients.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-yellow-600">
                <p className="text-sm">
                  You don't have any clients yet. 
                  <button
                    onClick={() => router.push('/onboard-client-form')}
                    className="ml-1 text-yellow-700 underline hover:text-yellow-800"
                  >
                    Add your first client
                  </button>
                  {' '}to get personalized recommendations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}