'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Sparkles } from 'lucide-react'
import { navigationItems } from '@/lib/constants/navigation'
import { cn } from '@/lib/utils/cn'

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 text-white shadow-lg shadow-fuchsia-500/30 flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col bg-gradient-to-b from-white via-fuchsia-50/30 to-white dark:from-gray-950 dark:via-fuchsia-950/20 dark:to-gray-950 shadow-xl">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-fuchsia-100 dark:border-fuchsia-900/30">
            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              <div className="relative h-10 w-36">
                <Image
                  src="/logo.png"
                  alt="VR Dental Care"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/30 transition-colors"
            >
              <X className="h-5 w-5 text-fuchsia-600" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-fuchsia-100 to-fuchsia-50 dark:from-fuchsia-950/50 dark:to-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-fuchsia-50/80 dark:hover:bg-fuchsia-950/30'
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-fuchsia-600" : "text-gray-500"
                    )} />
                    <span>{item.title}</span>
                    {isActive && <Sparkles className="ml-auto h-4 w-4 text-orange-500" />}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-fuchsia-100 dark:border-fuchsia-900/30">
            <div className="flex items-center gap-2 text-xs text-fuchsia-500/60">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
