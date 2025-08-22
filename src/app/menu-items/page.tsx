'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MenuItemsListSkeleton } from '@/components/LoadingSkeletons'

interface MenuItem {
  id: string
  name: string
  description: string
  cuisine_type: string
  ingredients: string[]
  allergens: string[]
  tags: string[]
  difficulty_level: 'easy' | 'medium' | 'hard'
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  price: number
  is_available: boolean
  recipe_url: string
  created_at: string
}

export default function MenuItemsPage() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCuisine, setFilterCuisine] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')

  useEffect(() => {
    const loadMenuItems = async () => {
      if (!supabase) return

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/login')
          return
        }

        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('chef_id', user.id)
          .order('created_at', { ascending: false })

        if (menuItemsError) throw menuItemsError

        setMenuItems(menuItemsData || [])

      } catch (error: any) {
        console.error('Error loading menu items:', error)
        alert('Error loading menu items: ' + error.message)
      } finally {
        setLoading(false)
      }
    }

    loadMenuItems()
  }, [router])

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !currentStatus })
        .eq('id', itemId)

      if (error) throw error

      // Update local state
      setMenuItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, is_available: !currentStatus }
            : item
        )
      )

    } catch (error: any) {
      console.error('Error updating menu item:', error)
      alert('Error updating menu item: ' + error.message)
    }
  }

  const deleteMenuItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return
    }

    if (!supabase) return

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      // Update local state
      setMenuItems(prev => prev.filter(item => item.id !== itemId))

    } catch (error: any) {
      console.error('Error deleting menu item:', error)
      alert('Error deleting menu item: ' + error.message)
    }
  }

  // Filter and search logic
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCuisine = !filterCuisine || item.cuisine_type === filterCuisine
    const matchesDifficulty = !filterDifficulty || item.difficulty_level === filterDifficulty

    return matchesSearch && matchesCuisine && matchesDifficulty
  })

  // Get unique values for filters
  const cuisineTypes = [...new Set(menuItems.map(item => item.cuisine_type))].sort()
  const difficultyLevels = ['easy', 'medium', 'hard']

  if (loading) {
    return <MenuItemsListSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900">
                Menu Items ({menuItems.length})
              </h1>
              <p className="text-sm text-gray-500">
                Manage your recipe collection and menu offerings
              </p>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <button
                onClick={() => router.push('/create-menu-item')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add New Menu Item
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
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name, description, or cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
              <select
                value={filterCuisine}
                onChange={(e) => setFilterCuisine(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Cuisines</option>
                {cuisineTypes.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Difficulties</option>
                {difficultyLevels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredMenuItems.length} of {menuItems.length} menu items
          </p>
        </div>

        {/* Menu Items Grid/List */}
        {filteredMenuItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {menuItems.length === 0 ? 'No menu items yet' : 'No items match your filters'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {menuItems.length === 0 
                  ? 'Create your first menu item to get started with your digital recipe collection.'
                  : 'Try adjusting your search terms or filters to find what you\'re looking for.'
                }
              </p>
              {menuItems.length === 0 && (
                <button
                  onClick={() => router.push('/create-menu-item')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create First Menu Item
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMenuItems.map((item) => (
              <div key={item.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.cuisine_type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{item.description}</p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Difficulty:</span>
                      <span className={`ml-1 capitalize ${
                        item.difficulty_level === 'easy' ? 'text-green-600' :
                        item.difficulty_level === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {item.difficulty_level}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Prep:</span> {item.prep_time_minutes}min
                    </div>
                    <div>
                      <span className="font-medium">Cook:</span> {item.cook_time_minutes}min
                    </div>
                    <div>
                      <span className="font-medium">Serves:</span> {item.servings}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Price:</span> ${item.price?.toFixed(2) || 'TBD'}
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Key Ingredients:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.ingredients.slice(0, 4).map((ingredient, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {ingredient}
                        </span>
                      ))}
                      {item.ingredients.length > 4 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{item.ingredients.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Allergens */}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-1">Allergens:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.allergens.map((allergen, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-1">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            +{item.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleAvailability(item.id, item.is_available)}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-md ${
                        item.is_available
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                    {item.recipe_url && (
                      <a
                        href={item.recipe_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                      >
                        Recipe
                      </a>
                    )}
                    <button
                      onClick={() => deleteMenuItem(item.id, item.name)}
                      className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                    >
                      Delete
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