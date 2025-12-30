export type BudgetPlanType = "70/15/15" | "50/30/20" | "custom"
export type Currency = "USD" | "NGN"

export interface Budget {
  id: string
  user_id: string
  month: number
  year: number
  income: number
  plan_type: BudgetPlanType
  spend_percentage: number
  investment_percentage: number
  savings_percentage: number
  spend_amount: number
  investment_amount: number
  savings_amount: number
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  user_id: string
  budget_id: string
  category: "spend" | "investment" | "savings"
  amount: number
  description: string
  date: string
  created_at: string
  updated_at: string
}

export interface IncomeEntry {
  id: string
  user_id: string
  budget_id: string
  amount: number
  description: string
  date: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  currency: Currency
  created_at: string
}
