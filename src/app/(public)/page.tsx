import { connection } from "next/server";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { CarScrollHero } from "@/components/CarScrollHero";

export const instant = false;

import { formatBDT } from "@/lib/utils";

function formatMileage(km: number | null | undefined) {
  if (km == null) return "N/A";
  if (km >= 1000) {
    return `${Math.round(km / 1000)}k KM`;
  }
  return `${km} KM`;
}

export default async function Home() {
  await connection();
  const featuredVehicles = await prisma.vehicle.findMany({
    where: {
      is_featured: true,
      status: { not: "sold" },
    },
    orderBy: { created_at: "desc" },
    take: 3,
  });

  return (
    <div style={{ backgroundColor: "#ea081c", color: "#ffffff", minHeight: "100vh" }}>
      {/* ===== APPLE-STYLE SCROLL-SCRUB HERO ===== */}
      <div style={{ marginTop: "-80px" }}>
        <CarScrollHero backgroundColor="#ea081c" />
      </div>

      {/* ===== FEATURED INVENTORY ===== */}
      <section style={{ padding: "80px 0", backgroundColor: "#ea081c" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--unit-lg)", flexWrap: "wrap", gap: "var(--unit-md)" }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  marginBottom: "8px",
                }}
              >
                <span>AUCTION GRADED IMPORTS</span>
              </div>
              <h2 className="text-headline-lg" style={{ marginBottom: "var(--unit-xs)", color: "#ffffff", fontWeight: 800 }}>Featured Inventory</h2>
              <p className="text-body-lg" style={{ color: "rgba(255, 255, 255, 0.9)" }}>Our hand-picked selection of high-grade Japanese and European imports.</p>
            </div>
            <Link
              href="/inventory"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#ffffff",
                color: "#bc001f",
                fontWeight: 700,
                fontSize: "14px",
                padding: "12px 24px",
                borderRadius: "9999px",
                textDecoration: "none",
                boxShadow: "0 10px 24px rgba(0, 0, 0, 0.25)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <span>View All</span>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--unit-lg)" }}>
            {featuredVehicles.map((v: any) => (
              <div key={v.id} className="vehicle-card" style={{ display: "flex", flexDirection: "column", backgroundColor: "#ffffff", borderRadius: "18px", overflow: "hidden", boxShadow: "0 16px 40px rgba(0, 0, 0, 0.25)", border: "1px solid rgba(255, 255, 255, 0.8)", transition: "box-shadow var(--transition-base), transform var(--transition-base)", cursor: "pointer" }}>
                <Link href={`/vehicles/${v.slug}`} style={{ display: "block", position: "relative", height: "220px", backgroundColor: "#f3f4f5" }}>
                  {v.cover_photo ? (
                    <img src={`/uploads/${v.cover_photo}`} alt={v.car_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--secondary)" }}>directions_car</span>
                    </div>
                  )}

                  {v.badge_text && (
                    <span style={{ position: "absolute", top: "12px", left: "12px", backgroundColor: v.badge_text === "BEST VALUE" ? "var(--tertiary)" : "var(--primary)", color: "white", padding: "4px 8px", borderRadius: "var(--radius)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>
                      {v.badge_text}
                    </span>
                  )}
                  {v.auction_grade && (
                    <span style={{ position: "absolute", bottom: "12px", right: "12px", backgroundColor: "rgba(0,0,0,0.7)", color: "white", padding: "4px 8px", borderRadius: "var(--radius)", fontSize: "12px", fontWeight: 600, backdropFilter: "blur(4px)" }}>
                      ☆ {v.auction_grade} Grade
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
                  <h3 className="text-title-md" style={{ marginBottom: "var(--unit-md)", flex: 1, color: "#181c20" }}>{v.car_name}</h3>

                  <div style={{ display: "flex", gap: "var(--unit-sm)", flexWrap: "wrap", marginBottom: "var(--unit-md)", paddingTop: "var(--unit-sm)", borderTop: "1px solid #e7e8e9" }}>
                    {v.engine_cc && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--on-surface-variant)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>settings</span> {v.engine_cc.toLocaleString()}cc
                      </span>
                    )}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--on-surface-variant)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>local_gas_station</span> {v.fuel_type}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--on-surface-variant)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>speed</span> {formatMileage(v.mileage_km)}
                    </span>
                  </div>

                  <Link href={`/vehicles/${v.slug}`} style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "#181c20" }}>
                    View Details <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}

            {featuredVehicles.length === 0 && (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "rgba(255, 255, 255, 0.8)", padding: "48px 0" }}>
                No featured vehicles at the moment. Check back soon!
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
