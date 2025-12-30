import type { BudgetPlanType } from "./types"

export function calculateDistribution(
  income: number,
  planType: BudgetPlanType,
  customPercentages?: { spend: number; investment: number; savings: number },
) {
  let spend_percentage = 0
  let investment_percentage = 0
  let savings_percentage = 0

  if (planType === "70/15/15") {
    spend_percentage = 70
    investment_percentage = 15
    savings_percentage = 15
  } else if (planType === "50/30/20") {
    spend_percentage = 50
    investment_percentage = 30
    savings_percentage = 20
  } else if (planType === "custom" && customPercentages) {
    spend_percentage = customPercentages.spend
    investment_percentage = customPercentages.investment
    savings_percentage = customPercentages.savings
  }

  const spend_amount = (income * spend_percentage) / 100
  const investment_amount = (income * investment_percentage) / 100
  const savings_amount = (income * savings_percentage) / 100

  return {
    spend_percentage,
    investment_percentage,
    savings_percentage,
    spend_amount,
    investment_amount,
    savings_amount,
  }
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function formatCurrency(amount: number, currency: "USD" | "NGN" = "USD"): string {
  return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const CURRENCY_SYMBOLS = {
  USD: "$",
  NGN: "₦",
}
