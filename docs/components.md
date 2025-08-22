# Component Architecture - Sous Agent

This document provides a comprehensive overview of the React component architecture used in Sous Agent, including reusable components, page components, and their interactions.

## 🏗️ Architecture Overview

Sous Agent follows a **component-driven architecture** using Next.js 15 App Router with TypeScript, Tailwind CSS, and modern React patterns.

### Component Hierarchy

```
src/
├── app/                          # Next.js App Router Pages
│   ├── (pages)/                  # Route components
│   ├── api/                      # API route handlers
│   ├── globals.css               # Global styles & animations
│   └── layout.tsx                # Root layout wrapper
├── components/                   # Reusable UI components
│   ├── ChatInterface.tsx         # AI chat component
│   └── LoadingSkeletons.tsx      # Loading state components
├── lib/                          # Utilities & business logic
└── types/                        # TypeScript definitions
```

## 🎯 Core Components

### 1. **ChatInterface** (`/src/components/ChatInterface.tsx`)

A reusable chat component that provides real-time AI conversation interface with advanced UX features.

#### **Component Interface**
```typescript
interface ChatInterfaceProps {
  title: string                                    // Chat window title
  placeholder?: string                             // Input placeholder text  
  onSendMessage: (message: string) => Promise<string> // Message handler function
  initialMessage?: string                          // Optional welcome message
  className?: string                               // Additional CSS classes
}

interface Message {
  id: string                                       // Unique message identifier
  content: string                                  // Message text content
  sender: 'user' | 'assistant'                    // Message author type
  timestamp: Date                                  // Creation timestamp
}
```

#### **Key Features**
- **Real-time messaging** with optimistic UI updates
- **Auto-scroll behavior** to latest messages
- **Thinking animation** with 3-dot bouncing loader
- **Message history** with persistent state
- **Error handling** with graceful fallbacks
- **Responsive design** for mobile and desktop

#### **Usage Example**
```typescript
import ChatInterface from '@/components/ChatInterface'

const AIAssistantPage = ({ clientId }: { clientId: string }) => {
  const handleSendMessage = async (message: string): Promise<string> => {
    try {
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
      return result.success ? result.message : 'Error occurred'
      
    } catch (error) {
      return 'Sorry, I encountered an error. Please try again.'
    }
  }

  return (
    <ChatInterface
      title="AI Menu Assistant"
      placeholder="Ask about menu recommendations..."
      onSendMessage={handleSendMessage}
      initialMessage="Hello! I'm here to help with personalized menu recommendations. What can I assist you with today?"
    />
  )
}
```

#### **Internal Implementation**

```typescript
export default function ChatInterface({
  title,
  placeholder = "Type your message...",
  onSendMessage,
  initialMessage,
  className = ""
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setMessages([{
        id: '1',
        content: initialMessage,
        sender: 'assistant',
        timestamp: new Date()
      }])
    }
  }, [initialMessage, messages.length])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    // Add user message immediately (optimistic update)
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Call AI service
      const response = await onSendMessage(userMessage.content)
      
      // Add AI response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
      
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        
        {/* Thinking Animation */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="px-6 py-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            <span className="ml-2">Send</span>
          </button>
        </form>
      </div>
    </div>
  )
}
```

### 2. **LoadingSkeletons** (`/src/components/LoadingSkeletons.tsx`)

A collection of skeleton loading components that provide smooth loading states while data is being fetched.

#### **Available Skeletons**

```typescript
// Dashboard loading state
export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
        <div className="py-6">
          <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    </div>
    
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-md"></div>
                  <div className="ml-5 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-8"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Client list loading state  
export const ClientsListSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
        <div className="py-6 animate-pulse">
          <div className="h-7 bg-gray-300 rounded w-48 mb-1"></div>
          <div className="h-4 bg-gray-300 rounded w-64"></div>
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="ml-4 flex-1">
                  <div className="h-5 bg-gray-300 rounded w-32 mb-1"></div>
                  <div className="h-4 bg-gray-300 rounded w-40"></div>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>

              <div className="mt-6">
                <div className="h-10 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Menu items list skeleton
export const MenuItemsListSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header skeleton */}
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
        <div className="py-6 animate-pulse">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-7 bg-gray-300 rounded w-40 mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-56"></div>
            </div>
            <div className="h-10 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Content skeleton */}
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and filters skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="h-10 bg-gray-300 rounded w-full"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-300 rounded w-24"></div>
            <div className="h-10 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Menu items grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-12"></div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 rounded w-4/6"></div>
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>

              <div className="flex gap-2 mb-4">
                {[...Array(3)].map((_, tagIndex) => (
                  <div key={tagIndex} className="h-6 bg-gray-300 rounded w-16"></div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-300 rounded w-24"></div>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// AI Assistant skeleton
export const AssistantSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col animate-pulse">
        {/* Header skeleton */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-300 rounded w-40"></div>
        </div>

        {/* Chat area skeleton */}
        <div className="flex-1 p-6 space-y-4">
          {/* AI message */}
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg p-4 max-w-md">
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>

          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-gray-300 rounded-lg p-4 max-w-md">
              <div className="h-4 bg-gray-400 rounded w-32"></div>
            </div>
          </div>

          {/* AI response */}
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg p-4 max-w-md">
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        {/* Input skeleton */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex space-x-4">
            <div className="flex-1 h-10 bg-gray-300 rounded"></div>
            <div className="h-10 w-20 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
```

#### **Shimmer Animation CSS**

The skeletons use custom CSS animations defined in `/src/app/globals.css`:

```css
/* Shimmer animation for loading skeletons */
@keyframes shimmer {
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
  background-size: 800px 104px;
}

/* Thinking animation for chat interface */
@keyframes thinking {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.animate-thinking {
  animation: thinking 1.4s ease-in-out infinite;
}
```

## 📱 Page Components

### 1. **Dashboard** (`/src/app/dashboard-client/page.tsx`)

Main landing page for authenticated chefs with overview statistics and quick actions.

#### **Key Features**
- **Authentication Guard** - Redirects unauthenticated users
- **Statistics Cards** - Client count, menu items, AI status
- **Prominent AI Assistant** - Large, gradient CTA button
- **Quick Actions Grid** - Fast access to common tasks
- **Responsive Sidebar** - Navigation menu for larger screens

#### **Component Structure**
```typescript
export default function ClientDashboard() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Authentication logic
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user || !user.email) {
        router.push('/login')
        return
      }
      
      setUser({ id: user.id, email: user.email })
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) return <DashboardSkeleton />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with chef info */}
      <div className="bg-gradient-to-r from-white to-gray-50 shadow-lg border-b border-gray-100">
        {/* Header content */}
      </div>

      {/* Main content area */}
      <div className="py-10">
        <div className="max-w-3xl mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-12 lg:gap-8">
          
          {/* Sidebar navigation */}
          <div className="hidden lg:block lg:col-span-3 xl:col-span-2">
            <nav className="sticky top-4">
              {/* Navigation links */}
            </nav>
          </div>

          {/* Main content */}
          <main className="lg:col-span-9 xl:col-span-10">
            
            {/* Statistics cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Stats cards */}
            </div>

            {/* Prominent AI Assistant section */}
            <div className="mt-8">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                {/* AI Assistant CTA */}
              </div>
            </div>

            {/* Quick actions grid */}
            <div className="mt-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Quick action buttons */}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
```

### 2. **AI Assistant** (`/src/app/assistant/page.tsx`)

Interactive chat interface for AI-powered menu recommendations.

#### **Key Features**
- **Client Selection Dropdown** - Choose which client to get recommendations for
- **Real-time Chat** - Uses ChatInterface component
- **Auto-scroll** - Smooth scrolling to latest messages  
- **Error Handling** - Graceful error recovery
- **Loading States** - Thinking animation during AI processing

#### **Implementation Highlights**
```typescript
export default function AssistantPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Load clients on component mount
  useEffect(() => {
    const loadClients = async () => {
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*')
        .order('name')
      
      if (!error && clientsData) {
        setClients(clientsData)
        if (clientsData.length > 0) {
          setSelectedClient(clientsData[0].id)
        }
      }
      setLoading(false)
    }

    loadClients()
  }, [])

  // Handle AI message sending
  const handleSendMessage = async (message: string): Promise<string> => {
    if (!selectedClient) {
      return 'Please select a client first.'
    }

    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token

      const response = await fetch('/api/menu-assistant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: selectedClient,
          userMessage: message
        })
      })

      const result = await response.json()
      return result.success ? result.message : 'Sorry, I encountered an error.'
      
    } catch (error) {
      console.error('Error sending message:', error)
      return 'Sorry, I encountered an error. Please try again.'
    }
  }

  if (loading) return <AssistantSkeleton />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Client selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Client for Recommendations
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} (Household: {client.household_size})
              </option>
            ))}
          </select>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-lg h-[600px]">
          <ChatInterface
            title={`AI Menu Assistant ${selectedClient ? `- ${clients.find(c => c.id === selectedClient)?.name}` : ''}`}
            placeholder="Ask about menu recommendations, dietary preferences, or cooking suggestions..."
            onSendMessage={handleSendMessage}
            initialMessage="Hello! I'm your AI menu assistant. I can help you create personalized menu recommendations based on your client's preferences, dietary restrictions, and your available menu items. What would you like to know?"
          />
        </div>
      </div>
    </div>
  )
}
```

## 🎨 Styling & Design System

### 1. **Tailwind CSS Configuration**

```typescript
// tailwind.config.ts
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'bounce': 'bounce 1s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'thinking': 'thinking 1.4s ease-in-out infinite',
      },
      colors: {
        'indigo': {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        }
      }
    }
  },
  plugins: []
}
```

### 2. **Design Patterns**

#### **Color Scheme**
- **Primary**: Indigo (`bg-indigo-600`, `text-indigo-600`)
- **Secondary**: Gray (`bg-gray-100`, `text-gray-500`)
- **Success**: Green (`bg-green-500`, `text-green-600`)
- **Warning**: Yellow (`bg-yellow-500`, `text-yellow-600`)
- **Error**: Red (`bg-red-500`, `text-red-600`)

#### **Typography**
```css
/* Headings */
.text-2xl.font-bold     /* Page titles */
.text-lg.font-semibold  /* Section headers */
.text-sm.font-medium    /* Labels */

/* Body text */
.text-base              /* Primary text */
.text-sm                /* Secondary text */
.text-xs                /* Small text */
```

#### **Spacing System**
```css
/* Consistent spacing */
.p-4, .p-6              /* Padding */
.m-4, .m-6              /* Margin */
.space-y-4, .space-x-4  /* Gap between elements */
.gap-4, .gap-6          /* Grid/flex gaps */
```

### 3. **Component Variants**

#### **Button Styles**
```typescript
// Primary action button
className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"

// Secondary button
className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"

// Danger button
className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
```

#### **Card Styles**
```typescript
// Standard card
className="bg-white overflow-hidden shadow rounded-lg"

// Interactive card
className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"

// Gradient card (AI Assistant)
className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
```

## 🔧 State Management Patterns

### 1. **Local State with useState**
```typescript
// Simple component state
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [data, setData] = useState<DataType[]>([])
```

### 2. **Form State Management**
```typescript
// Complex form state
const [formData, setFormData] = useState({
  name: '',
  email: '',
  preferences: []
})

const updateFormField = (field: string, value: any) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }))
}
```

### 3. **Async Operations Pattern**
```typescript
const performAsyncOperation = async () => {
  setLoading(true)
  setError(null)
  
  try {
    const result = await apiCall()
    setData(result)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred')
  } finally {
    setLoading(false)
  }
}
```

## 🚀 Performance Optimizations

### 1. **React Optimization Patterns**
```typescript
// Memoized components
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>
})

// Memoized callbacks
const handleClick = useCallback((id: string) => {
  // Handler logic
}, [dependency])

// Memoized values
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])
```

### 2. **Loading States**
- **Skeleton Loading** - Immediate visual feedback
- **Progressive Enhancement** - Load critical content first
- **Error Boundaries** - Graceful error handling

### 3. **Image & Asset Optimization**
```typescript
// Next.js Image optimization
import Image from 'next/image'

<Image
  src="/chef-avatar.jpg"
  alt="Chef Profile"
  width={100}
  height={100}
  className="rounded-full"
  priority // For above-the-fold images
/>
```

---

**Next**: Explore [Environment Setup](./environment-setup.md) for development configuration and [Deployment Guide](./deployment.md) for production deployment.