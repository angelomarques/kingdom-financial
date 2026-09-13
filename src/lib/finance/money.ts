const euro = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});

export function formatEuro(cents: number): string {
  return euro.format(cents / 100);
}

export function parseEuroToCents(raw: string): number | null {
  const trimmed = raw.trim().replace(/[€\s]/g, "");
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.includes(",") && !trimmed.includes(".")
    ? trimmed.replace(",", ".")
    : trimmed;

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [euros, fraction = ""] = normalized.split(".");
  return Number(euros) * 100 + Number(fraction.padEnd(2, "0").slice(0, 2));
}

export function isYearMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}
