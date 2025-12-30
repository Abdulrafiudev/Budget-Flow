"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Currency } from "@/lib/types"
import { useRouter } from "next/navigation"

interface CurrencySelectorProps {
  currentCurrency: Currency
  userId: string
}

export default function CurrencySelector({ currentCurrency, userId }: CurrencySelectorProps) {
  const [currency, setCurrency] = useState<Currency>(currentCurrency)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleCurrencyChange = async (newCurrency: Currency) => {
    if (newCurrency === currency) return

    setIsUpdating(true)
    const supabase = createClient()

    const { error } = await supabase.from("profiles").update({ currency: newCurrency }).eq("id", userId)

    if (!error) {
      setCurrency(newCurrency)
      router.refresh()
    }
    setIsUpdating(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          <CardTitle>Currency Preference</CardTitle>
        </div>
        <CardDescription>Select your preferred currency for displaying amounts</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button
          variant={currency === "USD" ? "default" : "outline"}
          className="flex-1"
          onClick={() => handleCurrencyChange("USD")}
          disabled={isUpdating}
        >
          {currency === "USD" && <Check className="h-4 w-4 mr-2" />}
          USD ($)
        </Button>
        <Button
          variant={currency === "NGN" ? "default" : "outline"}
          className="flex-1"
          onClick={() => handleCurrencyChange("NGN")}
          disabled={isUpdating}
        >
          {currency === "NGN" && <Check className="h-4 w-4 mr-2" />}
          NGN (₦)
        </Button>
      </CardContent>
    </Card>
  )
}
