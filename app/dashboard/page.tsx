import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/app-layout";
import YearTotalsCard from "@/components/year-totals-card";
import CurrencySelector from "@/components/currency-selector";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const currentYear = new Date().getFullYear();
  const { data: budgets } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("year", currentYear)
    .order("month", { ascending: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <AppLayout user={user} profile={profile}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-muted-foreground">
            Your financial overview for {currentYear}
          </p>
        </div>

        {/* <div className="mb-6">
          <CurrencySelector currentCurrency={profile?.currency || "USD"} userId={user.id} />
        </div> */}

        <YearTotalsCard
          budgets={budgets || []}
          year={currentYear}
          currency={profile?.currency || "USD"}
        />

        {budgets && budgets.length === 0 && (
          <div className="mt-8 text-center p-8 border border-dashed rounded-lg">
            <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first budget to start tracking your finances
            </p>
            <a
              href="/budgets"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to Budgets
            </a>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
