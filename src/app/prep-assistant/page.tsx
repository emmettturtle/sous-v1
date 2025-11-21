'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MenuItemWithRecipe, Recipe } from '@/types/database'
import AppLayout from '@/components/AppLayout'

interface PrepListItem extends MenuItemWithRecipe {
  selected: boolean
}

interface ScheduleTask {
  menuItemId: string
  menuItemName: string
  startTime: string
  endTime: string
  duration: number
}

export default function PrepAssistantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)

  // Prep list state
  const [prepList, setPrepList] = useState<PrepListItem[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [availableMenuItems, setAvailableMenuItems] = useState<MenuItemWithRecipe[]>([])
  const [menuSearchTerm, setMenuSearchTerm] = useState('')

  // Recipe card state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemWithRecipe | null>(null)

  // Schedule state
  const [schedule, setSchedule] = useState<ScheduleTask[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentScheduleId, setCurrentScheduleId] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [autoLoadMessage, setAutoLoadMessage] = useState<string | null>(null)

  // Check authentication
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
      await loadAvailableMenuItems(user.id)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  // Load available menu items with recipes
  const loadAvailableMenuItems = async (chefId: string) => {
    if (!supabase) return

    try {
      // Fetch menu items
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('chef_id', chefId)
        .eq('is_available', true)
        .order('name')

      if (menuError) throw menuError

      // Fetch all recipes for these menu items
      const menuItemIds = menuItems?.map(item => item.id) || []
      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('*')
        .in('menu_item_id', menuItemIds)

      if (recipesError) {
        console.error('Error loading recipes:', recipesError)
      }

      // Join them client-side
      const itemsWithRecipes: MenuItemWithRecipe[] = (menuItems || []).map(item => {
        const recipe = recipes?.find(r => r.menu_item_id === item.id)
        return {
          ...item,
          recipe: recipe
        }
      })

      setAvailableMenuItems(itemsWithRecipes)

      // Auto-load last schedule after menu items are loaded (only on initial mount)
      await loadLastSchedule(chefId, itemsWithRecipes)
    } catch (error: any) {
      console.error('Error loading menu items:', error)
      alert('Error loading menu items: ' + error.message)
    }
  }

  /**
   * Auto-load last schedule for this chef
   *
   * Automatically loads the most recently saved schedule when the page loads.
   * Restores both the prep list items and the generated schedule, allowing
   * users to continue where they left off.
   *
   * @param chefId - The chef's user ID
   * @param menuItems - Available menu items to restore from
   */
  const loadLastSchedule = async (chefId: string, menuItems: MenuItemWithRecipe[]) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('prep_schedules')
        .select('*')
        .eq('chef_id', chefId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        // No schedule found is okay
        if (error.code === 'PGRST116') return
        console.error('Error loading schedule:', error)
        return
      }

      if (data) {
        // Restore the schedule
        setCurrentScheduleId(data.id)
        setSchedule(data.schedule_data)
        setLastSaved(new Date(data.updated_at))

        // Restore prep list if items still exist
        const itemIds = data.prep_list_items
        const restoredItems = menuItems.filter(item => itemIds.includes(item.id))
        if (restoredItems.length > 0) {
          setPrepList(restoredItems.map(item => ({ ...item, selected: false })))

          // Show notification that schedule was auto-loaded
          setAutoLoadMessage(`Loaded your last schedule with ${restoredItems.length} item(s)`)
          setTimeout(() => setAutoLoadMessage(null), 5000) // Hide after 5 seconds
        }
      }
    } catch (error: any) {
      console.error('Error loading last schedule:', error)
    }
  }

  // Save schedule to database
  const saveSchedule = async () => {
    if (!user || !supabase || schedule.length === 0) return

    setIsSaving(true)
    try {
      const scheduleData = {
        chef_id: user.id,
        prep_list_items: prepList.map(item => item.id),
        schedule_data: schedule,
        time_window_start: '06:00',
        time_window_end: '17:00'
      }

      if (currentScheduleId) {
        // Update existing schedule
        const { error } = await supabase
          .from('prep_schedules')
          .update(scheduleData)
          .eq('id', currentScheduleId)

        if (error) throw error
      } else {
        // Create new schedule
        const { data, error } = await supabase
          .from('prep_schedules')
          .insert(scheduleData)
          .select()
          .single()

        if (error) throw error
        if (data) setCurrentScheduleId(data.id)
      }

      setLastSaved(new Date())
    } catch (error: any) {
      console.error('Error saving schedule:', error)
      alert('Error saving schedule: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Add item to prep list
  const addToPrepList = (item: MenuItemWithRecipe) => {
    if (!prepList.find(p => p.id === item.id)) {
      setPrepList([...prepList, { ...item, selected: false }])
    }
    setShowAddModal(false)
    setMenuSearchTerm('')
  }

  // Remove item from prep list
  const removeFromPrepList = (itemId: string) => {
    setPrepList(prepList.filter(item => item.id !== itemId))
    if (selectedMenuItem?.id === itemId) {
      setSelectedRecipe(null)
      setSelectedMenuItem(null)
    }
  }

  // Select a prep list item to view recipe
  const selectPrepItem = (item: PrepListItem) => {
    // Update selection state
    setPrepList(prepList.map(p => ({
      ...p,
      selected: p.id === item.id
    })))
    setSelectedMenuItem(item)
    setSelectedRecipe(item.recipe || null)
  }

  // Clear all data and start fresh
  const startFresh = () => {
    if (prepList.length === 0 && schedule.length === 0) {
      return // Nothing to clear
    }

    const confirmed = confirm('Are you sure you want to clear your current prep list and schedule? This cannot be undone.')
    if (!confirmed) return

    setPrepList([])
    setSchedule([])
    setSelectedRecipe(null)
    setSelectedMenuItem(null)
    setCurrentScheduleId(null)
    setLastSaved(null)
    setAutoLoadMessage(null)
  }

  // Select item from Gantt chart by menu item ID
  const selectItemById = (menuItemId: string) => {
    const item = prepList.find(p => p.id === menuItemId)
    if (item) {
      selectPrepItem(item)
    }
  }

  // Generate schedule
  const generateSchedule = async () => {
    if (!user || prepList.length === 0) return

    // Check if all items have recipes
    const itemsWithoutRecipes = prepList.filter(item => !item.recipe)
    if (itemsWithoutRecipes.length > 0) {
      alert(`The following items don't have recipes yet: ${itemsWithoutRecipes.map(i => i.name).join(', ')}. Please add recipes before generating a schedule.`)
      return
    }

    setIsGenerating(true)

    try {
      // Get auth session for API call
      const { data: { session } } = await supabase!.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      // Prepare prep list for API
      const prepListForApi = prepList.map(item => {
        const totalDuration = item.recipe!.prep_time_minutes + item.recipe!.cook_time_minutes
        return {
          menuItemId: item.id,
          menuItemName: item.name,
          prepTimeMinutes: item.recipe!.prep_time_minutes,
          cookTimeMinutes: item.recipe!.cook_time_minutes,
          totalDuration: totalDuration,
          cookingMethods: item.recipe!.cooking_methods
        }
      })

      const response = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          prepList: prepListForApi,
          timeWindowStart: '06:00',
          timeWindowEnd: '17:00'
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate schedule')
      }

      setSchedule(data.schedule)

      // Auto-save after generation
      setTimeout(() => saveSchedule(), 100)
    } catch (error: any) {
      console.error('Error generating schedule:', error)
      alert('Error generating schedule: ' + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  // Auto-save when schedule is modified (e.g., by dragging)
  useEffect(() => {
    if (schedule.length > 0 && user) {
      const timeoutId = setTimeout(() => {
        saveSchedule()
      }, 1000) // Debounce saves by 1 second

      return () => clearTimeout(timeoutId)
    }
  }, [schedule])

  // Filter menu items for modal
  const filteredMenuItems = availableMenuItems.filter(item =>
    item.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
    item.cuisine_type?.toLowerCase().includes(menuSearchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold leading-7 text-gray-900">
            Prep Assistant
          </h1>
          <p className="text-sm text-gray-500">
            Plan your production schedule with AI-powered optimization
          </p>
        </div>

        {/* Auto-load notification */}
        {autoLoadMessage && (
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-indigo-700">{autoLoadMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setAutoLoadMessage(null)}
                  className="inline-flex text-indigo-400 hover:text-indigo-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Section: Prep List (Left) + Recipe Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Section 1: Prep List (25% width) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[400px] flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Prep List</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none"
                  title="Add menu item"
                >
                  <span className="text-lg font-bold">+</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {prepList.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    Click + to add menu items to your prep list
                  </div>
                ) : (
                  <div className="space-y-2">
                    {prepList.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-start space-x-2 p-2 rounded cursor-pointer group transition-colors ${
                          item.selected
                            ? 'bg-indigo-50 border border-indigo-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                        onClick={() => selectPrepItem(item)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            item.selected ? 'text-indigo-900' : 'text-gray-900'
                          }`}>
                            {item.name}
                          </p>
                          {!item.recipe && (
                            <p className="text-xs text-red-600">No recipe</p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromPrepList(item.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Recipe Card (75% width) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[400px] overflow-y-auto">
              {selectedRecipe && selectedMenuItem ? (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedRecipe.title}</h2>

                  {/* Timing Information */}
                  <div className="mb-6 flex space-x-4 text-sm text-gray-600">
                    <span className="font-medium">Prep time: {selectedRecipe.prep_time_minutes} minutes</span>
                    <span className="font-medium">Cook time: {selectedRecipe.cook_time_minutes} minutes</span>
                  </div>

                  {/* Ingredients */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
                    <ul className="space-y-1">
                      {selectedRecipe.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="text-gray-700">
                          • {ingredient.amount} {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Procedure */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Procedure</h3>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {selectedRecipe.procedure.split('\n').map((step, idx) => {
                        const trimmedStep = step.trim()
                        if (!trimmedStep) return null
                        return (
                          <p key={idx} className="mb-2">
                            {idx + 1}. {trimmedStep}
                          </p>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>Select a menu item from the prep list to view its recipe</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Production Schedule (Gantt Chart) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Production Schedule</h2>
                {lastSaved && (
                  <span className="text-xs text-gray-500">
                    {isSaving ? 'Saving...' : `Last saved: ${lastSaved.toLocaleTimeString()}`}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={startFresh}
                  disabled={prepList.length === 0 && schedule.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  title="Clear prep list and schedule"
                >
                  Start Fresh
                </button>
                <button
                  onClick={generateSchedule}
                  disabled={prepList.length === 0 || isGenerating}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate Schedule'}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Based on the dishes in the prep list, an organized production schedule will be generated, determined by recipe procedure.
            </p>
          </div>

          <div className="p-6">
            <GanttChart schedule={schedule} setSchedule={setSchedule} onTaskClick={selectItemById} />
          </div>
        </div>

        {/* Add Menu Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Menu Item</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setMenuSearchTerm('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="Search menu items..."
                value={menuSearchTerm}
                onChange={(e) => setMenuSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="overflow-y-auto max-h-96 p-6">
              {filteredMenuItems.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No menu items found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMenuItems.map(item => {
                    const alreadyAdded = prepList.some(p => p.id === item.id)
                    return (
                      <div
                        key={item.id}
                        onClick={() => !alreadyAdded && addToPrepList(item)}
                        className={`p-4 border border-gray-200 rounded-lg hover:bg-gray-50 ${
                          alreadyAdded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                            <p className="text-xs text-gray-600">{item.cuisine_type}</p>
                            {!item.recipe && (
                              <p className="text-xs text-red-600 mt-1">⚠️ No recipe available</p>
                            )}
                          </div>
                          {alreadyAdded && (
                            <span className="text-sm text-green-600 font-medium">Added</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </AppLayout>
  )
}

// Gantt Chart Component
interface GanttChartProps {
  schedule: ScheduleTask[]
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleTask[]>>
  onTaskClick: (menuItemId: string) => void
}

function GanttChart({ schedule, setSchedule, onTaskClick }: GanttChartProps) {
  const [draggedTask, setDraggedTask] = useState<number | null>(null)
  const [dragStartX, setDragStartX] = useState<number>(0)
  const [dragStartTime, setDragStartTime] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)

  // Time configuration
  const startHour = 6 // 6 AM (for internal calculations)
  const endHour = 17 // 5 PM (for internal calculations)
  const totalHours = endHour - startHour
  const hours = Array.from({ length: totalHours }, (_, i) => i + 1) // 1hr, 2hr, 3hr...

  // Colors for tasks
  const taskColors = [
    'bg-orange-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-blue-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500'
  ]

  // Convert time string "HH:MM" to pixels
  const timeToPixels = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    const totalMinutes = (hours - startHour) * 60 + minutes
    const totalAvailableMinutes = totalHours * 60
    const width = 100 // percentage
    return (totalMinutes / totalAvailableMinutes) * width
  }

  // Convert pixels to time string
  const pixelsToTime = (percent: number): string => {
    const totalMinutes = (percent / 100) * totalHours * 60
    const hours = Math.floor(totalMinutes / 60) + startHour
    const minutes = Math.round(totalMinutes % 60)

    // Snap to 15-minute intervals
    const snappedMinutes = Math.round(minutes / 15) * 15
    const adjustedHours = snappedMinutes === 60 ? hours + 1 : hours
    const finalMinutes = snappedMinutes === 60 ? 0 : snappedMinutes

    return `${String(adjustedHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`
  }

  // Duration in pixels
  const durationToWidth = (duration: number): number => {
    const totalAvailableMinutes = totalHours * 60
    return (duration / totalAvailableMinutes) * 100
  }

  // Handle mouse down on task
  const handleMouseDown = (e: React.MouseEvent, taskIndex: number) => {
    setDraggedTask(taskIndex)
    setDragStartX(e.clientX)
    setDragStartTime(schedule[taskIndex].startTime)
    setIsDragging(false) // Reset drag state
  }

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedTask === null) return

    const containerWidth = (e.currentTarget as HTMLElement).offsetWidth
    const deltaX = e.clientX - dragStartX

    // If moved more than 5 pixels, consider it a drag
    if (Math.abs(deltaX) > 5) {
      setIsDragging(true)
    }

    const deltaPercent = (deltaX / containerWidth) * 100

    const startPercent = timeToPixels(dragStartTime)
    const newStartPercent = Math.max(0, Math.min(100 - durationToWidth(schedule[draggedTask].duration), startPercent + deltaPercent))
    const newStartTime = pixelsToTime(newStartPercent)

    // Calculate new end time
    const [startHours, startMinutes] = newStartTime.split(':').map(Number)
    const totalStartMinutes = startHours * 60 + startMinutes
    const totalEndMinutes = totalStartMinutes + schedule[draggedTask].duration
    const endHours = Math.floor(totalEndMinutes / 60)
    const endMinutes = totalEndMinutes % 60
    const newEndTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`

    // Update schedule
    const updatedSchedule = [...schedule]
    updatedSchedule[draggedTask] = {
      ...updatedSchedule[draggedTask],
      startTime: newStartTime,
      endTime: newEndTime
    }
    setSchedule(updatedSchedule)
  }

  // Handle mouse up
  const handleMouseUp = () => {
    setDraggedTask(null)
    // Reset dragging state after a short delay
    setTimeout(() => setIsDragging(false), 100)
  }

  if (schedule.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p>No schedule generated yet. Add items to your prep list and click "Generate Schedule"</p>
      </div>
    )
  }

  return (
    <div
      className="relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Time header */}
      <div className="flex border-b border-gray-200 mb-2">
        <div className="w-32 flex-shrink-0" /> {/* Empty space for task names */}
        <div className="flex-1 flex">
          {hours.map(hour => (
            <div key={hour} className="flex-1 text-center text-xs text-gray-600 pb-2">
              {hour}hr
            </div>
          ))}
        </div>
      </div>

      {/* Task rows */}
      <div className="space-y-2">
        {schedule.map((task, index) => (
          <div key={index} className="flex items-center">
            {/* Task name */}
            <div className="w-32 flex-shrink-0 pr-4">
              <p className="text-sm font-medium text-gray-900 truncate">{task.menuItemName}</p>
            </div>

            {/* Timeline */}
            <div className="flex-1 relative h-12 bg-gray-50 rounded">
              {/* Grid lines */}
              <div className="absolute inset-0 flex">
                {hours.map((_, idx) => (
                  <div key={idx} className="flex-1 border-r border-gray-200" />
                ))}
              </div>

              {/* Task block */}
              <div
                className={`absolute top-1 bottom-1 ${taskColors[index % taskColors.length]} rounded shadow-sm flex items-center justify-center text-white text-xs font-medium cursor-pointer transition-shadow hover:shadow-md ${
                  draggedTask === index ? 'shadow-lg ring-2 ring-indigo-400 cursor-grabbing' : 'hover:ring-2 hover:ring-white/50'
                }`}
                style={{
                  left: `${timeToPixels(task.startTime)}%`,
                  width: `${durationToWidth(task.duration)}%`
                }}
                onMouseDown={(e) => handleMouseDown(e, index)}
                onClick={(e) => {
                  // Only trigger click if not dragging
                  if (!isDragging) {
                    onTaskClick(task.menuItemId)
                  }
                }}
                title={`${task.menuItemName}\n${task.startTime} - ${task.endTime}\n${task.duration} minutes`}
              >
                <span className="truncate px-2">{task.menuItemName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
