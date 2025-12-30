"use client"

import ExpensesOverview from "./expenses-overview"
import type { Budget, Currency } from "@/lib/types"

interface ExpensesClientProps {
  budgets: Budget[]
  year: number
  currency: Currency
}

export default function ExpensesClient({ budgets, year, currency }: ExpensesClientProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Expense Tracking</h1>
        <p className="text-muted-foreground">Monitor your spending across all categories for {year}</p>
      </div>

      {budgets.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <h3 className="text-lg font-semibold mb-2">No budgets to track</h3>
          <p className="text-muted-foreground mb-4">Create a budget first to start tracking expenses</p>
          <a
            href="/budgets"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go to Budgets
          </a>
        </div>
      ) : (
        <ExpensesOverview budgets={budgets} year={year} currency={currency} />
      )}
    </div>
  )
}
