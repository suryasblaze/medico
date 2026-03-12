import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    isPositive: boolean
  }
  icon?: LucideIcon
}

export function StatsCard({ title, value, change, icon: Icon }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-fuchsia-100 dark:border-fuchsia-900/30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm p-6 shadow-lg shadow-fuchsia-500/5 hover:shadow-xl hover:shadow-fuchsia-500/10 transition-all duration-150 hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-fuchsia-600/80 dark:text-fuchsia-400/80">
          {title}
        </span>
        {Icon && (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-100 to-fuchsia-50 dark:from-fuchsia-950/50 dark:to-fuchsia-900/30 flex items-center justify-center">
            <Icon className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
          </div>
        )}
      </div>

      <div className="text-3xl font-bold bg-gradient-to-r from-fuchsia-700 via-fuchsia-600 to-fuchsia-800 bg-clip-text text-transparent">
        {value}
      </div>

      {change && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
            change.isPositive
              ? 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400'
              : 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400'
          }`}>
            {change.isPositive ? '↑' : '↓'} {change.value}
          </span>
        </div>
      )}
    </div>
  )
}
