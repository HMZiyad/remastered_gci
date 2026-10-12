"use client";

import { useState, useEffect, useId, useCallback } from "react";
import { getLiveForexRates, ForexRates } from "@/app/actions/forex";

interface CurrencyCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRates?: ForexRates | null;
}

type Currency = "BDT" | "JPY" | "USD";

const CURRENCY_CONFIG: Record<Currency, { symbol: string; label: string; name: string; flag: string }> = {
  BDT: { symbol: "৳", label: "BDT", name: "Bangladeshi Taka", flag: "🇧🇩" },
  JPY: { symbol: "¥", label: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  USD: { symbol: "$", label: "USD", name: "US Dollar", flag: "🇺🇸" },
};

export function CurrencyCalculatorModal({ isOpen, onClose, initialRates }: CurrencyCalculatorModalProps) {
  const fromCurrencyId = useId();
  const toCurrencyId = useId();
  const [fromCurrency, setFromCurrency] = useState<Currency>("JPY");
  const [toCurrency, setToCurrency] = useState<Currency>("BDT");
  const [amountStr, setAmountStr] = useState<string>("1000000");

  // Live exchange rates from Forex API
  const [rates, setRates] = useState<ForexRates>(
    initialRates || {
      jpyRate: 0.78,
      usdRate: 122.0,
      usdToJpy: 156.41,
      lastUpdated: new Date().toISOString(),
      source: "Live Benchmark",
      isLive: true,
    }
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Optional manual override drawer
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [customJpy, setCustomJpy] = useState("");
  const [customUsd, setCustomUsd] = useState("");

  const fetchRates = useCallback(async (forceFresh: boolean = false) => {
    setIsRefreshing(true);
    try {
      const data = await getLiveForexRates(forceFresh);
      setRates(data);
      setCustomJpy(data.jpyRate.toString());
      setCustomUsd(data.usdRate.toString());
    } catch (err) {
      console.error("Forex sync error:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Fetch live rates whenever modal opens if not provided
  useEffect(() => {
    if (isOpen) {
      fetchRates(false);
    }
  }, [isOpen, fetchRates]);

  // Keyboard escape listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Active rates to use (either live or custom override)
  const activeJpyRate = isManualOverride && parseFloat(customJpy) > 0 ? parseFloat(customJpy) : rates.jpyRate;
  const activeUsdRate = isManualOverride && parseFloat(customUsd) > 0 ? parseFloat(customUsd) : rates.usdRate;

  // Conversion math function: convert amount in 'from' to 'to'
  const convertAmount = (val: number, from: Currency, to: Currency): number => {
    if (isNaN(val) || val <= 0) return 0;
    if (from === to) return val;

    // Convert 'from' into base BDT
    let inBdt = 0;
    if (from === "BDT") inBdt = val;
    else if (from === "JPY") inBdt = val * activeJpyRate;
    else if (from === "USD") inBdt = val * activeUsdRate;

    // Convert BDT to 'to'
    if (to === "BDT") return inBdt;
    if (to === "JPY") return inBdt / (activeJpyRate || 1);
    if (to === "USD") return inBdt / (activeUsdRate || 1);

    return 0;
  };

  const parsedAmount = parseFloat(amountStr.replace(/,/g, "")) || 0;
  const convertedResult = convertAmount(parsedAmount, fromCurrency, toCurrency);
  const unitRate = convertAmount(1, fromCurrency, toCurrency);

  // Format numbers nicely
  const formatNumber = (num: number, curr: Currency): string => {
    if (isNaN(num)) return "0";
    if (curr === "JPY") {
      return new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 }).format(Math.round(num));
    }
    if (curr === "BDT") {
      return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(num);
    }
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  // Sub description (Lakh / Crore for BDT, Million for JPY)
  const getSubDescription = (num: number, curr: Currency): string => {
    if (num <= 0) return "";
    if (curr === "BDT") {
      if (num >= 10000000) return `≈ ${(num / 10000000).toFixed(2)} Crore BDT`;
      if (num >= 100000) return `≈ ${(num / 100000).toFixed(2)} Lakh BDT`;
    }
    if (curr === "JPY") {
      if (num >= 1000000) return `≈ ${(num / 1000000).toFixed(2)} Million Yen (M)`;
      if (num >= 10000) return `≈ ${(num / 10000).toFixed(1)} Man (万)`;
    }
    if (curr === "USD") {
      if (num >= 1000) return `≈ $${(num / 1000).toFixed(1)}k USD`;
    }
    return "";
  };

  const handleSwap = () => {
    const prevFrom = fromCurrency;
    const prevTo = toCurrency;
    setFromCurrency(prevTo);
    setToCurrency(prevFrom);
    if (convertedResult > 0) {
      setAmountStr(prevTo === "JPY" ? Math.round(convertedResult).toString() : convertedResult.toFixed(2));
    }
  };

  const handleQuickPreset = (val: number) => {
    setAmountStr(val.toString());
  };

  const handleCopy = () => {
    const textToCopy = `${formatNumber(convertedResult, toCurrency)} ${toCurrency}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "16px",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div 
        className="calc-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: "18px 24px 14px 24px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "#0f172a",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(15, 23, 42, 0.15)",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>calculate</span>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
                  Live Forex Calculator
                </h3>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "6px",
                  background: rates.isLive ? "#dcfce7" : "#fef3c7",
                  color: rates.isLive ? "#15803d" : "#b45309",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}>
                  <span style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: rates.isLive ? "#16a34a" : "#d97706",
                  }}></span>
                  {rates.isLive ? "Live Sync" : "Cached"}
                </span>
              </div>
              <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                Automatic Market Spot Rates • BDT (৳) ⇄ YEN (¥) ⇄ USD ($)
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* Sync Refresh Button */}
            <button
              type="button"
              onClick={() => fetchRates(true)}
              title="Sync Latest Spot Rates Now"
              disabled={isRefreshing}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: isRefreshing ? "#2563eb" : "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isRefreshing ? "wait" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span 
                className="material-symbols-outlined" 
                style={{ 
                  fontSize: "18px",
                  animation: isRefreshing ? "spin 1s linear infinite" : "none" 
                }}
              >
                sync
              </span>
            </button>

            {/* Close Button */}
            <button 
              type="button"
              onClick={onClose}
              aria-label="Close currency calculator"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.color = "#0f172a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "#64748b";
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {/* Quick Currency Pair Shortcuts */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {[
              { from: "JPY" as Currency, to: "BDT" as Currency, label: "YEN ⇄ BDT" },
              { from: "USD" as Currency, to: "BDT" as Currency, label: "USD ⇄ BDT" },
              { from: "USD" as Currency, to: "JPY" as Currency, label: "USD ⇄ YEN" },
            ].map((pair) => {
              const isMatch = (fromCurrency === pair.from && toCurrency === pair.to) || (fromCurrency === pair.to && toCurrency === pair.from);
              return (
                <button
                  key={pair.label}
                  type="button"
                  onClick={() => {
                    setFromCurrency(pair.from);
                    setToCurrency(pair.to);
                  }}
                  style={{
                    flex: 1,
                    padding: "7px 10px",
                    borderRadius: "10px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: isMatch ? "1.5px solid #0f172a" : "1px solid #e2e8f0",
                    background: isMatch ? "#0f172a" : "#f8fafc",
                    color: isMatch ? "#ffffff" : "#475569",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {pair.label}
                </button>
              );
            })}
          </div>

          {/* "From" Input Box */}
          <div style={{
            background: "#f8fafc",
            borderRadius: "16px",
            border: "1.5px solid #e2e8f0",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor={fromCurrencyId} style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                You Pay / Convert From
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px" }}>{CURRENCY_CONFIG[fromCurrency].flag}</span>
                <select
                  id={fromCurrencyId}
                  value={fromCurrency}
                  onChange={(e) => {
                    const next = e.target.value as Currency;
                    if (next === toCurrency) handleSwap();
                    else setFromCurrency(next);
                  }}
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#0f172a",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "3px 8px",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="JPY">¥ JPY (Yen)</option>
                  <option value="BDT">৳ BDT (Taka)</option>
                  <option value="USD">$ USD (Dollar)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
                {CURRENCY_CONFIG[fromCurrency].symbol}
              </span>
              <input
                type="text"
                value={amountStr}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                  setAmountStr(cleaned);
                }}
                placeholder="0"
                style={{
                  width: "100%",
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#0f172a",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {parsedAmount > 0 && (
              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                {getSubDescription(parsedAmount, fromCurrency)}
              </div>
            )}
          </div>

          {/* Swap Button Divider */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "-8px 0" }}>
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Currencies"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                border: "2px solid #ffffff",
                background: "#2563eb",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)",
                transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                zIndex: 2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1) rotate(180deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1) rotate(0deg)";
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>swap_vert</span>
            </button>
          </div>

          {/* "To" Converted Output Box */}
          <div style={{
            background: "#eff6ff",
            borderRadius: "16px",
            border: "1.5px solid #bfdbfe",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor={toCurrencyId} style={{ fontSize: "11px", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Converted Live Target
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px" }}>{CURRENCY_CONFIG[toCurrency].flag}</span>
                <select
                  id={toCurrencyId}
                  value={toCurrency}
                  onChange={(e) => {
                    const next = e.target.value as Currency;
                    if (next === fromCurrency) handleSwap();
                    else setToCurrency(next);
                  }}
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#1e3a8a",
                    background: "#ffffff",
                    border: "1px solid #93c5fd",
                    borderRadius: "8px",
                    padding: "3px 8px",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="BDT">৳ BDT (Taka)</option>
                  <option value="JPY">¥ JPY (Yen)</option>
                  <option value="USD">$ USD (Dollar)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#1e3a8a" }}>
                  {CURRENCY_CONFIG[toCurrency].symbol}
                </span>
                <span style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#1e3a8a",
                  letterSpacing: "-0.01em",
                }}>
                  {formatNumber(convertedResult, toCurrency)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "5px 10px",
                  borderRadius: "8px",
                  border: "1px solid #93c5fd",
                  background: "#ffffff",
                  color: copied ? "#16a34a" : "#2563eb",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  {copied ? "check" : "content_copy"}
                </span>
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {convertedResult > 0 && (
              <div style={{ fontSize: "11px", color: "#2563eb", fontWeight: 600 }}>
                {getSubDescription(convertedResult, toCurrency)}
              </div>
            )}
          </div>

          {/* Quick Amount Presets */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "5px" }}>
              Quick Presets ({fromCurrency})
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {fromCurrency === "JPY" && (
                <>
                  <button type="button" onClick={() => handleQuickPreset(500000)} style={presetBtnStyle}>¥500k</button>
                  <button type="button" onClick={() => handleQuickPreset(1000000)} style={presetBtnStyle}>¥1M</button>
                  <button type="button" onClick={() => handleQuickPreset(2500000)} style={presetBtnStyle}>¥2.5M</button>
                  <button type="button" onClick={() => handleQuickPreset(5000000)} style={presetBtnStyle}>¥5M</button>
                  <button type="button" onClick={() => handleQuickPreset(10000000)} style={presetBtnStyle}>¥10M</button>
                </>
              )}
              {fromCurrency === "BDT" && (
                <>
                  <button type="button" onClick={() => handleQuickPreset(500000)} style={presetBtnStyle}>৳5L</button>
                  <button type="button" onClick={() => handleQuickPreset(1000000)} style={presetBtnStyle}>৳10L</button>
                  <button type="button" onClick={() => handleQuickPreset(2500000)} style={presetBtnStyle}>৳25L</button>
                  <button type="button" onClick={() => handleQuickPreset(5000000)} style={presetBtnStyle}>৳50L</button>
                  <button type="button" onClick={() => handleQuickPreset(10000000)} style={presetBtnStyle}>৳1 Cr</button>
                </>
              )}
              {fromCurrency === "USD" && (
                <>
                  <button type="button" onClick={() => handleQuickPreset(5000)} style={presetBtnStyle}>$5k</button>
                  <button type="button" onClick={() => handleQuickPreset(10000)} style={presetBtnStyle}>$10k</button>
                  <button type="button" onClick={() => handleQuickPreset(25000)} style={presetBtnStyle}>$25k</button>
                  <button type="button" onClick={() => handleQuickPreset(50000)} style={presetBtnStyle}>$50k</button>
                </>
              )}
              <button 
                type="button" 
                onClick={() => setAmountStr("0")} 
                style={{ ...presetBtnStyle, background: "#fee2e2", color: "#991b1b", borderColor: "#fecaca" }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Live Rate Formula Banner */}
          <div style={{
            padding: "9px 12px",
            borderRadius: "12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#334155" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#16a34a" }}>trending_up</span>
              <span>1 {fromCurrency} = <strong>{unitRate < 0.01 ? unitRate.toFixed(4) : unitRate.toFixed(3)} {toCurrency}</strong></span>
            </div>

            <button
              type="button"
              onClick={() => setIsManualOverride(!isManualOverride)}
              style={{
                background: "none",
                border: "none",
                color: isManualOverride ? "#b45309" : "#2563eb",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                padding: "2px 6px",
                borderRadius: "6px",
              }}
            >
              {isManualOverride ? "Use Live Rates" : "Manual Override"}
            </button>
          </div>

          {/* Optional Manual Override Box */}
          {isManualOverride && (
            <div style={{
              padding: "10px 12px",
              borderRadius: "12px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400e" }}>
                Manual Rate Override (Active)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label style={{ fontSize: "10px", fontWeight: 600, color: "#78350f", display: "block" }}>
                    1 JPY in BDT
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={customJpy}
                    onChange={(e) => setCustomJpy(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "1px solid #fcd34d",
                      background: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 700,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "10px", fontWeight: 600, color: "#78350f", display: "block" }}>
                    1 USD in BDT
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={customUsd}
                    onChange={(e) => setCustomUsd(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "1px solid #fcd34d",
                      background: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 700,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Triple-Currency Summary Pill */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
            padding: "9px 10px",
            background: "#f1f5f9",
            borderRadius: "12px",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "9.5px", color: "#64748b", fontWeight: 700 }}>YEN (JPY)</div>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#0f172a" }}>
                ¥{formatNumber(convertAmount(parsedAmount, fromCurrency, "JPY"), "JPY")}
              </div>
            </div>
            <div style={{ textAlign: "center", borderLeft: "1px solid #cbd5e1", borderRight: "1px solid #cbd5e1" }}>
              <div style={{ fontSize: "9.5px", color: "#64748b", fontWeight: 700 }}>TAKA (BDT)</div>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#0f172a" }}>
                ৳{formatNumber(convertAmount(parsedAmount, fromCurrency, "BDT"), "BDT")}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "9.5px", color: "#64748b", fontWeight: 700 }}>DOLLAR (USD)</div>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#0f172a" }}>
                ${formatNumber(convertAmount(parsedAmount, fromCurrency, "USD"), "USD")}
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: "10px 24px 14px 24px",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fafafa",
        }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: 600 }}>
              Live: ¥1 = ৳{activeJpyRate.toFixed(3)} • $1 = ৳{activeUsdRate.toFixed(2)}
            </span>
            <span style={{ fontSize: "9.5px", color: "#94a3b8" }}>
              Source: {rates.source}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              fontSize: "11.5px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

const presetBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: "5px 6px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  color: "#334155",
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.15s ease",
};
