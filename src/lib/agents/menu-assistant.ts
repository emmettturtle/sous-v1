import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, AIMessage } from '@langchain/core/messages'
import { createServerClient } from '@supabase/ssr'
import { Client, ClientPreferences, MenuItem } from '@/types/database'

// Initialize the language model
const llm = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
})

export interface MenuAssistantRequest {
  clientId: string
  chefId: string
  userMessage: string
}

export interface MenuAssistantResponse {
  message: string
  suggestedMenuItems?: MenuItem[]
  reasoning?: string
  success: boolean
  error?: string
}

export async function getMenuAssistance(request: MenuAssistantRequest): Promise<MenuAssistantResponse> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {}
        }
      }
    )

    console.log('Looking for client:', request.clientId, 'chef:', request.chefId)

    // Load client information
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', request.clientId)
      .eq('chef_id', request.chefId)
      .single()

    console.log('Client query result:', { client, clientError })

    if (clientError || !client) {
      return {
        success: false,
        error: `Client not found: ${clientError?.message || 'No matching client'}`,
        message: `Sorry, I could not find the client information. Error: ${clientError?.message || 'Client not found'}`
      }
    }

    // Load client preferences
    const { data: preferences, error: prefError } = await supabase
      .from('client_preferences')
      .select('*')
      .eq('client_id', request.clientId)
      .single()

    if (prefError || !preferences) {
      return {
        success: false,
        error: 'Client preferences not found',
        message: 'Sorry, I could not find the client preferences.'
      }
    }

    // Load available menu items for this chef
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('chef_id', request.chefId)
      .eq('is_available', true)

    if (menuError) {
      return {
        success: false,
        error: 'Could not load menu items',
        message: 'Sorry, I encountered an error loading your menu items.'
      }
    }

    // Load client feedback history
    const { data: feedback, error: feedbackError } = await supabase
      .from('client_feedback_history')
      .select(`
        *,
        menu_items (*)
      `)
      .eq('client_id', request.clientId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Create comprehensive prompt for the AI assistant
    const prompt = `You are an expert personal chef AI assistant helping to create personalized menu recommendations.

CLIENT PROFILE:
- Name: ${client.name}
- Household Size: ${client.household_size}
- Email: ${client.email}

CLIENT DIETARY PREFERENCES:
- Dietary Restrictions: ${preferences.dietary_restrictions?.join(', ') || 'None'}
- Allergies: ${preferences.allergies?.join(', ') || 'None'}
- Cuisine Preferences: ${preferences.cuisine_preferences?.join(', ') || 'Any'}
- Disliked Ingredients: ${preferences.disliked_ingredients?.join(', ') || 'None'}
- Preferred Ingredients: ${preferences.preferred_ingredients?.join(', ') || 'Any'}
- Spice Tolerance: ${preferences.spice_tolerance || 'Medium'}
- Budget per Meal: $${preferences.budget_per_meal || 'Flexible'}
- Meal Prep Preferences: ${preferences.meal_prep_preferences?.batch_cooking ? 'Batch cooking' : ''} ${preferences.meal_prep_preferences?.individual_portions ? 'Individual portions' : ''}

AVAILABLE MENU ITEMS (${menuItems?.length || 0} items):
${menuItems?.map(item => `
- "${item.name}" (${item.cuisine_type})
  Ingredients: ${item.ingredients.join(', ')}
  Allergens: ${item.allergens?.join(', ') || 'None'}
  Tags: ${item.tags?.join(', ') || 'None'}
  Difficulty: ${item.difficulty_level}
  Prep Time: ${item.prep_time_minutes} min
  Price: $${item.price || 'TBD'}
`).join('') || 'No menu items available'}

RECENT FEEDBACK HISTORY:
${feedback?.map(f => `
- ${f.feedback_type}: "${f.feedback_text || f.rating + '/5 stars'}" (${new Date(f.created_at).toLocaleDateString()})
`).join('') || 'No previous feedback'}

USER REQUEST: "${request.userMessage}"

Please provide helpful, personalized menu advice based on the client's preferences and your available menu items. If recommending specific dishes, explain why they're good matches for this client. If the user is asking for menu recommendations, suggest 2-4 specific items from the available menu that best match the client's profile.

Be conversational and professional, as if you're speaking directly to the chef about their client.`

    const response = await llm.invoke([new HumanMessage(prompt)])
    const aiMessage = response.content as string

    // Try to extract recommended menu items from the response
    const suggestedItems: MenuItem[] = []
    if (menuItems) {
      for (const item of menuItems) {
        if (aiMessage.toLowerCase().includes(item.name.toLowerCase())) {
          suggestedItems.push(item)
        }
      }
    }

    return {
      success: true,
      message: aiMessage,
      suggestedMenuItems: suggestedItems.length > 0 ? suggestedItems : undefined,
      reasoning: `Based on ${client.name}'s preferences and feedback history`
    }

  } catch (error: any) {
    console.error('Menu assistant error:', error)
    return {
      success: false,
      error: error.message,
      message: 'Sorry, I encountered an error while processing your request. Please try again.'
    }
  }
}

// Helper function to get client summary for quick reference
export async function getClientSummary(clientId: string, chefId: string) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {}
        }
      }
    )

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        *,
        client_preferences (*)
      `)
      .eq('id', clientId)
      .eq('chef_id', chefId)
      .single()

    if (clientError || !client) {
      return null
    }

    return client
  } catch (error) {
    console.error('Error getting client summary:', error)
    return null
  }
}