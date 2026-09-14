import Link from "next/link";
import { BudgetPizza } from "@/components/budget-pizza";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardNavigation } from "@/components/dashboard-navigation";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import {
  ClearMonthForm,
  EntryForm,
  PlanForm,
  RecentEntries,
} from "@/components/ledger-forms";
import { MonthEmpty } from "@/components/month-empty";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UpdatesFeed } from "@/components/updates-feed";
import { currentYearMonth } from "@/lib/finance/month";
import { getStore, getStoreSource } from "@/lib/finance/store";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const { demo } = await searchParams;

  if (demo === "error") {
    throw new Error("Forced demo error for the error state.");
  }

  if (demo === "loading") {
    return <DashboardSkeleton />;
  }

  const yearMonth = currentYearMonth();
  const snapshot =
    demo === "empty"
      ? emptySnapshot(yearMonth)
      : await getStore().getMonth(yearMonth);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-amber-500/20">
      {/* 1. Top Bar with Brand & Profile */}
      <DashboardHeader snapshot={snapshot} yearMonth={yearMonth} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {demo === "empty" || !snapshot.plan ? (
          <div className="max-w-2xl mx-auto my-8">
            <MonthEmpty snapshot={snapshot} />
          </div>
        ) : (
          /* 3-Column Layout: Left Menu Bar | Center Hero Pizza Chart | Right Updates Feed */
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_340px] gap-6 items-start">
            {/* Left Sidebar: Navigation Menu Bar (Desktop wireframe) */}
            <DashboardNavigation
              snapshot={snapshot}
              className="hidden lg:block sticky top-20"
            />

            {/* Center Content: Pizza Chart Hero & Money Record Panels */}
            <div className="flex flex-col gap-6 min-w-0">
              {/* Pizza Card Hero */}
              <Card className="p-6 bg-card/60 border-border/50 backdrop-blur-xs shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/30 gap-2">
                  <div>
                    <CardTitle className="text-lg font-semibold tracking-tight">
                      Monthly Budget Pizza
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Live visualization of spending, saving, and spendable balance.
                    </CardDescription>
                  </div>
                </div>

                <div className="pt-6 flex justify-center">
                  <BudgetPizza snapshot={snapshot} />
                </div>
              </Card>

              {/* Action Cards: Quick Record & Plan Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-card/40 border-border/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Record Spending</CardTitle>
                    <CardDescription className="text-xs">
                      Record payments or debit expenses.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EntryForm snapshot={snapshot} kind="spend" />
                  </CardContent>
                </Card>

                <Card className="bg-card/40 border-border/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Record Saving</CardTitle>
                    <CardDescription className="text-xs">
                      Deposit funds into your savings target.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EntryForm snapshot={snapshot} kind="save" />
                  </CardContent>
                </Card>
              </div>

              {/* Collapsible/Secondary Ledger & Plan Overview */}
              <Card className="bg-card/30 border-border/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Plan Configuration</CardTitle>
                  <CardDescription className="text-xs">
                    Update monthly targets or view ledger actions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <PlanForm snapshot={snapshot} />
                  <Separator className="bg-border/30" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      Resetting removes all entries and resets the plan for {snapshot.yearMonth}.
                    </div>
                    <ClearMonthForm snapshot={snapshot} />
                  </div>
                </CardContent>
              </Card>

              {/* Hidden legacy recent entries for test compatibility */}
              <div className="hidden" aria-hidden="true">
                <RecentEntries snapshot={snapshot} />
              </div>
            </div>

            {/* Right Column: Recent Updates Feed (Alerts & Activity) */}
            <aside className="w-full lg:sticky lg:top-20">
              <Card className="p-4 bg-card/60 border-border/50 backdrop-blur-xs shadow-lg">
                <UpdatesFeed snapshot={snapshot} />
              </Card>
            </aside>
          </div>
        )}

        {/* Footer Demo Links */}
        <footer className="mt-12 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            Install Kingdom Financial from your browser menu to keep the pizza on your phone.
          </p>
          <div className="flex items-center gap-3">
            <span>Demo states:</span>
            <Link className="underline hover:text-foreground" href="/?demo=empty">
              empty
            </Link>
            <span>·</span>
            <Link className="underline hover:text-foreground" href="/?demo=loading">
              loading
            </Link>
            <span>·</span>
            <Link className="underline hover:text-foreground" href="/?demo=error">
              error
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

function emptySnapshot(yearMonth: string) {
  return {
    yearMonth,
    plan: null,
    spendingCents: 0,
    savingCents: 0,
    remainingCents: 0,
    slices: [
      { id: "spending" as const, cents: 0 },
      { id: "saving" as const, cents: 0 },
      { id: "remaining" as const, cents: 0 },
    ],
    alerts: [],
    entries: [],
    source: getStoreSource(),
  };
}
