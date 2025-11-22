'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
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
 * Modern dashboard layout with persistent left sidebar:
 * - Fixed left sidebar with branding, navigation, and user info
 * - Mobile-responsive with overlay sidebar
 * - User account section at bottom of sidebar
 * - Clean, modern aesthetic similar to popular dashboards
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
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
            <SidebarContent
              navigation={navigation}
              pathname={pathname}
              user={user}
              handleSignOut={handleSignOut}
              onClose={() => setSidebarOpen(false)}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          <SidebarContent
            navigation={navigation}
            pathname={pathname}
            user={user}
            handleSignOut={handleSignOut}
            isMobile={false}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">Sous</div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * Sidebar Content Component
 * Renders the navigation and user info for both mobile and desktop
 */
function SidebarContent({
  navigation,
  pathname,
  user,
  handleSignOut,
  onClose,
  isMobile = false
}: {
  navigation: typeof navigation
  pathname: string
  user?: { id: string; email: string } | null
  handleSignOut: () => void
  onClose?: () => void
  isMobile?: boolean
}) {
  return (
    <>
      {/* Top section: Branding and close button (mobile only) */}
      <div className="flex h-16 shrink-0 items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sous</h1>
        {isMobile && onClose && (
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const IconComponent = item.icon
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      onClick={onClose}
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-700 hover:text-indigo-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className={`h-6 w-6 shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'
                      }`} />
                      {item.name}
                    </a>
                  </li>
                )
              })}
            </ul>
          </li>

          {/* User info at bottom */}
          <li className="mt-auto">
            <div className="border-t border-gray-200 pt-4 space-y-2">
              {user && (
                <div className="px-2">
                  <div className="flex items-center gap-x-3 p-2 rounded-md bg-gray-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <span className="text-base font-semibold">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="px-2">
                <button
                  onClick={handleSignOut}
                  className="group flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-700"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                  Sign out
                </button>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </>
  )
}
