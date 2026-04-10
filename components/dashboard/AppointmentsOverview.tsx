'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TodayAppointment {
  id: string
  start_time: string
  end_time?: string | null
  title?: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  patient?: { full_name: string } | null
}

interface AppointmentTrendPoint {
  label: string
  scheduled: number
  completed: number
}

interface AppointmentsOverviewProps {
  todays: TodayAppointment[]
  trend: AppointmentTrendPoint[]
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
}

function formatTime(time: string) {
  if (!time) return ''
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m} ${ampm}`
}

export function AppointmentsOverview({ todays, trend }: AppointmentsOverviewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Today's Schedule */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-fuchsia-600" />
              Today&apos;s Schedule
            </CardTitle>
            <CardDescription>
              {todays.length === 0
                ? 'No appointments scheduled for today'
                : `${todays.length} appointment${todays.length !== 1 ? 's' : ''} today`}
            </CardDescription>
          </div>
          <Link href="/appointments">
            <Button variant="ghost" size="sm" className="text-fuchsia-600">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {todays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                Your schedule is clear today.
              </p>
              <Link href="/appointments">
                <Button variant="outline" size="sm" className="mt-4">
                  Schedule Appointment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {todays.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-3 rounded-lg border border-fuchsia-100 bg-fuchsia-50/30 p-3 hover:bg-fuchsia-50 transition-colors"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-fuchsia-100 text-fuchsia-700">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">
                        {formatTime(apt.start_time)}
                        {apt.end_time && ` - ${formatTime(apt.end_time)}`}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${STATUS_COLORS[apt.status] || ''}`}
                      >
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <User className="h-3 w-3" />
                      <span className="truncate">
                        {apt.patient?.full_name || 'Unknown patient'}
                      </span>
                      {apt.title && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="truncate">{apt.title}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointments Trend Chart */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#888" />
              <YAxis tick={{ fontSize: 11 }} stroke="#888" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              />
              <Bar dataKey="scheduled" stackId="a" fill="#9B2D8F" radius={[0, 0, 0, 0]} />
              <Bar dataKey="completed" stackId="a" fill="#7AB942" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#9B2D8F]" />
              <span className="text-muted-foreground">Scheduled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#7AB942]" />
              <span className="text-muted-foreground">Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
