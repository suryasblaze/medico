'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { navigationItems } from '@/lib/constants/navigation'
import { cn } from '@/lib/utils/cn'

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-gradient-to-b from-white via-fuchsia-50/30 to-white dark:from-gray-950 dark:via-fuchsia-950/20 dark:to-gray-950 border-r border-fuchsia-100 dark:border-fuchsia-900/30 shadow-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-fuchsia-100 dark:border-fuchsia-900/30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm transition-all duration-300",
        isCollapsed ? "justify-center px-2" : "justify-center px-4"
      )}>
        <Link href="/dashboard" className="group transition-transform duration-150 hover:scale-105">
          {isCollapsed ? (
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-600 to-fuchsia-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">VR</span>
            </div>
          ) : (
            <div className="relative h-12 w-40">
              <Image
                src="/logo.png"
                alt="VR Dental Care"
                fill
                priority
                className="object-contain"
              />
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-xl text-sm font-medium transition-all duration-150',
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5',
                  isActive
                    ? 'bg-gradient-to-r from-fuchsia-100 to-fuchsia-50 dark:from-fuchsia-950/50 dark:to-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 shadow-sm border border-fuchsia-200/50 dark:border-fuchsia-800/50'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-fuchsia-50/80 dark:hover:bg-fuchsia-950/30 hover:shadow-sm'
                )}
                title={isCollapsed ? item.title : item.description}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-fuchsia-600 dark:text-fuchsia-400" : "text-gray-500 dark:text-gray-400"
                )} />
                {!isCollapsed && (
                  <>
                    <span className="font-semibold truncate">{item.title}</span>
                    {isActive && (
                      <Sparkles className="ml-auto h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Collapse Toggle Button */}
      <div className="p-2 border-t border-fuchsia-100 dark:border-fuchsia-900/30">
        <button
          onClick={toggleCollapse}
          className={cn(
            "w-full flex items-center rounded-xl p-2.5 text-sm font-medium transition-all duration-150 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30 text-gray-600 dark:text-gray-400",
            isCollapsed ? "justify-center" : "gap-3"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Footer branding */}
      <div className={cn(
        "p-3 border-t border-fuchsia-100 dark:border-fuchsia-900/30",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <div className={cn(
          "flex items-center gap-2 text-[10px] text-fuchsia-500/60 dark:text-fuchsia-400/50",
          isCollapsed ? "justify-center" : ""
        )}>
          <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0"></div>
          {!isCollapsed && <span>System Online</span>}
        </div>
      </div>
    </div>
  )
}
