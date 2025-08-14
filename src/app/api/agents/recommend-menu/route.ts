import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getMenuRecommendations } from '@/lib/agents/menu-recommender'

export async function POST(request: NextRequest) {
  try {
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
    
    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { client_id, message } = await request.json()

      if (!client_id) {
        return NextResponse.json(
          { error: 'client_id is required' },
          { status: 400 }
        )
      }

      // Get menu recommendations for the client
      const result = await getMenuRecommendations(client_id, user.id, message)

      return NextResponse.json({
        success: true,
        response: result.messages[result.messages.length - 1]?.content || 'No recommendations available',
        recommendations: result.recommendations,
        reasoning: result.reasoning,
        completed: result.completed
      })
    } else {
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 })
    }

  } catch (error) {
    console.error('Error in menu recommendation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Menu recommendation agent endpoint',
    usage: 'POST with { client_id: "uuid", message: "optional context" }'
  })
}