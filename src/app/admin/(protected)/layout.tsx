import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminLiveSync } from "@/components/admin/AdminLiveSync";
import { AddVehicleModal } from "@/components/admin/AddVehicleModal";
import { AddStockInwardModal } from "@/components/admin/AddStockInwardModal";
import { Suspense } from "react";
import "../admin.css";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If not logged in, redirect to login page
  if (!session.isLoggedIn) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Overlay (mobile) */}
      <div className="sidebar-overlay" id="sidebarOverlay"></div>

      {/* ===== SIDEBAR ===== */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "16px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.2)"
          }}>
            G
          </div>
          <div>
            <div className="sidebar-brand-name">Good Car Imports</div>
            <div className="sidebar-portal-label">Executive Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            <li className="sidebar-nav-item">
              <Link href="/admin" className="sidebar-nav-link">
                <span className="material-symbols-outlined">grid_view</span>
                <span>Home</span>
              </Link>
            </li>
            <li className="sidebar-nav-item">
              <Link href="/admin/inventory" className="sidebar-nav-link">
                <span className="material-symbols-outlined">directions_car</span>
                <span>Live Fleet</span>
              </Link>
              <Link href="?modal=add-vehicle" className="sidebar-nav-quick-add" title="Add New Vehicle">
                +
              </Link>
            </li>
            <li className="sidebar-nav-item">
              <Link href="/admin/stock-inward" className="sidebar-nav-link">
                <span className="material-symbols-outlined">local_shipping</span>
                <span>Stock Inward</span>
              </Link>
              <Link href="?modal=add-stock-inward" className="sidebar-nav-quick-add" title="Inward Vehicle">
                +
              </Link>
            </li>
            <li className="sidebar-nav-item">
              <Link href="/admin/sales-register" className="sidebar-nav-link">
                <span className="material-symbols-outlined">receipt_long</span>
                <span>Sales Register</span>
              </Link>
            </li>
            <li className="sidebar-nav-item">
              <Link href="/admin/inquiries" className="sidebar-nav-link">
                <span className="material-symbols-outlined">chat_bubble_outline</span>
                <span>Inquiries & Leads</span>
              </Link>
            </li>
          </ul>

          {/* Executive Hub Card (Styled like "Upgrade to Pro" in reference image) */}
          <div className="sidebar-promo-card">
            <div className="sidebar-promo-title">Executive Hub</div>
            <div className="sidebar-promo-desc">
              Direct Japanese auction access & live ledger sync
            </div>
            <Link href="?modal=add-vehicle" className="sidebar-promo-btn">
              + Inward Vehicle
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link href="/admin/report" target="_blank" className="sidebar-footer-link">
            <span className="material-symbols-outlined">help_outline</span>
            <span>Business Report</span>
          </Link>
          <div style={{ padding: "0 4px" }}>
            <LogoutButton />
          </div>

          <div className="user-profile-chip">
            <div className="user-avatar">{"A"}</div>
            <div className="user-info">
              <div className="user-name">{"Executive Admin"}</div>
              <div className="user-title">Managing Director</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <main className="admin-main">
        <AdminTopbar />

        {/* Page Content */}
        {children}
      </main>

      {/* Global Modals & Real-Time Live Sync */}
      <AdminLiveSync />
      <Suspense fallback={null}>
        <AddVehicleModal />
        <AddStockInwardModal />
      </Suspense>
    </div>
  );
}
