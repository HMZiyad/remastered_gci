import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import { connection } from "next/server";
import Link from "next/link";
import { BusinessAnalyticsCard } from "@/components/admin/BusinessAnalyticsCard";
import { BrandSalesGraphCard, BrandGraphData, BrandSalesSummary } from "@/components/admin/BrandSalesGraphCard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  await connection();

  // Date Helpers
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentYearStart = new Date(now.getFullYear(), 0, 1);
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

  // 1. Total Revenue (Sales)
  const totalRevenueAgg = await prisma.sale.aggregate({
    _sum: { sale_price_bdt: true },
    where: { payment_status: { in: ['cleared', 'lc_settlement'] } }
  });
  const totalRevenue = Number(totalRevenueAgg._sum.sale_price_bdt || 0);

  // 2. Monthly Sales
  const monthlySalesResult = await prisma.sale.aggregate({
    _sum: { sale_price_bdt: true },
    _count: { id: true },
    where: {
      sale_date: { gte: currentMonthStart },
      payment_status: { in: ['cleared', 'lc_settlement'] }
    }
  });
  const monthlyRevenue = Number(monthlySalesResult._sum.sale_price_bdt || 0);
  const monthlyUnits = monthlySalesResult._count.id;

  // Revenue Growth (Current Year vs Last Year)
  const cyrAgg = await prisma.sale.aggregate({
    _sum: { sale_price_bdt: true },
    where: {
      sale_date: { gte: currentYearStart },
      payment_status: { in: ['cleared', 'lc_settlement'] }
    }
  });
  const lyrAgg = await prisma.sale.aggregate({
    _sum: { sale_price_bdt: true },
    where: {
      sale_date: { gte: lastYearStart, lte: lastYearEnd },
      payment_status: { in: ['cleared', 'lc_settlement'] }
    }
  });
  const currentYearRev = Number(cyrAgg._sum.sale_price_bdt || 0);
  const lastYearRev = Number(lyrAgg._sum.sale_price_bdt || 0);
  const revenueGrowth = lastYearRev === 0 ? (currentYearRev > 0 ? 100 : 0) : ((currentYearRev - lastYearRev) / lastYearRev) * 100;

  // 3. Live Inventory Stock & Analytics
  const [
    stockCount,
    showroomCount,
    portCount,
    transitCount,
    soldCount,
    reservedCount,
    incomingInwardCount,
    fuelCounts
  ] = await Promise.all([
    prisma.vehicle.count({ where: { status: { in: ['available', 'port_clearance', 'vessel_transit'] } } }),
    prisma.vehicle.count({ where: { status: 'available' } }),
    prisma.vehicle.count({ where: { status: 'port_clearance' } }),
    prisma.vehicle.count({ where: { status: 'vessel_transit' } }),
    prisma.vehicle.count({ where: { status: 'sold' } }),
    prisma.vehicle.count({ where: { status: { in: ['reserved', 'pre_booked'] } } }),
    prisma.stockInward.count({ where: { current_stage: { not: 'dhaka_handover' } } }),
    prisma.vehicle.groupBy({ by: ['fuel_type'], _count: { id: true } }),
  ]);

  const fuelColors: Record<string, string> = {
    Hybrid: "#10b981",
    Petrol: "#f97316",
    PHEV: "#3b82f6",
    Electric: "#8b5cf6",
    Diesel: "#64748b",
    Octane: "#ec4899",
  };

  const fuelBreakdown = fuelCounts.map((f) => ({
    name: f.fuel_type || "Petrol",
    count: f._count.id,
    color: fuelColors[f.fuel_type || "Petrol"] || "#2563eb",
  }));

  const analyticsData = {
    availableCount: showroomCount,
    soldCount,
    reservedCount,
    showroomCount,
    portCount,
    transitCount,
    incomingInwardCount,
    fuelBreakdown,
  };

  // 4. Inquiries & Pre-Orders
  const totalInquiries = await prisma.inquiry.count();
  const totalPreOrders = await prisma.preOrder.count();
  const recentPreOrders = await prisma.preOrder.findMany({
    orderBy: { created_at: "desc" },
    take: 4,
  });

  // Recent Sales (at least 4 recent sold vehicles)
  const recentSales = await prisma.sale.findMany({
    orderBy: [{ sale_date: 'desc' }, { id: 'desc' }],
    take: 4,
    include: { vehicle: true }
  });

  // 4. Most Sold Car Brands Velocity Analytics
  const allSales = await prisma.sale.findMany({
    orderBy: { sale_date: 'asc' },
    include: { vehicle: true },
  });

  // Extract clean brand name only (e.g. "Toyota Corolla Cross" -> "Toyota", "Nissan GTR" -> "Nissan")
  // Case-insensitive normalization: "Toyota", "toYota", "toyota", "TOYOTA" all aggregate under the same brand
  function normalizeBrand(rawBrand: string): string {
    const trimmed = (rawBrand || "").trim();
    if (!trimmed || trimmed.toLowerCase() === "unknown") return "Other";

    // Strip leading/trailing non-alphanumeric characters
    const cleaned = trimmed.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
    if (!cleaned) return "Other";

    const upper = cleaned.toUpperCase();
    if (["BMW", "BYD", "MG", "GMC", "VW"].includes(upper)) {
      return upper;
    }

    if (cleaned.includes("-")) {
      return cleaned
        .split("-")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join("-");
    }

    // Canonical Title Case: Toyota, toYota, toyota, TOYOTA -> Toyota
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  }

  function extractBrand(carName: string, vehicleBrand?: string | null, vehicleSlug?: string | null): string {
    if (vehicleBrand && vehicleBrand.trim() && vehicleBrand.trim().toLowerCase() !== "unknown") {
      return normalizeBrand(vehicleBrand);
    }
    const firstWord = (carName || "").trim().split(/\s+/)[0];
    if (firstWord) {
      return normalizeBrand(firstWord);
    }
    if (vehicleSlug && vehicleSlug.trim()) {
      const slugFirst = vehicleSlug.trim().split(/[-_]/)[0];
      if (slugFirst) {
        return normalizeBrand(slugFirst);
      }
    }
    return "Other";
  }

  // Minimum 8 months timeline for line graphs (dynamically expands if older sales exist)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let timelineMonthsCount = 8;
  if (allSales.length > 0) {
    const oldestDate = allSales.reduce((oldest, sale) => {
      const d = sale.sale_date ? new Date(sale.sale_date) : sale.created_at;
      return d < oldest ? d : oldest;
    }, now);
    const diffMonths = (now.getFullYear() - oldestDate.getFullYear()) * 12 + (now.getMonth() - oldestDate.getMonth()) + 1;
    if (diffMonths > timelineMonthsCount) {
      timelineMonthsCount = Math.min(diffMonths, 12); // expand up to 12 months if older records exist
    }
  }

  const graphMonths: { name: string; year: number; monthIdx: number }[] = [];
  for (let i = timelineMonthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    graphMonths.push({
      name: monthNames[d.getMonth()],
      year: d.getFullYear(),
      monthIdx: d.getMonth(),
    });
  }

  const brandSalesMap: Record<
    string,
    { brand: string; totalSold: number; totalRevenue: number; monthly: number[] }
  > = {};

  allSales.forEach((sale) => {
    const brand = extractBrand(sale.car_name, sale.vehicle?.brand, sale.vehicle?.slug);
    const brandKey = brand.toLowerCase(); // Case-insensitive aggregation key

    if (!brandSalesMap[brandKey]) {
      brandSalesMap[brandKey] = {
        brand,
        totalSold: 0,
        totalRevenue: 0,
        monthly: new Array(graphMonths.length).fill(0),
      };
    }
    brandSalesMap[brandKey].totalSold++;
    brandSalesMap[brandKey].totalRevenue += Number(sale.sale_price_bdt || 0);

    const saleDate = sale.sale_date ? new Date(sale.sale_date) : sale.created_at;
    const sYear = saleDate.getFullYear();
    const sMonth = saleDate.getMonth();
    const monthSlotIdx = graphMonths.findIndex((m) => m.year === sYear && m.monthIdx === sMonth);
    if (monthSlotIdx !== -1) {
      brandSalesMap[brandKey].monthly[monthSlotIdx]++;
    }
  });

  const brandColors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
  const topBrands: BrandSalesSummary[] = Object.values(brandSalesMap)
    .map((item, idx) => ({
      brand: item.brand,
      totalSold: item.totalSold,
      totalRevenueBdt: item.totalRevenue,
      color: brandColors[idx % brandColors.length],
      monthlyPoints: item.monthly,
    }))
    .sort((a, b) => b.totalSold - a.totalSold);

  const brandGraphData: BrandGraphData = {
    topBrands,
    months: graphMonths.map((m) => m.name),
    totalSalesCount: allSales.length,
  };

  return (
    <div className="modern-dashboard-grid">
      {/* ================= LEFT COLUMN ================= */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Top Card: Fleet & Valuation Showcase (Inspired by top-left card in mockup) */}
        <div className="fleet-hero-card">
          <div className="hero-profile-row">
            <div className="hero-avatar-banner">
              <div className="hero-avatar-large" title="Executive Concierge & Fleet Operations">
                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ display: "block" }}
                  aria-label="Call center agent profile logo"
                >
                  <path
                    d="M3 11C3 6.02944 7.02944 2 12 2C16.9706 2 21 6.02944 21 11"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <rect x="2" y="9.5" width="2.6" height="4.5" rx="1.3" fill="currentColor" />
                  <rect x="19.4" y="9.5" width="2.6" height="4.5" rx="1.3" fill="currentColor" />
                  <path
                    d="M20 13.5V15.5C20 17.433 18.433 19 16.5 19H13.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle cx="12.5" cy="19" r="1.2" fill="currentColor" />
                  <circle cx="12" cy="10.2" r="3.6" fill="currentColor" />
                  <path
                    d="M6 21.5C6 18.1863 8.68629 15.5 12 15.5C15.3137 15.5 18 18.1863 18 21.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="hero-avatar-text">
                <div className="hero-info-name">Executive Fleet Overview</div>
                <div className="hero-info-handle">Good Car Imports • Dhaka Hub & Port Pipeline</div>
              </div>
            </div>

            <div className="hero-quick-actions">
              <Link href="/admin/inventory" className="hero-action-circle" title="View Fleet">
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>directions_car</span>
              </Link>
              <Link href="/admin/inquiries?tab=pre_orders" className="hero-action-circle" title="Pre-Orders & Leads">
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>inventory_2</span>
              </Link>
              <Link href="?modal=add-vehicle" className="hero-action-circle" title="Inward New Vehicle">
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
              </Link>
              <Link href="/admin/report" target="_blank" className="hero-action-circle" title="Print Executive Ledger">
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>print</span>
              </Link>
            </div>
          </div>

          {/* Metric Split Grid */}
          <div className="metric-split-grid">
            <div className="metric-pill-box">
              <span className="metric-pill-label">Total Realized Revenue</span>
              <span className="metric-pill-value">{formatBDT(totalRevenue, true)}</span>
              <span className="metric-pill-sub">
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>trending_up</span>
                {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}% vs LY
              </span>
            </div>

            <div className="metric-pill-box">
              <span className="metric-pill-label">Monthly Sales ({now.toLocaleDateString("en-US", { month: "short" })})</span>
              <span className="metric-pill-value">{formatBDT(monthlyRevenue, true)}</span>
              <span style={{ fontSize: "11.5px", color: "var(--admin-text-muted)", fontWeight: 600 }}>
                {monthlyUnits} Units Delivered
              </span>
            </div>

            <div className="metric-pill-box">
              <span className="metric-pill-label">Active Fleet Stock</span>
              <span className="metric-pill-value">{stockCount} <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--admin-text-muted)" }}>Units</span></span>
              <span style={{ fontSize: "11.5px", color: "var(--admin-accent-blue)", fontWeight: 600 }}>
                {showroomCount} Showroom Ready
              </span>
            </div>

            <Link href="/admin/inquiries?tab=pre_orders" className="metric-pill-box" style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}>
              <span className="metric-pill-label">Pre-Order Demands</span>
              <span className="metric-pill-value" style={{ color: "var(--admin-accent-red, #ff4757)" }}>
                {totalPreOrders} <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--admin-text-muted)" }}>Orders</span>
              </span>
              <span style={{ fontSize: "11.5px", color: "var(--admin-accent-blue)", fontWeight: 600, display: "flex", alignItems: "center", gap: "2px" }}>
                <span>{totalInquiries} Total Leads</span>
                <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>arrow_forward</span>
              </span>
            </Link>
          </div>

          {/* Multi-Segment Fleet Progress Breakdown */}
          <div className="fleet-progress-wrapper">
            <div className="fleet-progress-labels">
              <span style={{ color: "var(--admin-text-main)" }}>Live Fleet Distribution</span>
              <span style={{ color: "var(--admin-text-muted)" }}>
                {showroomCount} Showroom • {portCount} Port Customs • {transitCount} Afloat
              </span>
            </div>
            <div className="fleet-progress-bar">
              <div
                className="fleet-segment-showroom"
                style={{ width: `${stockCount > 0 ? (showroomCount / stockCount) * 100 : 33}%` }}
                title={`Showroom: ${showroomCount}`}
              ></div>
              <div
                className="fleet-segment-port"
                style={{ width: `${stockCount > 0 ? (portCount / stockCount) * 100 : 33}%` }}
                title={`Customs: ${portCount}`}
              ></div>
              <div
                className="fleet-segment-transit"
                style={{ width: `${stockCount > 0 ? (transitCount / stockCount) * 100 : 34}%` }}
                title={`Transit: ${transitCount}`}
              ></div>
            </div>
          </div>
        </div>

        {/* Bottom Card: Recent Delivered Sales */}
        <div className="recent-sales-card">
          <div className="admin-card-header" style={{ marginBottom: "8px" }}>
            <h2 className="admin-card-title">Recent Delivered Sales</h2>
            <span className="admin-card-badge">
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>receipt_long</span>
              {recentSales.length}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "19px" }}>
            {recentSales.map((sale) => (
              <div key={sale.id} className="sales-member-row">
                <div className="sales-member-info">
                  <img
                    src={sale.vehicle?.cover_photo ? `/uploads/${sale.vehicle.cover_photo}` : "/images/placeholder-car.svg"}
                    alt="Vehicle"
                    className="sales-member-avatar"
                  />
                  <div>
                    <div className="sales-member-name">{sale.car_name}</div>
                    <div className="sales-member-role">
                      {sale.client_area || "Direct Sale"} • {formatBDT(Number(sale.sale_price_bdt || 0))}
                    </div>
                  </div>
                </div>

                <Link
                  href="/admin/sales-register"
                  className="sales-member-action"
                  title="View Sale Record"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>mail</span>
                </Link>
              </div>
            ))}

            {recentSales.length === 0 && (
              <div style={{ padding: "16px 0", color: "var(--admin-text-muted)", fontSize: "13px", textAlign: "center" }}>
                No recent sales recorded.
              </div>
            )}
          </div>

          <Link href="/admin/sales-register" className="sales-add-btn">
            <span className="sales-add-circle">+</span>
            <span>View Full Sales Register</span>
          </Link>
        </div>

        {/* Bottom Card 2: Recent Pre-Order Inquiries */}
        <div className="recent-sales-card">
          <div className="admin-card-header" style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 className="admin-card-title">Live Pre-Order Inquiries</h2>
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.2)"
              }}>
                AUCTION SOURCING
              </span>
            </div>
            <span className="admin-card-badge">
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>inventory_2</span>
              {totalPreOrders}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {recentPreOrders.map((po) => (
              <div key={po.id} className="sales-member-row">
                <div className="sales-member-info">
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                    border: "1.5px solid rgba(239, 68, 68, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--stock-accent-red, #ef4444)",
                    fontWeight: 800,
                    fontSize: "15px",
                    flexShrink: 0
                  }}>
                    {po.full_name?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <div className="sales-member-name" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>{po.full_name}</span>
                      <span className="pill-badge new" style={{ fontSize: "10px", padding: "1px 6px" }}>
                        {po.status ? po.status.toUpperCase() : "NEW"}
                      </span>
                    </div>
                    <div className="sales-member-role">
                      <strong style={{ color: "var(--admin-text-main)" }}>{po.make_model}</strong>
                      {po.budget_min_bdt ? ` • ${formatBDT(Number(po.budget_min_bdt))}` : ""}
                      {po.phone ? ` • ${po.phone}` : ""}
                    </div>
                  </div>
                </div>

                <Link
                  href="/admin/inquiries?tab=pre_orders"
                  className="sales-member-action"
                  title="View Pre-Order Sourcing Details"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>visibility</span>
                </Link>
              </div>
            ))}

            {recentPreOrders.length === 0 && (
              <div style={{ padding: "16px 0", color: "var(--admin-text-muted)", fontSize: "13px", textAlign: "center" }}>
                No pre-orders submitted yet.
              </div>
            )}
          </div>

          <Link href="/admin/inquiries?tab=pre_orders" className="sales-add-btn">
            <span className="sales-add-circle">+</span>
            <span>View All Pre-Order Inquiries ({totalPreOrders})</span>
          </Link>
        </div>

      </div>

      {/* ================= RIGHT COLUMN ================= */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Top Card: Most Sold Car Brands Line Graph */}
        <BrandSalesGraphCard data={brandGraphData} />

        {/* Bottom Card: Business Analytics & Distribution Pie Charts */}
        <BusinessAnalyticsCard data={analyticsData} />

      </div>
    </div>
  );
}
