'use client'

import { useState } from 'react'

export default function SimpleTest() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testOpenAI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/simple-openai-test')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: 'Network error' })
    }
    setLoading(false)
  }

  const checkEnv = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug-env')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: 'Network error' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Simple OpenAI Test</h1>
        
        <div className="space-x-4">
          <button
            onClick={checkEnv}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Environment'}
          </button>
          
          <button
            onClick={testOpenAI}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test OpenAI API'}
          </button>
        </div>

        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <pre className="bg-white p-4 rounded border overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}