import {
  Bell,
  CircleCheck,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { acknowledgeAlert } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatEuro } from "@/lib/finance/money";
import type { BudgetAlert, LedgerEntry, MonthSnapshot } from "@/lib/finance/types";

export function UpdatesFeed({
  snapshot,
  className,
}: {
  snapshot: MonthSnapshot;
  className?: string;
}) {
  const alerts = snapshot.alerts;
  const entries = snapshot.entries;

  return (
    <div className={className}>
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-amber-400" />
          <h2 className="font-heading text-sm font-semibold tracking-wide uppercase text-foreground">
            Recent Updates
          </h2>
        </div>
        {alerts.filter((a) => a.status === "open").length > 0 && (
          <Badge variant="destructive" className="px-1.5 py-0 text-[10px] uppercase font-mono">
            {alerts.filter((a) => a.status === "open").length} Action needed
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-3">
        {/* Render Open and Acknowledged Alerts first */}
        {alerts.map((alert) => (
          <AlertFeedCard key={alert.id} alert={alert} snapshot={snapshot} />
        ))}

        {/* If no alerts at all, show peaceful status */}
        {alerts.length === 0 && snapshot.plan && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-card/60 border border-border/40 ring-1 ring-emerald-500/10">
            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CircleCheck className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-foreground">No alerts active</p>
                <span className="text-[10px] text-muted-foreground font-mono">Status normal</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Spending is within budget cap ({formatEuro(snapshot.plan.spendThresholdCents)}).
              </p>
            </div>
          </div>
        )}

        {/* Render recent transactions / activity feed */}
        {entries.slice(0, 6).map((entry) => (
          <EntryFeedCard key={entry.id} entry={entry} />
        ))}

        {/* Informational summaries when list is small */}
        {entries.length === 0 && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-card/40 border border-dashed border-border/60 text-center justify-center">
            <p className="text-xs text-muted-foreground py-2">
              No recent activity recorded yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertFeedCard({
  alert,
  snapshot,
}: {
  alert: BudgetAlert;
  snapshot: MonthSnapshot;
}) {
  const isSpend = alert.kind === "spend_threshold";
  const isOpen = alert.status === "open";
  const title = isSpend ? "Spend threshold hit" : "Savings target reached";
  const body = isSpend
    ? `Recorded ${formatEuro(snapshot.spendingCents)} against a ${formatEuro(snapshot.plan?.spendThresholdCents ?? 0)} cap.`
    : `Put aside ${formatEuro(snapshot.savingCents)} towards your ${formatEuro(snapshot.plan?.savingsTargetCents ?? 0)} target.`;

  return (
    <Card
      className={`p-3.5 rounded-xl border transition-all ${
        isOpen
          ? isSpend
            ? "bg-rose-950/20 border-rose-500/30 ring-1 ring-rose-500/20"
            : "bg-emerald-950/20 border-emerald-500/30 ring-1 ring-emerald-500/20"
          : "bg-card/40 border-border/30 opacity-75"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
            isOpen
              ? isSpend
                ? "bg-rose-500/20 text-rose-400"
                : "bg-emerald-500/20 text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isSpend ? <TriangleAlert className="size-4" /> : <CircleCheck className="size-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-foreground truncate">{title}</h3>
            <span className="text-[10px] text-muted-foreground font-mono shrink-0">
              {isOpen ? "Active alert" : "Acknowledged"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{body}</p>
          {alert.status === "acknowledged" && (
            <p className="text-[10px] text-muted-foreground/80 mt-1 italic">
              Marked as seen.
            </p>
          )}

          {isOpen && (
            <div className="mt-2.5 pt-2 border-t border-border/40 flex justify-end">
              <ActionForm action={acknowledgeAlert}>
                <input type="hidden" name="alertId" value={alert.id} />
                <SubmitButton variant="outline">Acknowledge</SubmitButton>
              </ActionForm>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function EntryFeedCard({ entry }: { entry: LedgerEntry }) {
  const isSpend = entry.kind === "spend";

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card/50 border border-border/40 hover:bg-card/80 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${
            isSpend
              ? "bg-rose-500/10 text-rose-400"
              : "bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {isSpend ? (
            <TrendingDown className="size-3.5" />
          ) : (
            <TrendingUp className="size-3.5" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {entry.note ? entry.note : isSpend ? "Payment recorded" : "Savings transfer"}
          </p>
          <span className="text-[10px] text-muted-foreground font-mono">
            {formatDate(entry.recordedAt)}
          </span>
        </div>
      </div>
      <span
        className={`font-mono text-xs font-semibold tabular-nums shrink-0 ${
          isSpend ? "text-foreground" : "text-emerald-400"
        }`}
      >
        {isSpend ? "-" : "+"}
        {formatEuro(entry.amountCents)}
      </span>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-GB", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Lisbon",
    }).format(d);
  } catch {
    return iso;
  }
}
