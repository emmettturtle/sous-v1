// Reusable shimmer skeleton components

interface ShimmerProps {
  className?: string
}

const Shimmer: React.FC<ShimmerProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer ${className}`} />
)

// Dashboard Content Skeleton (use inside AppLayout)
export const DashboardContentSkeleton = () => (
  <div className="space-y-6">
    {/* Page Header */}
    <div>
      <Shimmer className="h-8 w-32 rounded mb-2" />
      <Shimmer className="h-4 w-96 rounded" />
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <Shimmer className="w-8 h-8 rounded-md" />
              <div className="ml-5 w-0 flex-1">
                <Shimmer className="h-4 w-24 rounded mb-2" />
                <Shimmer className="h-6 w-16 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* AI Assistant Card */}
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Shimmer className="h-8 w-48 rounded mb-2 bg-indigo-400" />
          <Shimmer className="h-5 w-full max-w-lg rounded mb-2 bg-indigo-300" />
          <Shimmer className="h-4 w-3/4 max-w-md rounded bg-indigo-300" />
        </div>
        <div className="hidden sm:block">
          <Shimmer className="w-24 h-24 rounded-full bg-indigo-400" />
        </div>
      </div>
      <div className="mt-6">
        <Shimmer className="h-12 w-48 rounded-lg bg-white opacity-90" />
      </div>
    </div>

    {/* Quick Actions */}
    <div>
      <Shimmer className="h-6 w-32 rounded mb-4" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg px-6 py-5">
            <Shimmer className="h-4 w-32 rounded mb-2" />
            <Shimmer className="h-3 w-40 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Clients Content Skeleton (use inside AppLayout)
export const ClientsContentSkeleton = () => (
  <div className="space-y-6">
    {/* Page Header */}
    <div className="flex items-center justify-between">
      <div>
        <Shimmer className="h-8 w-48 rounded mb-2" />
        <Shimmer className="h-4 w-64 rounded" />
      </div>
      <Shimmer className="h-10 w-32 rounded-md" />
    </div>

    {/* Clients Grid */}
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white overflow-hidden shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Shimmer className="w-10 h-10 rounded-full" />
            <div className="ml-4 flex-1">
              <Shimmer className="h-5 w-32 rounded mb-1" />
              <Shimmer className="h-4 w-40 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {[...Array(4)].map((_, j) => (
              <div key={j}>
                <Shimmer className="h-3 w-16 rounded mb-1" />
                <Shimmer className="h-4 w-24 rounded" />
              </div>
            ))}
          </div>

          <div className="p-3 bg-gray-50 rounded-md mb-4">
            <Shimmer className="h-3 w-20 rounded mb-2" />
            <Shimmer className="h-3 w-32 rounded mb-1" />
            <Shimmer className="h-3 w-28 rounded" />
          </div>

          <Shimmer className="h-10 w-full rounded-md" />
        </div>
      ))}
    </div>
  </div>
)

// Menu Items Content Skeleton (use inside AppLayout)
export const MenuItemsContentSkeleton = () => (
  <div className="space-y-6">
    {/* Page Header */}
    <div className="flex items-center justify-between">
      <div>
        <Shimmer className="h-8 w-48 rounded mb-2" />
        <Shimmer className="h-4 w-64 rounded" />
      </div>
      <Shimmer className="h-10 w-40 rounded-md" />
    </div>

    {/* Search and Filters */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Shimmer className="h-4 w-16 rounded mb-2" />
          <Shimmer className="h-10 w-full rounded-md" />
        </div>
        <div>
          <Shimmer className="h-4 w-20 rounded mb-2" />
          <Shimmer className="h-10 w-full rounded-md" />
        </div>
        <div>
          <Shimmer className="h-4 w-16 rounded mb-2" />
          <Shimmer className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>

    {/* Results Summary */}
    <Shimmer className="h-4 w-48 rounded" />

    {/* Menu Items Grid */}
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="bg-white overflow-hidden shadow rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Shimmer className="h-5 w-40 rounded mb-1" />
              <Shimmer className="h-4 w-24 rounded" />
            </div>
            <Shimmer className="h-6 w-16 rounded-full" />
          </div>

          <Shimmer className="h-4 w-full rounded mb-2" />
          <Shimmer className="h-4 w-3/4 rounded mb-4" />

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[...Array(4)].map((_, j) => (
              <Shimmer key={j} className="h-4 w-20 rounded" />
            ))}
          </div>

          <div className="mb-4">
            <Shimmer className="h-3 w-24 rounded mb-2" />
            <div className="flex flex-wrap gap-1">
              {[...Array(4)].map((_, j) => (
                <Shimmer key={j} className="h-6 w-16 rounded" />
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Shimmer className="flex-1 h-8 rounded-md" />
            <Shimmer className="h-8 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

// AI Assistant Content Skeleton (use inside AppLayout)
export const AssistantContentSkeleton = () => (
  <div className="space-y-6">
    {/* Page Header */}
    <div>
      <Shimmer className="h-8 w-64 rounded mb-2" />
      <Shimmer className="h-4 w-96 rounded" />
    </div>

    {/* Client Selection Bar */}
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Shimmer className="h-4 w-20 rounded" />
          <Shimmer className="h-10 w-64 rounded-md" />
        </div>
        <Shimmer className="h-4 w-32 rounded" />
      </div>
    </div>

    {/* Chat Interface */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-400px)] min-h-96 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Assistant message */}
        <div className="flex justify-start">
          <div className="max-w-md lg:max-w-2xl px-4 py-2 rounded-lg bg-gray-100">
            <Shimmer className="h-4 w-full rounded mb-2" />
            <Shimmer className="h-4 w-5/6 rounded mb-2" />
            <Shimmer className="h-4 w-4/5 rounded" />
          </div>
        </div>

        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-md lg:max-w-2xl px-4 py-2 rounded-lg bg-indigo-600">
            <Shimmer className="h-4 w-32 rounded bg-indigo-500" />
          </div>
        </div>

        {/* Assistant message */}
        <div className="flex justify-start">
          <div className="max-w-md lg:max-w-2xl px-4 py-2 rounded-lg bg-gray-100">
            <Shimmer className="h-4 w-full rounded mb-2" />
            <Shimmer className="h-4 w-3/4 rounded" />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <Shimmer className="flex-1 h-16 rounded-md" />
          <Shimmer className="h-16 w-16 rounded-md" />
        </div>
      </div>
    </div>

    {/* Client Info */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <Shimmer className="h-4 w-32 rounded mb-3" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <Shimmer className="h-3 w-24 rounded mb-1" />
            <Shimmer className="h-4 w-32 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Prep Assistant Content Skeleton (use inside AppLayout)
export const PrepAssistantContentSkeleton = () => (
  <div className="space-y-6">
    {/* Page Header */}
    <div>
      <Shimmer className="h-8 w-48 rounded mb-2" />
      <Shimmer className="h-4 w-96 rounded" />
    </div>

    {/* Top Section: Prep List + Recipe Card */}
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Prep List */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[400px] flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <Shimmer className="h-6 w-24 rounded" />
          </div>
          <div className="flex-1 p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Shimmer key={i} className="h-12 w-full rounded" />
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Card */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[400px] p-6">
          <Shimmer className="h-7 w-64 rounded mb-4" />
          <Shimmer className="h-4 w-48 rounded mb-6" />

          <Shimmer className="h-5 w-32 rounded mb-3" />
          <div className="space-y-2 mb-6">
            {[...Array(6)].map((_, i) => (
              <Shimmer key={i} className="h-4 w-full rounded" />
            ))}
          </div>

          <Shimmer className="h-5 w-32 rounded mb-3" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Shimmer key={i} className="h-4 w-full rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Production Schedule */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <Shimmer className="h-6 w-48 rounded" />
          <Shimmer className="h-10 w-40 rounded-md" />
        </div>
        <Shimmer className="h-4 w-96 rounded" />
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Shimmer key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Dashboard skeleton
export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header skeleton */}
    <div className="bg-gradient-to-r from-white to-gray-50 shadow-lg border-b border-gray-100">
      <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
        <div className="py-4 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <Shimmer className="h-7 w-24 rounded" />
              </div>
              <div className="flex items-center space-x-4">
                <Shimmer className="h-4 w-48 rounded" />
                <Shimmer className="h-4 w-40 rounded" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
            <Shimmer className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>

    <div className="py-10">
      <div className="max-w-3xl mx-auto sm:px-6 lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block lg:col-span-3 xl:col-span-2">
          <nav className="sticky top-4 divide-y divide-gray-300">
            <div className="pb-8 space-y-1">
              {[...Array(4)].map((_, i) => (
                <Shimmer key={i} className="h-10 w-full rounded-md mb-2" />
              ))}
            </div>
          </nav>
        </div>

        {/* Main content skeleton */}
        <main className="lg:col-span-9 xl:col-span-10">
          <div className="mt-4">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Shimmer className="h-6 w-32 rounded mb-4" />
              
              {/* Stats cards skeleton */}
              <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Shimmer className="w-8 h-8 rounded-md" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <Shimmer className="h-4 w-24 rounded mb-2" />
                          <Shimmer className="h-6 w-16 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Assistant prominent section skeleton */}
              <div className="mt-8">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Shimmer className="h-8 w-48 rounded mb-2 bg-indigo-400" />
                      <Shimmer className="h-5 w-full rounded mb-2 bg-indigo-300" />
                      <Shimmer className="h-4 w-3/4 rounded bg-indigo-300" />
                    </div>
                    <div className="hidden sm:block">
                      <Shimmer className="w-24 h-24 rounded-full bg-indigo-400" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Shimmer className="h-12 w-48 rounded-lg bg-white opacity-90" />
                  </div>
                </div>
              </div>

              {/* Quick actions skeleton */}
              <div className="mt-8">
                <Shimmer className="h-6 w-32 rounded mb-4" />
                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 min-w-0">
                            <Shimmer className="h-4 w-32 rounded mb-2" />
                            <Shimmer className="h-3 w-40 rounded" />
                          </div>
                          <Shimmer className="w-5 h-5 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
)

// Clients list skeleton
export const ClientsListSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header skeleton */}
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
        <div className="py-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <Shimmer className="h-8 w-64 rounded mb-2" />
            <Shimmer className="h-4 w-48 rounded" />
          </div>
          <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
            <Shimmer className="h-10 w-32 rounded-md" />
            <Shimmer className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shimmer className="w-10 h-10 rounded-full" />
                </div>
                <div className="ml-4 flex-1">
                  <Shimmer className="h-5 w-32 rounded mb-1" />
                  <Shimmer className="h-4 w-40 rounded" />
                </div>
              </div>
              
              <div className="mt-4">
                <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 text-sm">
                  {[...Array(4)].map((_, j) => (
                    <div key={j}>
                      <Shimmer className="h-3 w-16 rounded mb-1" />
                      <Shimmer className="h-4 w-24 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <Shimmer className="h-3 w-20 rounded mb-2" />
                <div className="space-y-1">
                  <Shimmer className="h-3 w-32 rounded" />
                  <Shimmer className="h-3 w-28 rounded" />
                  <Shimmer className="h-3 w-36 rounded" />
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <Shimmer className="flex-1 h-10 rounded-md" />
                <Shimmer className="h-10 w-16 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Menu items list skeleton
export const MenuItemsListSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header skeleton */}
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
        <div className="py-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <Shimmer className="h-8 w-48 rounded mb-2" />
            <Shimmer className="h-4 w-64 rounded" />
          </div>
          <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
            <Shimmer className="h-10 w-40 rounded-md" />
            <Shimmer className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and filters skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Shimmer className="h-4 w-16 rounded mb-2" />
            <Shimmer className="h-10 w-full rounded-md" />
          </div>
          <div>
            <Shimmer className="h-4 w-20 rounded mb-2" />
            <Shimmer className="h-10 w-full rounded-md" />
          </div>
          <div>
            <Shimmer className="h-4 w-16 rounded mb-2" />
            <Shimmer className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* Results summary skeleton */}
      <div className="mb-4">
        <Shimmer className="h-4 w-48 rounded" />
      </div>

      {/* Menu items grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Shimmer className="h-5 w-40 rounded mb-1" />
                  <Shimmer className="h-4 w-24 rounded" />
                </div>
                <Shimmer className="h-6 w-16 rounded-full" />
              </div>

              {/* Description */}
              <Shimmer className="h-4 w-full rounded mb-2" />
              <Shimmer className="h-4 w-3/4 rounded mb-4" />

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[...Array(6)].map((_, j) => (
                  <Shimmer key={j} className="h-4 w-20 rounded" />
                ))}
              </div>

              {/* Ingredients */}
              <div className="mb-4">
                <Shimmer className="h-3 w-24 rounded mb-2" />
                <div className="flex flex-wrap gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Shimmer key={j} className="h-6 w-16 rounded" />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Shimmer className="flex-1 h-8 rounded-md" />
                <Shimmer className="h-8 w-16 rounded-md" />
                <Shimmer className="h-8 w-16 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// AI Assistant skeleton
export const AssistantSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header skeleton */}
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
        <div className="py-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <Shimmer className="h-8 w-64 rounded mb-2" />
            <Shimmer className="h-4 w-96 rounded" />
          </div>
          <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
            <Shimmer className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>

    {/* Client selection bar skeleton */}
    <div className="bg-indigo-50 border-b border-indigo-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shimmer className="h-4 w-20 rounded" />
            <Shimmer className="h-10 w-64 rounded-md" />
          </div>
          <Shimmer className="h-4 w-32 rounded" />
        </div>
      </div>
    </div>

    {/* Chat interface skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-400px)] min-h-96 flex flex-col">
        {/* Messages skeleton */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Assistant message */}
          <div className="flex justify-start">
            <div className="max-w-md lg:max-w-2xl px-4 py-2 rounded-lg bg-gray-100">
              <Shimmer className="h-4 w-full rounded mb-2" />
              <Shimmer className="h-4 w-5/6 rounded mb-2" />
              <Shimmer className="h-4 w-4/5 rounded mb-2" />
              <Shimmer className="h-4 w-3/4 rounded" />
            </div>
          </div>
          
          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-md lg:max-w-2xl px-4 py-2 rounded-lg bg-indigo-600">
              <Shimmer className="h-4 w-32 rounded bg-indigo-500" />
            </div>
          </div>
          
          {/* Assistant message */}
          <div className="flex justify-start">
            <div className="max-w-md lg:max-w-2xl px-4 py-2 rounded-lg bg-gray-100">
              <Shimmer className="h-4 w-full rounded mb-2" />
              <Shimmer className="h-4 w-3/4 rounded" />
            </div>
          </div>
        </div>

        {/* Input skeleton */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <Shimmer className="flex-1 h-16 rounded-md" />
            <Shimmer className="h-16 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  </div>
)