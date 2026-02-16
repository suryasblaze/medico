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
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </span>
        {Icon && <Icon className="h-5 w-5 text-gray-400" />}
      </div>

      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </div>

      {change && (
        <div className="mt-2 flex items-center gap-1">
          <span className={`text-sm font-medium ${
            change.isPositive ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {change.isPositive ? '↑' : '↓'} {change.value}
          </span>
          <span className="text-sm text-gray-500">vs last month</span>
        </div>
      )}
    </div>
  )
}
