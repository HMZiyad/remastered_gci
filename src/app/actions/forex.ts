"use server";

export interface ForexRates {
  jpyRate: number;      // 1 JPY in BDT (e.g. ~0.778)
  usdRate: number;      // 1 USD in BDT (e.g. ~123.14)
  usdToJpy: number;     // 1 USD in JPY (e.g. ~158.23)
  lastUpdated: string;
  source: string;
  isLive: boolean;
}

const FALLBACK_RATES: ForexRates = {
  jpyRate: 0.78,
  usdRate: 122.0,
  usdToJpy: 156.41,
  lastUpdated: new Date().toISOString(),
  source: "Default Benchmark",
  isLive: false,
};

/**
 * Fetches live exchange rates for USD, JPY, and BDT from open.er-api.com.
 * Cached for 1 hour by default to optimize network and performance.
 * Pass forceFresh = true to bypass cache and fetch immediate live spot rates.
 */
export async function getLiveForexRates(forceFresh: boolean = false): Promise<ForexRates> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      ...(forceFresh ? { cache: "no-store" } : { next: { revalidate: 3600 } }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      console.warn("Forex API responded with non-200 status:", res.status);
      return FALLBACK_RATES;
    }

    const data = await res.json();
    if (data && data.result === "success" && data.rates) {
      const usdToBdt = Number(data.rates.BDT);
      const usdToJpy = Number(data.rates.JPY);

      if (usdToBdt > 0 && usdToJpy > 0) {
        const jpyToBdt = usdToBdt / usdToJpy;
        return {
          jpyRate: Number(jpyToBdt.toFixed(4)),
          usdRate: Number(usdToBdt.toFixed(2)),
          usdToJpy: Number(usdToJpy.toFixed(2)),
          lastUpdated: data.time_last_update_utc || new Date().toISOString(),
          source: "Open Exchange Rates (Live)",
          isLive: true,
        };
      }
    }

    return FALLBACK_RATES;
  } catch (error) {
    console.error("Failed to fetch live forex rates, using fallback:", error);
    return FALLBACK_RATES;
  }
}
