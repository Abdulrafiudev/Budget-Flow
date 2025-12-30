"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, MONTHS } from "@/lib/budget-utils";
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  DollarSign,
  Calendar,
} from "lucide-react";
import type { Budget, Currency, IncomeEntry } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

interface YearTotalsCardProps {
  budgets: Budget[];
  year: number;
  currency: Currency;
}

export default function YearTotalsCard({
  budgets,
  year,
  currency,
}: YearTotalsCardProps) {
  const [startMonth, setStartMonth] = useState<number>(1);
  const [endMonth, setEndMonth] = useState<number>(12);
  const [incomeEntriesByBudget, setIncomeEntriesByBudget] = useState<
    Record<string, IncomeEntry[]>
  >({});

  useEffect(() => {
    const loadIncomeEntries = async () => {
      if (budgets.length === 0) return;

      const supabase = createClient();
      const budgetIds = budgets.map((b) => b.id);

      const { data } = await supabase
        .from("income_entries")
        .select("*")
        .in("budget_id", budgetIds);

      if (data) {
        const entriesByBudget = data.reduce((acc, entry) => {
          if (!acc[entry.budget_id]) {
            acc[entry.budget_id] = [];
          }
          acc[entry.budget_id].push(entry as IncomeEntry);
          return acc;
        }, {} as Record<string, IncomeEntry[]>);

        setIncomeEntriesByBudget(entriesByBudget);
      }
    };

    loadIncomeEntries();
  }, [budgets]);

  const filteredBudgets = budgets.filter(
    (b) => b.month >= startMonth && b.month <= endMonth
  );

  const totals = filteredBudgets.reduce(
    (acc, budget) => {
      const budgetIncomeEntries = incomeEntriesByBudget[budget.id] || [];
      const additionalIncome = budgetIncomeEntries.reduce(
        (sum, entry) => sum + Number.parseFloat(entry.amount.toString()),
        0
      );
      const totalBudgetIncome =
        Number.parseFloat(budget.income.toString()) + additionalIncome;

      return {
        income: acc.income + totalBudgetIncome,
        spend: acc.spend + Number.parseFloat(budget.spend_amount.toString()),
        investment:
          acc.investment +
          Number.parseFloat(budget.investment_amount.toString()),
        savings:
          acc.savings + Number.parseFloat(budget.savings_amount.toString()),
      };
    },
    { income: 0, spend: 0, investment: 0, savings: 0 }
  );

  const setQuickRange = (range: "all" | "q1" | "q2" | "q3" | "q4" | "ytd") => {
    const currentMonth = new Date().getMonth() + 1;
    switch (range) {
      case "all":
        setStartMonth(1);
        setEndMonth(12);
        break;
      case "q1":
        setStartMonth(1);
        setEndMonth(3);
        break;
      case "q2":
        setStartMonth(4);
        setEndMonth(6);
        break;
      case "q3":
        setStartMonth(7);
        setEndMonth(9);
        break;
      case "q4":
        setStartMonth(10);
        setEndMonth(12);
        break;
      case "ytd":
        setStartMonth(1);
        setEndMonth(currentMonth);
        break;
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold">{year} Year Totals</h2>

        <div className="flex flex-wrap items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select
            value={startMonth.toString()}
            onValueChange={(v) => setStartMonth(Number.parseInt(v))}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, idx) => (
                <SelectItem key={idx} value={(idx + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">to</span>
          <Select
            value={endMonth.toString()}
            onValueChange={(v) => setEndMonth(Number.parseInt(v))}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, idx) => (
                <SelectItem
                  key={idx}
                  value={(idx + 1).toString()}
                  disabled={idx + 1 < startMonth}
                >
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuickRange("all")}
        >
          Full Year
        </Button>
        <Button variant="outline" size="sm" onClick={() => setQuickRange("q1")}>
          Q1
        </Button>
        <Button variant="outline" size="sm" onClick={() => setQuickRange("q2")}>
          Q2
        </Button>
        <Button variant="outline" size="sm" onClick={() => setQuickRange("q3")}>
          Q3
        </Button>
        <Button variant="outline" size="sm" onClick={() => setQuickRange("q4")}>
          Q4
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuickRange("ytd")}
        >
          Year to Date
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.income, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {filteredBudgets.length}{" "}
              {filteredBudgets.length === 1 ? "month" : "months"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total to Spend
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.spend, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total to Invest
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.investment, currency)}
            </div>
            <p className="text-xs text-muted-foreground">For investments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total to Save</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.savings, currency)}
            </div>
            <p className="text-xs text-muted-foreground">In savings accounts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
