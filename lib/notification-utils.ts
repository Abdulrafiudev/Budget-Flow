// Utility functions for push notifications

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export async function scheduleNotification(
  budgetId: string,
  incomeEntryId: string,
  amount: number,
  currency: "USD" | "NGN",
  distribution: {
    spend_amount: number;
    investment_amount: number;
    savings_amount: number;
  }
) {
  // Request permission if not already granted
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log("Notification permission not granted");
    return;
  }

  // Register service worker if not already registered
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Schedule notification for 24 hours from now
      const scheduledTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      // Store notification data in service worker
      if (registration.active) {
        registration.active.postMessage({
          type: "SCHEDULE_NOTIFICATION",
          data: {
            budgetId,
            incomeEntryId,
            scheduledTime,
            amount,
            currency,
            distribution,
          },
        });
      }

      console.log("[v0] Notification scheduled for 24 hours from now");
    } catch (error) {
      console.error("Failed to schedule notification:", error);
    }
  }
}

export async function scheduleTestNotification(
  budgetId: string,
  incomeEntryId: string,
  amount: number,
  currency: "USD" | "NGN",
  distribution: {
    spend_amount: number;
    investment_amount: number;
    savings_amount: number;
  },
  delaySeconds = 30 // Default 30 seconds for testing
) {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log("Notification permission not granted");
    return;
  }

  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Schedule notification for specified seconds from now (default 30s for testing)
      const scheduledTime = Date.now() + delaySeconds * 1000;

      if (registration.active) {
        registration.active.postMessage({
          type: "SCHEDULE_NOTIFICATION",
          data: {
            budgetId,
            incomeEntryId,
            scheduledTime,
            amount,
            currency,
            distribution,
          },
        });
      }

      console.log(
        `[v0] Test notification scheduled for ${delaySeconds} seconds from now`
      );
    } catch (error) {
      console.error("Failed to schedule notification:", error);
    }
  }
}

export function showImmediateNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): void {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icon-192x192.jpg",
      badge: "/icon-192x192.jpg",
      data,
    });
  }
}
