import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Sous V1</span>
            <span className="block text-indigo-600">Personal Chef AI Agent</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your chef services with AI-powered client onboarding, personalized menu recommendations, and intelligent meal planning.
          </p>
        </div>

        <div className="mt-10 flex justify-center gap-6">
          <Link
            href="/setup"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Client Onboarding</h3>
              <p className="text-gray-500">
                AI-powered conversations to collect client preferences, dietary restrictions, and meal requirements.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Menu Recommendations</h3>
              <p className="text-gray-500">
                Personalized menu suggestions based on client preferences, past feedback, and your available dishes.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI-Powered Workflows</h3>
              <p className="text-gray-500">
                LangGraph workflows that learn from client feedback and continuously improve recommendations.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Tech Stack</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-sm font-medium text-gray-900">Next.js 15</div>
              <div className="text-xs text-gray-500">React Framework</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-sm font-medium text-gray-900">Supabase</div>
              <div className="text-xs text-gray-500">Database & Auth</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-sm font-medium text-gray-900">LangGraph</div>
              <div className="text-xs text-gray-500">AI Workflows</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-sm font-medium text-gray-900">TypeScript</div>
              <div className="text-xs text-gray-500">Type Safety</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
