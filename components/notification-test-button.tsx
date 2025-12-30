"use client";

import { Button } from "@/components/ui/button";
import {
  requestNotificationPermission,
  showImmediateNotification,
} from "@/lib/notification-utils";
import { Bell } from "lucide-react";

export default function NotificationTestButton() {
  const handleTestNotification = async () => {
    const hasPermission = await requestNotificationPermission();

    if (hasPermission) {
      showImmediateNotification(
        "Time to Distribute Your Income! 💰",
        "You received $1,000.00. Remember to distribute it:\n• Spend: $700.00\n• Investment: $150.00\n• Savings: $150.00"
      );
    } else {
      alert("Please grant notification permission to test");
    }
  };

  return (
    <Button
      onClick={handleTestNotification}
      variant="outline"
      size="sm"
      className="gap-2 bg-transparent"
    >
      <Bell className="h-4 w-4" />
      Test Notification
    </Button>
  );
}
