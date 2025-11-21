import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getMenuAssistance } from '@/lib/agents/menu-assistant'

/**
 * AI Menu Assistant API Endpoint
 *
 * Provides personalized menu recommendations for clients using OpenAI GPT-4o-mini.
 * Analyzes client preferences, dietary restrictions, feedback history, and chef's
 * available menu items to generate intelligent suggestions.
 *
 * @param request - Contains clientId and userMessage
 * @returns AI-generated menu recommendations with reasoning
 */
export async function POST(request: NextRequest) {
  try {
    const { clientId, userMessage } = await request.json()

    if (!clientId || !userMessage) {
      return NextResponse.json(
        { success: false, error: 'Missing clientId or userMessage' },
        { status: 400 }
      )
    }

    // Create Supabase client from request headers/cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // We don't need to set cookies in API routes
          },
        },
      }
    )
    
    // Get auth header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authorization token' },
        { status: 401 }
      )
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get menu assistance
    const result = await getMenuAssistance({
      clientId,
      chefId: user.id,
      userMessage
    })

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Menu assistant API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}