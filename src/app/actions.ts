"use server";

import { revalidatePath } from "next/cache";
import { capture } from "@/lib/analytics";
import { currentYearMonth } from "@/lib/finance/month";
import { isYearMonth, parseEuroToCents } from "@/lib/finance/money";
import { getStore } from "@/lib/finance/store";
export type ActionState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string };

export const idleActionState: ActionState = { status: "idle" };

export async function savePlan(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const yearMonth = readYearMonth(formData);
  const incomeCents = parseEuroToCents(String(formData.get("income") ?? ""));
  const spendThresholdCents = parseEuroToCents(
    String(formData.get("spendThreshold") ?? ""),
  );
  const savingsTargetCents = parseEuroToCents(
    String(formData.get("savingsTarget") ?? ""),
  );

  if (
    incomeCents === null ||
    spendThresholdCents === null ||
    savingsTargetCents === null
  ) {
    return {
      status: "error",
      message: "Use euro amounts such as 2500 or 2500,50.",
    };
  }

  const before = await getStore().getMonth(yearMonth);
  const snapshot = await getStore().setPlan({
    yearMonth,
    incomeCents,
    spendThresholdCents,
    savingsTargetCents,
  });
  capture("plan_saved", {
    yearMonth,
    incomeCents,
    spendThresholdCents,
    savingsTargetCents,
  });
  captureNewAlerts(
    snapshot.alerts
      .filter((alert) => !before.alerts.some((item) => item.id === alert.id))
      .map((alert) => alert.kind),
  );
  revalidatePath("/");
  return { status: "ok" };
}

export async function recordEntry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const yearMonth = readYearMonth(formData);
  const kind = formData.get("kind");
  if (kind !== "spend" && kind !== "save") {
    return { status: "error", message: "Pick spend or save." };
  }

  const amountCents = parseEuroToCents(String(formData.get("amount") ?? ""));
  if (amountCents === null || amountCents <= 0) {
    return {
      status: "error",
      message: "Enter an amount greater than zero.",
    };
  }

  const note = String(formData.get("note") ?? "").trim();
  const before = await getStore().getMonth(yearMonth);
  const snapshot = await getStore().addEntry({
    yearMonth,
    kind,
    amountCents,
    note,
  });
  capture("entry_recorded", { yearMonth, kind, amountCents });
  captureNewAlerts(
    snapshot.alerts
      .filter((alert) => !before.alerts.some((item) => item.id === alert.id))
      .map((alert) => alert.kind),
  );
  revalidatePath("/");
  return { status: "ok" };
}

export async function acknowledgeAlert(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("alertId") ?? "");
  if (!id) {
    return { status: "error", message: "Missing alert." };
  }

  const snapshot = await getStore().acknowledgeAlert(id);
  const alert = snapshot.alerts.find((item) => item.id === id);
  capture("alert_acknowledged", {
    kind: alert?.kind ?? "unknown",
    yearMonth: snapshot.yearMonth,
  });
  revalidatePath("/");
  return { status: "ok" };
}

export async function clearMonth(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const yearMonth = readYearMonth(formData);
  await getStore().resetMonth(yearMonth);
  capture("month_cleared", { yearMonth });
  revalidatePath("/");
  return { status: "ok" };
}

function readYearMonth(formData: FormData): string {
  const raw = String(formData.get("yearMonth") ?? currentYearMonth());
  if (!isYearMonth(raw)) {
    throw new Error("That month is not valid.");
  }
  return raw;
}

function captureNewAlerts(kinds: string[]): void {
  for (const kind of kinds) {
    capture("alert_triggered", { kind });
  }
}
