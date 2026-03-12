// Supabase Edge Function to send appointment reminders
// Deploy: supabase functions deploy send-reminders
// Schedule with cron: every minute

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || ''
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || ''
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@medicore.app'

interface PushSubscription {
  doctor_id: string
  endpoint: string
  p256dh: string
  auth: string
}

interface Appointment {
  id: string
  doctor_id: string
  start_time: string
  title?: string
  patient: { full_name: string } | null
}

// Send web push notification
async function sendPushNotification(
  subscription: PushSubscription,
  payload: object
) {
  try {
    // Import web-push compatible library for Deno
    const webpush = await import('https://esm.sh/web-push@3.6.6')

    webpush.setVapidDetails(
      VAPID_SUBJECT,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    )

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    )

    console.log('Push sent to:', subscription.endpoint.slice(0, 50))
    return true
  } catch (error) {
    console.error('Push failed:', error)
    return false
  }
}

function formatTime(time: string): string {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${m} ${ampm}`
}

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Get today's scheduled appointments
    const { data: appointments, error: aptError } = await supabase
      .from('appointments')
      .select('id, doctor_id, start_time, title, patient:patients(full_name)')
      .eq('appointment_date', todayStr)
      .eq('status', 'scheduled')

    if (aptError) {
      console.error('Error fetching appointments:', aptError)
      return new Response(JSON.stringify({ error: aptError.message }), { status: 500 })
    }

    let notificationsSent = 0

    for (const apt of appointments as Appointment[]) {
      const [aptHour, aptMinute] = apt.start_time.split(':').map(Number)
      const aptTime = new Date()
      aptTime.setHours(aptHour, aptMinute, 0, 0)

      const diffMinutes = Math.floor((aptTime.getTime() - now.getTime()) / 60000)

      // Send notifications at 15, 10, 5, 0 minutes before
      if (![15, 10, 5, 0].includes(diffMinutes)) continue

      // Get push subscriptions for this doctor
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('doctor_id', apt.doctor_id)

      if (!subscriptions?.length) continue

      const title = diffMinutes === 0
        ? '🔔 Appointment Now!'
        : `⏰ Appointment in ${diffMinutes} minutes`

      const body = `${apt.patient?.full_name || 'Patient'} - ${formatTime(apt.start_time)}${apt.title ? ` (${apt.title})` : ''}`

      const payload = {
        title,
        body,
        tag: `apt-${apt.id}-${diffMinutes}`,
        appointmentId: apt.id,
        url: '/appointments',
      }

      for (const sub of subscriptions) {
        const success = await sendPushNotification(sub, payload)
        if (success) notificationsSent++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notificationsSent,
        checkedAt: now.toISOString(),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500 }
    )
  }
})
