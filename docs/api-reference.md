# API Reference - Sous Agent

This document provides comprehensive documentation for all API endpoints in the Sous Agent application, including request/response formats, authentication requirements, and example usage.

## 🌐 Base URL

```
Development: http://localhost:3000
Production:  https://your-vercel-app.vercel.app
```

## 🔐 Authentication

All API endpoints require authentication using Supabase session tokens passed as Bearer tokens in the Authorization header.

### Authentication Header Format
```
Authorization: Bearer <supabase_session_token>
```

### Getting Session Token (Frontend)
```typescript
const getAuthToken = async () => {
  const { data: session } = await supabase.auth.getSession()
  return session?.session?.access_token
}

// Usage in API calls
const token = await getAuthToken()
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## 🤖 AI Agent Endpoints

### POST `/api/menu-assistant`

Processes natural language queries and provides personalized menu recommendations using AI agent.

#### Request

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```typescript
{
  clientId: string    // UUID of target client
  userMessage: string // Natural language query from chef
}
```

**Example Request:**
```typescript
const response = await fetch('/api/menu-assistant', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clientId: "123e4567-e89b-12d3-a456-426614174000",
    userMessage: "What should I make for Sarah this week? She's been craving something Mediterranean."
  })
})
```

#### Response

**Success Response (200):**
```typescript
{
  success: true,
  message: string,                    // AI-generated response
  suggestedMenuItems?: MenuItem[],    // Matched menu items
  reasoning?: string                  // Explanation of recommendations
}
```

**Error Response (400/401/500):**
```typescript
{
  success: false,
  error: string                       // Error description
}
```

#### Example Responses

**Successful Recommendation:**
```json
{
  "success": true,
  "message": "For Sarah this week, I'd recommend the **Mediterranean Quinoa Bowl** and **Greek-Style Lemon Chicken**. Both dishes align with her Mediterranean preferences and dietary requirements. The quinoa bowl provides plant-based protein and fiber, while the lemon chicken offers her preferred lean protein. Both dishes accommodate her gluten-free needs and medium spice tolerance.",
  "suggestedMenuItems": [
    {
      "id": "789e0123-e45f-67g8-h901-234567890123",
      "chef_id": "987fcdeb-51a2-43d7-8f9e-123456789abc",
      "name": "Mediterranean Quinoa Bowl",
      "description": "Healthy quinoa with roasted vegetables and tahini dressing",
      "ingredients": ["quinoa", "chickpeas", "bell-peppers", "tahini"],
      "allergens": ["sesame"],
      "cuisine_type": "mediterranean",
      "price": 18.00,
      "is_available": true
    },
    {
      "id": "456e7890-e12b-34c5-d678-901234567890",
      "name": "Greek-Style Lemon Chicken",
      "cuisine_type": "mediterranean",
      "price": 22.00
    }
  ],
  "reasoning": "Based on Sarah's preferences and feedback history"
}
```

**Client Not Found Error:**
```json
{
  "success": false,
  "error": "Client not found: No matching client"
}
```

**Authentication Error:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**Missing Parameters Error:**
```json
{
  "success": false,
  "error": "Missing clientId or userMessage"
}
```

#### Error Handling Examples

```typescript
const sendMenuQuery = async (clientId: string, message: string) => {
  try {
    const token = await getAuthToken()
    const response = await fetch('/api/menu-assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId,
        userMessage: message
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'API request failed')
    }

    if (result.success) {
      // Handle successful recommendation
      console.log('AI Response:', result.message)
      if (result.suggestedMenuItems) {
        console.log('Suggested Items:', result.suggestedMenuItems)
      }
      return result
    } else {
      throw new Error(result.error)
    }

  } catch (error) {
    console.error('Menu Assistant Error:', error)
    // Handle error appropriately
    return {
      success: false,
      message: 'Sorry, I encountered an error. Please try again.',
      error: error.message
    }
  }
}
```

## 🔒 Authentication Endpoints

### POST `/auth/callback`

Handles Supabase authentication callbacks (managed by Supabase).

**Usage:** Automatically called by Supabase during authentication flow.

### POST `/auth/logout`

Handles user logout and session cleanup.

**Usage:** 
```typescript
// Client-side logout
await supabase.auth.signOut()
// Redirects to /auth/logout endpoint automatically
```

## 📊 Data Access Patterns

### Client Data Access

All client-related data is accessed through Supabase client-side SDK with RLS (Row Level Security) ensuring data isolation:

```typescript
// Get authenticated chef's clients
const { data: clients, error } = await supabase
  .from('clients')
  .select(`
    *,
    client_preferences (*)
  `)
  .order('created_at', { ascending: false })
```

### Menu Items Access

```typescript
// Get chef's available menu items
const { data: menuItems, error } = await supabase
  .from('menu_items')
  .select('*')
  .eq('is_available', true)
  .order('name')
```

### Client Preferences Access

```typescript
// Get specific client's preferences
const { data: preferences, error } = await supabase
  .from('client_preferences')
  .select('*')
  .eq('client_id', clientId)
  .single()
```

## 🚀 Rate Limiting & Performance

### Rate Limits

- **Menu Assistant API**: 60 requests per minute per chef
- **OpenAI Integration**: Subject to OpenAI API rate limits
- **Supabase Operations**: Subject to plan-based limits

### Performance Optimizations

1. **Request Caching**: Session tokens cached client-side
2. **Database Queries**: Optimized with RLS policies and indexes
3. **Response Compression**: Automatic on Vercel deployment

### Best Practices

```typescript
// ✅ Good: Batch operations when possible
const batchCreateClients = async (clients: ClientData[]) => {
  const { data, error } = await supabase
    .from('clients')
    .insert(clients)
    .select()
  
  return { data, error }
}

// ✅ Good: Use specific field selection
const getClientBasicInfo = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, household_size')
    .order('name')
  
  return { data, error }
}

// ❌ Avoid: Multiple individual requests
const inefficientApproach = async (clientIds: string[]) => {
  const results = []
  for (const id of clientIds) {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    results.push(data)
  }
  return results
}
```

## 🔧 Error Response Codes

### Standard HTTP Status Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| 200  | OK | Successful request |
| 400  | Bad Request | Missing required parameters, invalid data format |
| 401  | Unauthorized | Missing/invalid authentication token |
| 403  | Forbidden | Insufficient permissions (RLS violation) |
| 404  | Not Found | Client/resource not found |
| 429  | Too Many Requests | Rate limit exceeded |
| 500  | Internal Server Error | Database errors, AI service failures |

### Application-Specific Error Codes

```typescript
interface ApiError {
  success: false
  error: string
  code?: string
}

// Common error patterns
const ERROR_CODES = {
  CLIENT_NOT_FOUND: 'CLIENT_NOT_FOUND',
  PREFERENCES_MISSING: 'PREFERENCES_MISSING',
  MENU_ITEMS_EMPTY: 'MENU_ITEMS_EMPTY',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  INVALID_TOKEN: 'INVALID_TOKEN'
} as const
```

## 📱 Frontend Integration Examples

### React Hook for Menu Assistant

```typescript
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export const useMenuAssistant = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendQuery = async (clientId: string, message: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token

      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch('/api/menu-assistant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId,
          userMessage: message
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      if (!result.success) {
        throw new Error(result.error)
      }

      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return {
        success: false,
        message: 'Sorry, I encountered an error. Please try again.',
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendQuery,
    isLoading,
    error
  }
}
```

### Usage in Component

```typescript
import { useMenuAssistant } from '@/hooks/useMenuAssistant'

const ChatInterface = ({ clientId }: { clientId: string }) => {
  const { sendQuery, isLoading, error } = useMenuAssistant()
  const [message, setMessage] = useState('')
  const [responses, setResponses] = useState<string[]>([])

  const handleSend = async () => {
    if (!message.trim()) return

    const result = await sendQuery(clientId, message)
    
    if (result.success) {
      setResponses(prev => [...prev, result.message])
      
      // Handle suggested menu items
      if (result.suggestedMenuItems) {
        console.log('AI suggested these items:', result.suggestedMenuItems)
        // Display suggested items in UI
      }
    }

    setMessage('')
  }

  return (
    <div>
      <div className="messages">
        {responses.map((response, index) => (
          <div key={index} className="ai-response">
            {response}
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about menu recommendations..."
          disabled={isLoading}
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !message.trim()}
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
    </div>
  )
}
```

## 🔍 Testing & Debugging

### API Testing with cURL

```bash
# Test menu assistant endpoint
curl -X POST http://localhost:3000/api/menu-assistant \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "123e4567-e89b-12d3-a456-426614174000",
    "userMessage": "What vegetarian options do you recommend for this client?"
  }'
```

### Debug Logging

Enable debug mode by setting environment variables:

```env
# Enable detailed API logging
NODE_ENV=development

# Enable LangChain tracing
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-langsmith-key
LANGCHAIN_PROJECT=sous-agent-debug
```

### Common Debugging Scenarios

```typescript
// Debug authentication issues
const debugAuth = async () => {
  const { data: session, error } = await supabase.auth.getSession()
  console.log('Session:', session)
  console.log('Auth Error:', error)
  
  if (session?.session) {
    console.log('Token:', session.session.access_token)
    console.log('User:', session.session.user)
  }
}

// Debug API response
const debugApiCall = async (clientId: string, message: string) => {
  try {
    const response = await fetch('/api/menu-assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ clientId, userMessage: message })
    })

    console.log('Response Status:', response.status)
    console.log('Response Headers:', Object.fromEntries(response.headers))
    
    const result = await response.json()
    console.log('Response Body:', result)
    
    return result
  } catch (error) {
    console.error('Request failed:', error)
  }
}
```

## 🚀 Future API Enhancements

### Planned Endpoints

1. **GET `/api/analytics/chef-stats`**
   - Chef performance metrics
   - Client satisfaction scores
   - Menu item popularity

2. **POST `/api/menu-assistant/feedback`**
   - Store AI recommendation feedback
   - Improve future recommendations

3. **GET `/api/menu-assistant/history`**
   - Retrieve conversation history
   - Support chat persistence

4. **POST `/api/menu-planner/weekly`**
   - AI-powered weekly menu planning
   - Multi-client meal coordination

### Webhook Integration

```typescript
// Planned: Real-time updates
POST /api/webhooks/supabase
// Handle database changes
// Trigger real-time UI updates
```

---

**Next**: Explore [Component Architecture](./components.md) for frontend structure and [Environment Setup](./environment-setup.md) for development configuration.