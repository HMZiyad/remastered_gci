import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatBDT } from "@/lib/utils";
import { connection } from "next/server";
import { EditStockInwardButton } from "@/components/admin/EditStockInwardButton";

export const instant = false;

export default async function AdminStockInwardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connection();
  const resolvedParams = await searchParams;
  const stageFilter = typeof resolvedParams.stage === "string" ? resolvedParams.stage : "all";

  // Build WHERE clause
  const where: any = {};
  if (stageFilter !== "all") {
    if (stageFilter === "awaiting_vessel") {
      where.current_stage = { in: ["auction_won", "japan_yard"] };
    } else {
      where.current_stage = stageFilter;
    }
  }

  // Fetch KPI Counts
  const [
    totalInward,
    seaTransit,
    ctgCustoms,
    japanYard,
    awaitingVessel,
    totalValueAgg
  ] = await Promise.all([
    prisma.stockInward.count(),
    prisma.stockInward.count({ where: { current_stage: "sea_transit" } }),
    prisma.stockInward.count({ where: { current_stage: "ctg_customs" } }),
    prisma.stockInward.count({ where: { current_stage: "japan_yard" } }),
    prisma.stockInward.count({ where: { current_stage: { in: ["auction_won", "japan_yard"] } } }),
    prisma.stockInward.aggregate({
      _sum: { bdt_equivalent: true }
    })
  ]);

  const totalValue = Number(totalValueAgg._sum.bdt_equivalent || 0);

  // Fetch Data
  const records = await prisma.stockInward.findMany({
    where,
    orderBy: { created_at: "desc" },
  });

  const getInwardStageBadge = (stage: string) => {
    switch (stage) {
      case 'auction_won':
        return <span className="pill-badge available">Auction Won</span>;
      case 'japan_yard':
        return <span className="pill-badge transit">Japan Export Yard</span>;
      case 'sea_transit':
        return <span className="pill-badge transit">Sea Transit (Afloat)</span>;
      case 'ctg_customs':
        return <span className="pill-badge port">Customs Clearance</span>;
      case 'dhaka_handover':
        return <span className="pill-badge reserved">Ready for Handover</span>;
      default:
        return <span className="pill-badge sold">{stage}</span>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Modern KPI Grid */}
      <div className="modern-kpi-grid">
        <div className="modern-kpi-card">
          <div className="modern-kpi-header">
            <span className="modern-kpi-title">INWARD PIPELINE</span>
            <div className="modern-kpi-icon-circle">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>account_tree</span>
            </div>
          </div>
          <div className="modern-kpi-value">{totalInward} <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--admin-text-muted)" }}>Units</span></div>
          <div className="modern-kpi-sub" style={{ color: "var(--admin-accent-blue)", fontWeight: 600 }}>
            ৳{(totalValue / 100000).toFixed(1)}L Total Valuation
          </div>
        </div>
        
        <div className="modern-kpi-card">
          <div className="modern-kpi-header">
            <span className="modern-kpi-title">SEA TRANSIT</span>
            <div className="modern-kpi-icon-circle">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>directions_boat</span>
            </div>
          </div>
          <div className="modern-kpi-value">{seaTransit} <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--admin-text-muted)" }}>Afloat</span></div>
          <div className="modern-kpi-sub">Next ETA: Oct 23, 2026</div>
        </div>

        <div className="modern-kpi-card">
          <div className="modern-kpi-header">
            <span className="modern-kpi-title">CHITTAGONG CUSTOMS</span>
            <div className="modern-kpi-icon-circle">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>warehouse</span>
            </div>
          </div>
          <div className="modern-kpi-value">{ctgCustoms} <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--admin-text-muted)" }}>In Yard</span></div>
          <div className="modern-kpi-sub" style={{ color: "var(--admin-accent-amber)", fontWeight: 600 }}>Awaiting assessment</div>
        </div>

        <div className="modern-kpi-card">
          <div className="modern-kpi-header">
            <span className="modern-kpi-title">JAPAN YARD</span>
            <div className="modern-kpi-icon-circle">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>flag</span>
            </div>
          </div>
          <div className="modern-kpi-value">{japanYard} <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--admin-text-muted)" }}>Pre-export</span></div>
          <div className="modern-kpi-sub">Pending JAAI inspection</div>
        </div>
      </div>

      {/* Lifecycle Stepper Card */}
      <div className="pipeline-stepper">
        <div className="pipeline-step completed">
          <div className="step-icon"><span className="material-symbols-outlined">gavel</span></div>
          <div className="step-label">Auction Won</div>
        </div>
        <div className="pipeline-connector active"></div>
        
        <div className="pipeline-step completed">
          <div className="step-icon"><span className="material-symbols-outlined">flag</span></div>
          <div className="step-label">Japan Yard</div>
        </div>
        <div className="pipeline-connector active"></div>
        
        <div className="pipeline-step active">
          <div className="step-icon"><span className="material-symbols-outlined">directions_boat</span></div>
          <div className="step-label">Sea Transit</div>
        </div>
        <div className="pipeline-connector"></div>
        
        <div className="pipeline-step">
          <div className="step-icon"><span className="material-symbols-outlined">warehouse</span></div>
          <div className="step-label">CTG Customs</div>
        </div>
        <div className="pipeline-connector"></div>
        
        <div className="pipeline-step">
          <div className="step-icon"><span className="material-symbols-outlined">storefront</span></div>
          <div className="step-label">Hub Handover</div>
        </div>
      </div>

      {/* Table Container */}
      <div className="modern-table-container">
        <div className="modern-table-toolbar">
          {/* Mobile Top Header: Title & Compact Action */}
          <div className="toolbar-header-row">
            <div className="toolbar-title-group">
              <span className="toolbar-title">Inward Pipeline</span>
              <span className="toolbar-count-badge">{totalInward} Records</span>
            </div>
            <Link href="?modal=add-stock-inward" className="btn-modern-primary toolbar-add-btn">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
              <span>Add Inward</span>
            </Link>
          </div>

          {/* Filter Pills */}
          <div className="filter-pills-row">
            <Link 
              href="/admin/stock-inward?stage=all" 
              className={`filter-pill-item ${stageFilter === 'all' ? 'active' : ''}`}
            >
              All Inward <span className="filter-pill-count">{totalInward}</span>
            </Link>
            <Link 
              href="/admin/stock-inward?stage=sea_transit" 
              className={`filter-pill-item ${stageFilter === 'sea_transit' ? 'active' : ''}`}
            >
              Sea Transit <span className="filter-pill-count">{seaTransit}</span>
            </Link>
            <Link 
              href="/admin/stock-inward?stage=ctg_customs" 
              className={`filter-pill-item ${stageFilter === 'ctg_customs' ? 'active' : ''}`}
            >
              Chittagong Customs <span className="filter-pill-count">{ctgCustoms}</span>
            </Link>
            <Link 
              href="/admin/stock-inward?stage=awaiting_vessel" 
              className={`filter-pill-item ${stageFilter === 'awaiting_vessel' ? 'active' : ''}`}
            >
              Awaiting Vessel <span className="filter-pill-count">{awaitingVessel}</span>
            </Link>
          </div>
          
          {/* Desktop Action Button */}
          <div className="toolbar-desktop-actions">
            <Link href="?modal=add-stock-inward" className="btn-modern-primary">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
              <span>Add Stock Inward</span>
            </Link>
          </div>
        </div>

        {/* 1. Desktop / Tablet Table View (hidden on mobile <= 768px) */}
        <div className="stock-inward-desktop-table" style={{ overflowX: "auto" }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: "260px" }}>VEHICLE & CHASSIS</th>
                <th>AUCTION SOURCE</th>
                <th>VALUATION (JPY / BDT)</th>
                <th>LOGISTICS STATUS</th>
                <th>DOCUMENTS</th>
                <th style={{ textAlign: "right" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r: any) => {
                const words = r.car_name.split(' ');
                const firstLine = words.slice(0, 3).join(' ');
                const secondLine = words.slice(3).join(' ');
                
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--admin-text-main)", marginBottom: "3px", textTransform: "uppercase" }}>
                        {firstLine} {secondLine}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                        {r.year_of_manufacture} • {r.color_name} • {r.package_trim}
                      </div>
                      <span className="chassis-tag">{r.chassis_code}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, textTransform: "uppercase" }}>{r.auction_house}</div>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>Lot: {r.auction_lot}</div>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>Grade: {r.auction_grade}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: "var(--admin-accent-blue)" }}>
                        ¥{new Intl.NumberFormat('en-IN').format(Number(r.won_price_jpy || 0))}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>
                        ≈ ৳{new Intl.NumberFormat('en-IN').format(Number(r.bdt_equivalent || 0))}
                      </div>
                    </td>
                    <td>
                      <div style={{ marginBottom: "6px" }}>
                        {getInwardStageBadge(r.current_stage)}
                      </div>
                      {r.vessel_name && (
                        <div style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "12px", verticalAlign: "middle" }}>directions_boat</span> {r.vessel_name}
                          <br />ETA: {r.eta_date ? r.eta_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11px", fontWeight: 600 }}>
                        {r.jaai_cert ? (
                          <span style={{ color: "var(--admin-accent-green)" }}><span className="material-symbols-outlined" style={{ fontSize: "13px", verticalAlign: "middle" }}>check_circle</span> JAAI Certificate</span>
                        ) : (
                          <span style={{ color: "var(--admin-text-light)" }}><span className="material-symbols-outlined" style={{ fontSize: "13px", verticalAlign: "middle" }}>cancel</span> JAAI Pending</span>
                        )}
                        {r.bill_of_lading ? (
                          <span style={{ color: "var(--admin-accent-green)" }}><span className="material-symbols-outlined" style={{ fontSize: "13px", verticalAlign: "middle" }}>check_circle</span> Bill of Lading</span>
                        ) : (
                          <span style={{ color: "var(--admin-text-light)" }}><span className="material-symbols-outlined" style={{ fontSize: "13px", verticalAlign: "middle" }}>cancel</span> B/L Pending</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <EditStockInwardButton recordId={r.id} />
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "var(--admin-text-muted)" }}>
                    No records found for the selected stage.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 2. Mobile Cards View (displayed on mobile screens <= 768px) */}
        <div className="stock-inward-mobile-cards">
          {records.map((r: any) => (
            <div key={`mob-si-${r.id}`} className="responsive-mobile-card">
              <div className="res-card-top">
                <div className="res-card-main-meta">
                  <div className="res-card-title">{r.car_name}</div>
                  <div className="res-card-sub-line">
                    <span className="fw-bold">{r.year_of_manufacture || "—"}</span>
                    {r.color_name && <span>• {r.color_name}</span>}
                    {r.package_trim && <span>• {r.package_trim}</span>}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {getInwardStageBadge(r.current_stage)}
                </div>
              </div>

              {/* Tag row */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "10px 0" }}>
                <span className="chassis-tag">{r.chassis_code}</span>
                {r.auction_house && (
                  <span className="res-tag-pill">{r.auction_house} Lot #{r.auction_lot || "—"}</span>
                )}
                {r.auction_grade && (
                  <span className="res-tag-pill">Grade {r.auction_grade}</span>
                )}
              </div>

              {/* Valuation & Logistics Grid */}
              <div className="res-card-chips-grid">
                <div className="res-chip">
                  <span className="res-chip-label">WON PRICE (JPY)</span>
                  <span className="res-chip-val font-bold" style={{ color: "var(--admin-accent-blue)" }}>
                    ¥{new Intl.NumberFormat('en-IN').format(Number(r.won_price_jpy || 0))}
                  </span>
                </div>
                <div className="res-chip">
                  <span className="res-chip-label">BDT EQUIVALENT</span>
                  <span className="res-chip-val font-bold" style={{ color: "var(--admin-accent-green)" }}>
                    ৳{new Intl.NumberFormat('en-IN').format(Number(r.bdt_equivalent || 0))}
                  </span>
                </div>
                {r.vessel_name && (
                  <div className="res-chip" style={{ gridColumn: "1 / -1" }}>
                    <span className="res-chip-label">VESSEL & ETA</span>
                    <span className="res-chip-val" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>directions_boat</span>
                      {r.vessel_name} • ETA: {r.eta_date ? r.eta_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                    </span>
                  </div>
                )}
              </div>

              {/* Documents status */}
              <div style={{ display: "flex", gap: "8px", margin: "10px 0", flexWrap: "wrap" }}>
                <span className={`si-doc-chip ${r.jaai_cert ? "complete" : "pending"}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
                    {r.jaai_cert ? "check_circle" : "cancel"}
                  </span>
                  <span>JAAI {r.jaai_cert ? "Certified" : "Pending"}</span>
                </span>
                <span className={`si-doc-chip ${r.bill_of_lading ? "complete" : "pending"}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
                    {r.bill_of_lading ? "check_circle" : "cancel"}
                  </span>
                  <span>B/L {r.bill_of_lading ? "Received" : "Pending"}</span>
                </span>
              </div>

              {/* Action footer */}
              <div className="res-card-actions">
                <div style={{ marginLeft: "auto" }}>
                  <EditStockInwardButton recordId={r.id} />
                </div>
              </div>
            </div>
          ))}

          {records.length === 0 && (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--admin-text-muted)" }}>
              No records found for the selected stage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
