import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== Simple OpenAI Test ===')
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY)
    console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: 'Say "Hello!" and nothing else.' }
        ],
        max_tokens: 5,
        temperature: 0
      })
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response:', errorText)
      
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
    }

    const data = await response.json()
    console.log('Success! Response:', data)

    return NextResponse.json({
      success: true,
      message: data.choices[0]?.message?.content,
      usage: data.usage,
      model: data.model
    })

  } catch (error: any) {
    console.error('Fetch error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      type: 'fetch_error'
    })
  }
}