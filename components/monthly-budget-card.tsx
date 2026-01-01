"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MONTHS, formatCurrency } from "@/lib/budget-utils";
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  Plus,
  DollarSign,
  Trash2,
} from "lucide-react";
import type { Budget, Expense, Currency, IncomeEntry } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import AddExpenseDialog from "./add-expense-dialog";
import AddIncomeDialog from "./add-income-dialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MonthlyBudgetCardProps {
  budget: Budget;
  onUpdate: (budget: Budget) => void;
  currency: Currency;
}

export default function MonthlyBudgetCard({
  budget,
  onUpdate,
  currency,
}: MonthlyBudgetCardProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadExpenses();
    loadIncomeEntries();
  }, [budget.id]);

  const loadExpenses = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("budget_id", budget.id)
      .order("date", { ascending: false });

    if (data) {
      setExpenses(data as Expense[]);
    }
  };

  const loadIncomeEntries = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("income_entries")
      .select("*")
      .eq("budget_id", budget.id)
      .order("date", { ascending: false });

    if (data) {
      setIncomeEntries(data as IncomeEntry[]);
    }
  };

  const handleExpenseAdded = (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev]);
    setIsAddExpenseOpen(false);
  };

  const handleIncomeAdded = (newIncome: IncomeEntry) => {
    setIncomeEntries((prev) => [newIncome, ...prev]);
    refreshBudget();
    setIsAddIncomeOpen(false);
  };

  const refreshBudget = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("budgets")
      .select("*")
      .eq("id", budget.id)
      .single();

    if (data) {
      onUpdate(data as Budget);
    }
  };

  const handleDeleteBudget = async () => {
    setIsDeleting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", budget.id);

      if (error) throw error;

      toast.success("Budget deleted successfully");
      // Refresh the page or trigger a parent update
      window.location.reload();
    } catch (error: any) {
      console.error("[v0] Error deleting budget:", error);
      toast.error(error.message || "Failed to delete budget");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const totalIncome =
    budget.income +
    incomeEntries.reduce(
      (sum, entry) => sum + Number.parseFloat(entry.amount.toString()),
      0
    );

  const spentByCategory = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] += Number.parseFloat(expense.amount.toString());
      return acc;
    },
    { spend: 0, investment: 0, savings: 0 }
  );

  const remainingByCategory = {
    spend: budget.spend_amount - spentByCategory.spend,
    investment: budget.investment_amount - spentByCategory.investment,
    savings: budget.savings_amount - spentByCategory.savings,
  };

  const getCategoryProgress = (
    category: "spend" | "investment" | "savings"
  ) => {
    const budgeted = budget[`${category}_amount`];
    const spent = spentByCategory[category];
    return budgeted > 0 ? (spent / budgeted) * 100 : 0;
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>
                {MONTHS[budget.month - 1]} {budget.year}
              </CardTitle>
              <CardDescription>
                Income: {formatCurrency(totalIncome, currency)}
                {incomeEntries.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({incomeEntries.length}{" "}
                    {incomeEntries.length === 1 ? "entry" : "entries"})
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{budget.plan_type}</Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Spend Category */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Spend</span>
              </div>
              <span className="text-muted-foreground">
                {formatCurrency(spentByCategory.spend, currency)} /{" "}
                {formatCurrency(budget.spend_amount, currency)}
              </span>
            </div>
            <Progress value={getCategoryProgress("spend")} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Remaining: {formatCurrency(remainingByCategory.spend, currency)}
            </p>
          </div>

          {/* Investment Category */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Investment</span>
              </div>
              <span className="text-muted-foreground">
                {formatCurrency(spentByCategory.investment, currency)} /{" "}
                {formatCurrency(budget.investment_amount, currency)}
              </span>
            </div>
            <Progress
              value={getCategoryProgress("investment")}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              Remaining:{" "}
              {formatCurrency(remainingByCategory.investment, currency)}
            </p>
          </div>

          {/* Savings Category */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-green-500" />
                <span className="font-medium">Savings</span>
              </div>
              <span className="text-muted-foreground">
                {formatCurrency(spentByCategory.savings, currency)} /{" "}
                {formatCurrency(budget.savings_amount, currency)}
              </span>
            </div>
            <Progress value={getCategoryProgress("savings")} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Remaining: {formatCurrency(remainingByCategory.savings, currency)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setIsAddIncomeOpen(true)}
              variant="outline"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Add Income
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setIsAddExpenseOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Expense
            </Button>
            {expenses.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Hide" : "View"} ({expenses.length})
              </Button>
            )}
          </div>

          {/* Expense List */}
          {isExpanded && expenses.length > 0 && (
            <div className="mt-4 space-y-2 border-t pt-4">
              <h4 className="text-sm font-semibold">Recent Expenses</h4>
              {expenses.slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  className="flex justify-between items-center text-sm py-1"
                >
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {expense.category} •{" "}
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(
                      Number.parseFloat(expense.amount.toString()),
                      currency
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddExpenseDialog
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        onExpenseAdded={handleExpenseAdded}
        budget={budget}
      />

      <AddIncomeDialog
        open={isAddIncomeOpen}
        onOpenChange={setIsAddIncomeOpen}
        onIncomeAdded={handleIncomeAdded}
        budget={budget}
        currency={currency}
      />

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the budget for{" "}
              {MONTHS[budget.month - 1]} {budget.year} and all associated
              expenses and income entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteBudget();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Budget"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
