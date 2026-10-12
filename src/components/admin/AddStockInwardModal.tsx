"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getStockInwardById, saveStockInward, deleteStockInward } from "@/app/actions/stockInward";

export function AddStockInwardModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOpen = searchParams.get("modal") === "add-stock-inward";
  const editId = searchParams.get("edit_inward") || searchParams.get("id");

  const [jpyPrice, setJpyPrice] = useState<number | "">("");
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const forexRate = 0.78; // Hardcoded default for UI

  useEffect(() => {
    if (isOpen && editId) {
      setIsLoading(true);
      getStockInwardById(Number(editId)).then((data) => {
        setInitialData(data as Record<string, unknown> | null);
        if (data?.won_price_jpy) {
          setJpyPrice(Number(data.won_price_jpy));
        }
        setIsLoading(false);
      });
    } else {
      setInitialData(null);
      setJpyPrice("");
      setIsLoading(false);
    }
  }, [isOpen, editId]);

  useEffect(() => {
    if (initialData && formRef.current) {
      const form = formRef.current;
      Object.keys(initialData).forEach((key) => {
        const input = form.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement;
        if (input && key !== "won_price_jpy" && key !== "bdt_equivalent") {
          const val = initialData[key];
          input.value = val === null || val === undefined ? "" : String(val);
        }
      });
    } else if (!editId && formRef.current) {
      formRef.current.reset();
      setJpyPrice("");
    }
  }, [initialData, editId, isOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    params.delete("edit_inward");
    params.delete("id");
    setFeedback(null);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleDelete = async () => {
    if (!editId) return;
    if (!confirm("Are you sure you want to delete this stock inward record?")) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const result = await deleteStockInward(Number(editId));
      if (result.success) {
        setFeedback({ type: "success", message: "Record deleted successfully." });
        setTimeout(() => {
          router.refresh();
          closeModal();
        }, 800);
      } else {
        setFeedback({ type: "error", message: result.error || "Failed to delete record." });
      }
    } catch {
      setFeedback({ type: "error", message: "An error occurred while deleting." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const result = await saveStockInward(editId ? Number(editId) : null, formData);

      if (result.success) {
        setFeedback({ type: "success", message: editId ? "Stock inward record updated successfully." : "Vehicle successfully added to inward pipeline." });
        setTimeout(() => {
          router.refresh();
          closeModal();
        }, 1000);
      } else {
        setFeedback({ type: "error", message: result.error || "An error occurred." });
      }
    } catch (err: any) {
      console.error("Save stock inward error:", err);
      const msg = err?.message || (typeof err === "string" ? err : "An unexpected error occurred.");
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay active" id="modalOverlay" onClick={closeModal} style={{ display: "flex" }}>
      
      <div className="modal-container" id="stockInwardModal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
        {isLoading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--secondary)" }}>Loading record data...</div>
        ) : (
        <form ref={formRef} id="stockInwardForm" onSubmit={handleSubmit}>
          <div className="modal-header">
            <div className="modal-title">
              <h2>{editId ? "Edit Stock Inward Record" : "Inward Vehicle from Japan Auction"}</h2>
              <span className="badge-modern badge-blue">
                {editId ? "Editing Record" : "Step 1/5 Pipeline"}
              </span>
            </div>
            <button type="button" className="icon-btn" onClick={closeModal}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {feedback && (
              <div className={`form-message ${feedback.type}`} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderRadius: "14px", marginBottom: "16px", background: feedback.type === "success" ? "#ecfdf5" : "#fef2f2", color: feedback.type === "success" ? "#065f46" : "#991b1b", border: `1px solid ${feedback.type === "success" ? "#a7f3d0" : "#fecaca"}` }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  {feedback.type === "success" ? "check_circle" : "error"}
                </span>
                {feedback.message}
              </div>
            )}

            <div className="form-group mandatory-field">
              <label className="form-label">Pipeline Stage</label>
              <select name="current_stage" className="form-select" required>
                <option value="auction_won">1. Auction Won (Awaiting Transport)</option>
                <option value="japan_yard">2. Japan Export Yard</option>
                <option value="sea_transit">3. Sea Transit Afloat</option>
                <option value="ctg_customs">4. Chittagong Customs</option>
                <option value="dhaka_handover">5. Tejgaon Hub Handover</option>
              </select>
            </div>

            <div className="form-section-title" style={{ marginTop: "24px" }}>Vehicle Identification</div>
            <div className="form-group mandatory-field highlight-field">
              <label className="form-label">Chassis Code (MANDATORY & CIRCLED)</label>
              <input type="text" name="chassis_code" className="form-input" required placeholder="e.g. GDJ250-001928" />
            </div>

            <div className="grid-2-col">
              <div className="form-group mandatory-field">
                <label className="form-label">Car Name</label>
                <input type="text" name="car_name" className="form-input" required placeholder="e.g. Toyota Land Cruiser 250" />
              </div>
              <div className="form-group">
                <label className="form-label">Package/Trim</label>
                <input type="text" name="package_trim" className="form-input" placeholder="e.g. VX Package" />
              </div>
              <div className="form-group mandatory-field">
                <label className="form-label">Year of Manufacture</label>
                <input type="number" name="year_of_manufacture" className="form-input" required min="2000" />
              </div>
              <div className="form-group">
                <label className="form-label">Color Name</label>
                <input type="text" name="color_name" className="form-input" placeholder="e.g. Pearl White" />
              </div>
              <div className="form-group">
                <label className="form-label">Mileage (KM)</label>
                <input type="number" name="mileage_km" className="form-input" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Auction Grade</label>
                <input type="text" name="auction_grade" className="form-input" placeholder="e.g. 5.0" />
              </div>
            </div>

            <div className="form-section-title">Auction Win & Commercial Valuation Details</div>
            <div className="grid-2-col">
              <div className="form-group mandatory-field">
                <label className="form-label">Auction House</label>
                <select name="auction_house" className="form-select" required>
                  <option value="">Select House</option>
                  <option value="USS Tokyo">USS Tokyo</option>
                  <option value="USS Nagoya">USS Nagoya</option>
                  <option value="TAA Chubu">TAA Chubu</option>
                  <option value="JU Yokohama">JU Yokohama</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Lot Number</label>
                <input type="text" name="auction_lot" className="form-input" placeholder="e.g. #84102" />
              </div>
              <div className="form-group mandatory-field">
                <label className="form-label">Won Price (JPY)</label>
                <input 
                  type="number" 
                  name="won_price_jpy" 
                  id="wonPriceJpy" 
                  className="form-input" 
                  required 
                  value={jpyPrice}
                  onChange={(e) => setJpyPrice(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">BDT Equivalent (Auto-calc @ ¥1 = ৳{forexRate.toFixed(2)})</label>
                <input 
                  type="text" 
                  name="bdt_equivalent" 
                  id="bdtEquivalent" 
                  className="form-input" 
                  readOnly 
                  style={{ background: "#f1f5f9", color: "#334155", fontWeight: 700 }}
                  value={jpyPrice !== "" ? Math.round(jpyPrice * forexRate).toString() : ""}
                />
              </div>
            </div>
            
          </div>
          
          <div className="modal-footer">
            <div className="modal-footer-note">
              <span className="material-symbols-outlined" style={{ color: "var(--admin-accent-green)", fontSize: "16px" }}>verified_user</span>
              All 8 mandatory ledger fields verified
            </div>
            <div className="modal-actions">
              {editId && (
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ color: "#dc2626", borderColor: "#fca5a5" }}
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete Record
                </button>
              )}
              <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" id="stockInwardSubmitBtn" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : (editId ? "Save Changes" : "Confirm Stock Inward")}
              </button>
            </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
