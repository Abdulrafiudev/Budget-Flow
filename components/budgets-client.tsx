"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import NotificationTestButton from "./notification-test-button";
import type { Budget, Profile } from "@/lib/types";
import type { User } from "@supabase/supabase-js";
import { MONTHS } from "@/lib/budget-utils";
import MonthlyBudgetCard from "./monthly-budget-card";
import CreateBudgetDialog from "./create-budget-dialog";

interface BudgetsClientProps {
  user: User;
  initialBudgets: Budget[];
  profile: Profile | null;
  currentYear: number;
}

export default function BudgetsClient({
  user,
  initialBudgets,
  profile,
  currentYear,
}: BudgetsClientProps) {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleBudgetCreated = (newBudget: Budget) => {
    setBudgets((prev) =>
      [...prev, newBudget].sort((a, b) => a.month - b.month)
    );
    setIsCreateDialogOpen(false);
  };

  const handleBudgetUpdated = (updatedBudget: Budget) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === updatedBudget.id ? updatedBudget : b))
    );
  };

  const existingMonths = budgets.map((b) => b.month);
  const availableMonths = Array.from({ length: 12 }, (_, i) => i + 1).filter(
    (m) => !existingMonths.includes(m)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Monthly Budgets
            </h1>
            <p className="text-muted-foreground">
              Manage your income distribution for {currentYear}
            </p>
          </div>
          <NotificationTestButton />
        </div>
      </div>

      {availableMonths.length > 0 && (
        <div className="mb-6">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Budget for New Month
          </Button>
        </div>
      )}

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

      {budgets.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Budgets Yet</CardTitle>
            <CardDescription>
              Create your first budget to start tracking your finances.
            </CardDescription>
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

      <CreateBudgetDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onBudgetCreated={handleBudgetCreated}
        availableMonths={availableMonths}
        userId={user.id}
        year={currentYear}
      />
    </div>
  );
}
