import { StateGraph, END, START } from '@langchain/langgraph'
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'
import { createServerClient } from '@supabase/ssr'
import { Client, ClientPreferences } from '@/types/database'

// State interface for the client onboarding workflow
interface OnboardingState {
  messages: BaseMessage[]
  client_info: Partial<Client>
  preferences: Partial<ClientPreferences>
  current_step: string
  chef_id: string
  completed: boolean
}

// Initialize the language model
const llm = new ChatOpenAI({
  modelName: 'gpt-4o-mini', // Use newest, cheapest model
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
})

// Step 1: Collect basic client information
async function collectBasicInfo(state: OnboardingState): Promise<Partial<OnboardingState>> {
  const prompt = `You are helping onboard a new client for a personal chef service. 
  
Current step: Collecting basic information.

Ask the user for their basic information in a friendly, conversational way:
- Full name
- Email address  
- Phone number
- Home address
- Household size

Keep it conversational and ask for one piece of information at a time if needed.
Previous conversation: ${state.messages.map(m => m.content).join('\n')}`

  const response = await llm.invoke([new HumanMessage(prompt)])
  
  return {
    messages: [...state.messages, response],
    current_step: 'basic_info'
  }
}

// Step 2: Collect dietary preferences and restrictions
async function collectDietaryInfo(state: OnboardingState): Promise<Partial<OnboardingState>> {
  const prompt = `You are helping onboard a new client for a personal chef service.
  
Current step: Collecting dietary preferences and restrictions.

Ask about their dietary needs in a comprehensive but friendly way:
- Any dietary restrictions (vegetarian, vegan, pescatarian, etc.)
- Food allergies or intolerances
- Cuisine preferences (Italian, Asian, Mediterranean, etc.)
- Ingredients they particularly dislike
- Ingredients they love
- Spice tolerance (none, mild, medium, hot)
- Cooking methods to avoid (fried, grilled, etc.)
- Meal prep preferences (batch cooking vs individual portions)
- Budget per meal if comfortable sharing

Previous conversation: ${state.messages.map(m => m.content).join('\n')}`

  const response = await llm.invoke([new HumanMessage(prompt)])
  
  return {
    messages: [...state.messages, response],
    current_step: 'dietary_info'
  }
}

// Step 3: Process and confirm collected information
async function confirmInformation(state: OnboardingState): Promise<Partial<OnboardingState>> {
  const prompt = `You are helping onboard a new client for a personal chef service.
  
Current step: Confirming collected information.

Based on the conversation, summarize what you've learned about the client:
- Basic information (name, contact, household size)  
- Dietary restrictions and allergies
- Cuisine and ingredient preferences
- Other relevant preferences

Ask them to confirm this information is correct and if there's anything to add or change.

Previous conversation: ${state.messages.map(m => m.content).join('\n')}`

  const response = await llm.invoke([new HumanMessage(prompt)])
  
  return {
    messages: [...state.messages, response],
    current_step: 'confirm_info'
  }
}

// Step 4: Save client information to database
async function saveClientInfo(state: OnboardingState): Promise<Partial<OnboardingState>> {
  try {
    // This will be called from the API route context where we already have supabase configured
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
    
    // Extract client information from conversation using LLM
    const extractPrompt = `Based on this conversation, extract the client information as JSON:

Conversation: ${state.messages.map(m => m.content).join('\n')}

Return only valid JSON in this format:
{
  "client": {
    "name": "string",
    "email": "string", 
    "phone": "string",
    "address": {"street": "string", "city": "string", "state": "string", "zip": "string"},
    "household_size": number
  },
  "preferences": {
    "dietary_restrictions": ["array of strings"],
    "allergies": ["array of strings"], 
    "cuisine_preferences": ["array of strings"],
    "disliked_ingredients": ["array of strings"],
    "preferred_ingredients": ["array of strings"],
    "spice_tolerance": "none|mild|medium|hot",
    "cooking_methods_to_avoid": ["array of strings"],
    "meal_prep_preferences": {"batch_cooking": boolean, "individual_portions": boolean},
    "budget_per_meal": number
  }
}`

    const extractResponse = await llm.invoke([new HumanMessage(extractPrompt)])
    const extractedData = JSON.parse(extractResponse.content as string)

    // Save client to database
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        chef_id: state.chef_id,
        ...extractedData.client
      })
      .select()
      .single()

    if (clientError) throw clientError

    // Save preferences to database
    const { error: preferencesError } = await supabase
      .from('client_preferences')
      .insert({
        client_id: clientData.id,
        ...extractedData.preferences
      })

    if (preferencesError) throw preferencesError

    const successMessage = new AIMessage(
      `Perfect! I've successfully saved ${extractedData.client.name}'s information to your client database. 
      
      They're now ready to receive personalized menu recommendations based on their preferences. 
      You can find them in your clients dashboard and start creating customized meal plans!`
    )

    return {
      messages: [...state.messages, successMessage],
      client_info: extractedData.client,
      preferences: extractedData.preferences,
      current_step: 'completed',
      completed: true
    }

  } catch (error) {
    console.error('Error saving client info:', error)
    
    const errorMessage = new AIMessage(
      'I apologize, but there was an error saving the client information. Please try again or contact support.'
    )

    return {
      messages: [...state.messages, errorMessage],
      current_step: 'error'
    }
  }
}

// Define the workflow graph
const workflow = new StateGraph<OnboardingState>({
  channels: {
    messages: {
      reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
      default: () => []
    },
    client_info: {
      reducer: (x: Partial<Client>, y: Partial<Client>) => ({ ...x, ...y }),
      default: () => ({})
    },
    preferences: {
      reducer: (x: Partial<ClientPreferences>, y: Partial<ClientPreferences>) => ({ ...x, ...y }),
      default: () => ({})
    },
    current_step: {
      reducer: (x: string, y: string) => y,
      default: () => 'start'
    },
    chef_id: {
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
workflow.addNode('collect_basic_info', collectBasicInfo)
workflow.addNode('collect_dietary_info', collectDietaryInfo)
workflow.addNode('confirm_information', confirmInformation)
workflow.addNode('save_client_info', saveClientInfo)

// Define the workflow edges
workflow.addEdge(START, 'collect_basic_info')
workflow.addEdge('collect_basic_info', 'collect_dietary_info')
workflow.addEdge('collect_dietary_info', 'confirm_information')
workflow.addEdge('confirm_information', 'save_client_info')
workflow.addEdge('save_client_info', END)

// Compile the workflow
export const clientOnboardingAgent = workflow.compile()

// Helper function to start client onboarding
export async function startClientOnboarding(chefId: string, initialMessage?: string) {
  const initialState: OnboardingState = {
    messages: initialMessage ? [new HumanMessage(initialMessage)] : [],
    client_info: {},
    preferences: {},
    current_step: 'start',
    chef_id: chefId,
    completed: false
  }

  return await clientOnboardingAgent.invoke(initialState)
}