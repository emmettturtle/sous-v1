# Environment Setup - Sous Agent

This document provides comprehensive instructions for setting up a local development environment for Sous Agent.

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18+ or 20+ (recommended)
- **npm**: Version 8+ (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code (recommended) or your preferred editor

### External Services Required
- **Supabase Account**: Database and authentication
- **OpenAI Account**: AI model access
- **Vercel Account**: For deployment (optional)

## 🚀 Quick Setup

### 1. **Clone Repository**
```bash
git clone https://github.com/your-username/sous-v1.git
cd sous-v1
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Environment Configuration**
```bash
cp .env.example .env.local
```

### 4. **Configure Environment Variables** (See detailed section below)

### 5. **Start Development Server**
```bash
npm run dev
```

### 6. **Open Application**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables Configuration

### Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration (for AI Assistant)
OPENAI_API_KEY=your_openai_api_key

# LangSmith (Optional - for debugging LangChain)
LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=sous-agent
```

### Getting Supabase Credentials

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and set project name
   - Wait for project initialization

2. **Get Project URL and Keys**
   - Go to Project Settings → API
   - Copy the following values:
     ```
     Project URL → NEXT_PUBLIC_SUPABASE_URL
     Anon/Public Key → NEXT_PUBLIC_SUPABASE_ANON_KEY
     Service Role Key → SUPABASE_SERVICE_ROLE_KEY
     ```

3. **Set up Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Run the database schema (see Database Setup section)

### Getting OpenAI API Key

1. **Create OpenAI Account**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Sign up or log in to your account

2. **Generate API Key**
   - Go to API Keys section
   - Click "Create new secret key"
   - Copy the key → `OPENAI_API_KEY`
   - **Important**: Store this key securely as it won't be shown again

3. **Set up Billing** (Required for API access)
   - Add payment method in Billing section
   - Set usage limits to control costs

### Optional: LangSmith Configuration

LangSmith provides debugging and tracing for LangChain operations:

1. **Create LangSmith Account**
   - Go to [smith.langchain.com](https://smith.langchain.com)
   - Sign up for free account

2. **Get API Key**
   - Go to Settings → API Keys
   - Generate new key → `LANGCHAIN_API_KEY`

3. **Configure Tracing**
   ```env
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_API_KEY=your_langsmith_api_key
   LANGCHAIN_PROJECT=sous-agent-dev
   ```

## 🗄️ Database Setup

### 1. **Supabase Database Schema**

Run the following SQL in your Supabase SQL Editor to create the required tables and policies:

```sql
-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create clients table
CREATE TABLE clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chef_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  address jsonb,
  household_size integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create client preferences table
CREATE TABLE client_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  dietary_restrictions text[],
  allergies text[],
  cuisine_preferences text[],
  disliked_ingredients text[],
  preferred_ingredients text[],
  spice_tolerance text CHECK (spice_tolerance IN ('none', 'mild', 'medium', 'hot')),
  cooking_methods_to_avoid text[],
  meal_prep_preferences jsonb,
  budget_per_meal decimal(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create menu items table
CREATE TABLE menu_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chef_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  description text,
  recipe_url text,
  ingredients text[] NOT NULL,
  allergens text[],
  tags text[],
  meal_type text,
  cuisine_type text,
  prep_time_minutes integer,
  difficulty_level text CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  price decimal(10,2),
  is_available boolean DEFAULT true,
  seasonal_availability text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create client feedback history table
CREATE TABLE client_feedback_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
  feedback_type text CHECK (feedback_type IN ('rating', 'like', 'dislike', 'note')) NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  context jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create chef profiles table (optional, for future use)
CREATE TABLE chef_profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  name text,
  phone text,
  bio text,
  specialties text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_feedback_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients
CREATE POLICY "Chefs can view own clients" ON clients
  FOR SELECT USING (auth.uid() = chef_id);
CREATE POLICY "Chefs can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = chef_id);
CREATE POLICY "Chefs can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = chef_id);
CREATE POLICY "Chefs can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = chef_id);

-- Create RLS policies for client preferences
CREATE POLICY "Access preferences through client ownership" ON client_preferences
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE chef_id = auth.uid()
    )
  );

-- Create RLS policies for menu items
CREATE POLICY "Chefs can manage own menu items" ON menu_items
  FOR ALL USING (auth.uid() = chef_id);

-- Create RLS policies for feedback
CREATE POLICY "Access feedback through client ownership" ON client_feedback_history
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE chef_id = auth.uid()
    )
  );

-- Create RLS policies for chef profiles
CREATE POLICY "Chefs can manage own profile" ON chef_profiles
  FOR ALL USING (auth.uid() = id);

-- Create indexes for performance
CREATE INDEX idx_clients_chef_id ON clients(chef_id);
CREATE INDEX idx_client_preferences_client_id ON client_preferences(client_id);
CREATE INDEX idx_menu_items_chef_id ON menu_items(chef_id);
CREATE INDEX idx_menu_items_available ON menu_items(chef_id, is_available);
CREATE INDEX idx_feedback_client_id ON client_feedback_history(client_id);
CREATE INDEX idx_feedback_created_at ON client_feedback_history(created_at DESC);
```

### 2. **Configure Supabase Auth**

In your Supabase dashboard:

1. **Authentication Settings**
   - Go to Authentication → Settings
   - Configure site URL: `http://localhost:3000`
   - Add redirect URLs:
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000
     ```

2. **Enable Auth Providers** (optional)
   - Go to Authentication → Providers
   - Configure desired providers (Email, Google, GitHub, etc.)

## 🛠️ Development Tools Setup

### 1. **VS Code Extensions** (Recommended)

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### 2. **VS Code Settings**

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### 3. **Git Configuration**

```bash
# Configure Git (if not done globally)
git config user.name "Your Name"
git config user.email "your-email@example.com"

# Set up Git hooks (optional)
npx husky init
```

## 🔍 Verification Steps

### 1. **Test Database Connection**

Create a test file to verify Supabase connection:

```typescript
// test-db.js
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testConnection() {
  const { data, error } = await supabase.from('clients').select('count').limit(1)
  
  if (error) {
    console.error('Database connection failed:', error)
  } else {
    console.log('✅ Database connection successful')
  }
}

testConnection()
```

Run with: `node test-db.js`

### 2. **Test OpenAI API**

```typescript
// test-openai.js
const { ChatOpenAI } = require('@langchain/openai')

async function testOpenAI() {
  try {
    const llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    const response = await llm.invoke('Hello, can you help with menu recommendations?')
    console.log('✅ OpenAI API connection successful')
    console.log('Response:', response.content)
  } catch (error) {
    console.error('❌ OpenAI API connection failed:', error.message)
  }
}

testOpenAI()
```

Run with: `node test-openai.js`

### 3. **Test Application Pages**

Visit these URLs to verify setup:

- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Login Page**: [http://localhost:3000/login](http://localhost:3000/login)
- **Dashboard**: [http://localhost:3000/dashboard-client](http://localhost:3000/dashboard-client) (after login)
- **AI Assistant**: [http://localhost:3000/assistant](http://localhost:3000/assistant) (after login)

## 🐛 Common Issues & Troubleshooting

### Issue 1: "Supabase URL not provided"

**Solution:**
- Check `.env.local` file exists in project root
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- Restart development server after changing env vars

### Issue 2: "OpenAI API key not found"

**Solution:**
- Verify `OPENAI_API_KEY` in `.env.local`
- Check OpenAI account has billing set up
- Ensure API key hasn't expired

### Issue 3: Database connection errors

**Solution:**
```bash
# Check Supabase project status
# Go to supabase.com → your project → check status

# Verify RLS policies are set up
# Go to Authentication → Policies in Supabase dashboard

# Check database URL format
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
```

### Issue 4: Authentication not working

**Solution:**
- Check site URL in Supabase Auth settings
- Verify redirect URLs are configured
- Clear browser cookies and localStorage
- Check Network tab for auth errors

### Issue 5: Build errors

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run build
```

### Issue 6: AI Assistant not responding

**Solution:**
1. Check browser Network tab for API errors
2. Verify OpenAI API key and billing
3. Check Supabase RLS policies allow data access
4. Enable debug logging:
   ```env
   LANGCHAIN_TRACING_V2=true
   ```

## 📊 Development Workflow

### 1. **Daily Development**
```bash
# Start development server
npm run dev

# In separate terminal, watch for changes
npm run lint:watch  # if configured

# Run type checking
npm run type-check  # if configured
```

### 2. **Before Committing**
```bash
# Run linting
npm run lint

# Run type checking  
npx tsc --noEmit

# Test build
npm run build
```

### 3. **Database Changes**
```bash
# Make schema changes in Supabase SQL Editor
# Update TypeScript types in src/types/database.ts
# Test changes locally
# Document changes in migration files
```

## 🔧 Advanced Configuration

### 1. **Custom Domain for Development**

Add to `/etc/hosts` (macOS/Linux):
```
127.0.0.1   sous-agent.local
```

Update `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://sous-agent.local:3000
```

### 2. **Docker Development** (Optional)

```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

### 3. **Environment-Specific Configs**

```typescript
// lib/config.ts
const config = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    debug: true,
    logLevel: 'debug'
  },
  production: {
    apiUrl: 'https://your-app.vercel.app/api',
    debug: false,
    logLevel: 'error'
  }
}

export default config[process.env.NODE_ENV || 'development']
```

---

**Next**: Explore [Deployment Guide](./deployment.md) for production deployment instructions.