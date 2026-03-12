'use client'

import { useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NotificationProviderProps {
  doctorId: string
  children: React.ReactNode
}

// VAPID public key - generate with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function NotificationProvider({ doctorId, children }: NotificationProviderProps) {
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const notifiedRef = useRef<Set<string>>(new Set())

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready

      // Check existing subscription
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription && VAPID_PUBLIC_KEY) {
        // Subscribe to push
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
      }

      if (subscription) {
        // Save subscription to Supabase
        const supabase = createClient()
        const subscriptionJson = subscription.toJSON()

        await supabase.from('push_subscriptions').upsert({
          doctor_id: doctorId,
          endpoint: subscription.endpoint,
          p256dh: subscriptionJson.keys?.p256dh || '',
          auth: subscriptionJson.keys?.auth || '',
        }, {
          onConflict: 'endpoint'
        })

        console.log('Push subscription saved')
      }
    } catch (error) {
      console.error('Failed to subscribe to push:', error)
    }
  }, [doctorId])

  // Check appointments and show local notifications (when app is open)
  const checkAppointments = useCallback(async () => {
    if (typeof window === 'undefined' || Notification.permission !== 'granted') return

    const supabase = createClient()
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    try {
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*, patient:patients(full_name, phone)')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', todayStr)
        .eq('status', 'scheduled')

      if (!appointments) return

      appointments.forEach((apt) => {
        const [hours, minutes] = apt.start_time.split(':').map(Number)
        const aptTime = new Date()
        aptTime.setHours(hours, minutes, 0, 0)

        const diffMinutes = Math.floor((aptTime.getTime() - now.getTime()) / 60000)
        const notificationKey = `${apt.id}-${diffMinutes}`

        // Notify at specific intervals
        if ([15, 10, 5, 0].includes(diffMinutes) && !notifiedRef.current.has(notificationKey)) {
          notifiedRef.current.add(notificationKey)
          showLocalNotification(apt, diffMinutes)
        }
      })
    } catch (error) {
      console.error('Error checking appointments:', error)
    }
  }, [doctorId])

  const showLocalNotification = (apt: any, minutesBefore: number) => {
    const formatTime = (time: string) => {
      const [h, m] = time.split(':')
      const hour = parseInt(h)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      return `${hour % 12 || 12}:${m} ${ampm}`
    }

    const title = minutesBefore === 0
      ? '🔔 Appointment Now!'
      : `⏰ Appointment in ${minutesBefore} minutes`

    const body = `${apt.patient?.full_name || 'Patient'} - ${formatTime(apt.start_time)}${apt.title ? ` (${apt.title})` : ''}`

    // Use service worker notification
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/icon.svg',
          tag: `apt-${apt.id}-${minutesBefore}`,
          requireInteraction: true,
          data: { appointmentId: apt.id, url: '/appointments' }
        })
      })
    } else {
      // Fallback
      new Notification(title, { body, icon: '/icon.svg' })
    }
  }

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('Service Worker registered')

        // Subscribe to push when permission is granted
        if (Notification.permission === 'granted') {
          subscribeToPush()
        }
      }).catch((err) => {
        console.error('Service Worker registration failed:', err)
      })
    }

    // Check appointments every 60 seconds (when app is open) - reduced for performance
    checkAppointments()
    checkIntervalRef.current = setInterval(checkAppointments, 60000)

    // Clear old notification keys every hour
    const clearOldKeys = setInterval(() => {
      notifiedRef.current.clear()
    }, 3600000)

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
      clearInterval(clearOldKeys)
    }
  }, [doctorId, checkAppointments, subscribeToPush])

  return <>{children}</>
}

// Export function to request permission and subscribe
export async function requestPushPermission(doctorId: string) {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported')
  }

  const permission = await Notification.requestPermission()

  if (permission === 'granted') {
    // Trigger subscription
    if ('serviceWorker' in navigator && 'PushManager' in window && VAPID_PUBLIC_KEY) {
      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
      }

      if (subscription) {
        const supabase = createClient()
        const subscriptionJson = subscription.toJSON()

        await supabase.from('push_subscriptions').upsert({
          doctor_id: doctorId,
          endpoint: subscription.endpoint,
          p256dh: subscriptionJson.keys?.p256dh || '',
          auth: subscriptionJson.keys?.auth || '',
        }, {
          onConflict: 'endpoint'
        })
      }
    }
  }

  return permission
}
