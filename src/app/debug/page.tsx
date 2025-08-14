import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function DebugPage() {
  try {
    const supabase = await createServerSupabaseClient()
    
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Debug Auth Status</h1>
            
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold">Auth Error:</h2>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {error ? JSON.stringify(error, null, 2) : 'No error'}
                </pre>
              </div>

              <div>
                <h2 className="font-semibold">User Object:</h2>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {user ? JSON.stringify(user, null, 2) : 'No user'}
                </pre>
              </div>

              <div>
                <h2 className="font-semibold">Environment Check:</h2>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
                  SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
                </pre>
              </div>
            </div>

            <div className="mt-6">
              <a 
                href="/login" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Debug Error</h1>
            <pre className="bg-red-100 p-4 rounded text-sm">
              {error instanceof Error ? error.message : 'Unknown error'}
            </pre>
          </div>
        </div>
      </div>
    )
  }
}