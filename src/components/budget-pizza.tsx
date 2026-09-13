import { formatEuro } from "@/lib/finance/money";
import type { MonthSnapshot, PizzaSliceId } from "@/lib/finance/types";

const SLICE_META: Record<
  PizzaSliceId,
  { label: string; color: string }
> = {
  spending: { label: "Spending", color: "var(--pizza-spending)" },
  saving: { label: "Saving", color: "var(--pizza-saving)" },
  remaining: { label: "Remaining", color: "var(--pizza-remaining)" },
};

export function BudgetPizza({ snapshot }: { snapshot: MonthSnapshot }) {
  const total = snapshot.slices.reduce((sum, slice) => sum + slice.cents, 0);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let spent = 0;
  const label = [
    `${formatEuro(snapshot.spendingCents)} spent`,
    `${formatEuro(snapshot.savingCents)} saved`,
    `${formatEuro(snapshot.remainingCents)} remaining`,
  ].join(", ");

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-10">
      <svg
        viewBox="0 0 160 160"
        className="size-56 shrink-0"
        role="img"
        aria-label={`Monthly budget pizza: ${label}.`}
      >
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="22"
        />
        {total > 0
          ? snapshot.slices
              .filter((slice) => slice.cents > 0)
              .map((slice) => {
                const length = (slice.cents / total) * circumference;
                const rotation = (spent / total) * 360 - 90;
                spent += slice.cents;
                return (
                  <circle
                    key={slice.id}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={SLICE_META[slice.id].color}
                    strokeWidth="22"
                    strokeDasharray={`${length} ${circumference - length}`}
                    transform={`rotate(${rotation} 80 80)`}
                  />
                );
              })
          : null}
        <text
          x="80"
          y="76"
          textAnchor="middle"
          className="fill-foreground text-[11px] font-medium"
        >
          Remaining
        </text>
        <text
          x="80"
          y="94"
          textAnchor="middle"
          className="fill-foreground text-[13px] font-medium"
        >
          {formatEuro(snapshot.remainingCents)}
        </text>
      </svg>
      <ul className="grid w-full gap-3">
        {snapshot.slices.map((slice) => (
          <li key={slice.id} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm">
              <span
                className="size-2.5 rounded-full"
                style={{ background: SLICE_META[slice.id].color }}
                aria-hidden
              />
              {SLICE_META[slice.id].label}
            </span>
            <span className="font-mono text-sm tabular-nums">
              {formatEuro(slice.cents)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
