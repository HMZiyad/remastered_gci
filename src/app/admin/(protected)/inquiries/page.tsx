import prisma from "@/lib/prisma";
import Link from "next/link";
import { connection } from "next/server";
import { formatBDT } from "@/lib/utils";
import { InquiryActions } from "@/components/admin/InquiryActions";
import { PreOrderActions } from "@/components/admin/PreOrderActions";

export const instant = false;

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connection();
  const resolvedParams = await searchParams;
  const tab = typeof resolvedParams.tab === "string" ? resolvedParams.tab : "inquiries";

  const [inquiries, preOrders] = await Promise.all([
    prisma.inquiry.findMany({ orderBy: { created_at: "desc" } }),
    prisma.preOrder.findMany({ orderBy: { created_at: "desc" } })
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="modern-table-container">
        {/* Modern Filter Pill Toolbar */}
        <div className="modern-table-toolbar">
          <div className="filter-pills-row" style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <Link 
                href="/admin/inquiries?tab=inquiries" 
                className={`filter-pill-item ${tab === 'inquiries' ? 'active' : ''}`}
              >
                Contact Inquiries ({inquiries.length})
              </Link>
              <Link 
                href="/admin/inquiries?tab=pre_orders" 
                className={`filter-pill-item ${tab === 'pre_orders' ? 'active' : ''}`}
              >
                Pre-Order Requests ({preOrders.length})
              </Link>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "20px",
              background: "rgba(34, 197, 94, 0.08)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              fontSize: "12px",
              fontWeight: 700,
              color: "#16a34a",
              letterSpacing: "0.3px",
            }}>
              <span className="live-pulse-dot" />
              <span>LIVE REFRESH ACTIVE</span>
            </div>
          </div>
        </div>

        {/* 1. Desktop / Tablet Table View (hidden on mobile <= 768px) */}
        <div className="inquiries-desktop-table" style={{ overflowX: "auto" }}>
          {tab === 'inquiries' ? (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>CUSTOMER NAME</th>
                  <th>CONTACT DETAILS</th>
                  <th>INTERESTED IN</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq.id} style={{ background: inq.status === 'new' ? 'rgba(239, 68, 68, 0.04)' : undefined }}>
                    <td style={{ color: "var(--admin-text-muted)", fontSize: "12.5px", fontWeight: 600 }}>
                      {inq.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--admin-text-main)" }}>
                      {inq.full_name}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inq.phone}</div>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>{inq.email}</div>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--admin-accent-blue)" }}>
                      {inq.interested_in || 'General Fleet'}
                    </td>
                    <td>
                      {inq.status === 'new' ? (
                        <span className="pill-badge new">NEW</span>
                      ) : (
                        <span className="pill-badge sold">{inq.status}</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <InquiryActions inquiryId={inq.id} />
                    </td>
                  </tr>
                ))}
                {inquiries.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "var(--admin-text-muted)" }}>
                      No contact inquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>CUSTOMER NAME</th>
                  <th>CONTACT</th>
                  <th>CAR REQUESTED</th>
                  <th>EST. BUDGET</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {preOrders.map((po) => (
                  <tr key={po.id} style={{ background: po.status === 'new' ? 'rgba(239, 68, 68, 0.04)' : undefined }}>
                    <td style={{ color: "var(--admin-text-muted)", fontSize: "12.5px", fontWeight: 600 }}>
                      {po.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--admin-text-main)" }}>
                      {po.full_name}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{po.phone}</div>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>{po.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--admin-text-main)" }}>{po.make_model}</div>
                      <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>{po.year_from}+ • {po.body_style}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--admin-accent-green)" }}>
                      {po.budget_min_bdt ? (
                        `${formatBDT(Number(po.budget_min_bdt), true)} - ${formatBDT(Number(po.budget_max_bdt), true)}`
                      ) : 'Not specified'}
                    </td>
                    <td>
                      {po.status === 'new' ? (
                        <span className="pill-badge new">NEW</span>
                      ) : (
                        <span className="pill-badge sold">{po.status}</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <PreOrderActions preOrderId={po.id} />
                    </td>
                  </tr>
                ))}
                {preOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "var(--admin-text-muted)" }}>
                      No pre-orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 2. Mobile Cards View (displayed on mobile screens <= 768px) */}
        <div className="inquiries-mobile-cards">
          {tab === 'inquiries' ? (
            inquiries.map((inq) => (
              <div key={`mob-inq-${inq.id}`} className="responsive-mobile-card">
                <div className="res-card-top">
                  <div className="res-card-main-meta">
                    <div className="res-card-title">{inq.full_name}</div>
                    <div className="res-card-sub-line">
                      <span>{inq.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {inq.status === 'new' ? (
                      <span className="pill-badge new">NEW</span>
                    ) : (
                      <span className="pill-badge sold">{inq.status}</span>
                    )}
                  </div>
                </div>

                <div className="res-card-chips-grid">
                  <div className="res-chip" style={{ gridColumn: "1 / -1" }}>
                    <span className="res-chip-label">INTERESTED VEHICLE / FLEET</span>
                    <span className="res-chip-val font-bold" style={{ color: "var(--admin-accent-blue)" }}>
                      {inq.interested_in || 'General Fleet'}
                    </span>
                  </div>
                  {inq.phone && (
                    <div className="res-chip">
                      <span className="res-chip-label">PHONE</span>
                      <a href={`tel:${inq.phone}`} className="res-chip-val" style={{ color: "#2563eb", textDecoration: "none" }}>
                        {inq.phone}
                      </a>
                    </div>
                  )}
                  {inq.email && (
                    <div className="res-chip">
                      <span className="res-chip-label">EMAIL</span>
                      <a href={`mailto:${inq.email}`} className="res-chip-val" style={{ color: "#2563eb", textDecoration: "none" }}>
                        {inq.email}
                      </a>
                    </div>
                  )}
                </div>

                {inq.message && (
                  <div style={{
                    background: "var(--admin-subcard)",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--admin-text-muted)",
                    lineHeight: "1.5",
                    margin: "10px 0",
                    borderLeft: "3px solid #2563eb",
                  }}>
                    {inq.message}
                  </div>
                )}

                <div className="res-card-actions">
                  <div style={{ marginLeft: "auto" }}>
                    <InquiryActions inquiryId={inq.id} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            preOrders.map((po) => (
              <div key={`mob-po-${po.id}`} className="responsive-mobile-card">
                <div className="res-card-top">
                  <div className="res-card-main-meta">
                    <div className="res-card-title">{po.full_name}</div>
                    <div className="res-card-sub-line">
                      <span>{po.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {po.status === 'new' ? (
                      <span className="pill-badge new">NEW</span>
                    ) : (
                      <span className="pill-badge sold">{po.status}</span>
                    )}
                  </div>
                </div>

                <div className="res-card-chips-grid">
                  <div className="res-chip" style={{ gridColumn: "1 / -1" }}>
                    <span className="res-chip-label">TARGET VEHICLE</span>
                    <span className="res-chip-val font-bold" style={{ color: "var(--admin-accent-blue)", fontSize: "14px" }}>
                      {po.make_model}
                    </span>
                  </div>
                  <div className="res-chip">
                    <span className="res-chip-label">EST. BUDGET</span>
                    <span className="res-chip-val font-bold" style={{ color: "var(--admin-accent-green)" }}>
                      {po.budget_min_bdt ? (
                        `${formatBDT(Number(po.budget_min_bdt), true)} - ${formatBDT(Number(po.budget_max_bdt), true)}`
                      ) : 'Not specified'}
                    </span>
                  </div>
                  <div className="res-chip">
                    <span className="res-chip-label">BODY / YEAR</span>
                    <span className="res-chip-val">{po.year_from ? `${po.year_from}+` : 'Any'} • {po.body_style || 'Any'}</span>
                  </div>
                  {po.phone && (
                    <div className="res-chip">
                      <span className="res-chip-label">PHONE</span>
                      <a href={`tel:${po.phone}`} className="res-chip-val" style={{ color: "#2563eb", textDecoration: "none" }}>
                        {po.phone}
                      </a>
                    </div>
                  )}
                  {po.email && (
                    <div className="res-chip">
                      <span className="res-chip-label">EMAIL</span>
                      <a href={`mailto:${po.email}`} className="res-chip-val" style={{ color: "#2563eb", textDecoration: "none" }}>
                        {po.email}
                      </a>
                    </div>
                  )}
                </div>

                <div className="res-card-actions">
                  <div style={{ marginLeft: "auto" }}>
                    <PreOrderActions preOrderId={po.id} />
                  </div>
                </div>
              </div>
            ))
          )}

          {((tab === 'inquiries' && inquiries.length === 0) || (tab === 'pre_orders' && preOrders.length === 0)) && (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--admin-text-muted)" }}>
              No {tab === 'inquiries' ? 'contact inquiries' : 'pre-orders'} found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
