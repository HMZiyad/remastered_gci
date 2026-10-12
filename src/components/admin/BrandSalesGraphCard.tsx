"use client";

import { useState } from "react";
import Link from "next/link";

export interface BrandSalesSummary {
  brand: string;           // "Toyota", "Nissan", "Honda"
  totalSold: number;
  totalRevenueBdt: number;
  color: string;
  monthlyPoints: number[]; // 6 monthly values
}

export interface BrandGraphData {
  topBrands: BrandSalesSummary[];
  months: string[]; // ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]
  totalSalesCount: number;
}

export function BrandSalesGraphCard({ data }: { data: BrandGraphData }) {
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [hoveredPoint, setHoveredPoint] = useState<{
    brand: string;
    month: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const { topBrands, months, totalSalesCount } = data;

  // Chart dimensions
  const svgWidth = 600;
  const svgHeight = 150;
  const paddingLeft = 32;
  const paddingRight = 20;
  const paddingTop = 18;
  const paddingBottom = 26;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  // Find max value across all points to scale Y axis
  let maxVal = 1;
  topBrands.forEach((b) => {
    b.monthlyPoints.forEach((v) => {
      if (v > maxVal) maxVal = v;
    });
  });
  // Add some breathing room on Y axis
  const yDomainMax = Math.max(maxVal, 3);

  // Compute X and Y positions
  const getX = (idx: number) => {
    if (months.length <= 1) return paddingLeft + chartW / 2;
    return paddingLeft + (idx / (months.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    return paddingTop + chartH - (val / yDomainMax) * chartH;
  };

  // Helper for smooth bezier line
  const getSmoothPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const leadingBrand = topBrands[0];

  return (
    <div className="brand-sales-card">
      {/* Header */}
      <div className="brand-sales-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <span className="logistics-card-badge" style={{ color: "#2563eb" }}>
            SALES VELOCITY
          </span>
          <h3 className="logistics-card-title" style={{ marginTop: "2px", fontSize: "17px" }}>
            Most Sold Car Brands
          </h3>
          <p style={{ margin: "2px 0 0 0", fontSize: "11.5px", color: "var(--admin-text-muted)" }}>
            Last {months.length} months delivery volume by vehicle brand
          </p>
        </div>

        {leadingBrand && (
          <div className="brand-leading-badge" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            background: "rgba(37, 99, 235, 0.08)",
            padding: "6px 12px",
            borderRadius: "12px",
            border: "1px solid rgba(37, 99, 235, 0.15)",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" }}>
              #1 Top Brand
            </span>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
              {leadingBrand.brand}
            </span>
          </div>
        )}
      </div>

      {/* Brand Filter Pills */}
      <div style={{
        display: "flex",
        gap: "6px",
        overflowX: "auto",
        paddingBottom: "2px",
      }}>
        <button
          type="button"
          onClick={() => { setSelectedBrand("all"); setHoveredPoint(null); }}
          style={{
            padding: "5px 12px",
            borderRadius: "8px",
            fontSize: "11.5px",
            fontWeight: 700,
            border: selectedBrand === "all" ? "1.5px solid #0f172a" : "1px solid #e2e8f0",
            background: selectedBrand === "all" ? "#0f172a" : "#f8fafc",
            color: selectedBrand === "all" ? "#ffffff" : "#475569",
            cursor: "pointer",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
        >
          All Brands ({totalSalesCount})
        </button>

        {topBrands.map((b) => {
          const isSelected = selectedBrand.toLowerCase() === b.brand.toLowerCase();
          return (
            <button
              key={b.brand}
              type="button"
              onClick={() => { setSelectedBrand(b.brand); setHoveredPoint(null); }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "8px",
                fontSize: "11.5px",
                fontWeight: 700,
                border: isSelected ? `1.5px solid ${b.color}` : "1px solid #e2e8f0",
                background: isSelected ? b.color : "#ffffff",
                color: isSelected ? "#ffffff" : "#334155",
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: isSelected ? "#ffffff" : b.color,
              }}></span>
              <span>{b.brand}</span>
              <span style={{
                fontSize: "10.5px",
                opacity: 0.85,
                fontWeight: 600,
              }}>
                ({b.totalSold})
              </span>
            </button>
          );
        })}
      </div>

      {/* SVG Line Graph */}
      <div style={{ position: "relative", width: "100%", height: `${svgHeight}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          style={{ overflow: "visible" }}
        >
          <defs>
            {topBrands.map((b) => (
              <linearGradient key={`grad-${b.brand}`} id={`grad-${b.brand}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={b.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={b.color} stopOpacity="0.0" />
              </linearGradient>
            ))}
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = paddingTop + chartH * ratio;
            const valLabel = Math.round(yDomainMax * (1 - ratio));
            return (
              <g key={`grid-${idx}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="600"
                  fill="#94a3b8"
                >
                  {valLabel}
                </text>
              </g>
            );
          })}

          {/* X Axis Month Labels */}
          {months.map((m, idx) => {
            const x = getX(idx);
            return (
              <text
                key={m}
                x={x}
                y={svgHeight - 6}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="600"
                fill="#64748b"
              >
                {m}
              </text>
            );
          })}

          {/* Render Lines for Brands */}
          {topBrands
            .filter((b) => selectedBrand === "all" || selectedBrand.toLowerCase() === b.brand.toLowerCase())
            .map((b) => {
              const points = b.monthlyPoints.map((val, idx) => ({
                x: getX(idx),
                y: getY(val),
              }));

              const linePath = getSmoothPath(points);

              // Area path for gradient fill under the line
              const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartH} L ${points[0].x} ${paddingTop + chartH} Z`;

              return (
                <g key={b.brand}>
                  {/* Gradient Area Fill */}
                  <path
                    d={areaPath}
                    fill={`url(#grad-${b.brand})`}
                    style={{ transition: "all 0.3s ease" }}
                  />

                  {/* The Line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke={b.color}
                    strokeWidth={selectedBrand.toLowerCase() === b.brand.toLowerCase() ? "3.5" : "2.5"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transition: "all 0.3s ease" }}
                  />

                  {/* Point circles */}
                  {points.map((pt, idx) => {
                    const isHovered =
                      hoveredPoint?.brand.toLowerCase() === b.brand.toLowerCase() &&
                      hoveredPoint?.month === months[idx];

                    return (
                      <g key={`${b.brand}-${idx}`}>
                        {/* Invisible larger hover target */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="12"
                          fill="transparent"
                          cursor="pointer"
                          onMouseEnter={() => {
                            setHoveredPoint({
                              brand: b.brand,
                              month: months[idx],
                              value: b.monthlyPoints[idx],
                              x: pt.x,
                              y: pt.y,
                            });
                          }}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />

                        {/* Visible circle marker */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? "6" : "4"}
                          fill="#ffffff"
                          stroke={b.color}
                          strokeWidth={isHovered ? "3.5" : "2.5"}
                          pointerEvents="none"
                          style={{
                            transition: "all 0.15s ease",
                            filter: isHovered
                              ? "drop-shadow(0 2px 5px rgba(0,0,0,0.25))"
                              : "none",
                          }}
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredPoint && (
          <div style={{
            position: "absolute",
            left: `${Math.min(Math.max(hoveredPoint.x - 45, 10), svgWidth - 110)}px`,
            top: `${Math.max(hoveredPoint.y - 48, 0)}px`,
            background: "#0f172a",
            color: "#ffffff",
            padding: "5px 10px",
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: 700,
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.3)",
            whiteSpace: "nowrap",
            zIndex: 10,
            transform: "translateX(-15%)",
          }}>
            <div style={{ color: "#94a3b8", fontSize: "10px", fontWeight: 600 }}>
              {hoveredPoint.month} • {hoveredPoint.brand}
            </div>
            <div style={{ color: "#38bdf8", fontSize: "12px", fontWeight: 800 }}>
              {hoveredPoint.value} {hoveredPoint.value === 1 ? "vehicle" : "vehicles"} sold
            </div>
          </div>
        )}
      </div>

      {/* Brand Rank Summary Cards */}
      <div className="brand-rank-summary-grid" style={{
        display: "grid",
        gap: "8px",
        paddingTop: "6px",
        borderTop: "1px solid var(--admin-border-subtle)",
      }}>
        {topBrands.slice(0, 3).map((b, idx) => {
          const isCardActive = selectedBrand.toLowerCase() === b.brand.toLowerCase();
          const share = totalSalesCount > 0 ? Math.round((b.totalSold / totalSalesCount) * 100) : 0;
          return (
            <div
              key={b.brand}
              onClick={() => setSelectedBrand(isCardActive ? "all" : b.brand)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                borderRadius: "10px",
                background: isCardActive ? "rgba(37, 99, 235, 0.08)" : "var(--admin-subcard)",
                border: isCardActive ? "1px solid #2563eb" : "1px solid var(--admin-border-subtle)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                background: b.color,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10.5px",
                fontWeight: 800,
                flexShrink: 0,
              }}>
                #{idx + 1}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: "12.5px",
                  fontWeight: 700,
                  color: "var(--admin-text-main)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {b.brand}
                </div>
                <div style={{ fontSize: "10.5px", color: "var(--admin-text-muted)", fontWeight: 600 }}>
                  {b.totalSold} sold • {share}%
                </div>
              </div>
            </div>
          );
        })}

        {topBrands.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "8px 0", color: "var(--admin-text-muted)", fontSize: "12px" }}>
            No vehicle sales recorded yet.
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="brand-card-footer" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: "4px",
        flexWrap: "wrap",
        gap: "8px",
      }}>
        <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
          Data mapped from live delivered sales ledger
        </span>
        <Link
          href="/admin/sales-register"
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
          <span>Sales Register</span>
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
