import { formatEuro } from "@/lib/finance/money";
import type { MonthSnapshot, PizzaSliceId } from "@/lib/finance/types";

const SLICE_META: Record<
  PizzaSliceId,
  { label: string; color: string; badgeBg: string; textClass: string }
> = {
  spending: {
    label: "Spending",
    color: "var(--pizza-spending)",
    badgeBg: "rgba(244, 63, 94, 0.15)",
    textClass: "text-rose-400",
  },
  saving: {
    label: "Saving",
    color: "var(--pizza-saving)",
    badgeBg: "rgba(34, 197, 94, 0.15)",
    textClass: "text-emerald-400",
  },
  remaining: {
    label: "Remaining",
    color: "var(--pizza-remaining)",
    badgeBg: "rgba(234, 179, 8, 0.15)",
    textClass: "text-amber-400",
  },
};

export function BudgetPizza({ snapshot }: { snapshot: MonthSnapshot }) {
  const total = snapshot.slices.reduce((sum, slice) => sum + slice.cents, 0);
  const cx = 150;
  const cy = 150;
  const radius = 80;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  const label = [
    `${formatEuro(snapshot.spendingCents)} spent`,
    `${formatEuro(snapshot.savingCents)} saved`,
    `${formatEuro(snapshot.remainingCents)} remaining`,
  ].join(", ");

  // Calculate slice geometry and midpoint angles for callouts
  const activeSlices = total > 0 ? snapshot.slices.filter((s) => s.cents > 0) : [];

  const offsets = activeSlices.reduce<number[]>((acc, s, i) => {
    if (i === 0) {
      return [0];
    }
    const prevOffset = acc[i - 1];
    const prevSlice = activeSlices[i - 1];
    return [...acc, prevOffset + prevSlice.cents];
  }, []);

  const sliceData = activeSlices.map((slice, idx) => {
    const fraction = slice.cents / total;
    const length = fraction * circumference;
    const startAngleDeg = (offsets[idx] / total) * 360 - 90;
    const midAngleDeg = startAngleDeg + (fraction * 360) / 2;

    // Callout line points
    const midAngleRad = (midAngleDeg * Math.PI) / 180;
    const pStart = {
      x: cx + Math.cos(midAngleRad) * (radius + strokeWidth / 2 + 3),
      y: cy + Math.sin(midAngleRad) * (radius + strokeWidth / 2 + 3),
    };
    const isRightSide = Math.cos(midAngleRad) >= 0;
    const pKnee = {
      x: cx + Math.cos(midAngleRad) * (radius + strokeWidth / 2 + 22),
      y: cy + Math.sin(midAngleRad) * (radius + strokeWidth / 2 + 22),
    };
    const pEnd = {
      x: isRightSide ? pKnee.x + 22 : pKnee.x - 22,
      y: pKnee.y,
    };

    return {
      slice,
      fraction,
      length,
      startAngleDeg,
      midAngleDeg,
      isRightSide,
      pStart,
      pKnee,
      pEnd,
      meta: SLICE_META[slice.id],
    };
  });

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* SVG Container with Callouts */}
      <div className="relative flex items-center justify-center w-full max-w-sm sm:max-w-md aspect-square py-2">
        {/* Ambient subtle glow background */}
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, var(--pizza-remaining) 0%, transparent 65%)",
          }}
          aria-hidden
        />

        <svg
          viewBox="0 0 300 300"
          className="w-full h-full shrink-0 drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
          role="img"
          aria-label={`Monthly budget pizza: ${label}.`}
        >
          {/* Base Donut Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="oklch(0.24 0 0)"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {sliceData.map((d) => (
            <circle
              key={d.slice.id}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={d.meta.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${d.length} ${circumference - d.length}`}
              transform={`rotate(${d.startAngleDeg} ${cx} ${cy})`}
              className="transition-all duration-300 hover:opacity-90"
            />
          ))}

          {/* Desktop Leader Callout Lines */}
          {sliceData.map((d) => (
            <g key={`callout-${d.slice.id}`} className="hidden sm:inline">
              <polyline
                points={`${d.pStart.x},${d.pStart.y} ${d.pKnee.x},${d.pKnee.y} ${d.pEnd.x},${d.pEnd.y}`}
                fill="none"
                stroke="oklch(0.5 0 0 / 50%)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={d.pStart.x}
                cy={d.pStart.y}
                r="2.5"
                fill={d.meta.color}
              />
              <text
                x={d.isRightSide ? d.pEnd.x + 5 : d.pEnd.x - 5}
                y={d.pEnd.y + 3}
                textAnchor={d.isRightSide ? "start" : "end"}
                className="fill-zinc-300 text-[10px] font-medium"
              >
                {d.meta.label}{" "}
                <tspan className="fill-zinc-400 font-mono text-[9px]">
                  ({Math.round(d.fraction * 100)}%)
                </tspan>
              </text>
            </g>
          ))}

          {/* Center Donut Hub */}
          <circle
            cx={cx}
            cy={cy}
            r={radius - strokeWidth / 2 - 4}
            fill="oklch(0.18 0 0 / 85%)"
            stroke="oklch(1 0 0 / 8%)"
            strokeWidth="1"
          />

          {/* Center Text - Leftover / Spendable hero */}
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            className="fill-zinc-400 text-[10px] uppercase tracking-widest font-semibold"
          >
            Remaining
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            className="fill-foreground text-[18px] font-bold font-mono tracking-tight"
          >
            {formatEuro(snapshot.remainingCents)}
          </text>
          <text
            x={cx}
            y={cy + 27}
            textAnchor="middle"
            className="fill-zinc-400 text-[9px]"
          >
            spendable this month
          </text>
        </svg>
      </div>

      {/* Legend & Category Pills */}
      <div className="w-full max-w-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider px-1">
          <span>Categories</span>
          <span>Breakdown</span>
        </div>
        <ul className="grid gap-2">
          {snapshot.slices.map((slice) => {
            const meta = SLICE_META[slice.id];
            const percent = total > 0 ? Math.round((slice.cents / total) * 100) : 0;
            return (
              <li
                key={slice.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-card/60 border border-border/40 hover:bg-card/90 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="size-3 rounded-full shrink-0 shadow-sm"
                    style={{ background: meta.color }}
                    aria-hidden
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-none text-foreground">
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      {percent}% of monthly volume
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                    {formatEuro(slice.cents)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
