import { StateGraph, END, START } from '@langchain/langgraph'
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'
import { createServerClient } from '@supabase/ssr'
import { Client, ClientPreferences, MenuItem, ClientFeedbackHistory } from '@/types/database'

// State interface for the menu recommendation workflow
interface RecommendationState {
  messages: BaseMessage[]
  client_id: string
  chef_id: string
  client_preferences: ClientPreferences | null
  available_menu_items: MenuItem[]
  feedback_history: ClientFeedbackHistory[]
  recommendations: MenuItem[]
  reasoning: string
  completed: boolean
}

// Initialize the language model
const llm = new ChatOpenAI({
  modelName: 'gpt-4o-mini', // Use newest, cheapest model
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
})

// Step 1: Load client data and preferences
async function loadClientData(state: RecommendationState): Promise<Partial<RecommendationState>> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {}
        }
      }
    )

    // Load client preferences
    const { data: preferences, error: prefError } = await supabase
      .from('client_preferences')
      .select('*')
      .eq('client_id', state.client_id)
      .single()

    if (prefError) throw prefError

    // Load available menu items for this chef
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('chef_id', state.chef_id)
      .eq('is_available', true)

    if (menuError) throw menuError

    // Load client feedback history
    const { data: feedback, error: feedbackError } = await supabase
      .from('client_feedback_history')
      .select(`
        *,
        menu_items (*)
      `)
      .eq('client_id', state.client_id)

    if (feedbackError) throw feedbackError

    return {
      client_preferences: preferences,
      available_menu_items: menuItems || [],
      feedback_history: feedback || []
    }

  } catch (error) {
    console.error('Error loading client data:', error)
    const errorMessage = new AIMessage('Sorry, I encountered an error loading the client data.')
    
    return {
      messages: [...state.messages, errorMessage],
      completed: true
    }
  }
}

// Step 2: Analyze preferences and generate recommendations
async function generateRecommendations(state: RecommendationState): Promise<Partial<RecommendationState>> {
  const preferences = state.client_preferences
  const menuItems = state.available_menu_items
  const feedback = state.feedback_history

  if (!preferences || menuItems.length === 0) {
    const noDataMessage = new AIMessage(
      'I don\'t have enough information to make recommendations. Please ensure the client has completed onboarding and you have menu items available.'
    )
    
    return {
      messages: [...state.messages, noDataMessage],
      completed: true
    }
  }

  // Create a comprehensive prompt for menu recommendations
  const prompt = `You are an expert personal chef AI assistant. Analyze the client's preferences and recommend the best menu items.

CLIENT PREFERENCES:
- Dietary Restrictions: ${preferences.dietary_restrictions?.join(', ') || 'None'}
- Allergies: ${preferences.allergies?.join(', ') || 'None'}
- Cuisine Preferences: ${preferences.cuisine_preferences?.join(', ') || 'Any'}
- Disliked Ingredients: ${preferences.disliked_ingredients?.join(', ') || 'None'}
- Preferred Ingredients: ${preferences.preferred_ingredients?.join(', ') || 'Any'}
- Spice Tolerance: ${preferences.spice_tolerance || 'Medium'}
- Budget per Meal: $${preferences.budget_per_meal || 'Flexible'}

AVAILABLE MENU ITEMS:
${menuItems.map(item => `
- ${item.name} (${item.cuisine_type})
  Ingredients: ${item.ingredients.join(', ')}
  Allergens: ${item.allergens?.join(', ') || 'None'}
  Tags: ${item.tags?.join(', ') || 'None'}
  Difficulty: ${item.difficulty_level}
  Prep Time: ${item.prep_time_minutes} minutes
  Price: $${item.price || 'TBD'}
`).join('\n')}

PAST FEEDBACK:
${feedback.map(f => `
- ${f.feedback_type}: ${f.feedback_text || f.rating + '/5 stars'} 
`).join('\n') || 'No previous feedback'}

Based on this information:
1. Recommend 3-5 menu items that best match the client's preferences
2. Explain why each recommendation is a good fit
3. Consider dietary restrictions, allergies, and past feedback
4. Rank recommendations from best to good matches

Provide your response in a friendly, professional tone as if speaking directly to the chef.`

  const response = await llm.invoke([new HumanMessage(prompt)])

  // Extract recommended menu item IDs using a follow-up prompt
  const extractPrompt = `Based on your previous recommendation, return only the menu item names that you recommended, one per line:

Your previous response: ${response.content}

Available menu items: ${menuItems.map(item => item.name).join(', ')}

Return only the names of recommended items, one per line.`

  const extractResponse = await llm.invoke([new HumanMessage(extractPrompt)])
  const recommendedNames = (extractResponse.content as string).split('\n').filter(name => name.trim())

  // Find the actual menu items that match the recommendations
  const recommendedItems = menuItems.filter(item => 
    recommendedNames.some(name => 
      name.toLowerCase().trim().includes(item.name.toLowerCase()) ||
      item.name.toLowerCase().includes(name.toLowerCase().trim())
    )
  )

  return {
    messages: [...state.messages, response],
    recommendations: recommendedItems,
    reasoning: response.content as string,
    completed: true
  }
}

// Define the workflow graph
const workflow = new StateGraph<RecommendationState>({
  channels: {
    messages: {
      reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
      default: () => []
    },
    client_id: {
      reducer: (x: string, y: string) => y,
      default: () => ''
    },
    chef_id: {
      reducer: (x: string, y: string) => y,
      default: () => ''
    },
    client_preferences: {
      reducer: (x: ClientPreferences | null, y: ClientPreferences | null) => y,
      default: () => null
    },
    available_menu_items: {
      reducer: (x: MenuItem[], y: MenuItem[]) => y,
      default: () => []
    },
    feedback_history: {
      reducer: (x: ClientFeedbackHistory[], y: ClientFeedbackHistory[]) => y,
      default: () => []
    },
    recommendations: {
      reducer: (x: MenuItem[], y: MenuItem[]) => y,
      default: () => []
    },
    reasoning: {
      reducer: (x: string, y: string) => y,
      default: () => ''
    },
    completed: {
      reducer: (x: boolean, y: boolean) => y,
      default: () => false
    }
  }
})

// Add nodes to the workflow
workflow.addNode('load_client_data', loadClientData)
workflow.addNode('generate_recommendations', generateRecommendations)

// Define the workflow edges
workflow.addEdge(START, 'load_client_data')
workflow.addEdge('load_client_data', 'generate_recommendations')
workflow.addEdge('generate_recommendations', END)

// Compile the workflow
export const menuRecommendationAgent = workflow.compile()

// Helper function to get menu recommendations for a client
export async function getMenuRecommendations(clientId: string, chefId: string, userMessage?: string) {
  const initialState: RecommendationState = {
    messages: userMessage ? [new HumanMessage(userMessage)] : [],
    client_id: clientId,
    chef_id: chefId,
    client_preferences: null,
    available_menu_items: [],
    feedback_history: [],
    recommendations: [],
    reasoning: '',
    completed: false
  }

  return await menuRecommendationAgent.invoke(initialState)
}