'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Sparkles } from 'lucide-react'
import { navigationItems } from '@/lib/constants/navigation'
import { cn } from '@/lib/utils/cn'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50 border-r border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all group-hover:scale-105">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              MediCore
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5">
              Healthcare Platform
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1.5">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex flex-col gap-0.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/50'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 hover:shadow-sm hover:scale-[1.02]'
                )}
                title={item.description}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn(
                    "h-5 w-5 transition-transform group-hover:scale-110",
                    isActive && "text-blue-600 dark:text-blue-400"
                  )} />
                  <span className="font-semibold">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && (
                    <Sparkles className="ml-auto h-3.5 w-3.5 text-blue-500 animate-pulse" />
                  )}
                </div>
                {item.description && (
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 ml-8 leading-tight">
                    {item.description}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

    </div>
  )
}
