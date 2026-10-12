"use client";

import { deleteInquiry, getInquiryById } from "@/app/actions/inquiry";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function InquiryActions({ inquiryId }: { inquiryId: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleView = async () => {
    setLoadingDetail(true);
    try {
      const data = await getInquiryById(inquiryId);
      setDetail(data as Record<string, unknown> | null);
      setShowDetail(true);
      router.refresh(); // Refresh to update status badge
    } catch {
      alert("Failed to load inquiry details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    setIsDeleting(true);
    try {
      const result = await deleteInquiry(inquiryId);
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
          title="Delete Inquiry"
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
            style={{ maxWidth: "520px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                <h2>Inquiry Details</h2>
                <span className="badge-modern badge-blue">ID #{inquiryId}</span>
              </div>
              <button className="icon-btn" onClick={() => setShowDetail(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <DetailRow label="Name" value={String(detail.full_name || "")} />
              <DetailRow label="Phone" value={String(detail.phone || "N/A")} />
              <DetailRow label="Email" value={String(detail.email || "N/A")} />
              <DetailRow label="Interested In" value={String(detail.interested_in || "General")} />
              <DetailRow label="Status" value={String(detail.status || "")} />
              {Boolean(detail.message) && (
                <div style={{ marginTop: "4px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Message</div>
                  <div style={{ fontSize: "13px", padding: "12px 14px", background: "var(--admin-subcard)", borderRadius: "12px", border: "1px solid var(--admin-border-subtle)", whiteSpace: "pre-wrap", lineHeight: 1.5, color: "var(--admin-text-main)" }}>
                    {String(detail.message)}
                  </div>
                </div>
              )}
              <DetailRow label="Date Received" value={detail.created_at ? new Date(detail.created_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"} />
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
