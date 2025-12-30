"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, LogOut, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Budget, Profile } from "@/lib/types"
import type { User } from "@supabase/supabase-js"
import { MONTHS } from "@/lib/budget-utils"
import MonthlyBudgetCard from "./monthly-budget-card"
import CreateBudgetDialog from "./create-budget-dialog"
import YearTotalsCard from "./year-totals-card"
import ExpensesOverview from "./expenses-overview"
import CurrencySelector from "./currency-selector"

interface DashboardClientProps {
  user: User
  initialBudgets: Budget[]
  profile: Profile | null
  currentYear: number
}

export default function DashboardClient({ user, initialBudgets, profile, currentYear }: DashboardClientProps) {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleBudgetCreated = (newBudget: Budget) => {
    setBudgets((prev) => [...prev, newBudget].sort((a, b) => a.month - b.month))
    setIsCreateDialogOpen(false)
  }

  const handleBudgetUpdated = (updatedBudget: Budget) => {
    setBudgets((prev) => prev.map((b) => (b.id === updatedBudget.id ? updatedBudget : b)))
  }

  const existingMonths = budgets.map((b) => b.month)
  const availableMonths = Array.from({ length: 12 }, (_, i) => i + 1).filter((m) => !existingMonths.includes(m))

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">BudgetFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{profile?.full_name || user.email}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-muted-foreground">Manage your budget for {currentYear}</p>
        </div>

        {/* Currency Selector */}
        <div className="mb-6">
          <CurrencySelector currentCurrency={profile?.currency || "USD"} userId={user.id} />
        </div>

        {/* Year Totals */}
        <YearTotalsCard budgets={budgets} year={currentYear} currency={profile?.currency || "USD"} />

        {/* Expenses Overview */}
        {budgets.length > 0 && (
          <div className="mb-6">
            <ExpensesOverview budgets={budgets} year={currentYear} currency={profile?.currency || "USD"} />
          </div>
        )}

        {/* Create Budget Button */}
        {availableMonths.length > 0 && (
          <div className="mb-6">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget for New Month
            </Button>
          </div>
        )}

        {/* Month Filter */}
        {budgets.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              variant={selectedMonth === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMonth(null)}
            >
              All Months
            </Button>
            {budgets.map((budget) => (
              <Button
                key={budget.id}
                variant={selectedMonth === budget.month ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMonth(budget.month)}
              >
                {MONTHS[budget.month - 1]}
              </Button>
            ))}
          </div>
        )}

        {/* Monthly Budgets Grid */}
        {budgets.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Budgets Yet</CardTitle>
              <CardDescription>Create your first budget to start tracking your finances.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {budgets
              .filter((b) => selectedMonth === null || b.month === selectedMonth)
              .map((budget) => (
                <MonthlyBudgetCard
                  key={budget.id}
                  budget={budget}
                  onUpdate={handleBudgetUpdated}
                  currency={profile?.currency || "USD"}
                />
              ))}
          </div>
        )}
      </main>

      {/* Create Budget Dialog */}
      <CreateBudgetDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onBudgetCreated={handleBudgetCreated}
        availableMonths={availableMonths}
        userId={user.id}
        year={currentYear}
      />
    </div>
  )
}
