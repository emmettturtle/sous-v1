'use client'

export default function Setup() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Setup Sous V1 - Personal Chef AI Agent
          </h1>
          
          <div className="space-y-6">
            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Environment variables not configured.</strong> Please follow the steps below to complete setup.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Create Supabase Project</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Go to <a href="https://supabase.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">supabase.com</a> and create a new project</li>
                <li>Wait for the project to be fully set up</li>
                <li>Go to Settings → API to find your project URL and anon key</li>
              </ol>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Run Database Schema</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>In your Supabase project, go to the SQL Editor</li>
                <li>Copy and paste the contents from <code className="bg-gray-100 px-1 rounded">/supabase-schema.sql</code></li>
                <li>Run the SQL to create all necessary tables and security policies</li>
              </ol>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 3: Update Environment Variables</h2>
              <p className="text-sm text-gray-700 mb-3">
                Update your <code className="bg-gray-100 px-1 rounded">.env.local</code> file with the following:
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono">
                <div className="space-y-1">
                  <div><span className="text-green-400"># Supabase Configuration</span></div>
                  <div><span className="text-blue-300">NEXT_PUBLIC_SUPABASE_URL</span>=<span className="text-yellow-300">your_supabase_project_url</span></div>
                  <div><span className="text-blue-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>=<span className="text-yellow-300">your_supabase_anon_key</span></div>
                  <div><span className="text-blue-300">SUPABASE_SERVICE_ROLE_KEY</span>=<span className="text-yellow-300">your_supabase_service_role_key</span></div>
                  <div className="mt-3"><span className="text-green-400"># OpenAI Configuration (for LangGraph)</span></div>
                  <div><span className="text-blue-300">OPENAI_API_KEY</span>=<span className="text-yellow-300">your_openai_api_key</span></div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 4: Get OpenAI API Key</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Go to <a href="https://platform.openai.com/api-keys" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">OpenAI API Keys</a></li>
                <li>Create a new API key</li>
                <li>Add it to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file</li>
              </ol>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 5: Restart Development Server</h2>
              <p className="text-sm text-gray-700">
                After updating your environment variables, restart your development server:
              </p>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm font-mono mt-2">
                npm run dev
              </div>
            </div>

            <div className="border-l-4 border-green-400 bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Once configured,</strong> you'll be able to access the login page and start using the AI agent features!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a 
                href="/login" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Login Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}