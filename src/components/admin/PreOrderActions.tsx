"use client";

import { deletePreOrder, getPreOrderById } from "@/app/actions/inquiry";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatBDT } from "@/lib/utils";

export function PreOrderActions({ preOrderId }: { preOrderId: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleView = async () => {
    setLoadingDetail(true);
    try {
      const data = await getPreOrderById(preOrderId);
      setDetail(data as Record<string, unknown> | null);
      setShowDetail(true);
      router.refresh(); // Refresh to update status badge
    } catch {
      alert("Failed to load pre-order details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this pre-order?")) return;
    setIsDeleting(true);
    try {
      const result = await deletePreOrder(preOrderId);
      if (result.success) {
        router.refresh();
      } else {
        alert("Failed to delete: " + result.error);
      }
    } catch {
      alert("An error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
        <button
          className="btn-modern-outline"
          style={{ padding: "6px 14px", fontSize: "12px" }}
          onClick={handleView}
          disabled={loadingDetail}
        >
          {loadingDetail ? "..." : "View"}
        </button>
        <button
          className="action-circle-btn action-circle-delete"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete Pre-Order"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>delete</span>
        </button>
      </div>

      {/* View Detail Modal */}
      {showDetail && detail && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="modal-container"
            style={{ maxWidth: "560px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                <h2>Pre-Order Details</h2>
                <span className="badge-modern badge-blue">ID #{preOrderId}</span>
              </div>
              <button className="icon-btn" onClick={() => setShowDetail(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <DetailRow label="Client Name" value={String(detail.full_name || "")} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <DetailRow label="Phone" value={String(detail.phone || "N/A")} />
                <DetailRow label="WhatsApp" value={String(detail.whatsapp || "N/A")} />
              </div>
              <DetailRow label="Email" value={String(detail.email || "N/A")} />
              
              <div style={{ margin: "6px 0 2px", padding: "10px 14px", background: "rgba(37, 99, 235, 0.05)", borderRadius: "14px", border: "1px solid rgba(37, 99, 235, 0.15)" }}>
                <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--admin-accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Requested Specification</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--admin-navy)" }}>{String(detail.make_model || "N/A")}</div>
                <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", marginTop: "2px" }}>
                  Origin: {String(detail.region_of_origin || "N/A")} • Style: {String(detail.body_style || "N/A")} • YOM: {`${detail.year_from || '?'} – ${detail.year_to || '?'}`}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <DetailRow label="Budget" value={
                  detail.budget_min_bdt 
                    ? `${formatBDT(Number(detail.budget_min_bdt), true)} – ${formatBDT(Number(detail.budget_max_bdt), true)}`
                    : "Not specified"
                } />
                <DetailRow label="Timeline" value={String(detail.timeline || "N/A")} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <DetailRow label="Color Preference" value={String(detail.color_preference || "N/A")} />
                <DetailRow label="Status" value={String(detail.status || "")} />
              </div>

              {Boolean(detail.additional_notes) && (
                <div style={{ marginTop: "4px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Additional Notes</div>
                  <div style={{ fontSize: "13px", padding: "12px 14px", background: "var(--admin-subcard)", borderRadius: "12px", border: "1px solid var(--admin-border-subtle)", whiteSpace: "pre-wrap", lineHeight: 1.5, color: "var(--admin-text-main)" }}>
                    {String(detail.additional_notes)}
                  </div>
                </div>
              )}
              <DetailRow label="Date Submitted" value={detail.created_at ? new Date(detail.created_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"} />
            </div>

            <div className="modal-footer" style={{ justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setShowDetail(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "8px 12px", background: "var(--admin-subcard)", borderRadius: "12px", border: "1px solid var(--admin-border-subtle)" }}>
      <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--admin-text-main)" }}>{value}</div>
    </div>
  );
}
