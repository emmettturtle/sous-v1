import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { startClientOnboarding } from '@/lib/agents/client-onboarding'

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

      const { message } = await request.json()

      // Start the client onboarding workflow
      const result = await startClientOnboarding(user.id, message)

      return NextResponse.json({
        success: true,
        response: result.messages[result.messages.length - 1]?.content || 'Onboarding started',
        state: {
          current_step: result.current_step,
          completed: result.completed
        }
      })
    } else {
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 })
    }

  } catch (error) {
    console.error('Error in client onboarding:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Client onboarding agent endpoint',
    usage: 'POST with { message: "user input" }'
  })
}