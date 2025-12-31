"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/budget-utils";
import { PartyPopper, TrendingUp, PiggyBank, ShoppingBag } from "lucide-react";

interface IncomeCelebrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  currency: "USD" | "NGN";
  distribution: {
    spend_amount: number;
    spend_percentage: number;
    investment_amount: number;
    investment_percentage: number;
    savings_amount: number;
    savings_percentage: number;
  };
}

export default function IncomeCelebrationModal({
  open,
  onOpenChange,
  amount,
  currency,
  distribution,
}: IncomeCelebrationModalProps) {
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setConfetti(true);
      const timer = setTimeout(() => setConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
    max-w-lg
    max-h-[90dvh]
    overflow-y-auto
    rounded-xl
    sm:rounded-xl"
      >
        <div className="text-center space-y-6 py-4 ">
          {/* Celebration Header */}
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <PartyPopper className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-balance">
              Congratulations!
            </h2>
            <p className="text-lg text-muted-foreground">
              You've added{" "}
              <span className="font-bold text-foreground">
                {formatCurrency(amount, currency)}
              </span>{" "}
              to your budget
            </p>
          </div>

          <Separator />

          {/* Distribution Breakdown */}
          <div className="space-y-4">
            <div className="text-left space-y-2">
              <h3 className="font-semibold text-base">
                Time to Distribute Your Income
              </h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Transfer these amounts to their respective accounts to stay on
                track with your budget plan:
              </p>
            </div>

            <div className="space-y-3">
              {/* Spending Account */}
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm">Spending Account</p>
                      <p className="text-xs text-muted-foreground">
                        {distribution.spend_percentage}%
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {formatCurrency(distribution.spend_amount, currency)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Investment Account */}
              <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm">
                        Investment Account
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {distribution.investment_percentage}%
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {formatCurrency(distribution.investment_amount, currency)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Savings Account */}
              <Card className="p-4 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <PiggyBank className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm">Savings Account</p>
                      <p className="text-xs text-muted-foreground">
                        {distribution.savings_percentage}%
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                      {formatCurrency(distribution.savings_amount, currency)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We'll remind you to complete your distribution!
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full"
              size="lg"
            >
              Got it, thanks!
            </Button>
          </div>
        </div>

        {/* Confetti Animation */}
        {confetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-10px",
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: [
                      "#3b82f6",
                      "#22c55e",
                      "#a855f7",
                      "#f59e0b",
                      "#ef4444",
                    ][Math.floor(Math.random() * 5)],
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
