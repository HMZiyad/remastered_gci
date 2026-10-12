import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatBDT } from "@/lib/utils";
import { connection } from "next/server";

export const instant = false;

export default async function AdminSalesRegisterPage() {
  await connection();
  
  const totalSales = await prisma.sale.count();
  
  const sales = await prisma.sale.findMany({
    orderBy: { sale_date: "desc" },
    include: { vehicle: true }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="modern-table-container">
        <div className="modern-table-toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--admin-text-main)" }}>
              Delivered & Cleared Sales Register
            </span>
            <span className="admin-card-badge">
              {totalSales} Realized Sales
            </span>
          </div>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <a 
              href="/admin/report" 
              target="_blank" 
              className="btn-modern-outline"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>print</span>
              <span>Print Sales Ledger</span>
            </a>
          </div>
        </div>

        {/* 1. Desktop / Tablet Table View (hidden on mobile <= 768px) */}
        <div className="sales-desktop-table" style={{ overflowX: "auto" }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: "280px" }}>VEHICLE & MODEL</th>
                <th>CHASSIS CODE</th>
                <th>BUYER / REGION</th>
                <th>SALE DATE</th>
                <th>PAYMENT</th>
                <th style={{ textAlign: "right" }}>SALE PRICE (BDT)</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const words = s.car_name.split(' ');
                const firstLine = words.slice(0, 3).join(' ');
                const secondLine = words.slice(3).join(' ');
                
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="table-car-cell">
                        <img 
                          src={s.vehicle?.cover_photo ? `/uploads/${s.vehicle.cover_photo}` : "/images/placeholder-car.svg"} 
                          alt="Car" 
                          className="table-car-img" 
                        />
                        <div className="table-car-info">
                          <span className="table-car-name" style={{ textTransform: "uppercase" }}>
                            {firstLine} {secondLine}
                          </span>
                          {s.vehicle?.slug && (
                            <Link href={`/vehicles/${s.vehicle.slug}`} target="_blank" style={{ fontSize: "11.5px", color: "var(--admin-accent-blue)", textDecoration: "none", fontWeight: 600 }}>
                              View Listing ↗
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="chassis-tag">
                        {s.chassis_code || 'N/A'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--admin-text-main)" }}>
                      {s.client_area || 'Direct Showroom Sale'}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--admin-text-muted)" }}>
                      {s.sale_date ? s.sale_date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td>
                      <span className="pill-badge available">
                        {s.payment_status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 800, fontSize: "15px", color: "var(--admin-text-main)" }}>
                      {s.sale_price_bdt ? formatBDT(Number(s.sale_price_bdt)) : '-'}
                    </td>
                  </tr>
                );
              })}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "48px 0", color: "var(--admin-text-muted)" }}>
                    No sales records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 2. Mobile Cards View (displayed on mobile screens <= 768px) */}
        <div className="sales-mobile-cards">
          {sales.map((s) => (
            <div key={`mob-sale-${s.id}`} className="responsive-mobile-card">
              <div className="res-card-top">
                <img
                  src={s.vehicle?.cover_photo ? `/uploads/${s.vehicle.cover_photo}` : "/images/placeholder-car.svg"}
                  alt={s.car_name}
                  className="res-card-thumb"
                />
                <div className="res-card-main-meta">
                  <div className="res-card-title">{s.car_name}</div>
                  <div className="res-card-sub-line">
                    <span className="chassis-tag">{s.chassis_code || 'N/A'}</span>
                    <span className="pill-badge available" style={{ marginLeft: "4px" }}>{s.payment_status}</span>
                  </div>
                </div>
              </div>

              <div className="res-card-chips-grid">
                <div className="res-chip">
                  <span className="res-chip-label">BUYER / AREA</span>
                  <span className="res-chip-val">{s.client_area || 'Direct Showroom'}</span>
                </div>
                <div className="res-chip">
                  <span className="res-chip-label">SALE DATE</span>
                  <span className="res-chip-val">
                    {s.sale_date ? s.sale_date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                </div>
                <div className="res-chip" style={{ gridColumn: "1 / -1" }}>
                  <span className="res-chip-label">REALIZED SALE PRICE</span>
                  <span className="res-chip-val font-bold" style={{ fontSize: "16px", color: "var(--admin-text-main)" }}>
                    {s.sale_price_bdt ? formatBDT(Number(s.sale_price_bdt)) : '—'}
                  </span>
                </div>
              </div>

              {s.vehicle?.slug && (
                <div className="res-card-actions">
                  <Link
                    href={`/vehicles/${s.vehicle.slug}`}
                    target="_blank"
                    className="btn-card-action"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>visibility</span>
                    <span>View Public Vehicle Page</span>
                  </Link>
                </div>
              )}
            </div>
          ))}

          {sales.length === 0 && (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--admin-text-muted)" }}>
              No sales records found.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: "1px solid var(--admin-border-subtle)", background: "var(--admin-subcard)" }}>
          <div style={{ fontSize: "12.5px", color: "var(--admin-text-muted)", fontWeight: 600 }}>
            Showing {sales.length} of {totalSales} recorded sales
          </div>
        </div>
      </div>
    </div>
  );
}
