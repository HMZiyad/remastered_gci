import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatBDT } from "@/lib/utils";
import { connection } from "next/server";
import { InventoryTable, SerializedVehicle } from "@/components/admin/InventoryTable";

export const instant = false;

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connection();
  const resolvedParams = await searchParams;
  const statusFilter = typeof resolvedParams.status === "string" ? resolvedParams.status : "all";

  // Build WHERE clause
  const where: any = {};
  if (statusFilter !== "all") {
    if (statusFilter === "sold_reserved") {
      where.status = { in: ["sold", "reserved"] };
    } else {
      where.status = statusFilter;
    }
  }

  // Fetch KPI Counts
  const [
    totalUnits,
    showroomUnits,
    portUnits,
    vesselUnits,
    soldReservedUnits,
    totalValueAgg
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "available" } }),
    prisma.vehicle.count({ where: { status: "port_clearance" } }),
    prisma.vehicle.count({ where: { status: "vessel_transit" } }),
    prisma.vehicle.count({ where: { status: { in: ["sold", "reserved"] } } }),
    prisma.vehicle.aggregate({
      _sum: { price_bdt: true },
      where: { status: { in: ["available", "port_clearance", "vessel_transit"] } }
    })
  ]);

  const totalValue = Number(totalValueAgg._sum.price_bdt || 0);

  // Fetch Data
  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { created_at: "desc" },
    include: { photos: true },
  });

  const serializedVehicles: SerializedVehicle[] = vehicles.map((v) => ({
    id: v.id,
    car_name: v.car_name,
    cover_photo: v.cover_photo,
    body_type: v.body_type,
    fuel_type: v.fuel_type,
    package_trim: v.package_trim,
    year_of_manufacture: v.year_of_manufacture,
    color_name: v.color_name,
    auction_grade: v.auction_grade,
    mileage_km: v.mileage_km,
    engine_cc: v.engine_cc,
    chassis_code: v.chassis_code,
    status: v.status,
    slug: v.slug,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Modern KPI Cards Grid */}
      <div className="modern-kpi-grid">
        <div className="modern-kpi-card">
          <div className="modern-kpi-header">
            <span className="modern-kpi-title">TOTAL STOCK UNITS</span>
            <div className="modern-kpi-icon-circle">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>directions_car</span>
            </div>
          </div>
          <div className="modern-kpi-value">{totalUnits}</div>
          <div className="modern-kpi-sub">Entire vehicle fleet catalog</div>
        </div>

        <div className="modern-kpi-card">
          <div className="modern-kpi-header">
            <span className="modern-kpi-title">EST. STOCK VALUE</span>
            <div className="modern-kpi-icon-circle">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>payments</span>
            </div>
          </div>
          <div className="modern-kpi-value">৳{(totalValue / 100 / 10000000).toFixed(2)} Cr</div>
          <div className="modern-kpi-sub" style={{ color: "var(--admin-accent-green)", fontWeight: 600 }}>Active unsold inventory</div>
        </div>

        <div className="modern-kpi-card">
          <div className="modern-kpi-header">
            <span className="modern-kpi-title">SHOWROOM READY</span>
            <div className="modern-kpi-icon-circle">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>storefront</span>
            </div>
          </div>
          <div className="modern-kpi-value">{showroomUnits} <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--admin-text-muted)" }}>Units</span></div>
          <div className="modern-kpi-sub">Baridhara Showroom Hub</div>
        </div>

        <div className="modern-kpi-card">
          <div className="modern-kpi-header">
            <span className="modern-kpi-title">PORT & TRANSIT</span>
            <div className="modern-kpi-icon-circle">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>directions_boat</span>
            </div>
          </div>
          <div className="modern-kpi-value">{portUnits + vesselUnits} <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--admin-text-muted)" }}>Units</span></div>
          <div className="modern-kpi-sub">{portUnits} CTG Customs • {vesselUnits} Afloat</div>
        </div>
      </div>

      {/* Table Container */}
      <div className="modern-table-container">
        <div className="modern-table-toolbar">
          {/* Mobile Top Header: Title & Compact Action */}
          <div className="toolbar-header-row">
            <div className="toolbar-title-group">
              <span className="toolbar-title">Fleet Inventory</span>
              <span className="toolbar-count-badge">{totalUnits} Units</span>
            </div>
            <Link href="?modal=add-vehicle" className="btn-modern-primary toolbar-add-btn">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
              <span>Add Vehicle</span>
            </Link>
          </div>

          {/* Filter Pills */}
          <div className="filter-pills-row">
            <Link
              href="/admin/inventory?status=all"
              className={`filter-pill-item ${statusFilter === 'all' ? 'active' : ''}`}
            >
              All Stocks <span className="filter-pill-count">{totalUnits}</span>
            </Link>
            <Link
              href="/admin/inventory?status=available"
              className={`filter-pill-item ${statusFilter === 'available' ? 'active' : ''}`}
            >
              Showroom Ready <span className="filter-pill-count">{showroomUnits}</span>
            </Link>
            <Link
              href="/admin/inventory?status=port_clearance"
              className={`filter-pill-item ${statusFilter === 'port_clearance' ? 'active' : ''}`}
            >
              Chittagong Port <span className="filter-pill-count">{portUnits}</span>
            </Link>
            <Link
              href="/admin/inventory?status=vessel_transit"
              className={`filter-pill-item ${statusFilter === 'vessel_transit' ? 'active' : ''}`}
            >
              Vessel Transit <span className="filter-pill-count">{vesselUnits}</span>
            </Link>
            <Link
              href="/admin/inventory?status=sold_reserved"
              className={`filter-pill-item ${statusFilter === 'sold_reserved' ? 'active' : ''}`}
            >
              Sold / Reserved <span className="filter-pill-count">{soldReservedUnits}</span>
            </Link>
          </div>

          {/* Desktop Action Button */}
          <div className="toolbar-desktop-actions">
            <Link href="?modal=add-vehicle" className="btn-modern-primary">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
              <span>Add Vehicle</span>
            </Link>
          </div>
        </div>

        <InventoryTable vehicles={serializedVehicles} />
      </div>
    </div>
  );
}
