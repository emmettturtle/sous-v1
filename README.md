# Sous Agent - Personal Chef AI Assistant

A modern web application that provides AI-powered assistance for personal chefs, including client management, menu recommendations, and operational guidance.

## Features

- **Client Management**: Streamlined form-based client onboarding with preference tracking
- **AI Menu Assistant**: Intelligent menu recommendations based on client preferences and dietary restrictions
- **Menu Item Management**: Comprehensive menu item creation and management system
- **Real-time Chat Interface**: Interactive AI assistant with smooth animations and auto-scroll
- **Professional UI**: Modern design with shimmer loading states and responsive layouts

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for database and authentication
- **OpenAI API** for AI-powered recommendations
- **LangChain/LangGraph** for AI workflows

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Configure the following environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

## Database Setup

Run the SQL schema from `supabase-schema-simplified.sql` in your Supabase SQL editor to set up the required database tables and row-level security policies.

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Deployment on Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
3. Deploy with automatic builds on push

## Application Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard-client/   # Main dashboard
│   ├── assistant/          # AI assistant chat interface
│   ├── clients/           # Client management
│   ├── menu-items/        # Menu item management
│   ├── onboard-client-form/ # Client onboarding form
│   ├── create-menu-item/   # Menu item creation
│   └── api/               # API routes
├── components/            # Reusable UI components
├── lib/                  # Utility functions and agents
└── types/                # TypeScript type definitions
```

## Key Pages

- `/` - Landing page (redirects to dashboard)
- `/dashboard-client` - Main dashboard with stats and quick actions
- `/assistant` - AI chat assistant for menu recommendations
- `/clients` - Client list and management
- `/menu-items` - Menu item management with search and filters
- `/onboard-client-form` - Add new clients
- `/create-menu-item` - Add new menu items

## Features

### AI Assistant
- Client-specific menu recommendations
- Dietary restriction awareness
- Interactive chat interface with thinking animations
- Auto-scroll to latest messages

### Client Management
- Form-based onboarding
- Comprehensive preference tracking
- Search and filter capabilities

### Menu Management
- Rich menu item creation
- Ingredient and allergen tracking
- Availability management
- Search and categorization

## Production Ready

- All test/debug pages removed
- Environment variables properly configured
- Database schema optimized for production
- Error handling and loading states implemented
- Responsive design for all screen sizes
