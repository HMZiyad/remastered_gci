"use client";

import { useState } from "react";
import Link from "next/link";

export interface BusinessAnalyticsData {
  // Available vs Sold
  availableCount: number;
  soldCount: number;
  reservedCount: number;

  // Stock vs Incoming
  showroomCount: number;
  portCount: number;
  transitCount: number;
  incomingInwardCount: number;

  // Fuel types
  fuelBreakdown: Array<{ name: string; count: number; color: string }>;
}

type TabType = "available_vs_sold" | "stock_vs_incoming" | "fuel_type";

interface Segment {
  label: string;
  value: number;
  color: string;
}

export function BusinessAnalyticsCard({ data }: { data: BusinessAnalyticsData }) {
  const [activeTab, setActiveTab] = useState<TabType>("available_vs_sold");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Define segments according to active tab
  let segments: Segment[] = [];
  let centerMainText = "";
  let centerSubText = "";

  if (activeTab === "available_vs_sold") {
    segments = [
      { label: "Delivered / Sold", value: data.soldCount, color: "#10b981" },
      { label: "Showroom Available", value: data.availableCount, color: "#2563eb" },
      { label: "Reserved / Pre-Booked", value: data.reservedCount, color: "#f59e0b" },
    ].filter((s) => s.value > 0);

    const total = data.soldCount + data.availableCount + data.reservedCount;
    const soldRatio = total > 0 ? Math.round((data.soldCount / total) * 100) : 0;
    centerMainText = `${soldRatio}%`;
    centerSubText = "Delivered Ratio";
  } else if (activeTab === "stock_vs_incoming") {
    segments = [
      { label: "Showroom Ready", value: data.showroomCount, color: "#2563eb" },
      { label: "Port Customs (CTG)", value: data.portCount, color: "#f59e0b" },
      { label: "Sea Transit Afloat", value: data.transitCount, color: "#8b5cf6" },
      { label: "Japan Pipeline Inward", value: data.incomingInwardCount, color: "#06b6d4" },
    ].filter((s) => s.value > 0);

    const totalStock = data.showroomCount + data.portCount + data.transitCount + data.incomingInwardCount;
    centerMainText = `${totalStock}`;
    centerSubText = "Total Fleet Flow";
  } else {
    segments = data.fuelBreakdown.filter((f) => f.count > 0).map((f) => ({
      label: f.name,
      value: f.count,
      color: f.color,
    }));

    const total = segments.reduce((sum, s) => sum + s.value, 0);
    centerMainText = `${total}`;
    centerSubText = "Tracked Units";
  }

  const totalValue = segments.reduce((sum, s) => sum + s.value, 0);

  // SVG Donut Calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius; // ~339.292
  let accumulatedOffset = 0;

  return (
    <div className="analytics-pie-card">
      {/* Card Header with Tab Switcher */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="analytics-card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <span className="logistics-card-badge" style={{ color: "#2563eb" }}>
              BUSINESS INTELLIGENCE
            </span>
            <h3 className="logistics-card-title" style={{ marginTop: "2px", fontSize: "17px" }}>
              Fleet & Sales Distribution
            </h3>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--admin-text-muted)" }}>
            Live Audit
          </span>
        </div>

        {/* Tab Switcher Pills */}
        <div className="analytics-tab-strip" style={{
          display: "flex",
          gap: "6px",
          background: "var(--admin-subcard)",
          padding: "4px",
          borderRadius: "12px",
          border: "1px solid var(--admin-border-subtle)",
          overflowX: "auto",
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab("available_vs_sold"); setHoveredIdx(null); }}
            style={{
              flex: 1,
              padding: "6px 8px",
              borderRadius: "8px",
              fontSize: "11.5px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              background: activeTab === "available_vs_sold" ? "#ffffff" : "transparent",
              color: activeTab === "available_vs_sold" ? "var(--admin-navy)" : "var(--admin-text-muted)",
              boxShadow: activeTab === "available_vs_sold" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            Available vs Sold
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("stock_vs_incoming"); setHoveredIdx(null); }}
            style={{
              flex: 1,
              padding: "6px 8px",
              borderRadius: "8px",
              fontSize: "11.5px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              background: activeTab === "stock_vs_incoming" ? "#ffffff" : "transparent",
              color: activeTab === "stock_vs_incoming" ? "var(--admin-navy)" : "var(--admin-text-muted)",
              boxShadow: activeTab === "stock_vs_incoming" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            Stock vs Incoming
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("fuel_type"); setHoveredIdx(null); }}
            style={{
              flex: 1,
              padding: "6px 8px",
              borderRadius: "8px",
              fontSize: "11.5px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              background: activeTab === "fuel_type" ? "#ffffff" : "transparent",
              color: activeTab === "fuel_type" ? "var(--admin-navy)" : "var(--admin-text-muted)",
              boxShadow: activeTab === "fuel_type" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            Powertrain
          </button>
        </div>
      </div>

      {/* Chart & Legend Layout */}
      <div className="analytics-donut-legend-grid" style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: "20px",
        alignItems: "center",
        padding: "8px 0",
      }}>
        {/* SVG Donut */}
        <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto" }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Background Empty Ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="16"
            />

            {/* Slices */}
            {totalValue > 0 &&
              segments.map((seg, idx) => {
                const fraction = seg.value / totalValue;
                const arcLength = fraction * circumference;
                const dashArray = `${arcLength} ${circumference - arcLength}`;
                const dashOffset = -accumulatedOffset;
                accumulatedOffset += arcLength;

                const isHovered = hoveredIdx === idx;

                return (
                  <circle
                    key={seg.label}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={isHovered ? "20" : "16"}
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 70 70)"
                    style={{
                      transition: "all 0.25s ease",
                      cursor: "pointer",
                      filter: isHovered ? "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" : "none",
                    }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })}
          </svg>

          {/* Donut Center Label */}
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            textAlign: "center",
          }}>
            <span style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "var(--admin-navy)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}>
              {hoveredIdx !== null ? segments[hoveredIdx]?.value : centerMainText}
            </span>
            <span style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "var(--admin-text-muted)",
              marginTop: "2px",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}>
              {hoveredIdx !== null ? segments[hoveredIdx]?.label : centerSubText}
            </span>
          </div>
        </div>

        {/* Legend List with Progress Indicators */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {segments.length > 0 ? (
            segments.map((seg, idx) => {
              const pct = totalValue > 0 ? Math.round((seg.value / totalValue) * 100) : 0;
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={seg.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    background: isHovered ? "var(--admin-subcard)" : "transparent",
                    transition: "all 0.15s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: seg.color,
                        flexShrink: 0,
                      }}></span>
                      <span style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--admin-text-main)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "110px",
                      }}>
                        {seg.label}
                      </span>
                    </div>

                    <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--admin-navy)" }}>
                      {seg.value} <span style={{ fontSize: "10.5px", color: "var(--admin-text-muted)", fontWeight: 500 }}>({pct}%)</span>
                    </span>
                  </div>

                  {/* Micro Progress Bar */}
                  <div style={{
                    width: "100%",
                    height: "3.5px",
                    background: "#f1f5f9",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: "100%",
                      backgroundColor: seg.color,
                      borderRadius: "4px",
                      transition: "width 0.3s ease",
                    }}></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", padding: "12px 0", textAlign: "center" }}>
              No fleet distribution data yet.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Insights Bar & Navigation */}
      <div className="analytics-card-footer" style={{
        marginTop: "4px",
        paddingTop: "12px",
        borderTop: "1px solid var(--admin-border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "8px",
      }}>
        {activeTab === "available_vs_sold" && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#10b981" }}>verified</span>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)" }}>
              {data.soldCount} Vehicles cleared & delivered
            </span>
          </div>
        )}

        {activeTab === "stock_vs_incoming" && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#2563eb" }}>sync_alt</span>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)" }}>
              {data.portCount + data.transitCount + data.incomingInwardCount} Vehicles in import pipeline
            </span>
          </div>
        )}

        {activeTab === "fuel_type" && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#16a34a" }}>eco</span>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)" }}>
              Japanese hybrid & EV powertrains
            </span>
          </div>
        )}

        <Link
          href={activeTab === "available_vs_sold" ? "/admin/sales-register" : "/admin/stock-inward"}
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--admin-accent-blue)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "2px",
          }}
        >
          <span>Ledger</span>
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
