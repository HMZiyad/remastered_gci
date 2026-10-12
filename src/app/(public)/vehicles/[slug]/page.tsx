import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { InteractiveGallery } from "@/components/InteractiveGallery";
import { VehicleBookingForm } from "@/components/VehicleBookingForm";

export const instant = false;

function formatBDT(paisa: number | bigint | null | undefined) {
  if (paisa == null) return "";
  const bdt = Number(paisa) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(bdt);
}

function formatMileageLong(km: number | null | undefined) {
  if (km == null) return "N/A";
  return new Intl.NumberFormat("en-IN").format(km) + " km";
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const resolvedParams = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      photos: {
        orderBy: [{ is_cover: "desc" }, { sort_order: "asc" }],
      },
    },
  });

  if (!vehicle) {
    notFound();
  }

  // If no DB photos, use cover photo as a fallback
  const photoUrls = vehicle.photos.length > 0 
    ? vehicle.photos.map((p: { file_path: string }) => `/uploads/${p.file_path}`)
    : vehicle.cover_photo ? [`/uploads/${vehicle.cover_photo}`] : [];

  const similarVehicles = await prisma.vehicle.findMany({
    where: {
      id: { not: vehicle.id },
      status: { in: ["available", "port_clearance"] },
      OR: [
        { brand: vehicle.brand },
        { body_type: vehicle.body_type },
      ],
    },
    orderBy: { created_at: "desc" },
    take: 3,
  });

  const pageTitle = `${vehicle.car_name} ${vehicle.package_trim || ""}`;

  return (
    <section style={{ padding: "var(--unit-lg) 0" }}>
      <div className="container">
        
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--secondary)", marginBottom: "var(--unit-lg)" }}>
          <Link href="/inventory" style={{ color: "var(--on-surface-variant)" }}>Inventory</Link>
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
          {vehicle.brand && (
            <>
              <Link href={`/inventory?brand=${vehicle.brand}`} style={{ color: "var(--on-surface-variant)" }}>{vehicle.brand}</Link>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
            </>
          )}
          <span style={{ color: "var(--on-surface)", fontWeight: 500 }}>{vehicle.car_name}</span>
        </nav>

        {/* Title Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--unit-lg)", marginBottom: "var(--unit-xl)" }}>
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              {vehicle.badge_text && (
                <span style={{ backgroundColor: vehicle.badge_text === "NEW ARRIVAL" ? "var(--tertiary)" : "var(--primary)", color: "white", padding: "4px 10px", borderRadius: "var(--radius-full)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                  {vehicle.badge_text}
                </span>
              )}
              {vehicle.auction_grade && (
                <span style={{ backgroundColor: "var(--surface-container-high)", color: "var(--on-surface)", padding: "4px 10px", borderRadius: "var(--radius-full)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                  AUCTION GRADE {vehicle.auction_grade}
                </span>
              )}
            </div>
            <h1 className="text-display-lg">{pageTitle}</h1>
          </div>
          
          {vehicle.price_bdt && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--secondary)", letterSpacing: "1px", marginBottom: "4px" }}>ESTIMATED PRICE</div>
              <div className="text-price-bdt" style={{ fontSize: "36px" }}>{formatBDT(vehicle.price_bdt)}</div>
            </div>
          )}
        </div>

        {/* Specs Bar */}
        <div style={{ display: "flex", gap: "var(--unit-xl)", flexWrap: "wrap", backgroundColor: "var(--surface)", padding: "var(--unit-md) var(--unit-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)", marginBottom: "var(--unit-xl)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "28px" }}>calendar_today</span>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", letterSpacing: "0.5px" }}>YEAR</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--on-surface)" }}>{vehicle.year_of_manufacture}</div>
            </div>
          </div>
          <div style={{ width: "1px", backgroundColor: "var(--surface-container-high)" }}></div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "28px" }}>star</span>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", letterSpacing: "0.5px" }}>GRADE</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--on-surface)" }}>{vehicle.auction_grade || "N/A"}</div>
            </div>
          </div>
          <div style={{ width: "1px", backgroundColor: "var(--surface-container-high)" }}></div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "28px" }}>speed</span>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", letterSpacing: "0.5px" }}>MILEAGE</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--on-surface)" }}>{formatMileageLong(vehicle.mileage_km)}</div>
            </div>
          </div>
          <div style={{ width: "1px", backgroundColor: "var(--surface-container-high)" }}></div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "28px" }}>settings</span>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", letterSpacing: "0.5px" }}>ENGINE</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--on-surface)" }}>{vehicle.engine_cc ? `${vehicle.engine_cc.toLocaleString()} CC` : "N/A"}</div>
            </div>
          </div>
          <div style={{ width: "1px", backgroundColor: "var(--surface-container-high)" }}></div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "28px" }}>local_gas_station</span>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", letterSpacing: "0.5px" }}>FUEL</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--on-surface)" }}>{vehicle.fuel_type}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "var(--unit-xl)", alignItems: "start" }}>
          
          {/* MAIN COLUMN */}
          <div>
            <InteractiveGallery photos={photoUrls} title={pageTitle} />

            <h2 className="text-headline-lg" style={{ marginBottom: "var(--unit-md)" }}>Vehicle Overview</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--unit-md)", backgroundColor: "var(--surface-container-lowest)", padding: "var(--unit-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)", marginBottom: "var(--unit-xl)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--surface-container)", paddingBottom: "12px" }}>
                <span style={{ color: "var(--on-surface-variant)" }}>Chassis Code</span>
                <span style={{ fontWeight: 600 }}>{vehicle.chassis_code}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--surface-container)", paddingBottom: "12px" }}>
                <span style={{ color: "var(--on-surface-variant)" }}>Color</span>
                <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  {vehicle.color_hex && (
                    <span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: vehicle.color_hex, border: "1px solid var(--surface-container-high)" }}></span>
                  )}
                  {vehicle.color_name || "N/A"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--surface-container)", paddingBottom: "12px" }}>
                <span style={{ color: "var(--on-surface-variant)" }}>Transmission</span>
                <span style={{ fontWeight: 600 }}>{vehicle.transmission || "N/A"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--surface-container)", paddingBottom: "12px" }}>
                <span style={{ color: "var(--on-surface-variant)" }}>Body Type</span>
                <span style={{ fontWeight: 600 }}>{vehicle.body_type === "HIACE_Van" ? "HIACE-Van" : vehicle.body_type}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--on-surface-variant)" }}>Status</span>
                <span style={{ fontWeight: 600, color: "var(--tertiary)" }}>{vehicle.status.replace("_", " ").toUpperCase()}</span>
              </div>
            </div>

            {vehicle.description && (
              <div style={{ marginBottom: "var(--unit-xl)" }}>
                <h3 className="text-title-md" style={{ marginBottom: "var(--unit-md)" }}>Description</h3>
                <div style={{ lineHeight: 1.6, color: "var(--on-surface-variant)", whiteSpace: "pre-wrap" }}>
                  {vehicle.description}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "var(--unit-lg)" }}>
            
            {/* Booking Form Card */}
            <div style={{ backgroundColor: "var(--surface)", padding: "var(--unit-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)" }}>
              <h3 className="text-title-md" style={{ marginBottom: "var(--unit-lg)" }}>Booking & Inquiry</h3>
              <VehicleBookingForm
                vehicleId={vehicle.id}
                carName={pageTitle}
                chassisCode={vehicle.chassis_code}
              />

              <div style={{ display: "flex", alignItems: "center", margin: "24px 0" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "var(--surface-container-high)" }}></div>
                <div style={{ padding: "0 16px", fontSize: "12px", fontWeight: 700, color: "var(--secondary)", letterSpacing: "1px" }}>OR</div>
                <div style={{ flex: 1, height: "1px", backgroundColor: "var(--surface-container-high)" }}></div>
              </div>

              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hello, I am interested in the ${pageTitle} (${vehicle.chassis_code})`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", backgroundColor: "var(--whatsapp-green)", color: "white", fontWeight: 600, borderRadius: "var(--radius-full)" }}>
                <span className="material-symbols-outlined filled" style={{ fontSize: "20px" }}>chat</span>
                Chat on WhatsApp
              </a>
            </div>

            {/* Location Card */}
            <div style={{ backgroundColor: "var(--surface)", padding: "var(--unit-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)" }}>
              <h3 className="text-title-md" style={{ marginBottom: "var(--unit-md)" }}>Vehicle Location</h3>
              <div style={{ height: "200px", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "var(--unit-md)" }}>
                <iframe src="https://maps.google.com/maps?q=56+Inner+Circular+Road+Eastern+Trade+Center+Dhaka&t=&z=15&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{ border: 0, width: "100%", height: "100%" }}></iframe>
              </div>
              <div style={{ display: "flex", gap: "12px", color: "var(--on-surface-variant)", fontSize: "14px", lineHeight: 1.5 }}>
                <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>location_on</span>
                <div>
                  <strong style={{ color: "var(--on-surface)" }}>Our Office</strong><br />
                  56 Inner Circular Road<br />Eastern Trade Center (6 Floor)<br />Purana Paltan Line Dhaka-1000
                </div>
              </div>
            </div>

          </aside>
        </div>

      </div>
    </section>
  );
}
