'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { navigationItems } from '@/lib/constants/navigation'
import { cn } from '@/lib/utils/cn'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-white via-fuchsia-50/30 to-white dark:from-gray-950 dark:via-fuchsia-950/20 dark:to-gray-950 border-r border-fuchsia-100 dark:border-fuchsia-900/30 shadow-sm">
      {/* Logo */}
      <div className="flex h-20 items-center justify-center px-4 border-b border-fuchsia-100 dark:border-fuchsia-900/30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm">
        <Link href="/dashboard" className="group transition-transform duration-150 hover:scale-105">
          <div className="relative h-14 w-48">
            <Image
              src="/logo.png"
              alt="VR Dental Care"
              fill
              priority
              className="object-contain"
            />
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
                  'group flex flex-col gap-0.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-gradient-to-r from-fuchsia-100 to-fuchsia-50 dark:from-fuchsia-950/50 dark:to-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 shadow-sm border border-fuchsia-200/50 dark:border-fuchsia-800/50'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-fuchsia-50/80 dark:hover:bg-fuchsia-950/30 hover:shadow-sm hover:scale-[1.02]'
                )}
                title={item.description}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn(
                    "h-5 w-5 transition-transform group-hover:scale-110",
                    isActive ? "text-fuchsia-600 dark:text-fuchsia-400" : "text-gray-500 dark:text-gray-400"
                  )} />
                  <span className="font-semibold">{item.title}</span>
                  {isActive && (
                    <Sparkles className="ml-auto h-3.5 w-3.5 text-orange-500" />
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

      {/* Footer branding */}
      <div className="p-4 border-t border-fuchsia-100 dark:border-fuchsia-900/30">
        <div className="flex items-center gap-2 text-[10px] text-fuchsia-500/60 dark:text-fuchsia-400/50">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span>System Online</span>
        </div>
      </div>
    </div>
  )
}
