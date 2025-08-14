'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatInterface from '@/components/ChatInterface'
import { supabase } from '@/lib/supabase'

export default function OnboardClient() {
  const [isComplete, setIsComplete] = useState(false)
  const [clientData, setClientData] = useState<any>(null)
  const router = useRouter()

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      // Get current user for auth
      const { data: { user } } = await supabase!.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/agents/onboard-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase!.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ message })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      
      // Check if onboarding is complete
      if (data.state?.completed) {
        setIsComplete(true)
        setClientData(data.client_info)
      }

      return data.response || 'I understand. Please continue...'
    } catch (error) {
      console.error('Error communicating with agent:', error)
      return 'I apologize, but I encountered an error. This might be because the OpenAI API key is not configured. Please make sure to add your OpenAI API key to the environment variables and try again.'
    }
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard-client')
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Client Onboarding Complete!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {clientData?.name ? `${clientData.name} has been` : 'Your new client has been'} successfully added to your client database.
            </p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Review client preferences in your dashboard</li>
              <li>Create or update your menu items</li>
              <li>Use the AI to get personalized menu recommendations</li>
            </ul>
          </div>

          <div>
            <button
              onClick={handleBackToDashboard}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Dashboard
            </button>
          </div>
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
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
                Client Onboarding Assistant
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                I'll help you gather all the information needed to serve your new client perfectly.
              </p>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <button
                onClick={handleBackToDashboard}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-96">
            <ChatInterface
              title="AI Client Onboarding"
              placeholder="Tell me about your new client..."
              onSendMessage={handleSendMessage}
              initialMessage="Hello! I'm your personal chef AI assistant. I'm here to help you onboard a new client. Let's start by getting some basic information. What's your new client's name?"
              className="h-full"
            />
          </div>
          
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  How this works
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    The AI will ask you questions to gather information about your client's dietary preferences, 
                    restrictions, favorite cuisines, and other important details. This information will be saved 
                    to help create personalized menu recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}