# Deployment Guide - Sous Agent

This document provides comprehensive instructions for deploying Sous Agent to production using Vercel, along with alternative deployment options.

## 🚀 Vercel Deployment (Recommended)

Vercel is the recommended deployment platform for Next.js applications, providing seamless integration and optimal performance.

### Prerequisites
- **GitHub/GitLab/Bitbucket repository** with your code
- **Vercel account** (free tier available)
- **Supabase project** set up for production
- **OpenAI API account** with billing configured

### Step-by-Step Deployment

#### 1. **Prepare Repository**

```bash
# Ensure code is pushed to repository
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

#### 2. **Connect to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your Git provider
3. Click "New Project"
4. Import your `sous-v1` repository
5. Select "Next.js" framework preset (auto-detected)

#### 3. **Configure Environment Variables**

In Vercel dashboard during import, or later in Project Settings → Environment Variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Optional: LangSmith for debugging
LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=your_langsmith_api_key_if_enabled
LANGCHAIN_PROJECT=sous-agent-production
```

**Important**: Use production Supabase credentials, not development ones.

#### 4. **Deploy**

1. Click "Deploy" in Vercel
2. Wait for build to complete (typically 1-3 minutes)
3. Visit the provided URL to test deployment

#### 5. **Configure Custom Domain** (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Supabase auth URLs (see below)

### Production Supabase Configuration

#### 1. **Update Site URL**
In Supabase dashboard → Authentication → URL Configuration:

```
Site URL: https://your-app.vercel.app
Additional Redirect URLs:
- https://your-app.vercel.app/auth/callback
- https://your-custom-domain.com (if using custom domain)
- https://your-custom-domain.com/auth/callback
```

#### 2. **Update CORS Settings** (if needed)
In Supabase dashboard → Settings → API:

```
Additional allowed origins:
- https://your-app.vercel.app
- https://your-custom-domain.com
```

## 🔒 Production Security Configuration

### 1. **Environment Variables Security**

```bash
# ✅ Good: Use production-specific keys
OPENAI_API_KEY=sk-prod-xxx...  # Different from development

# ✅ Good: Use production Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co

# ❌ Bad: Don't use development credentials in production
```

### 2. **Supabase Security Hardening**

In Supabase dashboard:

1. **Enable RLS on all tables** (already done in schema)
2. **Review Auth policies**:
   ```sql
   -- Ensure only authenticated chefs can access data
   SELECT * FROM pg_policies WHERE tablename = 'clients';
   ```
3. **Enable email confirmations** (Auth → Settings)
4. **Set up password requirements**
5. **Configure session timeout**

### 3. **API Security**

```typescript
// middleware.ts - Add rate limiting (optional)
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Add security headers
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  return response
}

export const config = {
  matcher: '/api/:path*'
}
```

## 📊 Performance Optimization

### 1. **Next.js Configuration**

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  
  // Enable experimental features for performance
  experimental: {
    optimizeCss: true,
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
```

### 2. **Vercel Analytics** (Optional)

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## 📈 Monitoring & Logging

### 1. **Vercel Analytics**

Enable in Vercel dashboard:
1. Go to Project Settings → Analytics
2. Enable Web Analytics
3. View performance metrics

### 2. **Error Tracking with Sentry** (Optional)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  environment: process.env.NODE_ENV,
});
```

### 3. **LangSmith Monitoring**

For AI operations monitoring:

```env
# Production environment variables
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_production_key
LANGCHAIN_PROJECT=sous-agent-production
```

## 🔄 CI/CD Pipeline

### 1. **Automatic Deployments**

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to feature branches
- **Preview**: Every pull request

### 2. **GitHub Actions** (Optional Enhanced CI/CD)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Type checking
      run: npx tsc --noEmit
    
    - name: Run build test
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to Vercel
      run: echo "Deployment handled by Vercel automatically"
```

## 🌍 Alternative Deployment Options

### 1. **Netlify Deployment**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

**Netlify Configuration**:
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 2. **Docker Deployment**

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
```

### 3. **AWS Amplify**

```yaml
# amplify.yml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
      buildSettings:
        commands:
          - npm run build
        baseDirectory: /
        files:
          - '**/*'
```

## 🔧 Post-Deployment Checklist

### 1. **Functional Testing**

- [ ] **Authentication Flow**
  - [ ] Sign up works
  - [ ] Sign in works  
  - [ ] Sign out works
  - [ ] Password reset works

- [ ] **Core Features**
  - [ ] Dashboard loads correctly
  - [ ] Client creation works
  - [ ] Menu item creation works
  - [ ] AI Assistant responds correctly

- [ ] **Performance**
  - [ ] Page load times < 3 seconds
  - [ ] API responses < 2 seconds
  - [ ] Images load properly

### 2. **Security Testing**

- [ ] **Authentication**
  - [ ] Unauthenticated users redirected to login
  - [ ] Users can only access their own data
  - [ ] Session timeout works

- [ ] **API Security**
  - [ ] API endpoints require authentication
  - [ ] RLS policies enforced
  - [ ] No sensitive data in client responses

### 3. **Monitoring Setup**

- [ ] **Analytics**
  - [ ] Vercel Analytics enabled
  - [ ] Error tracking configured
  - [ ] Performance monitoring active

- [ ] **Alerts**
  - [ ] Error rate alerts
  - [ ] Performance degradation alerts
  - [ ] API usage monitoring

## 📱 Mobile & PWA Optimization

### 1. **Progressive Web App** (Optional)

```typescript
// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest.json$/],
})

const nextConfig = {
  // ... other config
}

module.exports = withPWA(nextConfig)
```

```json
// public/manifest.json
{
  "name": "Sous Agent",
  "short_name": "Sous Agent",
  "description": "AI-Powered Personal Chef Assistant",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🚨 Rollback Strategy

### 1. **Vercel Rollback**

In Vercel dashboard:
1. Go to Deployments tab
2. Find previous successful deployment
3. Click "Promote to Production"

### 2. **Database Rollback** (If needed)

```sql
-- Example: Rollback schema changes
-- Always backup before schema changes!
-- Use Supabase backups feature

-- Rollback example (prepare scripts in advance)
-- This is just an example - customize for your needs
BEGIN;
  -- Rollback logic here
COMMIT;
```

## 📋 Maintenance Tasks

### 1. **Regular Updates**

```bash
# Weekly: Update dependencies
npm update

# Monthly: Update major dependencies
npx npm-check-updates -u
npm install

# Check for security issues
npm audit
```

### 2. **Database Maintenance**

- **Weekly**: Review slow queries in Supabase
- **Monthly**: Analyze usage and optimize indexes
- **Quarterly**: Review and update RLS policies

### 3. **Cost Optimization**

- **Monitor Vercel usage**: Functions, bandwidth, build minutes
- **Monitor Supabase usage**: Database size, auth users, storage
- **Monitor OpenAI usage**: Token usage, request volume

---

Your Sous Agent application is now ready for production deployment! The documentation provides comprehensive guidance for both initial deployment and ongoing maintenance.

## 📚 Related Documentation

- **[Environment Setup](./environment-setup.md)** - Development environment configuration
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[AI Workflow](./ai-workflow.md)** - AI system architecture details