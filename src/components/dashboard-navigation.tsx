import Link from "next/link";
import {
  CreditCard,
  History,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Settings,
  Sliders,
} from "lucide-react";
import {
  ClearMonthForm,
  EntryForm,
  PlanForm,
  RecentEntries,
} from "@/components/ledger-forms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { MonthSnapshot } from "@/lib/finance/types";

export function DashboardNavigation({
  snapshot,
  className,
}: {
  snapshot: MonthSnapshot;
  className?: string;
}) {
  return (
    <aside className={className}>
      <div className="flex flex-col gap-4">
        {/* Menu Bar Header */}
        <div className="px-3 py-2 rounded-lg bg-card/60 border border-border/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Menu Bar
          </p>
        </div>

        {/* 7 Navigation Bars as shown in wireframe */}
        <nav className="flex flex-col gap-1.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm font-medium transition-colors"
          >
            <LayoutDashboard className="size-4 shrink-0" />
            <span>Overview</span>
          </Link>

          {/* Quick Record Spend Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/60 border border-transparent hover:border-border/40 text-sm font-medium text-left transition-colors w-full cursor-pointer"
              >
                <CreditCard className="size-4 shrink-0 text-rose-400" />
                <span>Record Spend</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record a spend</DialogTitle>
                <DialogDescription>
                  Enter the amount in euros to add to your monthly spending.
                </DialogDescription>
              </DialogHeader>
              <EntryForm snapshot={snapshot} kind="spend" />
            </DialogContent>
          </Dialog>

          {/* Quick Record Save Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/60 border border-transparent hover:border-border/40 text-sm font-medium text-left transition-colors w-full cursor-pointer"
              >
                <PiggyBank className="size-4 shrink-0 text-emerald-400" />
                <span>Record Save</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record a save</DialogTitle>
                <DialogDescription>
                  Put money aside toward your monthly savings target.
                </DialogDescription>
              </DialogHeader>
              <EntryForm snapshot={snapshot} kind="save" />
            </DialogContent>
          </Dialog>

          {/* Monthly Plan Adjustment */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/60 border border-transparent hover:border-border/40 text-sm font-medium text-left transition-colors w-full cursor-pointer"
              >
                <Sliders className="size-4 shrink-0 text-amber-400" />
                <span>Budget Plan</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Monthly plan</DialogTitle>
                <DialogDescription>
                  Adjust income, spend threshold warning, and savings target.
                </DialogDescription>
              </DialogHeader>
              <PlanForm snapshot={snapshot} />
            </DialogContent>
          </Dialog>

          {/* Transaction Ledger */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/60 border border-transparent hover:border-border/40 text-sm font-medium text-left transition-colors w-full cursor-pointer"
              >
                <History className="size-4 shrink-0 text-blue-400" />
                <span>Activity History</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Activity history</DialogTitle>
                <DialogDescription>
                  All recorded entries for this month.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-72 overflow-y-auto pr-1">
                <RecentEntries snapshot={snapshot} />
              </div>
            </DialogContent>
          </Dialog>

          {/* Month Reset / Clear */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 text-sm font-medium text-left transition-colors w-full cursor-pointer"
              >
                <Receipt className="size-4 shrink-0 text-zinc-500" />
                <span>Reset Month</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset month</DialogTitle>
                <DialogDescription>
                  Clear the current month plan and entries to start over.
                </DialogDescription>
              </DialogHeader>
              <ClearMonthForm snapshot={snapshot} />
            </DialogContent>
          </Dialog>

          {/* Settings / Info item */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground border border-transparent text-sm font-medium">
            <Settings className="size-4 shrink-0 text-zinc-500" />
            <span className="text-zinc-500">Settings</span>
          </div>
        </nav>

        <Separator className="my-2 bg-border/40" />

        {/* Quick status card in sidebar */}
        <div className="p-3 rounded-xl bg-card/40 border border-border/30 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Storage Backend</p>
          <p>{snapshot.source === "d1" ? "D1 Engine" : "Local Storage"}</p>
        </div>
      </div>
    </aside>
  );
}
