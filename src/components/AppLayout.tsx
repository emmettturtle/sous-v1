'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'

interface AppLayoutProps {
  children: React.ReactNode
  user?: { id: string; email: string } | null
}

/**
 * Main navigation configuration
 * Defines all available pages in the application with their routes and icons
 */
const navigation = [
  { name: 'Dashboard', href: '/dashboard-client', icon: HomeIcon },
  { name: 'Clients', href: '/clients', icon: UsersIcon },
  { name: 'Menu Items', href: '/menu-items', icon: DocumentTextIcon },
  { name: 'AI Assistant', href: '/assistant', icon: SparklesIcon },
  { name: 'Prep Assistant', href: '/prep-assistant', icon: ClipboardDocumentCheckIcon },
]

/**
 * AppLayout Component
 *
 * Provides consistent layout across all authenticated pages with:
 * - Top header with logo, user info, and sign out button
 * - Persistent sidebar navigation with active state highlighting
 * - Mobile-responsive design with hamburger menu
 * - Heroicons for professional icon set
 *
 * @param children - Page content to render in main area
 * @param user - Current authenticated user (optional, for display)
 */
export default function AppLayout({ children, user }: AppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    const { supabase } = await import('@/lib/supabase')
    await supabase?.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 shadow-lg border-b border-gray-100">
        <div className="px-4 sm:px-6 lg:max-w-7xl lg:mx-auto lg:px-8">
          <div className="py-4 flex items-center justify-between">
            {/* Left: Logo + Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <span className="sr-only">Open menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
                Sous Agent
              </h1>
            </div>

            {/* Right: User Info + Sign Out */}
            <div className="flex items-center space-x-4">
              {user && (
                <p className="text-sm text-gray-600 font-medium hidden sm:block">
                  <span className="text-indigo-600">{user.email.split('@')[0]}</span>
                </p>
              )}
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close menu</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  const IconComponent = item.icon
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <IconComponent className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-indigo-600' : 'text-gray-500'
                      }`} />
                      {item.name}
                    </a>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with Sidebar */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-3 xl:col-span-2">
              <nav className="sticky top-6 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  const IconComponent = item.icon
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      <IconComponent className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-indigo-600' : 'text-gray-500'
                      }`} />
                      {item.name}
                    </a>
                  )
                })}
              </nav>
            </div>

            {/* Main Content Area */}
            <main className="lg:col-span-9 xl:col-span-10">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
