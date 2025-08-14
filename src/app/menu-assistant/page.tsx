'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Message {
  id: string
  type: 'user' | 'assistant'
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

export default function MenuAssistant() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientId = searchParams.get('clientId')
  
  const [client, setClient] = useState<Client | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingClient, setLoadingClient] = useState(true)

  // Load client information
  useEffect(() => {
    const loadClient = async () => {
      if (!clientId || !supabase) return
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/login')
          return
        }

        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select(`
            *,
            client_preferences (*)
          `)
          .eq('id', clientId)
          .eq('chef_id', user.id)
          .single()

        if (clientError || !clientData) {
          alert('Client not found')
          router.push('/dashboard-client')
          return
        }

        setClient(clientData)
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: '1',
          type: 'assistant',
          content: `Hello! I'm your AI menu assistant. I'm here to help you create personalized menu recommendations for ${clientData.name}. 

I have their dietary preferences, allergies, and food preferences on file. You can ask me things like:
- "What should I cook for ${clientData.name} this week?"
- "Suggest some dishes that match their preferences"
- "What would be good for a dinner party?"
- "Show me low-prep options"

What would you like help with today?`,
          timestamp: new Date()
        }
        
        setMessages([welcomeMessage])

      } catch (error: any) {
        console.error('Error loading client:', error)
        alert('Error loading client information')
      } finally {
        setLoadingClient(false)
      }
    }

    loadClient()
  }, [clientId, router])

  const sendMessage = async () => {
    if (!inputMessage.trim() || !clientId) return

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
          clientId,
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

  if (loadingClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-lg text-gray-600">Loading client information...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Client not found</h1>
          <button
            onClick={() => router.push('/dashboard-client')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
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
                Menu Assistant for {client.name}
              </h1>
              <p className="text-sm text-gray-500">
                AI-powered menu recommendations based on client preferences
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

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-indigo-600 text-white'
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
                placeholder="Ask me about menu recommendations..."
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

        {/* Client Info Panel */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Client Preferences Summary</h3>
          {client.client_preferences && client.client_preferences[0] && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Dietary Restrictions:</span> {
                  client.client_preferences[0].dietary_restrictions?.join(', ') || 'None'
                }
              </div>
              <div>
                <span className="font-medium">Allergies:</span> {
                  client.client_preferences[0].allergies?.join(', ') || 'None'
                }
              </div>
              <div>
                <span className="font-medium">Cuisine Preferences:</span> {
                  client.client_preferences[0].cuisine_preferences?.join(', ') || 'Any'
                }
              </div>
              <div>
                <span className="font-medium">Spice Tolerance:</span> {
                  client.client_preferences[0].spice_tolerance || 'Medium'
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}