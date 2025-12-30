"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, MONTHS } from "@/lib/budget-utils"
import { TrendingDown, TrendingUp, Wallet, Receipt } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Budget, Expense, Currency } from "@/lib/types"

interface ExpensesOverviewProps {
  budgets: Budget[]
  year: number
  currency: Currency
}

interface BudgetWithExpenses extends Budget {
  expenses: Expense[]
}

export default function ExpensesOverview({ budgets, year, currency }: ExpensesOverviewProps) {
  const [budgetsWithExpenses, setBudgetsWithExpenses] = useState<BudgetWithExpenses[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAllExpenses()
  }, [budgets])

  const loadAllExpenses = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const budgetIds = budgets.map((b) => b.id)
    if (budgetIds.length === 0) {
      setBudgetsWithExpenses([])
      setIsLoading(false)
      return
    }

    const { data: expenses } = await supabase.from("expenses").select("*").in("budget_id", budgetIds)

    const budgetsWithExp: BudgetWithExpenses[] = budgets.map((budget) => ({
      ...budget,
      expenses: (expenses || []).filter((exp) => exp.budget_id === budget.id) as Expense[],
    }))

    setBudgetsWithExpenses(budgetsWithExp)
    setIsLoading(false)
  }

  const calculateTotals = () => {
    return budgetsWithExpenses.reduce(
      (acc, budget) => {
        const spent = budget.expenses.reduce(
          (expAcc, expense) => {
            expAcc[expense.category] += Number.parseFloat(expense.amount.toString())
            return expAcc
          },
          { spend: 0, investment: 0, savings: 0 },
        )

        return {
          budgeted: {
            spend: acc.budgeted.spend + Number.parseFloat(budget.spend_amount.toString()),
            investment: acc.budgeted.investment + Number.parseFloat(budget.investment_amount.toString()),
            savings: acc.budgeted.savings + Number.parseFloat(budget.savings_amount.toString()),
          },
          spent: {
            spend: acc.spent.spend + spent.spend,
            investment: acc.spent.investment + spent.investment,
            savings: acc.spent.savings + spent.savings,
          },
        }
      },
      {
        budgeted: { spend: 0, investment: 0, savings: 0 },
        spent: { spend: 0, investment: 0, savings: 0 },
      },
    )
  }

  const totals = calculateTotals()

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "spend":
        return <TrendingDown className="h-4 w-4 text-orange-500" />
      case "investment":
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case "savings":
        return <Wallet className="h-4 w-4 text-green-500" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading expenses...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (budgetsWithExpenses.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Expenses Overview - {year}
        </CardTitle>
        <CardDescription>Detailed breakdown of all expenses across months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                  Spend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totals.spent.spend, currency)}</div>
                <p className="text-xs text-muted-foreground">
                  of {formatCurrency(totals.budgeted.spend, currency)} budgeted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Investment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totals.spent.investment, currency)}</div>
                <p className="text-xs text-muted-foreground">
                  of {formatCurrency(totals.budgeted.investment, currency)} budgeted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-green-500" />
                  Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totals.spent.savings, currency)}</div>
                <p className="text-xs text-muted-foreground">
                  of {formatCurrency(totals.budgeted.savings, currency)} budgeted
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Total Expenses</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Investment</TableHead>
                  <TableHead className="text-right">Savings</TableHead>
                  <TableHead className="text-right">Expenses Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetsWithExpenses.map((budget) => {
                  const spent = budget.expenses.reduce(
                    (acc, expense) => {
                      acc[expense.category] += Number.parseFloat(expense.amount.toString())
                      return acc
                    },
                    { spend: 0, investment: 0, savings: 0 },
                  )
                  const totalSpent = spent.spend + spent.investment + spent.savings

                  return (
                    <TableRow key={budget.id}>
                      <TableCell className="font-medium">{MONTHS[budget.month - 1]}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(totalSpent, currency)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(spent.spend, currency)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(spent.investment, currency)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(spent.savings, currency)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{budget.expenses.length}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
                <TableRow className="font-semibold bg-muted/50">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totals.spent.spend + totals.spent.investment + totals.spent.savings, currency)}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.spent.spend, currency)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.spent.investment, currency)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.spent.savings, currency)}</TableCell>
                  <TableCell className="text-right">
                    <Badge>{budgetsWithExpenses.reduce((acc, b) => acc + b.expenses.length, 0)}</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
