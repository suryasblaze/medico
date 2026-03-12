'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Bell, Calendar, Clock, User, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import type { Doctor, Appointment } from '@/types'

interface HeaderProps {
  doctor: Pick<Doctor, 'id' | 'full_name' | 'email' | 'avatar_url'>
}

export function Header({ doctor }: HeaderProps) {
  const router = useRouter()
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const { data } = await supabase
        .from('appointments')
        .select('*, patient:patients(full_name)')
        .eq('doctor_id', doctor.id)
        .eq('appointment_date', today)
        .eq('status', 'scheduled')
        .order('start_time', { ascending: true })

      setTodayAppointments(data || [])
      setLoading(false)
    }

    fetchTodayAppointments()

    // Refresh every minute
    const interval = setInterval(fetchTodayAppointments, 60000)
    return () => clearInterval(interval)
  }, [doctor.id])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTime = (time: string) => {
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    return `${hour % 12 || 12}:${m} ${ampm}`
  }

  // Get upcoming appointments (next 2 hours)
  const now = new Date()
  const upcomingAppointments = todayAppointments.filter((apt) => {
    const [h, m] = apt.start_time.split(':').map(Number)
    const aptTime = new Date()
    aptTime.setHours(h, m, 0, 0)
    const diffMinutes = (aptTime.getTime() - now.getTime()) / 60000
    return diffMinutes > -30 && diffMinutes <= 120 // Past 30 min to next 2 hours
  })

  return (
    <header className="border-b border-fuchsia-100 dark:border-fuchsia-900/30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg">
      <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-6">
        {/* Search - hidden on mobile */}
        <div className="hidden md:block flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia-400" />
            <input
              type="search"
              placeholder="Search patients, forms, appointments..."
              className="w-full rounded-xl border border-fuchsia-100 dark:border-fuchsia-900/50 bg-fuchsia-50/30 dark:bg-fuchsia-950/20 pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-all placeholder:text-fuchsia-400/60"
            />
          </div>
        </div>

        {/* Mobile: Show app name */}
        <div className="md:hidden">
          <h1 className="text-lg font-bold bg-gradient-to-r from-fuchsia-600 to-orange-500 bg-clip-text text-transparent">
            VR Dental
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30 transition-all hover:scale-105"
              >
                <Bell className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
                {upcomingAppointments.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-gray-950 animate-pulse">
                    {upcomingAppointments.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 rounded-xl border-fuchsia-100 dark:border-fuchsia-900/50 shadow-xl shadow-fuchsia-500/10">
              <div className="p-4 border-b border-fuchsia-100 dark:border-fuchsia-900/30 bg-gradient-to-r from-fuchsia-50 to-white dark:from-fuchsia-950/50 dark:to-gray-950">
                <h3 className="font-semibold text-fuchsia-800 dark:text-fuchsia-200">Today's Appointments</h3>
                <p className="text-xs text-fuchsia-600/70 dark:text-fuchsia-400/70">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                </p>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-fuchsia-600/70 text-sm">
                    Loading...
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-fuchsia-100 dark:bg-fuchsia-950/50 flex items-center justify-center mb-3">
                      <Calendar className="h-6 w-6 text-fuchsia-500" />
                    </div>
                    <p className="text-sm text-fuchsia-600/70 dark:text-fuchsia-400/70">No upcoming appointments</p>
                  </div>
                ) : (
                  upcomingAppointments.map((apt) => {
                    const [h, m] = apt.start_time.split(':').map(Number)
                    const aptTime = new Date()
                    aptTime.setHours(h, m, 0, 0)
                    const diffMinutes = Math.floor((aptTime.getTime() - now.getTime()) / 60000)
                    const isNow = diffMinutes >= -5 && diffMinutes <= 5
                    const isSoon = diffMinutes > 5 && diffMinutes <= 15

                    return (
                      <div
                        key={apt.id}
                        onClick={() => router.push('/appointments')}
                        className={`p-3 border-b border-fuchsia-50 dark:border-fuchsia-900/20 last:border-b-0 cursor-pointer hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-950/30 transition-colors ${
                          isNow ? 'bg-orange-50 dark:bg-orange-950/20' : isSoon ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isNow ? 'bg-orange-100 text-orange-600' : isSoon ? 'bg-yellow-100 text-yellow-600' : 'bg-fuchsia-100 text-fuchsia-600'
                          }`}>
                            <User className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate text-gray-800 dark:text-gray-200">
                              {apt.patient?.full_name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-fuchsia-600/70 dark:text-fuchsia-400/70">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(apt.start_time)}</span>
                              {apt.title && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{apt.title}</span>
                                </>
                              )}
                            </div>
                            {isNow && (
                              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                                NOW
                              </span>
                            )}
                            {isSoon && (
                              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                                IN {diffMinutes} MIN
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              {todayAppointments.length > 0 && (
                <div className="p-2 border-t border-fuchsia-100 dark:border-fuchsia-900/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-fuchsia-600 hover:text-fuchsia-700 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30 rounded-lg"
                    onClick={() => router.push('/appointments')}
                  >
                    View All ({todayAppointments.length} today)
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 md:gap-3 rounded-xl hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30 px-2 md:px-3 py-1.5 md:py-2 transition-all hover:shadow-md">
                <Avatar className="h-8 w-8 md:h-9 md:w-9 ring-2 ring-fuchsia-500/30">
                  <AvatarImage src={doctor.avatar_url || ''} alt={doctor.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-fuchsia-600 to-fuchsia-700 text-white text-xs font-bold">
                    {getInitials(doctor.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {doctor.full_name}
                  </span>
                  <span className="text-[11px] text-fuchsia-500 dark:text-fuchsia-400">
                    View Profile
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-xl shadow-fuchsia-500/10 border border-fuchsia-100 dark:border-fuchsia-900/50">
              <DropdownMenuLabel className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-fuchsia-500/30">
                    <AvatarImage src={doctor.avatar_url || ''} alt={doctor.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-fuchsia-600 to-fuchsia-700 text-white font-bold">
                      {getInitials(doctor.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{doctor.full_name}</p>
                    <p className="text-xs text-fuchsia-600/70 dark:text-fuchsia-400/70">{doctor.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-fuchsia-100 dark:bg-fuchsia-900/30" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 mx-1 mb-1"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-medium">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
