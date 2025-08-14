'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CreateMenuItem() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    recipe_url: '',
    ingredients: '',
    allergens: '',
    tags: '',
    meal_type: '',
    cuisine_type: '',
    prep_time_minutes: '',
    difficulty_level: 'easy' as 'easy' | 'medium' | 'hard',
    price: '',
    seasonal_availability: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase!.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Process form data
      const menuItemData = {
        chef_id: user.id,
        name: formData.name,
        description: formData.description || null,
        recipe_url: formData.recipe_url || null,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
        allergens: formData.allergens ? formData.allergens.split(',').map(a => a.trim()).filter(a => a) : [],
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        meal_type: formData.meal_type || null,
        cuisine_type: formData.cuisine_type || null,
        prep_time_minutes: formData.prep_time_minutes ? parseInt(formData.prep_time_minutes) : null,
        difficulty_level: formData.difficulty_level,
        price: formData.price ? parseFloat(formData.price) : null,
        seasonal_availability: formData.seasonal_availability ? formData.seasonal_availability.split(',').map(s => s.trim()).filter(s => s) : [],
        is_available: true
      }

      // Insert into database
      const { error: insertError } = await supabase!
        .from('menu_items')
        .insert([menuItemData])

      if (insertError) {
        throw insertError
      }

      // Success! Navigate back to dashboard
      router.push('/dashboard-client')
    } catch (err: any) {
      console.error('Error creating menu item:', err)
      setError(err.message || 'Failed to create menu item')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
                Create Menu Item
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Add a new dish to your repertoire for client recommendations.
              </p>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <button
                onClick={() => router.push('/dashboard-client')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Truffle Risotto"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Brief description of the dish..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="recipe_url" className="block text-sm font-medium text-gray-700">
                    Recipe URL
                  </label>
                  <input
                    type="url"
                    name="recipe_url"
                    id="recipe_url"
                    value={formData.recipe_url}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="https://..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">
                    Ingredients * (comma-separated)
                  </label>
                  <textarea
                    name="ingredients"
                    id="ingredients"
                    rows={3}
                    required
                    value={formData.ingredients}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="truffle oil, arborio rice, parmesan cheese, chicken stock..."
                  />
                </div>

                <div>
                  <label htmlFor="allergens" className="block text-sm font-medium text-gray-700">
                    Allergens (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="allergens"
                    id="allergens"
                    value={formData.allergens}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="dairy, gluten, nuts..."
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    id="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="vegetarian, comfort-food, healthy..."
                  />
                </div>

                <div>
                  <label htmlFor="meal_type" className="block text-sm font-medium text-gray-700">
                    Meal Type
                  </label>
                  <select
                    name="meal_type"
                    id="meal_type"
                    value={formData.meal_type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select meal type</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                    <option value="dessert">Dessert</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="cuisine_type" className="block text-sm font-medium text-gray-700">
                    Cuisine Type
                  </label>
                  <input
                    type="text"
                    name="cuisine_type"
                    id="cuisine_type"
                    value={formData.cuisine_type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Italian, Asian, Mediterranean..."
                  />
                </div>

                <div>
                  <label htmlFor="prep_time_minutes" className="block text-sm font-medium text-gray-700">
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="prep_time_minutes"
                    id="prep_time_minutes"
                    min="0"
                    value={formData.prep_time_minutes}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700">
                    Difficulty Level
                  </label>
                  <select
                    name="difficulty_level"
                    id="difficulty_level"
                    value={formData.difficulty_level}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    id="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="seasonal_availability" className="block text-sm font-medium text-gray-700">
                    Seasonal Availability (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="seasonal_availability"
                    id="seasonal_availability"
                    value={formData.seasonal_availability}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="spring, summer, fall, winter"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard-client')}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                >
                  {isLoading ? 'Creating...' : 'Create Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}