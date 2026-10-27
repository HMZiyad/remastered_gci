"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DeleteVehicleButton } from "@/components/admin/DeleteVehicleButton";

export interface SerializedVehicle {
  id: number;
  car_name: string;
  cover_photo: string | null;
  body_type: string | null;
  fuel_type: string | null;
  package_trim: string | null;
  year_of_manufacture: number | null;
  color_name: string | null;
  auction_grade: string | null;
  mileage_km: number | null;
  engine_cc: number | null;
  chassis_code: string;
  transmission: string | null;
  status: string;
  slug: string | null;
}

export function InventoryTable({ vehicles }: { vehicles: SerializedVehicle[] }) {
  // Screen-size detection for responsive page size
  // On smaller laptop screens (height <= 800px): defaults to 5-6 rows
  // On medium screens (height <= 950px): defaults to 8-10 rows
  // On large desktop screens: defaults to 15-20 rows
  const [detectedAutoPageSize, setDetectedAutoPageSize] = useState<number>(5);
  const [selectedPageSize, setSelectedPageSize] = useState<number | "auto" | "all">("auto");
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const calculateAutoPageSize = () => {
      if (typeof window === "undefined") return;
      const h = window.innerHeight;
      if (h <= 780) {
        setDetectedAutoPageSize(5);
      } else if (h <= 880) {
        setDetectedAutoPageSize(6);
      } else if (h <= 980) {
        setDetectedAutoPageSize(10);
      } else {
        setDetectedAutoPageSize(20);
      }
    };

    calculateAutoPageSize();
    window.addEventListener("resize", calculateAutoPageSize);
    return () => window.removeEventListener("resize", calculateAutoPageSize);
  }, []);

  const effectivePageSize = useMemo(() => {
    if (selectedPageSize === "all") return Math.max(vehicles.length, 1);
    if (selectedPageSize === "auto") return detectedAutoPageSize;
    return selectedPageSize;
  }, [selectedPageSize, detectedAutoPageSize, vehicles.length]);

  const totalPages = Math.max(1, Math.ceil(vehicles.length / effectivePageSize));

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * effectivePageSize;
    return vehicles.slice(start, start + effectivePageSize);
  }, [vehicles, currentPage, effectivePageSize]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vessel_transit":
        return <span className="pill-badge transit">On Vessel</span>;
      case "port_clearance":
        return <span className="pill-badge port">Customs (CTG)</span>;
      case "available":
        return <span className="pill-badge available">Showroom Ready</span>;
      case "sold":
        return <span className="pill-badge sold">Sold</span>;
      case "reserved":
        return <span className="pill-badge reserved">Reserved</span>;
      default:
        return <span className="pill-badge sold">{status}</span>;
    }
  };

  return (
    <div>
      {/* 1. Desktop / Tablet Table View (hidden on mobile) */}
      <div className="inventory-desktop-table" style={{ overflowX: "auto", width: "100%" }}>
        <table className="modern-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", verticalAlign: "middle", paddingLeft: "16px" }}>CAR BRAND</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }}>PACKAGE</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }}>YEAR OF MANUFACTURE</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }}>COLOR</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }}>AUC/GRADE</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }}>MILEAGE (KM)</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }}>ENGINE /CC</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }}>CHASSIS NO.</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }}>TRANS.</th>
              <th style={{ textAlign: "center", verticalAlign: "middle" }}>STATUS</th>
              <th style={{ textAlign: "center", verticalAlign: "middle", paddingRight: "16px" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVehicles.map((v) => {
              return (
                <tr key={v.id}>
                  {/* Car Brand & Photo */}
                  <td style={{ textAlign: "left", verticalAlign: "middle", paddingLeft: "16px" }}>
                    <div className="table-car-cell" style={{ gap: "8px" }}>
                      <img
                        src={v.cover_photo ? `/uploads/${v.cover_photo}` : "/images/placeholder-car.svg"}
                        alt="Car"
                        className="table-car-img"
                        style={{ width: "34px", height: "34px", borderRadius: "8px" }}
                      />
                      <div className="table-car-info">
                        <span
                          className="table-car-name"
                          style={{
                            textTransform: "uppercase",
                            fontSize: "11.5px",
                            fontWeight: 700,
                            letterSpacing: "0.01em",
                          }}
                        >
                          {v.car_name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Package */}
                  <td
                    style={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      fontSize: "11.5px",
                    }}
                  >
                    {v.package_trim || "-"}
                  </td>

                  {/* Year of Manufacture */}
                  <td style={{ textAlign: "center", verticalAlign: "middle", fontWeight: 700, fontSize: "11.5px" }}>
                    {v.year_of_manufacture || "-"}
                  </td>

                  {/* Color */}
                  <td
                    style={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      textTransform: "capitalize",
                      color: "var(--admin-text-muted)",
                      fontSize: "11.5px",
                    }}
                  >
                    {v.color_name || "-"}
                  </td>

                  {/* AUC/Grade */}
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <span
                      style={{
                        fontSize: "10.5px",
                        padding: "2px 6px",
                        borderRadius: "5px",
                        fontWeight: 700,
                        background: "var(--admin-pill-bg)",
                        display: "inline-block",
                      }}
                    >
                      {v.auction_grade || "-"}
                    </span>
                  </td>

                  {/* Mileage (KM) */}
                  <td
                    style={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      fontSize: "11px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v.mileage_km ? `${new Intl.NumberFormat("en-IN").format(v.mileage_km)} km` : "-"}
                  </td>

                  {/* Engine /CC */}
                  <td style={{ textAlign: "center", verticalAlign: "middle", fontSize: "11px", whiteSpace: "nowrap" }}>
                    {v.engine_cc ? `${new Intl.NumberFormat("en-IN").format(v.engine_cc)} cc` : "-"}
                  </td>

                  {/* Chassis No. */}
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <span className="chassis-tag" style={{ fontSize: "10.5px", padding: "2px 6px" }}>
                      {v.chassis_code}
                    </span>
                  </td>

                  {/* Trans. */}
                  <td
                    style={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      fontWeight: 600,
                      fontSize: "11.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {v.transmission || "AT"}
                  </td>

                  {/* Status */}
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    {getStatusBadge(v.status)}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: "center", verticalAlign: "middle", paddingRight: "16px" }}>
                    <div style={{ display: "inline-flex", gap: "4px", justifyContent: "center", alignItems: "center" }}>
                      <Link
                        href={`?modal=add-vehicle&id=${v.id}`}
                        className="action-icon-btn"
                        title="Edit Vehicle"
                        style={{ width: "26px", height: "26px" }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                          edit
                        </span>
                      </Link>
                      <a
                        href={`/vehicles/${v.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-icon-btn"
                        title="View Public Page"
                        style={{ width: "26px", height: "26px" }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                          visibility
                        </span>
                      </a>
                      <DeleteVehicleButton vehicleId={v.id} />
                    </div>
                  </td>
                </tr>
              );
            })}

            {vehicles.length === 0 && (
              <tr>
                <td colSpan={11} style={{ padding: "48px", textAlign: "center", color: "var(--admin-text-muted)" }}>
                  No vehicles found for the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Cards View (displayed on mobile screens <= 768px) */}
      <div className="inventory-mobile-cards">
        {paginatedVehicles.map((v) => {
          const bodyTypeLabel = (v.body_type === "HIACE_Van" ? "HIACE-Van" : v.body_type) || "—";
          const fuelTypeLabel = v.fuel_type || "—";

          return (
            <div key={`mob-${v.id}`} className="responsive-mobile-card">
              {/* Header: Photo + Info + Status */}
              <div className="res-card-top">
                <img
                  src={v.cover_photo ? `/uploads/${v.cover_photo}` : "/images/placeholder-car.svg"}
                  alt={v.car_name}
                  className="res-card-thumb"
                />
                <div className="res-card-main-meta">
                  <div className="res-card-title">{v.car_name}</div>
                  <div className="res-card-sub-line">
                    <span className="fw-bold">{v.year_of_manufacture || "—"}</span>
                    {v.package_trim && <span>• {v.package_trim}</span>}
                    {v.color_name && <span>• {v.color_name}</span>}
                  </div>
                  <div style={{ marginTop: "6px" }}>
                    {getStatusBadge(v.status)}
                  </div>
                </div>
              </div>

              {/* Specs Pills Grid */}
              <div className="res-card-chips-grid">
                <div className="res-chip">
                  <span className="res-chip-label">BODY</span>
                  <span className="res-chip-val">{bodyTypeLabel}</span>
                </div>
                <div className="res-chip">
                  <span className="res-chip-label">FUEL</span>
                  <span className="res-chip-val">{fuelTypeLabel}</span>
                </div>
                <div className="res-chip">
                  <span className="res-chip-label">GRADE</span>
                  <span className="res-chip-val">{v.auction_grade || "—"}</span>
                </div>
                <div className="res-chip">
                  <span className="res-chip-label">MILEAGE</span>
                  <span className="res-chip-val">{v.mileage_km ? `${new Intl.NumberFormat("en-IN").format(v.mileage_km)} km` : "—"}</span>
                </div>
                <div className="res-chip">
                  <span className="res-chip-label">ENGINE</span>
                  <span className="res-chip-val">{v.engine_cc ? `${new Intl.NumberFormat("en-IN").format(v.engine_cc)} cc` : "—"}</span>
                </div>
                <div className="res-chip">
                  <span className="res-chip-label">CHASSIS</span>
                  <span className="res-chip-val chassis-code-tag">{v.chassis_code || "—"}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="res-card-actions">
                <Link
                  href={`?modal=add-vehicle&id=${v.id}`}
                  className="btn-card-action"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                  <span>Edit</span>
                </Link>
                {v.slug && (
                  <a
                    href={`/vehicles/${v.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-card-action"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>visibility</span>
                    <span>View Page</span>
                  </a>
                )}
                <div style={{ marginLeft: "auto" }}>
                  <DeleteVehicleButton vehicleId={v.id} />
                </div>
              </div>
            </div>
          );
        })}

        {vehicles.length === 0 && (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--admin-text-muted)" }}>
            No vehicles found for the selected filter.
          </div>
        )}
      </div>

      {/* Modern Responsive Pagination Footer */}
      {vehicles.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 20px",
            background: "#ffffff",
            borderTop: "1px solid var(--admin-border-subtle)",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          {/* Summary */}
          <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", fontWeight: 500 }}>
            Showing{" "}
            <strong style={{ color: "var(--admin-text-main)" }}>
              {(currentPage - 1) * effectivePageSize + 1}
            </strong>
            –
            <strong style={{ color: "var(--admin-text-main)" }}>
              {Math.min(currentPage * effectivePageSize, vehicles.length)}
            </strong>{" "}
            of <strong style={{ color: "var(--admin-text-main)" }}>{vehicles.length}</strong> vehicles
          </div>

          {/* Numbered Page Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                border: "1px solid var(--admin-border-subtle)",
                background: "#ffffff",
                color: currentPage === 1 ? "#cbd5e1" : "var(--admin-text-main)",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
              title="Previous Page"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                chevron_left
              </span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              if (
                totalPages > 6 &&
                pageNum !== 1 &&
                pageNum !== totalPages &&
                Math.abs(pageNum - currentPage) > 1
              ) {
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return (
                    <span key={`dots-${pageNum}`} style={{ padding: "0 2px", color: "#94a3b8", fontSize: "11px" }}>
                      ...
                    </span>
                  );
                }
                return null;
              }

              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "28px",
                    height: "28px",
                    padding: "0 6px",
                    borderRadius: "7px",
                    border: isActive ? "1.5px solid #0f172a" : "1px solid var(--admin-border-subtle)",
                    background: isActive ? "#0f172a" : "#ffffff",
                    color: isActive ? "#ffffff" : "var(--admin-text-main)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "11.5px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                border: "1px solid var(--admin-border-subtle)",
                background: "#ffffff",
                color: currentPage >= totalPages ? "#cbd5e1" : "var(--admin-text-main)",
                cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
              title="Next Page"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                chevron_right
              </span>
            </button>
          </div>

          {/* Rows per page selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontSize: "11px",
                color: "var(--admin-text-muted)",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Per page:
            </span>
            <div
              style={{
                display: "inline-flex",
                background: "var(--admin-pill-bg)",
                borderRadius: "8px",
                padding: "2px",
                gap: "2px",
              }}
            >
              {[
                { label: `Auto (${detectedAutoPageSize})`, value: "auto" as const },
                { label: "5", value: 5 },
                { label: "10", value: 10 },
                { label: "20", value: 20 },
                { label: "All", value: "all" as const },
              ].map((opt) => {
                const isSelected = selectedPageSize === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      setSelectedPageSize(opt.value);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "3px 8px",
                      borderRadius: "6px",
                      border: "none",
                      background: isSelected ? "#0f172a" : "transparent",
                      color: isSelected ? "#ffffff" : "var(--admin-text-muted)",
                      fontSize: "11px",
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
