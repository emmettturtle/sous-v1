'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ClientOnboardingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    household_size: 1,
    
    // Preferences
    dietary_restrictions: [] as string[],
    allergies: [] as string[],
    cuisine_preferences: [] as string[],
    disliked_ingredients: [] as string[],
    preferred_ingredients: [] as string[],
    spice_tolerance: 'medium' as 'none' | 'mild' | 'medium' | 'hot',
    cooking_methods_to_avoid: [] as string[],
    meal_prep_preferences: {
      batch_cooking: false,
      individual_portions: true
    },
    budget_per_meal: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!supabase) {
        throw new Error('Supabase not initialized')
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }

      // Insert client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          chef_id: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          household_size: formData.household_size
        })
        .select()
        .single()

      if (clientError) throw clientError

      // Insert preferences
      const { error: preferencesError } = await supabase
        .from('client_preferences')
        .insert({
          client_id: clientData.id,
          dietary_restrictions: formData.dietary_restrictions,
          allergies: formData.allergies,
          cuisine_preferences: formData.cuisine_preferences,
          disliked_ingredients: formData.disliked_ingredients,
          preferred_ingredients: formData.preferred_ingredients,
          spice_tolerance: formData.spice_tolerance,
          cooking_methods_to_avoid: formData.cooking_methods_to_avoid,
          meal_prep_preferences: formData.meal_prep_preferences,
          budget_per_meal: formData.budget_per_meal
        })

      if (preferencesError) throw preferencesError

      // Success! Redirect to dashboard
      router.push('/dashboard-client?success=client-added')

    } catch (error: any) {
      console.error('Error adding client:', error)
      alert('Error adding client: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleArrayInput = (field: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item)
    setFormData(prev => ({ ...prev, [field]: items }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Client</h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Household Size</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.household_size}
                      onChange={(e) => setFormData(prev => ({ ...prev, household_size: parseInt(e.target.value) }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Address</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={formData.address.street}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.address.city}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={formData.address.state}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, state: e.target.value }
                        }))}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="ZIP"
                        value={formData.address.zip}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, zip: e.target.value }
                        }))}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Dietary Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dietary Restrictions</label>
                    <input
                      type="text"
                      placeholder="e.g., vegetarian, vegan, keto (comma-separated)"
                      onChange={(e) => handleArrayInput('dietary_restrictions', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allergies</label>
                    <input
                      type="text"
                      placeholder="e.g., nuts, dairy, shellfish (comma-separated)"
                      onChange={(e) => handleArrayInput('allergies', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cuisine Preferences</label>
                    <input
                      type="text"
                      placeholder="e.g., Italian, Asian, Mediterranean (comma-separated)"
                      onChange={(e) => handleArrayInput('cuisine_preferences', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Disliked Ingredients</label>
                    <input
                      type="text"
                      placeholder="e.g., cilantro, mushrooms, olives (comma-separated)"
                      onChange={(e) => handleArrayInput('disliked_ingredients', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Ingredients</label>
                    <input
                      type="text"
                      placeholder="e.g., garlic, basil, chicken (comma-separated)"
                      onChange={(e) => handleArrayInput('preferred_ingredients', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Spice Tolerance</label>
                      <select
                        value={formData.spice_tolerance}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          spice_tolerance: e.target.value as 'none' | 'mild' | 'medium' | 'hot'
                        }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="none">None</option>
                        <option value="mild">Mild</option>
                        <option value="medium">Medium</option>
                        <option value="hot">Hot</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Budget per Meal ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.budget_per_meal}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget_per_meal: parseFloat(e.target.value) }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meal Prep Preferences</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.meal_prep_preferences.batch_cooking}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            meal_prep_preferences: {
                              ...prev.meal_prep_preferences,
                              batch_cooking: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Batch cooking (multiple servings)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.meal_prep_preferences.individual_portions}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            meal_prep_preferences: {
                              ...prev.meal_prep_preferences,
                              individual_portions: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Individual portions</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Adding Client...' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}