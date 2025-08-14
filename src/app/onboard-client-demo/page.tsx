'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatInterface from '@/components/ChatInterface'
import { supabase } from '@/lib/supabase'

export default function OnboardClientDemo() {
  const [isComplete, setIsComplete] = useState(false)
  const [clientData, setClientData] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  // Demo conversation flow
  const demoSteps = [
    "Hello! I'm your personal chef AI assistant. I'm here to help you onboard a new client. Let's start by getting some basic information. What's your new client's name?",
    "Great! Now I need their contact information. Could you provide their email address and phone number?",
    "Perfect! Now let's talk about their dietary needs. Do they have any dietary restrictions like vegetarian, vegan, gluten-free, or any food allergies?",
    "Excellent information! What types of cuisine do they enjoy? For example, Italian, Asian, Mediterranean, Mexican, etc.?",
    "That's helpful! Are there any specific ingredients they particularly dislike or want to avoid?",
    "What about ingredients they absolutely love and would like to see more often in their meals?",
    "How is their spice tolerance? Would you say they prefer no spice, mild, medium, or hot spicy food?",
    "Are there any cooking methods they want to avoid? For example, fried foods, grilled foods, etc.?",
    "What's their household size, and do they prefer batch cooking for meal prep or individual fresh portions?",
    "Finally, do they have a budget per meal they'd like to stay within?",
    "Perfect! I have all the information I need. Let me save this client to your database now..."
  ]

  const handleSendMessage = async (message: string): Promise<string> => {
    if (currentStep >= demoSteps.length - 1) {
      // Simulate saving to database
      try {
        const { data: { user } } = await supabase!.auth.getUser()
        if (!user) {
          throw new Error('Not authenticated')
        }

        // Create a demo client record
        const demoClient = {
          chef_id: user.id,
          name: "Demo Client",
          email: "demo@example.com",
          phone: "555-0123",
          address: { street: "123 Demo St", city: "Demo City", state: "DC", zip: "12345" },
          household_size: 2
        }

        const { data: clientData, error: clientError } = await supabase!
          .from('clients')
          .insert([demoClient])
          .select()
          .single()

        if (clientError) throw clientError

        // Create demo preferences
        const demoPreferences = {
          client_id: clientData.id,
          dietary_restrictions: ["vegetarian"],
          allergies: ["nuts"],
          cuisine_preferences: ["Italian", "Mediterranean"],
          disliked_ingredients: ["mushrooms"],
          preferred_ingredients: ["tomatoes", "basil", "olive oil"],
          spice_tolerance: "mild" as const,
          cooking_methods_to_avoid: ["fried"],
          meal_prep_preferences: { batch_cooking: false, individual_portions: true },
          budget_per_meal: 25.00
        }

        const { error: prefError } = await supabase!
          .from('client_preferences')
          .insert([demoPreferences])

        if (prefError) throw prefError

        setClientData(demoClient)
        setIsComplete(true)
        
        return "Excellent! I've successfully saved your client's information to the database. They're now ready to receive personalized menu recommendations based on their preferences!"
      } catch (error) {
        console.error('Error saving demo client:', error)
        return "I've collected all the information, but there was an error saving to the database. In a real scenario, this would be saved automatically."
      }
    }

    // Return the next step in the conversation
    const nextStep = currentStep + 1
    setCurrentStep(nextStep)
    return demoSteps[nextStep] || "Thank you for the information!"
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
              Demo Client has been successfully added to your client database.
            </p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Demo Client Summary</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Vegetarian with nut allergies</li>
              <li>Prefers Italian and Mediterranean cuisine</li>
              <li>Mild spice tolerance</li>
              <li>Avoids fried foods and mushrooms</li>
              <li>Loves tomatoes, basil, and olive oil</li>
              <li>Individual portions preferred</li>
              <li>$25 budget per meal</li>
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
                AI Client Onboarding (Demo Mode)
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Demo version - simulates AI conversation without OpenAI API calls.
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
              title="AI Client Onboarding (Demo)"
              placeholder="Tell me about your new client..."
              onSendMessage={handleSendMessage}
              initialMessage={demoSteps[0]}
              className="h-full"
            />
          </div>
          
          <div className="mt-6 bg-yellow-50 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Demo Mode Active
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This is a demo version that simulates the AI conversation. To use the full AI features, 
                    add credits to your OpenAI account. The client data will still be saved to your database.
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