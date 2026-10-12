import { connection } from "next/server";
import Link from "next/link";
import prisma from "@/lib/prisma";

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
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", color: "white" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: -2 }}>
          <div style={{ width: "100%", height: "100%", backgroundColor: "#121212", backgroundImage: "url('/images/preorder-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 100%)", zIndex: -1 }}></div>
        
        <div className="container" style={{ position: "relative", zIndex: 1, padding: "var(--unit-xl) var(--margin-desktop)" }}>
          <h1 className="text-display-lg" style={{ marginBottom: "var(--unit-md)", maxWidth: "800px", color: "white" }}>
            Drive Your Dream.<br />
            <span style={{ color: "var(--primary)" }}>Imported Directly</span> to Bangladesh.
          </h1>
          <p className="text-body-lg" style={{ marginBottom: "var(--unit-xl)", maxWidth: "550px", color: "#e1e3e4" }}>
            Authentic auction sheets, hassle-free registration, and guaranteed best prices for the finest Japanese and European vehicles.
          </p>
          <div style={{ display: "flex", gap: "var(--unit-md)", flexWrap: "wrap" }}>
            <Link href="/inventory" style={{ padding: "14px 32px", backgroundColor: "var(--primary)", color: "white", borderRadius: "8px", fontWeight: 600, fontSize: "14px", transition: "background var(--transition-fast)" }}>
              Browse Inventory
            </Link>
            <Link href="/pre-order" style={{ padding: "14px 32px", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "8px", fontWeight: 600, fontSize: "14px", transition: "background var(--transition-fast)" }}>
              Request a Specific Car
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <section style={{ padding: "var(--unit-xl) 0", backgroundColor: "var(--surface-container-low)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--gutter, 24px)" }}>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "var(--unit-md)", backgroundColor: "var(--surface)", borderRadius: "4px", border: "1px solid var(--outline-variant)", boxShadow: "0 20px 30px -10px rgba(91, 95, 99, 0.08)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "var(--unit-sm)" }}>verified</span>
              <h3 className="text-title-md" style={{ marginBottom: "8px", color: "var(--on-background)" }}>Verified Auction Sheets</h3>
              <p className="text-body-md" style={{ color: "var(--secondary)", fontSize: "14px" }}>100% genuine inspection reports directly from Japanese auction houses.</p>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "var(--unit-md)", backgroundColor: "var(--surface)", borderRadius: "4px", border: "1px solid var(--outline-variant)", boxShadow: "0 20px 30px -10px rgba(91, 95, 99, 0.08)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "var(--unit-sm)" }}>account_balance</span>
              <h3 className="text-title-md" style={{ marginBottom: "8px", color: "var(--on-background)" }}>Loan Assistance</h3>
              <p className="text-body-md" style={{ color: "var(--secondary)", fontSize: "14px" }}>Expert guidance for bank loan and insurance processing with local partners.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "var(--unit-md)", backgroundColor: "var(--surface)", borderRadius: "4px", border: "1px solid var(--outline-variant)", boxShadow: "0 20px 30px -10px rgba(91, 95, 99, 0.08)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "var(--unit-sm)" }}>assignment</span>
              <h3 className="text-title-md" style={{ marginBottom: "8px", color: "var(--on-background)" }}>BRTA Support</h3>
              <p className="text-body-md" style={{ color: "var(--secondary)", fontSize: "14px" }}>We handle all the paperwork for registration and fitness certificates.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "var(--unit-md)", backgroundColor: "var(--surface)", borderRadius: "4px", border: "1px solid var(--outline-variant)", boxShadow: "0 20px 30px -10px rgba(91, 95, 99, 0.08)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "var(--unit-sm)" }}>local_shipping</span>
              <h3 className="text-title-md" style={{ marginBottom: "8px", color: "var(--on-background)" }}>Port-to-Door Delivery</h3>
              <p className="text-body-md" style={{ color: "var(--secondary)", fontSize: "14px" }}>Safe and reliable transport from Chittagong port to your home.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ===== FEATURED INVENTORY ===== */}
      <section style={{ padding: "var(--unit-xl) 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--unit-lg)", flexWrap: "wrap", gap: "var(--unit-md)" }}>
            <div>
              <h2 className="text-headline-lg" style={{ marginBottom: "var(--unit-xs)" }}>Featured Inventory</h2>
              <p className="text-body-lg" style={{ color: "var(--on-surface-variant)" }}>Our hand-picked selection of high-grade imports.</p>
            </div>
            <Link href="/inventory" style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--primary)", fontWeight: 600 }}>
              View All <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--unit-lg)" }}>
            {featuredVehicles.map((v: any) => (
              <div key={v.id} className="vehicle-card" style={{ display: "flex", flexDirection: "column", backgroundColor: "var(--surface)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--surface-container-high)", transition: "box-shadow var(--transition-base), transform var(--transition-base)", cursor: "pointer" }}>
                <Link href={`/vehicles/${v.slug}`} style={{ display: "block", position: "relative", height: "220px", backgroundColor: "var(--surface-container)" }}>
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
                  <h3 className="text-title-md" style={{ marginBottom: "var(--unit-md)", flex: 1 }}>{v.car_name}</h3>
                  
                  <div style={{ display: "flex", gap: "var(--unit-sm)", flexWrap: "wrap", marginBottom: "var(--unit-md)", paddingTop: "var(--unit-sm)", borderTop: "1px solid var(--surface-container-high)" }}>
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
                  
                  <Link href={`/vehicles/${v.slug}`} style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "var(--on-surface)" }}>
                    View Details <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}

            {featuredVehicles.length === 0 && (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--secondary)", padding: "48px 0" }}>
                No featured vehicles at the moment. Check back soon!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ===== PRE-ORDER PROCESS ===== */}
      <section style={{ padding: "var(--unit-xl) 0", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "var(--unit-lg)" }}>
            <h2 className="text-headline-lg" style={{ marginBottom: "var(--unit-xs)" }}>Our Seamless Pre-Order Process</h2>
            <p className="text-body-lg" style={{ color: "var(--on-surface-variant)" }}>Getting your dream car is simpler than you think.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--unit-lg)", textAlign: "center" }}>
            
            <div>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--primary-container)", color: "var(--on-primary-container)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700, margin: "0 auto var(--unit-md)" }}>1</div>
              <h3 className="text-title-md" style={{ marginBottom: "8px" }}>Choose Car</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>Select from live Japanese auction listings.</p>
            </div>
            <div>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--primary-container)", color: "var(--on-primary-container)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700, margin: "0 auto var(--unit-md)" }}>2</div>
              <h3 className="text-title-md" style={{ marginBottom: "8px" }}>Auction/Bidding</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>We secure the car at the best possible price.</p>
            </div>
            <div>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--primary-container)", color: "var(--on-primary-container)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700, margin: "0 auto var(--unit-md)" }}>3</div>
              <h3 className="text-title-md" style={{ marginBottom: "8px" }}>Shipping</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>Global shipping with full tracking to BD.</p>
            </div>
            <div>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--primary-container)", color: "var(--on-primary-container)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700, margin: "0 auto var(--unit-md)" }}>4</div>
              <h3 className="text-title-md" style={{ marginBottom: "8px" }}>Delivery</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>Cleared at port and delivered to Dhaka.</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
