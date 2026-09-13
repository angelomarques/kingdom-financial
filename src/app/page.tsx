import Link from "next/link";
import { AlertsPanel } from "@/components/alerts-panel";
import { BudgetPizza } from "@/components/budget-pizza";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import {
  ClearMonthForm,
  EntryForm,
  PlanForm,
  RecentEntries,
} from "@/components/ledger-forms";
import { MonthEmpty } from "@/components/month-empty";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { analyticsMode } from "@/lib/analytics";
import { currentYearMonth, formatYearMonth } from "@/lib/finance/month";
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
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-1">
          <p className="text-sm text-muted-foreground">Ângelo Emanuel Marques</p>
          <h1 className="font-heading text-3xl font-medium tracking-tight">
            Kingdom Financial
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            This month&apos;s pizza is spending, saving, and what is still
            unallocated from your income.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{formatYearMonth(yearMonth)}</Badge>
          <Badge variant="outline">
            {snapshot.source === "d1" ? "Cloudflare D1" : "Local mock"}
          </Badge>
          <Badge variant="outline">
            {analyticsMode() === "posthog" ? "PostHog on" : "PostHog off"}
          </Badge>
        </div>
      </header>

      {demo === "empty" || !snapshot.plan ? (
        <MonthEmpty snapshot={snapshot} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly pizza</CardTitle>
              <CardDescription>
                Gold is leftover income. Coral is spending. Green is saving.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetPizza snapshot={snapshot} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>
                A spend cap fires a warning. Hitting the savings target asks
                you to acknowledge it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertsPanel snapshot={snapshot} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Record money</CardTitle>
              <CardDescription>
                Amounts are in euros. Commas and dots both work.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <EntryForm snapshot={snapshot} kind="spend" />
              <EntryForm snapshot={snapshot} kind="save" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>This month</CardTitle>
              <CardDescription>
                Change the plan, scan recent entries, or start the month over.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <PlanForm snapshot={snapshot} />
              <Separator />
              <RecentEntries snapshot={snapshot} />
              <ClearMonthForm snapshot={snapshot} />
            </CardContent>
          </Card>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Install Kingdom Financial from your browser menu to keep the pizza on
        your phone. Demo states live at{" "}
        <Link className="underline" href="/?demo=empty">
          empty
        </Link>
        ,{" "}
        <Link className="underline" href="/?demo=loading">
          loading
        </Link>
        , and{" "}
        <Link className="underline" href="/?demo=error">
          error
        </Link>
        .
      </p>
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
