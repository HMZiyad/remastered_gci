import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { InteractiveGallery } from "@/components/InteractiveGallery";
import { VehicleBookingForm } from "@/components/VehicleBookingForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

function formatFullPriceBDT(paisa: bigint | number | null | undefined): string {
  if (paisa == null) return "Call for Price";
  const bdt = Number(paisa) / 100;
  return "৳" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(bdt);
}

function formatPriceLakhs(paisa: bigint | number | null | undefined): string {
  if (paisa == null) return "Call";
  const lakhs = Number(paisa) / 10000000;
  return lakhs % 1 === 0 ? `${lakhs.toFixed(0)}.0L` : `${lakhs.toFixed(1)}L`;
}

function normalizePhotoUrl(path: string | null | undefined): string {
  if (!path) return "/images/placeholder-car.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return path;
  return `/uploads/${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      OR: [
        { slug: resolvedParams.slug },
        { stock_id: resolvedParams.slug },
        { chassis_code: resolvedParams.slug },
      ],
    },
  });

  if (!vehicle) {
    return { title: "Vehicle Details | Good Car Imports" };
  }

  return {
    title: `${vehicle.car_name} ${vehicle.package_trim || ""} | Good Car Imports`,
    description: `Inspect ${vehicle.car_name} ${vehicle.year_of_manufacture || ""} auction grade ${vehicle.auction_grade || "verified"} imported directly from Japan.`,
  };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const resolvedParams = await params;
  const rawSlug = decodeURIComponent(resolvedParams.slug);

  let vehicle = await prisma.vehicle.findFirst({
    where: {
      OR: [
        { slug: rawSlug },
        { stock_id: rawSlug },
        { chassis_code: rawSlug },
      ],
    },
    include: {
      photos: {
        orderBy: [{ is_cover: "desc" }, { sort_order: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!vehicle) {
    const slugParts = rawSlug.split(/[-_]/).filter(Boolean);
    const keywords = slugParts.slice(0, 2).join(" ");
    vehicle = await prisma.vehicle.findFirst({
      where: {
        OR: [
          { slug: { contains: slugParts[0] || rawSlug } },
          { car_name: { contains: keywords || rawSlug } },
        ],
      },
      include: {
        photos: {
          orderBy: [{ is_cover: "desc" }, { sort_order: "asc" }, { id: "asc" }],
        },
      },
    });
  }

  if (!vehicle) {
    notFound();
  }

  // Resolve all photos from DB
  const photoUrls: string[] = vehicle.photos.length > 0
    ? vehicle.photos.map((p) => normalizePhotoUrl(p.file_path))
    : vehicle.cover_photo
    ? [normalizePhotoUrl(vehicle.cover_photo)]
    : ["/images/placeholder-car.svg"];

  // Fetch similar vehicles
  const similarVehicles = await prisma.vehicle.findMany({
    where: {
      id: { not: vehicle.id },
    },
    orderBy: { created_at: "desc" },
    take: 4,
  });

  const pageTitle = `${vehicle.car_name} ${vehicle.package_trim || ""}`.trim();

  // Status mapping
  const statusDisplay =
    vehicle.status === "vessel_transit"
      ? "On Vessel"
      : vehicle.status === "available"
      ? "Showroom Ready"
      : vehicle.status === "port_clearance"
      ? "In Port"
      : vehicle.status === "reserved"
      ? "Reserved"
      : vehicle.status === "sold"
      ? "Delivered"
      : String(vehicle.status).replace("_", " ").toUpperCase();

  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801718700120";

  return (
    <div
      style={{
        backgroundColor: "var(--stock-bg, #090a0d)",
        minHeight: "100vh",
        color: "var(--stock-text-primary, #ffffff)",
        padding: "32px 0 80px 0",
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: "100%",
          width: "100%",
          padding: "0 var(--margin-desktop, clamp(40px, 3.2vw, 60px))",
        }}
      >
        {/* ================= 1. BREADCRUMB ================= */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13.5px",
            fontWeight: 500,
            color: "var(--stock-text-secondary)",
            marginBottom: "20px",
          }}
        >
          <Link
            href="/inventory"
            style={{
              color: "var(--stock-label-color)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
          >
            Inventory
          </Link>
          <span style={{ color: "var(--stock-label-color)", fontSize: "12px", opacity: 0.6 }}>&gt;</span>
          {vehicle.brand && (
            <>
              <Link
                href={`/inventory?brand=${encodeURIComponent(vehicle.brand)}`}
                style={{
                  color: "var(--stock-label-color)",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  transition: "color 0.2s ease",
                }}
              >
                {vehicle.brand.toUpperCase()}
              </Link>
              <span style={{ color: "var(--stock-label-color)", fontSize: "12px", opacity: 0.6 }}>&gt;</span>
            </>
          )}
          <span
            style={{
              color: "var(--stock-accent-red)",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {vehicle.car_name}
          </span>
        </nav>

        {/* ================= 2. TITLE & ESTIMATED PRICE HEADER ================= */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          {/* Left: Grade badge & vehicle title */}
          <div>
            {vehicle.auction_grade && (
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  backgroundColor: "var(--stock-badge-bg)",
                  border: "1px solid var(--stock-badge-border)",
                  color: "var(--stock-badge-color)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                  transition: "background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease",
                }}
              >
                AUCTION GRADE {vehicle.auction_grade}
              </div>
            )}
            <h1
              style={{
                fontSize: "clamp(26px, 3.2vw, 36px)",
                fontWeight: 800,
                color: "var(--stock-text-primary)",
                letterSpacing: "-0.015em",
                margin: 0,
                textTransform: "uppercase",
                lineHeight: 1.2,
                transition: "color 0.25s ease",
              }}
            >
              {pageTitle}
            </h1>
          </div>

          {/* Right: Estimated Price */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--stock-label-color)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "2px",
                transition: "color 0.25s ease",
              }}
            >
              ESTIMATED PRICE
            </div>
            <div
              style={{
                fontSize: "clamp(30px, 3.6vw, 42px)",
                fontWeight: 800,
                color: "var(--stock-accent-red)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {formatFullPriceBDT(vehicle.price_bdt)}
            </div>
          </div>
        </div>

        {/* ================= 3. 5 KEY FEATURE METRIC BOXES ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            backgroundColor: "var(--stock-card-bg)",
            border: "1px solid var(--stock-card-border)",
            borderRadius: "12px",
            marginBottom: "32px",
            overflow: "hidden",
            boxShadow: "var(--stock-card-shadow)",
            transition: "background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
          }}
        >
          {/* 1. Year */}
          <div
            style={{
              padding: "20px 16px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              borderRight: "1px solid var(--stock-card-border)",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "var(--stock-accent-red)", fontSize: "22px" }}>
              calendar_today
            </span>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "var(--stock-label-color)",
                textTransform: "uppercase",
              }}
            >
              YEAR OF MANUFACTURE
            </span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--stock-text-primary)" }}>
              {vehicle.year_of_manufacture || "N/A"}
            </span>
          </div>

          {/* 2. Auc Grade */}
          <div
            style={{
              padding: "20px 16px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              borderRight: "1px solid var(--stock-card-border)",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "var(--stock-accent-red)", fontSize: "22px" }}>
              star
            </span>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "var(--stock-label-color)",
                textTransform: "uppercase",
              }}
            >
              AUC/GRADE
            </span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--stock-text-primary)" }}>
              {vehicle.auction_grade || "N/A"}
            </span>
          </div>

          {/* 3. Mileage */}
          <div
            style={{
              padding: "20px 16px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              borderRight: "1px solid var(--stock-card-border)",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "var(--stock-accent-red)", fontSize: "22px" }}>
              speed
            </span>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "var(--stock-label-color)",
                textTransform: "uppercase",
              }}
            >
              MILEAGE
            </span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--stock-text-primary)" }}>
              {vehicle.mileage_km ? `${vehicle.mileage_km.toLocaleString("en-IN")} KM` : "N/A"}
            </span>
          </div>

          {/* 4. Engine / CC */}
          <div
            style={{
              padding: "20px 16px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              borderRight: "1px solid var(--stock-card-border)",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "var(--stock-accent-red)", fontSize: "22px" }}>
              settings
            </span>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "var(--stock-label-color)",
                textTransform: "uppercase",
              }}
            >
              ENGINE/CC
            </span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--stock-text-primary)" }}>
              {vehicle.engine_cc ? `${vehicle.engine_cc.toLocaleString("en-IN")}/CC` : "N/A"}
            </span>
          </div>

          {/* 5. Fuel */}
          <div
            style={{
              padding: "20px 16px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "var(--stock-accent-red)", fontSize: "22px" }}>
              local_gas_station
            </span>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "var(--stock-label-color)",
                textTransform: "uppercase",
              }}
            >
              FUEL
            </span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--stock-text-primary)" }}>
              {vehicle.fuel_type || "Petrol"}
            </span>
          </div>
        </div>

        {/* ================= 4. MAIN SPLIT: GALLERY & OVERVIEW (LEFT) vs BOOKING & LOCATION (RIGHT) ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 370px",
            gap: "32px",
            alignItems: "start",
          }}
          className="vehicle-detail-main-layout"
        >
          {/* ================= LEFT COLUMN ================= */}
          <div>
            <InteractiveGallery photos={photoUrls} title={pageTitle}>
              {/* Vehicle Overview Section with Red Vertical Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  margin: "32px 0 20px 0",
                }}
              >
                <span
                  style={{
                    width: "4px",
                    height: "22px",
                    backgroundColor: "var(--stock-accent-red)",
                    borderRadius: "2px",
                    display: "inline-block",
                  }}
                />
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "var(--stock-text-primary)",
                    margin: 0,
                    letterSpacing: "-0.01em",
                    transition: "color 0.25s ease",
                  }}
                >
                  Vehicle Overview
                </h2>
              </div>

              {/* 4-Column Specs Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "24px 16px",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      color: "var(--stock-label-color)",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                      transition: "color 0.25s ease",
                    }}
                  >
                    CHASSIS NO.
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--stock-text-primary)", transition: "color 0.25s ease" }}>
                    {vehicle.chassis_code}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      color: "var(--stock-label-color)",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                      transition: "color 0.25s ease",
                    }}
                  >
                    COLOR
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--stock-text-primary)", transition: "color 0.25s ease" }}>
                    {vehicle.color_name || "PEARL"}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      color: "var(--stock-label-color)",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                      transition: "color 0.25s ease",
                    }}
                  >
                    TRANSMISSION
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--stock-text-primary)", transition: "color 0.25s ease" }}>
                    {vehicle.transmission || "AT"}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      color: "var(--stock-label-color)",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                      transition: "color 0.25s ease",
                    }}
                  >
                    BODY TYPE
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--stock-text-primary)", transition: "color 0.25s ease" }}>
                    {vehicle.body_type === "HIACE_Van" ? "HIACE-Van" : vehicle.body_type || "Van"}
                  </div>
                </div>
              </div>

              {/* Status Row */}
              <div style={{ marginBottom: "28px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    color: "var(--stock-label-color)",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    transition: "color 0.25s ease",
                  }}
                >
                  STATUS
                </div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--stock-text-primary)", transition: "color 0.25s ease" }}>
                  {statusDisplay}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "8px" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--stock-text-primary)",
                    margin: "0 0 10px 0",
                    letterSpacing: "-0.01em",
                    transition: "color 0.25s ease",
                  }}
                >
                  Description
                </h3>
                <p
                  style={{
                    color: "var(--stock-text-secondary)",
                    fontSize: "14.5px",
                    lineHeight: "1.65",
                    margin: 0,
                    whiteSpace: "pre-line",
                    transition: "color 0.25s ease",
                  }}
                >
                  {vehicle.description || "Hello This is a Test description"}
                </p>
              </div>
            </InteractiveGallery>
          </div>

          {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* 1. Booking & Inquiry Card */}
            <div
              style={{
                backgroundColor: "var(--stock-card-bg)",
                border: "1px solid var(--stock-card-border)",
                borderRadius: "14px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "var(--stock-card-shadow)",
                transition: "background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
              }}
            >
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--stock-text-primary)",
                  margin: "0 0 20px 0",
                  letterSpacing: "-0.01em",
                  transition: "color 0.25s ease",
                }}
              >
                Booking & Inquiry
              </h3>

              <VehicleBookingForm
                vehicleId={vehicle.id}
                carName={pageTitle}
                chassisCode={vehicle.chassis_code}
              />

              {/* OR CONNECT DIRECTLY */}
              <div
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "var(--stock-label-color)",
                  textTransform: "uppercase",
                  margin: "24px 0 14px 0",
                  transition: "color 0.25s ease",
                }}
              >
                OR CONNECT DIRECTLY
              </div>

              {/* WhatsApp direct chat button */}
              <a
                href={`https://wa.me/${whatsappPhone}?text=Hello,%20I%20am%20interested%20in%20the%20${encodeURIComponent(pageTitle)}%20(${vehicle.chassis_code})`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "13px",
                  backgroundColor: "#22c55e",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "14px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(34, 197, 94, 0.3)",
                  boxSizing: "border-box",
                  transition: "opacity 0.2s ease",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  chat
                </span>
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* 2. Vehicle Location Card */}
            <div
              style={{
                backgroundColor: "var(--stock-card-bg)",
                border: "1px solid var(--stock-card-border)",
                borderRadius: "14px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                boxShadow: "var(--stock-card-shadow)",
                transition: "background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--stock-text-primary)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                  transition: "color 0.25s ease",
                }}
              >
                Vehicle Location
              </h3>

              {/* Maps Preview Frame */}
              <div
                style={{
                  position: "relative",
                  height: "145px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid var(--stock-card-border)",
                }}
              >
                <iframe
                  src="https://maps.google.com/maps?q=56+Inner+Circular+Road+Eastern+Trade+Center+Purana+Paltan+Dhaka&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Good Car Imports Office Location"
                  style={{ border: 0, width: "100%", height: "100%" }}
                />
                <a
                  href="https://maps.google.com/?q=56+Inner+Circular+Road+Eastern+Trade+Center+Purana+Paltan+Dhaka"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    color: "#0f172a",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.25)",
                  }}
                >
                  <span>Maps</span>
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                    open_in_new
                  </span>
                </a>
              </div>

              {/* Office Details */}
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--stock-accent-red)", fontSize: "20px", marginTop: "2px", flexShrink: 0 }}
                >
                  location_on
                </span>
                <div style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--stock-text-secondary)", transition: "color 0.25s ease" }}>
                  <strong style={{ color: "var(--stock-text-primary)", display: "block", marginBottom: "2px", fontSize: "13.5px", transition: "color 0.25s ease" }}>
                    Our Office
                  </strong>
                  56 Inner Circular Road<br />
                  Eastern Trade Center (6 Floor)<br />
                  Purana Paltan Line Dhaka-1000
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ================= 5. SIMILAR VEHICLES SECTION ================= */}
        {similarVehicles.length > 0 && (
          <section style={{ marginTop: "72px" }}>
            <h2
              style={{
                fontSize: "26px",
                fontWeight: 800,
                color: "var(--stock-text-primary)",
                letterSpacing: "-0.015em",
                marginBottom: "24px",
                transition: "color 0.25s ease",
              }}
            >
              Similar Vehicles
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 320px))",
                gap: "24px",
              }}
            >
              {similarVehicles.map((sim) => (
                <Link
                  key={sim.id}
                  href={`/vehicles/${sim.slug}`}
                  style={{
                    textDecoration: "none",
                    backgroundColor: "var(--stock-card-bg)",
                    border: "1px solid var(--stock-card-border)",
                    borderRadius: "14px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "var(--stock-card-shadow)",
                    transition: "transform 0.2s ease, border-color 0.2s ease, background-color 0.25s ease, box-shadow 0.25s ease",
                  }}
                  className="similar-vehicle-card"
                >
                  {/* Photo with Grade Badge */}
                  <div
                    style={{
                      position: "relative",
                      height: "190px",
                      width: "100%",
                      backgroundColor: "var(--stock-badge-bg)",
                    }}
                  >
                    <img
                      src={normalizePhotoUrl(sim.cover_photo)}
                      alt={sim.car_name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {sim.auction_grade && (
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          backgroundColor: "rgba(0, 0, 0, 0.75)",
                          color: "#ffffff",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          backdropFilter: "blur(6px)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#fbbf24" }}>
                          star
                        </span>
                        <span>{sim.auction_grade} Grade</span>
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                    <div
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "var(--stock-label-color)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        transition: "color 0.25s ease",
                      }}
                    >
                      {sim.year_of_manufacture || "2024"} • {sim.package_trim || "Z LEATHER"}
                    </div>

                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: "var(--stock-text-primary)",
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: "0.01em",
                        transition: "color 0.25s ease",
                      }}
                    >
                      {sim.car_name}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        color: "var(--stock-text-secondary)",
                        fontSize: "12px",
                        marginTop: "2px",
                        transition: "color 0.25s ease",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
                          local_gas_station
                        </span>
                        {sim.fuel_type || "Petrol"}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
                          speed
                        </span>
                        {sim.mileage_km ? `${Math.round(sim.mileage_km / 1000)}k KM` : "N/A"}
                      </span>
                    </div>

                    <div style={{ marginTop: "10px", fontSize: "18px", fontWeight: 800, color: "var(--stock-accent-red)" }}>
                      ৳{formatPriceLakhs(sim.price_bdt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ================= FLOATING WHATSAPP CHAT BUTTON ================= */}
      <a
        href={`https://wa.me/${whatsappPhone}?text=Hello,%20I%20have%20an%20inquiry%20about%20the%20${encodeURIComponent(pageTitle)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#22c55e",
          color: "#ffffff",
          padding: "10px 18px",
          borderRadius: "999px",
          fontSize: "14px",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 6px 20px rgba(34, 197, 94, 0.45)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        className="floating-whatsapp-btn gci-btn-shine"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
          chat
        </span>
        <span>Start Chat</span>
      </a>
    </div>
  );
}
