// Service Worker for MediCore - Push Notifications

const CACHE_NAME = 'medicore-v1'

// Install
self.addEventListener('install', () => {
  console.log('Service Worker installed')
  self.skipWaiting()
})

// Activate
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated')
  event.waitUntil(clients.claim())
})

// Handle Push Notifications (works when browser is closed!)
self.addEventListener('push', (event) => {
  console.log('Push received:', event)

  let data = { title: 'Appointment Reminder', body: 'You have an upcoming appointment' }

  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: data.tag || 'appointment-reminder',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/appointments',
      appointmentId: data.appointmentId
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const urlToOpen = event.notification.data?.url || '/appointments'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus()
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Listen for messages from app
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
