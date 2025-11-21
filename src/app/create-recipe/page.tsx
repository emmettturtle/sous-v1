'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MenuItem } from '@/types/database'

export default function CreateRecipePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('')
  const [title, setTitle] = useState('')
  const [ingredients, setIngredients] = useState<{ name: string; amount: string }[]>([
    { name: '', amount: '' }
  ])
  const [procedure, setProcedure] = useState('')
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(30)
  const [cookTimeMinutes, setCookTimeMinutes] = useState(30)
  const [cookingMethods, setCookingMethods] = useState<string[]>([])

  const availableCookingMethods = ['oven', 'stovetop', 'grill', 'microwave', 'slow cooker', 'air fryer', 'instant pot']

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        router.push('/login')
        return
      }

      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user || !user.email) {
        router.push('/login')
        return
      }

      setUser({ id: user.id, email: user.email })
      await loadMenuItems(user.id)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const loadMenuItems = async (chefId: string) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('chef_id', chefId)
        .order('name')

      if (error) throw error
      setMenuItems(data || [])
    } catch (error: any) {
      console.error('Error loading menu items:', error)
      alert('Error loading menu items: ' + error.message)
    }
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: 'name' | 'amount', value: string) => {
    const updated = [...ingredients]
    updated[index][field] = value
    setIngredients(updated)
  }

  const toggleCookingMethod = (method: string) => {
    if (cookingMethods.includes(method)) {
      setCookingMethods(cookingMethods.filter(m => m !== method))
    } else {
      setCookingMethods([...cookingMethods, method])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMenuItemId || !title || !procedure) {
      alert('Please fill in all required fields')
      return
    }

    const validIngredients = ingredients.filter(ing => ing.name && ing.amount)
    if (validIngredients.length === 0) {
      alert('Please add at least one ingredient')
      return
    }

    setSubmitting(true)

    try {
      if (!supabase) throw new Error('Supabase not initialized')

      // Auto-populate title from menu item if not provided
      let recipeTitle = title
      if (!recipeTitle && selectedMenuItemId) {
        const selectedItem = menuItems.find(item => item.id === selectedMenuItemId)
        recipeTitle = selectedItem?.name || 'Recipe'
      }

      const { error } = await supabase
        .from('recipes')
        .insert({
          menu_item_id: selectedMenuItemId,
          title: recipeTitle,
          ingredients: validIngredients,
          procedure,
          prep_time_minutes: prepTimeMinutes,
          cook_time_minutes: cookTimeMinutes,
          cooking_methods: cookingMethods
        })

      if (error) throw error

      alert('Recipe created successfully!')
      router.push('/menu-items')
    } catch (error: any) {
      console.error('Error creating recipe:', error)
      alert('Error creating recipe: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Auto-populate title when menu item is selected
  useEffect(() => {
    if (selectedMenuItemId) {
      const selectedItem = menuItems.find(item => item.id === selectedMenuItemId)
      if (selectedItem && !title) {
        setTitle(selectedItem.name)
      }
    }
  }, [selectedMenuItemId, menuItems])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900">
                Create Recipe
              </h1>
              <p className="text-sm text-gray-500">
                Add a detailed recipe to a menu item
              </p>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <button
                onClick={() => router.push('/menu-items')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Menu Item Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu Item <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedMenuItemId}
              onChange={(e) => setSelectedMenuItemId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a menu item</option>
              {menuItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.cuisine_type}
                </option>
              ))}
            </select>
          </div>

          {/* Recipe Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Classic Margherita Pizza"
              required
            />
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingredients <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={ingredient.amount}
                    onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                    className="w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Amount (e.g., 2 cups)"
                  />
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ingredient name"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngredient}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              + Add Ingredient
            </button>
          </div>

          {/* Procedure */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Procedure <span className="text-red-500">*</span>
            </label>
            <textarea
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter step-by-step instructions, one per line or numbered"
              required
            />
          </div>

          {/* Timing */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prep Time (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cook Time (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={cookTimeMinutes}
                onChange={(e) => setCookTimeMinutes(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Cooking Methods */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cooking Methods
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCookingMethods.map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => toggleCookingMethod(method)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    cookingMethods.includes(method)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/menu-items')}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {submitting ? 'Creating...' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
