const CACHE_NAME = "budgetflow-v1"
const urlsToCache = ["/", "/dashboard", "/budgets", "/expenses", "/auth/login", "/auth/sign-up"]

const scheduledNotifications = new Map()

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    }),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || "Budget Reminder"
  const options = {
    body: data.body || "Time to distribute your income!",
    icon: "/icon-192x192.jpg",
    badge: "/icon-192x192.jpg",
    data: data.data || {},
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow("/budgets"))
})

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_NOTIFICATION") {
    const { data } = event.data
    const { budgetId, incomeEntryId, scheduledTime, amount, currency, distribution } = data

    // Calculate delay
    const delay = scheduledTime - Date.now()

    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        self.registration.showNotification("Time to Distribute Your Income! 💰", {
          body: `You received ${currency === "NGN" ? "₦" : "$"}${amount.toFixed(2)}. Remember to distribute it:\n• Spend: ${currency === "NGN" ? "₦" : "$"}${distribution.spend_amount.toFixed(2)}\n• Investment: ${currency === "NGN" ? "₦" : "$"}${distribution.investment_amount.toFixed(2)}\n• Savings: ${currency === "NGN" ? "₦" : "$"}${distribution.savings_amount.toFixed(2)}`,
          icon: "/icon-192x192.jpg",
          badge: "/icon-192x192.jpg",
          data: { budgetId, incomeEntryId },
        })

        // Remove from scheduled map
        scheduledNotifications.delete(incomeEntryId)
      }, delay)

      // Store the timeout ID
      scheduledNotifications.set(incomeEntryId, timeoutId)
    }
  }
})
