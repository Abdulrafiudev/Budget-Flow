import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AppLayout from "@/components/app-layout"
import ExpensesClient from "@/components/expenses-client"

export default async function ExpensesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const currentYear = new Date().getFullYear()
  const { data: budgets } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("year", currentYear)
    .order("month", { ascending: true })

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <AppLayout user={user} profile={profile}>
      <ExpensesClient budgets={budgets || []} year={currentYear} currency={profile?.currency || "USD"} />
    </AppLayout>
  )
}
