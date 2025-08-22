// Database type definitions based on our Supabase schema with native auth

// Supabase Auth User (built-in)
export interface AuthUser {
  id: string
  email: string
  created_at: string
  updated_at: string
  // other auth fields available but not commonly used
}

// Chef profile (extends auth user with chef-specific data)
export interface ChefProfile {
  id: string // references auth.users(id)
  name?: string
  phone?: string
  bio?: string
  specialties?: string[]
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  chef_id: string // references auth.users(id)
  name: string
  email?: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }
  household_size: number
  created_at: string
  updated_at: string
}

export interface ClientPreferences {
  id: string
  client_id: string
  dietary_restrictions?: string[]
  allergies?: string[]
  cuisine_preferences?: string[]
  disliked_ingredients?: string[]
  preferred_ingredients?: string[]
  spice_tolerance?: 'none' | 'mild' | 'medium' | 'hot'
  cooking_methods_to_avoid?: string[]
  meal_prep_preferences?: {
    batch_cooking?: boolean
    individual_portions?: boolean
  }
  budget_per_meal?: number
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  chef_id: string // references auth.users(id)
  name: string
  description?: string
  recipe_url?: string
  ingredients: string[]
  allergens?: string[]
  tags?: string[]
  meal_type?: string
  cuisine_type?: string
  prep_time_minutes?: number
  difficulty_level?: 'easy' | 'medium' | 'hard'
  price?: number
  is_available: boolean
  seasonal_availability?: string[]
  created_at: string
  updated_at: string
}

export interface ClientFeedbackHistory {
  id: string
  client_id: string
  menu_item_id: string
  feedback_type: 'rating' | 'like' | 'dislike' | 'note'
  rating?: number
  feedback_text?: string
  context?: Record<string, unknown>
  created_at: string
}

// Extended types with relations
export interface ClientWithPreferences extends Client {
  preferences?: ClientPreferences
  feedback_history?: ClientFeedbackHistory[]
}

export interface MenuItemWithFeedback extends MenuItem {
  feedback_history?: ClientFeedbackHistory[]
}

export interface ChefWithProfile extends AuthUser {
  chef_profile?: ChefProfile
  clients?: Client[]
  menu_items?: MenuItem[]
}