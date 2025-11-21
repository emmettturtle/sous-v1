import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Request format for schedule generation
 * Contains all necessary information about a menu item to schedule
 */
export interface ScheduleTaskRequest {
  menuItemId: string
  menuItemName: string
  prepTimeMinutes: number
  cookTimeMinutes: number
  totalDuration: number // Sum of prep + cook time
  cookingMethods: string[] // e.g., ['grill', 'oven', 'stovetop']
}

/**
 * Response format for a scheduled task
 * Represents a time-blocked item in the production schedule
 */
export interface ScheduleTaskResponse {
  menuItemId: string
  menuItemName: string
  startTime: string // Format: "HH:MM" (relative to time window start)
  endTime: string // Format: "HH:MM"
  duration: number // Total minutes (prep + cook)
}

/**
 * AI-Powered Production Schedule Generator
 *
 * Accepts a prep list with recipe details and generates an optimized production schedule
 * using OpenAI GPT-4o-mini to intelligently arrange tasks based on:
 * - Cooking method constraints (avoid equipment conflicts)
 * - Recipe dependencies and timing
 * - Efficient kitchen workflow
 *
 * @param request - Contains prepList (array of ScheduleTaskRequest), timeWindowStart, timeWindowEnd
 * @returns Optimized schedule with start/end times for each task
 */
export async function POST(request: NextRequest) {
  try {
    const { prepList, timeWindowStart = '06:00', timeWindowEnd = '17:00' } = await request.json()

    if (!prepList || !Array.isArray(prepList) || prepList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid prepList' },
        { status: 400 }
      )
    }

    // Create Supabase client for auth
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

    // Create OpenAI API request
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Prepare the prompt
    const systemMessage = {
      role: 'system',
      content: 'You are a professional kitchen production scheduler. You create optimized cooking schedules that avoid equipment conflicts and maximize efficiency. Always respond with only valid JSON, no explanations or markdown formatting.'
    }

    const userMessage = {
      role: 'user',
      content: `Create an optimized production schedule for the following dishes. The schedule must fit within ${timeWindowStart} to ${timeWindowEnd}.

DISHES TO SCHEDULE:
${prepList.map((item: ScheduleTaskRequest, idx: number) => `
${idx + 1}. ${item.menuItemName}
   - Prep Time: ${item.prepTimeMinutes} minutes
   - Cook Time: ${item.cookTimeMinutes} minutes
   - TOTAL Duration: ${item.totalDuration} minutes (prep + cook)
   - Cooking Methods: ${item.cookingMethods.join(', ')}
   - Menu Item ID: ${item.menuItemId}
`).join('')}

SCHEDULING REQUIREMENTS:
1. The duration for each task MUST be exactly the TOTAL Duration shown above (prep time + cook time)
2. Avoid equipment conflicts (same oven/stovetop equipment should not be used simultaneously)
3. Longest/most complex tasks should generally start first
4. Identify opportunities for parallel prep work
5. Keep everything within the ${timeWindowStart} to ${timeWindowEnd} time window

RESPONSE FORMAT:
Return a JSON array with this exact structure (no markdown, no code blocks, just raw JSON):
[
  {
    "menuItemId": "string",
    "menuItemName": "string",
    "startTime": "HH:MM",
    "endTime": "HH:MM",
    "duration": number (MUST equal prep time + cook time for each dish)
  }
]

Important:
- startTime and endTime must be in 24-hour format (e.g., "09:30", "14:15")
- duration MUST equal the TOTAL Duration specified for each dish above
- The difference between endTime and startTime must equal the duration`
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, userMessage],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      return NextResponse.json(
        { success: false, error: 'Failed to generate schedule from OpenAI' },
        { status: 500 }
      )
    }

    const data = await response.json()
    let scheduleContent = data.choices[0]?.message?.content

    if (!scheduleContent) {
      return NextResponse.json(
        { success: false, error: 'No response from OpenAI' },
        { status: 500 }
      )
    }

    // Strip markdown code blocks if present (```json ... ```)
    scheduleContent = scheduleContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    // Parse the JSON response
    let schedule: ScheduleTaskResponse[]
    try {
      const parsed = JSON.parse(scheduleContent)
      // Handle both array and object with array property
      schedule = Array.isArray(parsed) ? parsed : (parsed.schedule || parsed.tasks || [])
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', scheduleContent, parseError)
      return NextResponse.json(
        { success: false, error: 'Invalid schedule format from AI' },
        { status: 500 }
      )
    }

    // Validate schedule structure
    if (!Array.isArray(schedule) || schedule.length === 0) {
      return NextResponse.json(
        { success: false, error: 'AI returned invalid or empty schedule' },
        { status: 500 }
      )
    }

    // Validate each task has required fields
    for (const task of schedule) {
      if (!task.menuItemId || !task.menuItemName || !task.startTime || !task.endTime || !task.duration) {
        console.error('Invalid task in schedule:', task)
        return NextResponse.json(
          { success: false, error: 'AI returned incomplete task data' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      schedule: schedule
    })

  } catch (error: any) {
    console.error('Schedule generation API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
