export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-fuchsia-100 dark:bg-fuchsia-950/30 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-fuchsia-50 dark:bg-fuchsia-950/20 rounded animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-fuchsia-100 dark:border-fuchsia-900/30 bg-white/80 dark:bg-gray-950/80 p-6"
          >
            <div className="space-y-3">
              <div className="h-4 w-24 bg-fuchsia-100 dark:bg-fuchsia-950/30 rounded animate-pulse" />
              <div className="h-8 w-16 bg-fuchsia-100 dark:bg-fuchsia-950/30 rounded animate-pulse" />
              <div className="h-3 w-20 bg-fuchsia-50 dark:bg-fuchsia-950/20 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-fuchsia-100 dark:border-fuchsia-900/30 bg-white/80 dark:bg-gray-950/80 p-6"
          >
            <div className="h-5 w-32 bg-fuchsia-100 dark:bg-fuchsia-950/30 rounded animate-pulse mb-4" />
            <div className="h-64 bg-fuchsia-50 dark:bg-fuchsia-950/20 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
