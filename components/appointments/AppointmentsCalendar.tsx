'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Phone,
  Check,
  X,
  Calendar,
  FileText,
  Bell,
  BellRing,
} from 'lucide-react'
import type { Appointment, Patient } from '@/types'

interface AppointmentsCalendarProps {
  appointments: Appointment[]
  patients: Pick<Patient, 'id' | 'full_name' | 'phone'>[]
  doctorId: string
}

const statusColors = {
  scheduled: 'bg-blue-500 border-blue-600 text-white',
  completed: 'bg-green-500 border-green-600 text-white',
  cancelled: 'bg-gray-400 border-gray-500 text-white line-through opacity-60',
}

const statusBadgeColors = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function AppointmentsCalendar({
  appointments,
  patients,
  doctorId,
}: AppointmentsCalendarProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  // Form state
  const [patientId, setPatientId] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('09:30')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const selectedDateStr = selectedDate.toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]
  const isSelectedDatePast = selectedDate < today
  const isSelectedDateToday = selectedDateStr === todayStr

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  // Set up notification checker
  useEffect(() => {
    if (!notificationsEnabled) return

    const checkUpcomingAppointments = () => {
      const now = new Date()
      const todayStr = now.toISOString().split('T')[0]

      appointments.forEach((apt) => {
        if (apt.appointment_date !== todayStr || apt.status !== 'scheduled') return

        const [hours, minutes] = apt.start_time.split(':').map(Number)
        const aptTime = new Date()
        aptTime.setHours(hours, minutes, 0, 0)

        const diffMinutes = Math.floor((aptTime.getTime() - now.getTime()) / 60000)

        // Notify at 15 minutes and 5 minutes before
        if (diffMinutes === 15 || diffMinutes === 5) {
          showNotification(apt, diffMinutes)
        }
      })
    }

    // Check every minute
    const interval = setInterval(checkUpcomingAppointments, 60000)
    // Also check immediately
    checkUpcomingAppointments()

    return () => clearInterval(interval)
  }, [appointments, notificationsEnabled])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications')
      return
    }

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    setNotificationsEnabled(permission === 'granted')

    if (permission === 'granted') {
      new Notification('Notifications Enabled', {
        body: 'You will receive appointment reminders',
        icon: '/icon.png',
      })
    }
  }

  const showNotification = (apt: Appointment, minutesBefore: number) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const notification = new Notification(`Appointment in ${minutesBefore} minutes`, {
      body: `${apt.patient?.full_name} - ${formatTime(apt.start_time)}${apt.title ? ` (${apt.title})` : ''}`,
      icon: '/icon.png',
      tag: apt.id, // Prevent duplicate notifications
      requireInteraction: true,
    })

    notification.onclick = () => {
      window.focus()
      setSelectedAppointment(apt)
      setShowDetailDialog(true)
    }
  }

  // Filter appointments for selected date
  const dayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.appointment_date === selectedDateStr)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [appointments, selectedDateStr])

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${minutes} ${ampm}`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const prevDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const nextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const openAddDialog = () => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    setAppointmentDate(dateStr)
    setShowAddDialog(true)
  }

  const openDetailDialog = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setShowDetailDialog(true)
  }

  const resetForm = () => {
    setPatientId('')
    setAppointmentDate('')
    setStartTime('09:00')
    setEndTime('09:30')
    setTitle('')
    setNotes('')
    setShowAddDialog(false)
  }

  const handleAddAppointment = async () => {
    if (!patientId || !appointmentDate || !startTime) return

    // Validate not in past
    const aptDate = new Date(appointmentDate)
    aptDate.setHours(0, 0, 0, 0)
    if (aptDate < today) {
      alert('Cannot schedule appointments in the past')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('appointments').insert({
        doctor_id: doctorId,
        patient_id: patientId,
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: endTime || null,
        title: title || null,
        notes: notes || null,
        status: 'scheduled',
      })

      if (error) throw error

      resetForm()
      window.location.reload()
    } catch (err) {
      console.error('Failed to add appointment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: 'completed' | 'cancelled') => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      setShowDetailDialog(false)
      setSelectedAppointment(null)
      window.location.reload()
    } catch (err) {
      console.error('Failed to update appointment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('appointments').delete().eq('id', id)

      if (error) throw error

      setShowDetailDialog(false)
      setSelectedAppointment(null)
      window.location.reload()
    } catch (err) {
      console.error('Failed to delete appointment:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get upcoming appointments (next 7 days)
  const upcomingAppointments = appointments
    .filter((a) => {
      const date = new Date(a.appointment_date)
      date.setHours(0, 0, 0, 0)
      const weekLater = new Date(today)
      weekLater.setDate(weekLater.getDate() + 7)
      return date >= today && date <= weekLater && a.status === 'scheduled'
    })
    .sort((a, b) => {
      const dateCompare = a.appointment_date.localeCompare(b.appointment_date)
      if (dateCompare !== 0) return dateCompare
      return a.start_time.localeCompare(b.start_time)
    })
    .slice(0, 8)

  const minDate = todayStr

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Day View */}
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
          <CardTitle className="text-lg">
            {formatDate(selectedDate)}
            {isSelectedDateToday && (
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                Today
              </span>
            )}
            {isSelectedDatePast && (
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                Past
              </span>
            )}
          </CardTitle>
          <Button onClick={openAddDialog} disabled={isSelectedDatePast}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {dayAppointments.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground">No appointments for this day</p>
              {!isSelectedDatePast && (
                <Button variant="outline" className="mt-4" onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule an Appointment
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {dayAppointments.map((apt) => {
                const isPast = isSelectedDatePast || (isSelectedDateToday && (() => {
                  const [h, m] = apt.start_time.split(':').map(Number)
                  const aptTime = new Date()
                  aptTime.setHours(h, m, 0, 0)
                  return aptTime < new Date()
                })())

                return (
                  <div
                    key={apt.id}
                    onClick={() => openDetailDialog(apt)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-l-4 cursor-pointer transition-all hover:shadow-md ${
                      apt.status === 'cancelled'
                        ? 'bg-gray-50 border-gray-300 dark:bg-gray-900/50'
                        : apt.status === 'completed'
                        ? 'bg-green-50 border-green-500 dark:bg-green-950/30'
                        : isPast
                        ? 'bg-gray-50 border-gray-300 dark:bg-gray-900/50'
                        : 'bg-blue-50 border-blue-500 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50'
                    }`}
                  >
                    {/* Time */}
                    <div className="text-center min-w-[80px]">
                      <p className={`text-lg font-bold ${isPast && apt.status === 'scheduled' ? 'text-gray-400' : ''}`}>
                        {formatTime(apt.start_time)}
                      </p>
                      {apt.end_time && (
                        <p className="text-xs text-muted-foreground">
                          to {formatTime(apt.end_time)}
                        </p>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-12 w-px bg-border" />

                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-lg ${apt.status === 'cancelled' ? 'line-through text-gray-500' : ''}`}>
                          {apt.patient?.full_name}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadgeColors[apt.status]}`}>
                          {apt.status}
                        </span>
                      </div>
                      {apt.title && (
                        <p className="text-sm text-muted-foreground">{apt.title}</p>
                      )}
                      {apt.patient?.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {apt.patient.phone}
                        </p>
                      )}
                    </div>

                    {/* Quick Actions */}
                    {apt.status === 'scheduled' && !isPast && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:bg-green-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(apt.id, 'completed')
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(apt.id, 'cancelled')
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notificationsEnabled ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <BellRing className="h-4 w-4 animate-pulse" />
                  <span>Notifications active</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  You'll get alerts at 15, 10, 5, and 0 minutes before appointments
                </p>
              </div>
            ) : notificationPermission === 'denied' ? (
              <div className="space-y-2">
                <p className="text-sm text-red-600">Notifications blocked</p>
                <p className="text-xs text-muted-foreground">
                  Please enable notifications in your browser settings
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={requestNotificationPermission}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Enable Notifications
                </Button>
                <p className="text-xs text-muted-foreground">
                  Get desktop alerts before appointments
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Date Picker */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Jump to Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={selectedDateStr}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(new Date(e.target.value + 'T00:00:00'))
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <p className="text-2xl font-bold text-blue-600">
                  {dayAppointments.filter((a) => a.status === 'scheduled').length}
                </p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                <p className="text-2xl font-bold text-green-600">
                  {dayAppointments.filter((a) => a.status === 'completed').length}
                </p>
                <p className="text-xs text-muted-foreground">Done</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-2xl font-bold text-gray-600">
                  {dayAppointments.filter((a) => a.status === 'cancelled').length}
                </p>
                <p className="text-xs text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming appointments
              </p>
            ) : (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => {
                    setSelectedDate(new Date(apt.appointment_date + 'T00:00:00'))
                    openDetailDialog(apt)
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {apt.patient?.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(apt.appointment_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      })}{' '}
                      at {formatTime(apt.start_time)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Appointment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name} {p.phone && `(${p.phone})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={appointmentDate}
                  min={minDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Checkup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={handleAddAppointment}
                disabled={loading || !patientId || !appointmentDate || !startTime}
              >
                {loading ? 'Scheduling...' : 'Schedule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appointment Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedAppointment.patient?.full_name}
                  </h3>
                  {selectedAppointment.patient?.phone && (
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {selectedAppointment.patient.phone}
                    </p>
                  )}
                </div>
                <span
                  className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                    statusBadgeColors[selectedAppointment.status]
                  }`}
                >
                  {selectedAppointment.status.charAt(0).toUpperCase() +
                    selectedAppointment.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedAppointment.appointment_date).toLocaleDateString(
                      'en-IN',
                      {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(selectedAppointment.start_time)}
                    {selectedAppointment.end_time &&
                      ` - ${formatTime(selectedAppointment.end_time)}`}
                  </p>
                </div>
              </div>

              {selectedAppointment.title && (
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{selectedAppointment.title}</p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Notes
                  </p>
                  <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              {selectedAppointment.status === 'scheduled' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() =>
                      handleStatusChange(selectedAppointment.id, 'completed')
                    }
                    disabled={loading}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() =>
                      handleStatusChange(selectedAppointment.id, 'cancelled')
                    }
                    disabled={loading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(selectedAppointment.id)}
                  disabled={loading}
                >
                  Delete Appointment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
