import { connection } from "next/server";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { formatBDT } from "@/lib/utils";

function formatMileage(km: number | null | undefined) {
  if (km == null) return "N/A";
  if (km >= 1000) {
    return `${Math.round(km / 1000)}k KM`;
  }
  return `${km} KM`;
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connection();
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.search === "string" ? resolvedParams.search : "";
  const brand = typeof resolvedParams.brand === "string" ? resolvedParams.brand : "";
  const sort = typeof resolvedParams.sort === "string" ? resolvedParams.sort : "latest";
  
  // Filtering logic
  const where: any = {
    status: { in: ["available", "port_clearance", "vessel_transit", "pre_booked"] },
  };

  if (search) {
    where.OR = [
      { car_name: { contains: search } },
      { package_trim: { contains: search } },
      { chassis_code: { contains: search } },
    ];
  }

  if (brand) {
    where.brand = brand;
  }

  // Sorting logic
  let orderBy: any = { created_at: "desc" };
  if (sort === "price_low") orderBy = { price_bdt: "asc" };
  if (sort === "price_high") orderBy = { price_bdt: "desc" };
  if (sort === "mileage") orderBy = { mileage_km: "asc" };

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy,
  });

  const allBrands = await prisma.vehicle.findMany({
    distinct: ["brand"],
    select: { brand: true },
    where: { brand: { not: null } },
  });

  return (
    <section style={{ padding: "var(--unit-xl) 0" }}>
      <div className="container">
        
        <div style={{ display: "flex", gap: "var(--unit-xl)", alignItems: "flex-start" }}>
          {/* ===== FILTER SIDEBAR (Desktop) ===== */}
          <aside style={{ width: "256px", flexShrink: 0, backgroundColor: "var(--surface)", padding: "var(--unit-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)", position: "sticky", top: "100px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--unit-lg)" }}>
              <h2 className="text-title-md">Filters</h2>
              <Link href="/inventory" style={{ fontSize: "12px", fontWeight: 600, color: "var(--primary)" }}>RESET</Link>
            </div>

            <form action="/inventory" method="GET">
              <div style={{ marginBottom: "var(--unit-md)" }}>
                <label className="text-label-sm" style={{ display: "block", marginBottom: "var(--unit-xs)", color: "var(--on-surface-variant)" }}>Quick Search</label>
                <div style={{ position: "relative" }}>
                  <span className="material-symbols-outlined" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--secondary)", fontSize: "20px" }}>search</span>
                  <input type="text" name="search" defaultValue={search} placeholder="Model name..." style={{ width: "100%", padding: "10px 10px 10px 36px", borderRadius: "var(--radius)", border: "1px solid var(--surface-container-high)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)" }} />
                </div>
              </div>

              <div style={{ marginBottom: "var(--unit-lg)" }}>
                <label className="text-label-sm" style={{ display: "block", marginBottom: "var(--unit-xs)", color: "var(--on-surface-variant)" }}>Brand</label>
                <select name="brand" defaultValue={brand} style={{ width: "100%", padding: "10px", borderRadius: "var(--radius)", border: "1px solid var(--surface-container-high)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)" }}>
                  <option value="">All Brands</option>
                  {allBrands.map((b: { brand: string | null }) => (
                    <option key={b.brand || "unknown"} value={b.brand!}>{b.brand}</option>
                  ))}
                </select>
              </div>

              <button type="submit" style={{ width: "100%", padding: "12px", backgroundColor: "var(--primary)", color: "var(--on-primary)", fontWeight: 600, borderRadius: "var(--radius)", transition: "background var(--transition-fast)" }}>
                Apply Filters
              </button>
            </form>
          </aside>

          {/* ===== INVENTORY CONTENT ===== */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--unit-lg)" }}>
              <div>
                <h1 className="text-headline-lg" style={{ marginBottom: "var(--unit-xs)" }}>Current Inventory</h1>
                <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>Showing {vehicles.length} high-quality imported vehicles</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--unit-lg)" }}>
              {vehicles.map((v: any) => (
                <div key={v.id} className="vehicle-card" style={{ display: "flex", flexDirection: "column", backgroundColor: "var(--surface)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--surface-container-high)", transition: "box-shadow var(--transition-base), transform var(--transition-base)" }}>
                  <Link href={`/vehicles/${v.slug}`} style={{ display: "block", position: "relative", height: "200px", backgroundColor: "var(--surface-container)" }}>
                    {v.cover_photo ? (
                      <img src={`/uploads/${v.cover_photo}`} alt={v.car_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--secondary)" }}>directions_car</span>
                      </div>
                    )}
                    {v.badge_text && (
                      <span style={{ position: "absolute", top: "12px", left: "12px", backgroundColor: "var(--primary)", color: "white", padding: "4px 8px", borderRadius: "var(--radius)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>
                        {v.badge_text}
                      </span>
                    )}
                  </Link>
                  <div style={{ padding: "var(--unit-md)", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--unit-xs)" }}>
                      <p style={{ fontSize: "13px", color: "var(--secondary)", fontWeight: 500 }}>
                        {v.year_of_manufacture} • {v.package_trim}
                      </p>
                      <div className="text-price-bdt">{formatBDT(v.price_bdt, true)}</div>
                    </div>
                    <h3 className="text-title-md" style={{ marginBottom: "var(--unit-md)", flex: 1 }}>{v.car_name}</h3>
                    <div style={{ display: "flex", gap: "var(--unit-sm)", flexWrap: "wrap", marginBottom: "var(--unit-md)", paddingTop: "var(--unit-sm)", borderTop: "1px solid var(--surface-container-high)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--on-surface-variant)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>settings</span> {v.engine_cc}cc
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--on-surface-variant)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>local_gas_station</span> {v.fuel_type}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--on-surface-variant)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>speed</span> {formatMileage(v.mileage_km)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {vehicles.length === 0 && (
                <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--secondary)", padding: "48px 0" }}>
                  No vehicles match your filters. Try adjusting your search criteria.
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
