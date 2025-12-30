"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import type { Budget, Expense } from "@/lib/types"
import { toast } from "sonner"

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExpenseAdded: (expense: Expense) => void
  budget: Budget
}

export default function AddExpenseDialog({ open, onOpenChange, onExpenseAdded, budget }: AddExpenseDialogProps) {
  const [category, setCategory] = useState<"spend" | "investment" | "savings">("spend")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const expenseAmount = Number.parseFloat(amount)
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      setError("Please enter a valid amount")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { data, error: insertError } = await supabase
        .from("expenses")
        .insert({
          user_id: budget.user_id,
          budget_id: budget.id,
          category,
          amount: expenseAmount,
          description,
          date,
        })
        .select()
        .single()

      if (insertError) throw insertError
      if (data) {
        onExpenseAdded(data as Expense)
        toast.success("Expense added successfully!", {
          description: `${category.charAt(0).toUpperCase() + category.slice(1)}: $${expenseAmount.toFixed(2)}`,
        })
        setAmount("")
        setDescription("")
        setDate(new Date().toISOString().split("T")[0])
        setCategory("spend")
        onOpenChange(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expense")
      toast.error("Failed to add expense", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Track an expense for this budget period</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as "spend" | "investment" | "savings")}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spend">Spend</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="50.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
