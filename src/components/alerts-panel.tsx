import { CircleCheck, TriangleAlert } from "lucide-react";
import { acknowledgeAlert } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { formatEuro } from "@/lib/finance/money";
import type { BudgetAlert, MonthSnapshot } from "@/lib/finance/types";

export function AlertsPanel({ snapshot }: { snapshot: MonthSnapshot }) {
  if (!snapshot.plan) {
    return null;
  }

  const open = snapshot.alerts.filter((alert) => alert.status === "open");
  const done = snapshot.alerts.filter((alert) => alert.status === "acknowledged");

  if (open.length === 0 && done.length === 0) {
    return (
      <Alert>
        <CircleCheck />
        <AlertTitle>No alerts this month</AlertTitle>
        <AlertDescription>
          Spending stays under {formatEuro(snapshot.plan.spendThresholdCents)}.
          Saving still needs{" "}
          {formatEuro(
            Math.max(0, snapshot.plan.savingsTargetCents - snapshot.savingCents),
          )}{" "}
          to hit the target.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-3">
      {open.map((alert) => (
        <AlertCard key={alert.id} alert={alert} snapshot={snapshot} />
      ))}
      {done.map((alert) => (
        <AlertCard key={alert.id} alert={alert} snapshot={snapshot} />
      ))}
    </div>
  );
}

function AlertCard({
  alert,
  snapshot,
}: {
  alert: BudgetAlert;
  snapshot: MonthSnapshot;
}) {
  const spend = alert.kind === "spend_threshold";
  const title = spend ? "Spend threshold hit" : "Savings target reached";
  const body = spend
    ? `You have recorded ${formatEuro(snapshot.spendingCents)} against a ${formatEuro(snapshot.plan?.spendThresholdCents ?? 0)} cap.`
    : `You have put aside ${formatEuro(snapshot.savingCents)} of your ${formatEuro(snapshot.plan?.savingsTargetCents ?? 0)} target.`;

  return (
    <Alert variant={spend && alert.status === "open" ? "destructive" : "default"}>
      {spend ? <TriangleAlert /> : <CircleCheck />}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {body}
        {alert.status === "acknowledged"
          ? " Marked as seen."
          : null}
      </AlertDescription>
      {alert.status === "open" ? (
        <AlertAction>
          <ActionForm action={acknowledgeAlert}>
            <input type="hidden" name="alertId" value={alert.id} />
            <SubmitButton variant="outline">Acknowledge</SubmitButton>
          </ActionForm>
        </AlertAction>
      ) : null}
    </Alert>
  );
}
