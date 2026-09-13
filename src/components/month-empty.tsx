import { PlanForm } from "@/components/ledger-forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatYearMonth } from "@/lib/finance/month";
import type { MonthSnapshot } from "@/lib/finance/types";

export function MonthEmpty({ snapshot }: { snapshot: MonthSnapshot }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No plan for {formatYearMonth(snapshot.yearMonth)}</CardTitle>
        <CardDescription>
          Set income, a spend alert, and a savings target. The pizza stays
          empty until those numbers exist.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PlanForm snapshot={snapshot} />
      </CardContent>
    </Card>
  );
}
