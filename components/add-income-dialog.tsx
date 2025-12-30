"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import IncomeCelebrationModal from "@/components/income-celebration-modal";
import {
  scheduleNotification,
  scheduleTestNotification,
} from "@/lib/notification-utils";
import { calculateDistribution } from "@/lib/budget-utils";
import type { Budget, IncomeEntry } from "@/lib/types";
import { toast } from "sonner";

interface AddIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIncomeAdded: (income: IncomeEntry) => void;
  budget: Budget;
  currency: "USD" | "NGN";
}

export default function AddIncomeDialog({
  open,
  onOpenChange,
  onIncomeAdded,
  budget,
  currency,
}: AddIncomeDialogProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    amount: number;
    distribution: ReturnType<typeof calculateDistribution>;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const incomeAmount = Number.parseFloat(amount);
    if (isNaN(incomeAmount) || incomeAmount <= 0) {
      setError("Please enter a valid amount");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { data, error: insertError } = await supabase
        .from("income_entries")
        .insert({
          user_id: budget.user_id,
          budget_id: budget.id,
          amount: incomeAmount,
          description: description || null,
          date,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { data: allIncomeEntries } = await supabase
        .from("income_entries")
        .select("amount")
        .eq("budget_id", budget.id);

      const totalIncomeFromEntries =
        allIncomeEntries?.reduce(
          (sum, entry) => sum + Number.parseFloat(entry.amount.toString()),
          0
        ) || 0;
      const newTotalIncome =
        Number.parseFloat(budget.income.toString()) + totalIncomeFromEntries;

      const distribution = calculateDistribution(
        newTotalIncome,
        budget.plan_type,
        {
          spend: budget.spend_percentage,
          investment: budget.investment_percentage,
          savings: budget.savings_percentage,
        }
      );

      const { error: updateError } = await supabase
        .from("budgets")
        .update({
          spend_amount: distribution.spend_amount,
          investment_amount: distribution.investment_amount,
          savings_amount: distribution.savings_amount,
        })
        .eq("id", budget.id);

      if (updateError) throw updateError;

      if (data) {
        const incomeDistribution = calculateDistribution(
          incomeAmount,
          budget.plan_type,
          {
            spend: budget.spend_percentage,
            investment: budget.investment_percentage,
            savings: budget.savings_percentage,
          }
        );

        await scheduleTestNotification(
          budget.id,
          data.id,
          incomeAmount,
          currency,
          incomeDistribution
        );

        onIncomeAdded(data as IncomeEntry);

        toast.success("Income added successfully!", {
          description: `${new Intl.NumberFormat(
            currency === "NGN" ? "en-NG" : "en-US",
            {
              style: "currency",
              currency: currency,
            }
          ).format(incomeAmount)} added to your budget.`,
        });

        setCelebrationData({
          amount: incomeAmount,
          distribution: incomeDistribution,
        });
        setShowCelebration(true);

        setAmount("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
        onOpenChange(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add income");
      toast.error("Failed to add income", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Income</DialogTitle>
            <DialogDescription>
              Add additional income to this month's budget
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount ({currency === "NGN" ? "₦" : "$"})
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Bonus, freelance work, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Adding..." : "Add Income"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {celebrationData && (
        <IncomeCelebrationModal
          open={showCelebration}
          onOpenChange={setShowCelebration}
          amount={celebrationData.amount}
          currency={currency}
          distribution={celebrationData.distribution}
        />
      )}
    </>
  );
}
