import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import { connection } from "next/server";

export const instant = false;

export default async function AdminReportPage() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/admin/login");
  }
  await connection();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthStart = new Date(currentYear, currentMonth, 1);

  // Gather All Data
  const [
    totalRevenueAgg,
    monthlySalesResult,
    totalSales,
    totalInquiries,
    totalPreOrders,
    vehicles,
    showroomCount,
    portCount,
    transitCount,
    reservedCount,
    soldCount,
    stockInward,
    sales,
    inventoryValueAgg,
    inwardInvestAgg
  ] = await Promise.all([
    prisma.sale.aggregate({
      _sum: { sale_price_bdt: true },
      where: { payment_status: { in: ["cleared", "lc_settlement"] } }
    }),
    prisma.sale.aggregate({
      _count: { id: true },
      _sum: { sale_price_bdt: true },
      where: {
        sale_date: { gte: currentMonthStart },
        payment_status: { in: ["cleared", "lc_settlement"] }
      }
    }),
    prisma.sale.count(),
    prisma.inquiry.count(),
    prisma.preOrder.count(),
    prisma.vehicle.findMany({ orderBy: [{ status: "asc" }, { created_at: "desc" }] }),
    prisma.vehicle.count({ where: { status: "available" } }),
    prisma.vehicle.count({ where: { status: "port_clearance" } }),
    prisma.vehicle.count({ where: { status: "vessel_transit" } }),
    prisma.vehicle.count({ where: { status: "reserved" } }),
    prisma.vehicle.count({ where: { status: "sold" } }),
    prisma.stockInward.findMany({ orderBy: { created_at: "desc" } }),
    prisma.sale.findMany({ orderBy: { sale_date: "desc" } }),
    prisma.vehicle.aggregate({
      _sum: { price_bdt: true },
      where: { status: { not: "sold" } }
    }),
    prisma.stockInward.aggregate({
      _sum: { bdt_equivalent: true }
    })
  ]);

  const totalRevenue = Number(totalRevenueAgg._sum.sale_price_bdt || 0);
  const monthlyRevenue = Number(monthlySalesResult._sum.sale_price_bdt || 0);
  const monthlyUnits = monthlySalesResult._count.id;
  const inventoryValue = Number(inventoryValueAgg._sum.price_bdt || 0);
  const inwardInvest = Number(inwardInvestAgg._sum.bdt_equivalent || 0);

  const reportDate = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const totalSalesValue = sales.reduce((acc, s) => acc + Number(s.sale_price_bdt || 0), 0);

  return (
    <div style={{ background: "#fff", color: "#1a1a1a", minHeight: "100vh", padding: "24px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", fontSize: "11px", lineHeight: 1.5 }}>
      <style>{`
        @media print {
          body { padding: 0 !important; background: #fff !important; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
        .print-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background: #c0392b;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .print-btn:hover { background: #a93226; }
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #1a1a1a;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .report-header h1 { font-size: 22px; font-weight: 800; margin: 0; }
        .report-header .subtitle { font-size: 12px; color: #666; margin-top: 4px; }
        .report-header .date { font-size: 11px; color: #666; text-align: right; }
        .report-header .confidential {
          font-size: 10px;
          color: #c0392b;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #c0392b;
          margin: 24px 0 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid #ddd;
        }
        .kpi-grid-report {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .kpi-box-report {
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 12px;
          text-align: center;
        }
        .kpi-box-report .label { font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .kpi-box-report .value { font-size: 18px; font-weight: 800; color: #1a1a1a; margin-top: 4px; }
        .kpi-box-report .sub { font-size: 10px; color: #666; margin-top: 2px; }
        table.report-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
          font-size: 10px;
        }
        table.report-table th {
          background: #f5f5f5;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 9px;
          letter-spacing: 0.03em;
          padding: 8px 6px;
          text-align: left;
          border-bottom: 2px solid #ddd;
        }
        table.report-table td {
          padding: 7px 6px;
          border-bottom: 1px solid #eee;
        }
        table.report-table tr:nth-child(even) { background: #fafafa; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .fw-bold { font-weight: 700; }
        .status-pill-report {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .s-available { background: #d4edda; color: #155724; }
        .s-port { background: #fff3cd; color: #856404; }
        .s-transit { background: #d1ecf1; color: #0c5460; }
        .s-reserved { background: #e2e3f1; color: #383d6e; }
        .s-sold { background: #f8d7da; color: #721c24; }
        .s-cleared { background: #d4edda; color: #155724; }
        .summary-row-report {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px dotted #ddd;
          font-size: 11px;
        }
        .summary-row-report .label { color: #666; }
        .summary-row-report .value { font-weight: 700; }
        .footer-note-report {
          margin-top: 32px;
          padding-top: 12px;
          border-top: 1px solid #ddd;
          font-size: 9px;
          color: #999;
          text-align: center;
        }
      `}</style>

      {/* Print Button (Client trigger via inline script or anchor) */}
      <a 
        href="javascript:window.print()" 
        className="print-btn no-print" 
        style={{ textDecoration: "none", display: "inline-block" }}
      >
        📄 Save as PDF / Print
      </a>

      {/* Report Header */}
      <div className="report-header">
        <div>
          <h1>Good Car Imports</h1>
          <div className="subtitle">Full Business Report — Financial Summary, Inventory & Stock Pipeline</div>
        </div>
        <div>
          <div className="date">Generated: {reportDate}</div>
          <div className="confidential">Confidential — Internal Use Only</div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="section-title">Key Performance Indicators</div>
      <div className="kpi-grid-report">
        <div className="kpi-box-report">
          <div className="label">Total Gross Revenue</div>
          <div className="value">{formatBDT(totalRevenue, true)}</div>
          <div className="sub">{totalSales} total sales</div>
        </div>
        <div className="kpi-box-report">
          <div className="label">Monthly Revenue ({now.toLocaleDateString("en-US", { month: "short", year: "numeric" })})</div>
          <div className="value">{formatBDT(monthlyRevenue, true)}</div>
          <div className="sub">{monthlyUnits} units sold</div>
        </div>
        <div className="kpi-box-report">
          <div className="label">Inventory Value (Asking)</div>
          <div className="value">{formatBDT(inventoryValue, true)}</div>
          <div className="sub">{vehicles.length - soldCount} active units</div>
        </div>
        <div className="kpi-box-report">
          <div className="label">Inward Pipeline Investment</div>
          <div className="value">{formatBDT(inwardInvest, true)}</div>
          <div className="sub">{stockInward.length} vehicles in pipeline</div>
        </div>
      </div>

      <div className="kpi-grid-report" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        <div className="kpi-box-report">
          <div className="label">Showroom</div>
          <div className="value">{showroomCount}</div>
        </div>
        <div className="kpi-box-report">
          <div className="label">Port Clearance</div>
          <div className="value">{portCount}</div>
        </div>
        <div className="kpi-box-report">
          <div className="label">In Transit</div>
          <div className="value">{transitCount}</div>
        </div>
        <div className="kpi-box-report">
          <div className="label">Reserved</div>
          <div className="value">{reservedCount}</div>
        </div>
        <div className="kpi-box-report">
          <div className="label">Total Sold</div>
          <div className="value">{soldCount}</div>
        </div>
      </div>

      {/* Live Inventory */}
      <div className="section-title">Live Inventory & Fleet</div>
      <table className="report-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Car Name</th>
            <th>Chassis Code</th>
            <th>YOM</th>
            <th>Mileage</th>
            <th>Grade</th>
            <th>Fuel</th>
            <th>Status</th>
            <th className="text-right">Asking Price (BDT)</th>
            <th className="text-center">Featured</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v, i) => {
            const statusMap: Record<string, string> = {
              available: "s-available",
              port_clearance: "s-port",
              vessel_transit: "s-transit",
              reserved: "s-reserved",
              sold: "s-sold",
            };
            const statusLabels: Record<string, string> = {
              available: "Available",
              port_clearance: "Port",
              vessel_transit: "Transit",
              reserved: "Reserved",
              sold: "Sold",
            };
            return (
              <tr key={v.id}>
                <td>{i + 1}</td>
                <td className="fw-bold">{v.car_name} {v.package_trim ? `(${v.package_trim})` : ""}</td>
                <td style={{ fontFamily: "monospace" }}>{v.chassis_code}</td>
                <td>{v.year_of_manufacture}</td>
                <td>{new Intl.NumberFormat("en-IN").format(v.mileage_km || 0)} km</td>
                <td>{v.auction_grade || "N/A"}</td>
                <td>{v.fuel_type || ""}</td>
                <td>
                  <span className={`status-pill-report ${statusMap[v.status] || ""}`}>
                    {statusLabels[v.status] || v.status}
                  </span>
                </td>
                <td className="text-right fw-bold">{v.price_bdt ? formatBDT(Number(v.price_bdt)) : "—"}</td>
                <td className="text-center">{v.is_featured ? "★" : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Stock Inward Pipeline */}
      <div className="page-break"></div>
      <div className="section-title">Stock Inward Pipeline (Auction → Delivery)</div>
      <table className="report-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Car Name</th>
            <th>Chassis Code</th>
            <th>YOM</th>
            <th>Grade</th>
            <th>Won Price (JPY)</th>
            <th className="text-right">BDT Equivalent</th>
            <th>Stage</th>
            <th>Date Added</th>
          </tr>
        </thead>
        <tbody>
          {stockInward.map((si, i) => {
            const stageLabels: Record<string, string> = {
              auction_won: "Auction Won",
              japan_yard: "Export Yard",
              sea_transit: "Sea Transit",
              ctg_customs: "CTG Customs",
              dhaka_handover: "Handover",
            };
            return (
              <tr key={si.id}>
                <td>{i + 1}</td>
                <td className="fw-bold">{si.car_name} {si.package_trim ? `(${si.package_trim})` : ""}</td>
                <td style={{ fontFamily: "monospace" }}>{si.chassis_code}</td>
                <td>{si.year_of_manufacture}</td>
                <td>{si.auction_grade || "N/A"}</td>
                <td>¥{new Intl.NumberFormat("en-IN").format(Number(si.won_price_jpy || 0))}</td>
                <td className="text-right fw-bold">৳{new Intl.NumberFormat("en-IN").format(Number(si.bdt_equivalent || 0))}</td>
                <td>{stageLabels[si.current_stage] || si.current_stage}</td>
                <td>{new Date(si.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Sales Register */}
      <div className="section-title">Sales Register — All Delivered & Cleared</div>
      <table className="report-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Car Name</th>
            <th>Chassis Code</th>
            <th>Client Area</th>
            <th>Sale Date</th>
            <th>Payment</th>
            <th className="text-right">Sale Price (BDT)</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s, i) => (
            <tr key={s.id}>
              <td>{i + 1}</td>
              <td className="fw-bold">{s.car_name}</td>
              <td style={{ fontFamily: "monospace" }}>{s.chassis_code || "N/A"}</td>
              <td>{s.client_area || "Direct Sale"}</td>
              <td>{s.sale_date ? new Date(s.sale_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
              <td><span className="status-pill-report s-cleared">{(s.payment_status || "pending").toUpperCase()}</span></td>
              <td className="text-right fw-bold">{s.sale_price_bdt ? formatBDT(Number(s.sale_price_bdt)) : "—"}</td>
            </tr>
          ))}
          <tr style={{ borderTop: "2px solid #1a1a1a", background: "#f5f5f5" }}>
            <td colSpan={6} className="text-right fw-bold" style={{ fontSize: "11px" }}>TOTAL SALES VALUE</td>
            <td className="text-right fw-bold" style={{ fontSize: "12px" }}>{formatBDT(totalSalesValue)}</td>
          </tr>
        </tbody>
      </table>

      {/* Inquiries & Pre-Orders Summary */}
      <div className="section-title">Leads Summary</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div>
          <div className="summary-row-report">
            <span className="label">Total Contact Inquiries</span>
            <span className="value">{totalInquiries}</span>
          </div>
          <div className="summary-row-report">
            <span className="label">Total Pre-Order Requests</span>
            <span className="value">{totalPreOrders}</span>
          </div>
          <div className="summary-row-report">
            <span className="label">Combined Leads</span>
            <span className="value">{totalInquiries + totalPreOrders}</span>
          </div>
        </div>
        <div>
          <div className="summary-row-report">
            <span className="label">Active Inventory Units</span>
            <span className="value">{vehicles.length - soldCount}</span>
          </div>
          <div className="summary-row-report">
            <span className="label">Inward Pipeline Units</span>
            <span className="value">{stockInward.length}</span>
          </div>
          <div className="summary-row-report">
            <span className="label">Total Vehicles Managed</span>
            <span className="value">{vehicles.length + stockInward.length}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer-note-report">
        This report was auto-generated by Good Car Imports Executive Portal on {reportDate}.<br />
        This document is confidential and intended for internal use only. Do not distribute without authorization.
      </div>
    </div>
  );
}
