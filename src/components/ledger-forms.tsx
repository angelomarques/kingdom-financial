import { clearMonth, recordEntry, savePlan } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatEuro } from "@/lib/finance/money";
import type { MonthSnapshot } from "@/lib/finance/types";

export function PlanForm({ snapshot }: { snapshot: MonthSnapshot }) {
  return (
    <ActionForm action={savePlan} className="grid gap-3" id="plan-form">
      <input type="hidden" name="yearMonth" value={snapshot.yearMonth} />
      <Field
        id="income"
        name="income"
        label="Monthly income"
        defaultValue={euroField(snapshot.plan?.incomeCents)}
      />
      <Field
        id="spendThreshold"
        name="spendThreshold"
        label="Spend alert at"
        defaultValue={euroField(snapshot.plan?.spendThresholdCents)}
      />
      <Field
        id="savingsTarget"
        name="savingsTarget"
        label="Savings target"
        defaultValue={euroField(snapshot.plan?.savingsTargetCents)}
      />
      <SubmitButton>{snapshot.plan ? "Update plan" : "Set this month"}</SubmitButton>
    </ActionForm>
  );
}

export function EntryForm({
  snapshot,
  kind,
}: {
  snapshot: MonthSnapshot;
  kind: "spend" | "save";
}) {
  const label = kind === "spend" ? "Record a spend" : "Record a save";
  return (
    <ActionForm
      action={recordEntry}
      className="grid gap-3"
      id={`${kind}-form`}
    >
      <input type="hidden" name="yearMonth" value={snapshot.yearMonth} />
      <input type="hidden" name="kind" value={kind} />
      <Field
        id={`${kind}-amount`}
        name="amount"
        label="Amount"
        placeholder="12,50"
      />
      <div className="grid gap-1.5">
        <Label htmlFor={`${kind}-note`}>Note</Label>
        <Input
          id={`${kind}-note`}
          name="note"
          placeholder={kind === "spend" ? "Groceries" : "Emergency fund"}
        />
      </div>
      <SubmitButton>{label}</SubmitButton>
    </ActionForm>
  );
}

export function ClearMonthForm({ snapshot }: { snapshot: MonthSnapshot }) {
  return (
    <ActionForm action={clearMonth} id="clear-month-form">
      <input type="hidden" name="yearMonth" value={snapshot.yearMonth} />
      <SubmitButton variant="destructive">Clear this month</SubmitButton>
    </ActionForm>
  );
}

export function RecentEntries({ snapshot }: { snapshot: MonthSnapshot }) {
  if (snapshot.entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No spends or saves recorded yet.
      </p>
    );
  }

  return (
    <ul className="grid gap-2">
      {snapshot.entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-center justify-between gap-3 text-sm"
        >
          <span className="min-w-0 truncate">
            {entry.kind === "spend" ? "Spend" : "Save"}
            {entry.note ? ` · ${entry.note}` : ""}
          </span>
          <span className="font-mono tabular-nums">
            {formatEuro(entry.amountCents)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Field({
  id,
  name,
  label,
  defaultValue,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        inputMode="decimal"
        defaultValue={defaultValue}
        placeholder={placeholder ?? "2500"}
      />
    </div>
  );
}

function euroField(cents: number | undefined): string | undefined {
  if (cents === undefined) {
    return undefined;
  }
  return (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
}
