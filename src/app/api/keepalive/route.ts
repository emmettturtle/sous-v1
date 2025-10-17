import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Keepalive endpoint to prevent Supabase database from pausing
 * This endpoint performs a simple query to keep the database active
 *
 * Security: Protected by CRON_SECRET environment variable
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {}
        }
      }
    )

    // Perform a simple query to keep the database active
    // Count clients to verify database connectivity
    const { count, error } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Keepalive database error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Database query failed',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Database keepalive successful',
      timestamp: new Date().toISOString(),
      clientCount: count
    })

  } catch (error: any) {
    console.error('Keepalive endpoint error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Keepalive failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}
