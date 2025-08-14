import { NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'

export async function GET() {
  try {
    console.log('=== OpenAI API Test Debug Info ===')
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY)
    console.log('API Key format:', process.env.OPENAI_API_KEY?.substring(0, 12) + '...')
    console.log('API Key length:', process.env.OPENAI_API_KEY?.length)
    console.log('Node environment:', process.env.NODE_ENV)
    
    // Test with direct fetch first
    console.log('Testing direct fetch to OpenAI...')
    const directResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say hello!' }],
        max_tokens: 10
      })
    })

    console.log('Direct fetch status:', directResponse.status)
    console.log('Direct fetch headers:', Object.fromEntries(directResponse.headers.entries()))

    if (!directResponse.ok) {
      const errorText = await directResponse.text()
      console.log('Direct fetch error body:', errorText)
      
      return NextResponse.json({
        success: false,
        error: `Direct fetch failed: ${directResponse.status} ${directResponse.statusText}`,
        errorBody: errorText,
        apiKeyPresent: !!process.env.OPENAI_API_KEY,
        apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 12),
        testType: 'direct_fetch'
      }, { status: 500 })
    }

    const directData = await directResponse.json()
    console.log('Direct fetch success:', directData)

    return NextResponse.json({
      success: true,
      response: directData,
      apiKeyPresent: !!process.env.OPENAI_API_KEY,
      apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 12),
      testType: 'direct_fetch'
    })

  } catch (error: any) {
    console.error('OpenAI API test failed with error:', error)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorName: error.constructor.name,
      errorStack: error.stack,
      apiKeyPresent: !!process.env.OPENAI_API_KEY,
      apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 12),
      testType: 'direct_fetch'
    }, { status: 500 })
  }
}