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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { MONTHS, calculateDistribution } from "@/lib/budget-utils";
import type { Budget, BudgetPlanType } from "@/lib/types";
import { toast } from "sonner";
import IncomeCelebrationModal from "./income-celebration-modal";
import {
  requestNotificationPermission,
  scheduleNotification,
  scheduleTestNotification,
} from "@/lib/notification-utils";

interface CreateBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBudgetCreated: (budget: Budget) => void;
  availableMonths: number[];
  userId: string;
  year: number;
  currency: "USD" | "NGN";
}

export default function CreateBudgetDialog({
  open,
  onOpenChange,
  onBudgetCreated,
  availableMonths,
  userId,
  year,
  currency,
}: CreateBudgetDialogProps) {
  const [month, setMonth] = useState<number>(availableMonths[0] || 1);
  const [income, setIncome] = useState("");
  const [planType, setPlanType] = useState<BudgetPlanType>("50/30/20");
  const [customSpend, setCustomSpend] = useState("");
  const [customInvestment, setCustomInvestment] = useState("");
  const [customSavings, setCustomSavings] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    amount: number;
    distribution: any;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const incomeAmount = Number.parseFloat(income);
    if (isNaN(incomeAmount) || incomeAmount <= 0) {
      setError("Please enter a valid income amount");
      setIsLoading(false);
      return;
    }

    let customPercentages;
    if (planType === "custom") {
      const spend = Number.parseFloat(customSpend);
      const investment = Number.parseFloat(customInvestment);
      const savings = Number.parseFloat(customSavings);

      if (isNaN(spend) || isNaN(investment) || isNaN(savings)) {
        setError("Please enter valid percentages");
        setIsLoading(false);
        return;
      }

      if (spend + investment + savings !== 100) {
        setError("Percentages must add up to 100%");
        setIsLoading(false);
        return;
      }

      customPercentages = { spend, investment, savings };
    }

    const distribution = calculateDistribution(
      incomeAmount,
      planType,
      customPercentages
    );

    const supabase = createClient();

    try {
      const { data, error: insertError } = await supabase
        .from("budgets")
        .insert({
          user_id: userId,
          month,
          year,
          income: incomeAmount,
          plan_type: planType,
          ...distribution,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      if (data) {
        onBudgetCreated(data as Budget);
        toast.success("Budget created successfully!", {
          description: `${MONTHS[month - 1]} budget has been set up.`,
        });

        setCelebrationData({
          amount: incomeAmount,
          distribution: {
            spend_amount: distribution.spend_amount,
            spend_percentage: distribution.spend_percentage,
            investment_amount: distribution.investment_amount,
            investment_percentage: distribution.investment_percentage,
            savings_amount: distribution.savings_amount,
            savings_percentage: distribution.savings_percentage,
          },
        });
        setShowCelebration(true);

        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
          await scheduleTestNotification(
            data.id,
            null,
            incomeAmount,
            currency,
            {
              spend_amount: distribution.spend_amount,
              investment_amount: distribution.investment_amount,
              savings_amount: distribution.savings_amount,
            }
          );
        }

        setIncome("");
        setPlanType("50/30/20");
        setCustomSpend("");
        setCustomInvestment("");
        setCustomSavings("");
        onOpenChange(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create budget");
      toast.error("Failed to create budget", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalCustomPercentage =
    (Number.parseFloat(customSpend) || 0) +
    (Number.parseFloat(customInvestment) || 0) +
    (Number.parseFloat(customSavings) || 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
            <DialogDescription>
              Set up your budget plan for a new month
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select
                value={month.toString()}
                onValueChange={(v) => setMonth(Number.parseInt(v))}
              >
                <SelectTrigger id="month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {MONTHS[m - 1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="income">
                Monthly Income ({currency === "NGN" ? "₦" : "$"})
              </Label>
              <Input
                id="income"
                type="number"
                step="0.01"
                min="0"
                placeholder="5000.00"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planType">Budget Plan</Label>
              <Select
                value={planType}
                onValueChange={(v) => setPlanType(v as BudgetPlanType)}
              >
                <SelectTrigger id="planType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50/30/20">
                    50/30/20 (Spend/Investment/Savings)
                  </SelectItem>
                  <SelectItem value="70/15/15">
                    70/15/15 (Spend/Investment/Savings)
                  </SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {planType === "custom" && (
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="customSpend">Spend %</Label>
                  <Input
                    id="customSpend"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="50"
                    value={customSpend}
                    onChange={(e) => setCustomSpend(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customInvestment">Investment %</Label>
                  <Input
                    id="customInvestment"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="30"
                    value={customInvestment}
                    onChange={(e) => setCustomInvestment(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customSavings">Savings %</Label>
                  <Input
                    id="customSavings"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="20"
                    value={customSavings}
                    onChange={(e) => setCustomSavings(e.target.value)}
                    required
                  />
                </div>
                <div className="text-sm">
                  Total:{" "}
                  <span
                    className={
                      totalCustomPercentage === 100
                        ? "text-green-600"
                        : "text-destructive"
                    }
                  >
                    {totalCustomPercentage.toFixed(2)}%
                  </span>
                  {totalCustomPercentage !== 100 && " (must equal 100%)"}
                </div>
              </div>
            )}

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
                {isLoading ? "Creating..." : "Create Budget"}
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
