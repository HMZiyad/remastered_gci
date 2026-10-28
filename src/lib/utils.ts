export function formatBDT(paisa: number | bigint | string | null | undefined, short = false) {
  if (paisa == null) return "";
  const bdt = Number(paisa) / 100;
  if (short) {
    // 1 Crore = 10,000,000 BDT (100 Lakh). If amount passes 99 Lakh (>= 10,000,000), count in Crore (Cr)
    if (bdt >= 10_000_000) {
      const crore = bdt / 10_000_000;
      return `৳${crore.toFixed(2)} Cr`;
    }
    // 1 Lakh = 100,000 BDT (up to 99 Lakh)
    if (bdt >= 100_000) {
      return `৳${(bdt / 100_000).toFixed(1)}L`;
    }
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(bdt);
}
