"use client"

import type { ReactNode } from "react"
import AppNav from "./app-nav"
import PWAInstallPrompt from "./pwa-install-prompt"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

interface AppLayoutProps {
  children: ReactNode
  user: User
  profile: Profile | null
}

export default function AppLayout({ children, user, profile }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <AppNav userEmail={user.email!} userName={profile?.full_name} />

      {/* Desktop: offset for sidebar */}
      <div className="md:ml-64">
        {/* Mobile: header with padding for bottom nav */}
        <header className="md:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">BudgetFlow</span>
            </div>
          </div>
        </header>

        {/* Main content with bottom padding for mobile nav */}
        <main className="pb-20 md:pb-8">{children}</main>
      </div>

      <PWAInstallPrompt />
    </div>
  )
}

function Wallet({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  )
}
