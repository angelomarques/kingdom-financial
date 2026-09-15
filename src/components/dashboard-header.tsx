import Link from "next/link";
import { Menu, User } from "lucide-react";
import { DashboardNavigation } from "@/components/dashboard-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { analyticsMode } from "@/lib/analytics";
import { formatYearMonth } from "@/lib/finance/month";
import type { MonthSnapshot } from "@/lib/finance/types";

export function DashboardHeader({
  snapshot,
  yearMonth,
}: {
  snapshot: MonthSnapshot;
  yearMonth: string;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border/40 py-3.5 px-4 sm:px-6 bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Drawer Trigger */}
        <div className="lg:hidden">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <Menu className="size-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xs p-5">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">Kingdom Financial</DialogTitle>
              </DialogHeader>
              <DashboardNavigation snapshot={snapshot} className="mt-2" />
            </DialogContent>
          </Dialog>
        </div>

        {/* Brand Logo / Title as in wireframe */}
        <div className="flex flex-col">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-6 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs tracking-wider">
              KF
            </div>
            <span className="font-heading text-base font-bold tracking-tight text-foreground group-hover:text-amber-400 transition-colors">
              Kingdom Financial
            </span>
          </Link>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            Ângelo Emanuel Marques
          </span>
        </div>
      </div>

      {/* Badges and Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Badge variant="secondary" className="font-mono text-[10px] sm:text-xs">
            {formatYearMonth(yearMonth)}
          </Badge>
          <Badge variant="outline" className="text-[10px] sm:text-[11px]">
            {snapshot.source === "d1" ? "Cloudflare D1" : "Local mock"}
          </Badge>
          <Badge variant="outline" className="text-[10px] sm:text-[11px]">
            {analyticsMode() === "posthog" ? "PostHog on" : "PostHog off"}
          </Badge>
        </div>

        <Link
          href="/session"
          className="size-8 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-300 hover:text-foreground hover:border-zinc-500 transition-colors shadow-sm shrink-0"
          title="User Profile & Session"
          aria-label="User profile and session"
        >
          <User className="size-4" />
        </Link>
      </div>
    </header>
  );
}
