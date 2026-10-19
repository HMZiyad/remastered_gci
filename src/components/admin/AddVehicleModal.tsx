"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getVehicleById, saveVehicle } from "@/app/actions/vehicle";

export function AddVehicleModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOpen = searchParams.get("modal") === "add-vehicle";
  const editId = searchParams.get("id");
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<Array<{ file_path: string; is_cover: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && editId) {
      setIsLoading(true);
      getVehicleById(Number(editId)).then((data) => {
        if (data) {
          setInitialData(data as Record<string, unknown>);
          const photosData = (data as Record<string, unknown>).photos as Array<{ file_path: string; is_cover: boolean }> | undefined;
          setExistingPhotos(photosData || []);
        }
        setIsLoading(false);
      });
    } else {
      setInitialData(null);
      setExistingPhotos([]);
      setPhotos([]);
      setIsLoading(false);
    }
    setFeedback(null);
  }, [isOpen, editId]);

  useEffect(() => {
    if (initialData && formRef.current) {
      const form = formRef.current;
      const skipKeys = ["photos", "id", "created_at", "updated_at", "slug", "views_count", "cover_photo", "brand"];
      Object.keys(initialData).forEach((key) => {
        if (skipKeys.includes(key)) return;
        const input = form.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
        if (input) {
          const val = initialData[key];
          if (key === "is_featured") {
            (input as HTMLInputElement).checked = val === true || val === 1;
          } else if (key === "price_bdt" && val) {
            // price_bdt is stored in paisa, display in BDT
            input.value = String(val);
          } else if (key === "body_type" && val) {
            const bt = String(val);
            const normalized = (bt === "HIACE-Van" || bt === "HIACE_Van") ? "HIACE_Van" : bt;
            input.value = normalized;
            if (input instanceof HTMLSelectElement && (input.selectedIndex === -1 || !input.value)) {
              if (normalized === "HIACE_Van") {
                input.value = "HIACE-Van";
              }
              if (input.selectedIndex === -1 || !input.value) {
                const opt = document.createElement("option");
                opt.value = bt;
                opt.text = bt === "HIACE_Van" ? "HIACE-Van" : bt;
                opt.selected = true;
                input.appendChild(opt);
                input.value = bt;
              }
            }
          } else if (key === "fuel_type" && val) {
            const ft = String(val);
            const normalized = (ft === "Petrol-Hybrid" || ft === "Hybrid") ? "Hybrid" : ft;
            input.value = normalized;
            if (input instanceof HTMLSelectElement && (input.selectedIndex === -1 || !input.value)) {
              if (normalized === "Hybrid") {
                input.value = "Petrol-Hybrid";
              }
              if (input.selectedIndex === -1 || !input.value) {
                const opt = document.createElement("option");
                opt.value = ft;
                opt.text = ft === "Hybrid" ? "Petrol-Hybrid" : ft;
                opt.selected = true;
                input.appendChild(opt);
                input.value = ft;
              }
            }
          } else {
            input.value = val === null || val === undefined ? "" : String(val);
            if (input instanceof HTMLSelectElement && val && (input.selectedIndex === -1 || !input.value)) {
              const opt = document.createElement("option");
              opt.value = String(val);
              opt.text = String(val);
              opt.selected = true;
              input.appendChild(opt);
              input.value = String(val);
            }
          }
        }
      });
    } else if (!editId && formRef.current) {
      formRef.current.reset();
      setPhotos([]);
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
    params.delete("id");
    setFeedback(null);
    // Replace current URL without the modal param
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
      setPhotos((prev) => [...prev, ...droppedFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const makeCover = (index: number) => {
    setPhotos((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      
      // Remove any auto-attached photos and re-add from our state
      formData.delete("photos[]");
      for (const file of photos) {
        formData.append("photos[]", file);
      }

      // 1. Primary: Direct API endpoint (immune to stale Server Action deployment hashes)
      const url = editId ? `/api/admin/vehicles?id=${editId}` : "/api/admin/vehicles";
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setFeedback({ type: "success", message: editId ? "Vehicle updated successfully." : "Vehicle successfully added to inventory." });
        setTimeout(() => {
          router.refresh();
          closeModal();
        }, 1000);
        return;
      }

      if (data?.error) {
        setFeedback({ type: "error", message: data.error });
        return;
      }

      // 2. Secondary fallback: Server Action
      const result = await saveVehicle(editId ? Number(editId) : null, formData);
      
      if (result.success) {
        setFeedback({ type: "success", message: editId ? "Vehicle updated successfully." : "Vehicle successfully added to inventory." });
        setTimeout(() => {
          router.refresh();
          closeModal();
        }, 1000);
      } else {
        setFeedback({ type: "error", message: result.error || "Failed to save vehicle." });
      }
    } catch (err: any) {
      console.error("Save vehicle error:", err);
      const msg = err?.message || (typeof err === "string" ? err : "An unexpected error occurred.");
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay active" id="modalOverlay" onClick={closeModal} style={{ display: "flex" }}>
      
      <div className="modal-container" id="addVehicleModal" onClick={(e) => e.stopPropagation()}>
        {isLoading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--secondary)" }}>Loading vehicle data...</div>
        ) : (
        <form ref={formRef} id="addVehicleForm" onSubmit={handleSubmit}>
          <div className="modal-header">
            <div className="modal-title">
              <h2>{editId ? "Edit Vehicle" : "Add New Vehicle to Inventory"}</h2>
              <span className="badge-modern badge-blue">8 Mandatory Columns</span>
            </div>
            <button type="button" className="icon-btn" onClick={closeModal}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="modal-body">
            {feedback && (
              <div className={`form-message ${feedback.type}`} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderRadius: "14px", marginBottom: "16px", background: feedback.type === "success" ? "#ecfdf5" : "#fef2f2", color: feedback.type === "success" ? "#065f46" : "#991b1b", border: `1px solid ${feedback.type === "success" ? "#a7f3d0" : "#fecaca"}` }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  {feedback.type === "success" ? "check_circle" : "error"}
                </span>
                {feedback.message}
              </div>
            )}
            
            <div className="form-section-title">Core Specifications</div>
            <div className="grid-2-col">
              <div className="form-group mandatory-field">
                <label className="form-label">Car Brand and Specs</label>
                <input type="text" name="car_name" className="form-input" required placeholder="e.g. Toyota Land Cruiser 300" />
              </div>
              <div className="form-group">
                <label className="form-label">Package</label>
                <input type="text" name="package_trim" className="form-input" placeholder="e.g. ZX Modellista" />
              </div>
              <div className="form-group mandatory-field">
                <label className="form-label">Year of Manufacture (YOM)</label>
                <input type="number" name="year_of_manufacture" className="form-input" required min="2000" max={new Date().getFullYear() + 1} />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input type="text" name="color_name" className="form-input" placeholder="e.g. Pearl White" />
              </div>
              <div className="form-group mandatory-field highlight-field">
                <label className="form-label">Chassis Code (KEY IDENTIFIER)</label>
                <input type="text" name="chassis_code" className="form-input" required placeholder="e.g. VJA300-0019482" />
              </div>
              <div className="form-group">
                <label className="form-label">Mileage (KM)</label>
                <input type="number" name="mileage_km" className="form-input" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Auction Grade</label>
                <select name="auction_grade" className="form-select">
                  <option value="">Select Grade</option>
                  <option value="6.0">6.0 (Like New)</option>
                  <option value="S">S (Brand New)</option>
                  <option value="5.0">5.0 (Excellent)</option>
                  <option value="4.5">4.5 (Very Good)</option>
                  <option value="4.0">4.0 (Good)</option>
                  <option value="3.5">3.5 (Fair)</option>
                  <option value="R">R (Repaired/Accident)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Transmission</label>
                <input type="text" name="transmission" className="form-input" placeholder="e.g. AT, CVT" />
              </div>
              <div className="form-group">
                <label className="form-label">Engine CC</label>
                <input type="number" name="engine_cc" className="form-input" placeholder="e.g. 1500" min="0" />
              </div>
            </div>

            <div className="form-section-title">Additional Details & Pricing</div>
            <div className="grid-2-col">
              <div className="form-group mandatory-field">
                <label className="form-label">Body Type</label>
                <select name="body_type" className="form-select" required>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="MPV">MPV</option>
                  <option value="Crossover">Crossover</option>
                  <option value="Wagon">Wagon</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Microbus">Microbus</option>
                  <option value="HIACE_Van">HIACE-Van</option>
                </select>
              </div>
              <div className="form-group mandatory-field">
                <label className="form-label">Fuel Type</label>
                <select name="fuel_type" className="form-select" required>
                  <option value="Petrol">Petrol</option>
                  <option value="Hybrid">Petrol-Hybrid / Hybrid</option>
                  <option value="PHEV">PHEV (Plug-in Hybrid)</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric (EV)</option>
                  <option value="Octane">Octane</option>
                </select>
              </div>
              <div className="form-group mandatory-field">
                <label className="form-label">Target Stock Status</label>
                <select name="status" className="form-select" required>
                  <option value="available">Available — Showroom</option>
                  <option value="port_clearance">Port Clearance</option>
                  <option value="vessel_transit">On Vessel Transit</option>
                  <option value="pre_booked">Pre-Booked</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Asking Price (BDT)</label>
                <input type="number" name="price_bdt" className="form-input" placeholder="e.g. 85000000 (8.5 Cr)" />
                <small style={{ color: "var(--secondary)", fontSize: "11px" }}>Enter full amount, no commas.</small>
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label className="form-label">Vehicle Description</label>
                  <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>Public showcase copy</span>
                </div>
                <textarea 
                  name="description" 
                  className="form-input" 
                  rows={4} 
                  placeholder="Describe vehicle condition, unique factory options, Modellista aero kit, premium interior, sunroof, etc..."
                  style={{ minHeight: "100px", lineHeight: "1.5", resize: "vertical" }}
                ></textarea>
              </div>

              {/* Feature on Homepage Toggle Card */}
              <div className="featured-toggle-card">
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-accent)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>star</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--admin-navy)" }}>Feature on Homepage</div>
                    <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>Showcase this vehicle in the &quot;Featured Inventory&quot; hero section</div>
                  </div>
                </div>
                <label className="modern-switch" title="Toggle Homepage Featured">
                  <input type="checkbox" name="is_featured" value="1" />
                  <span className="modern-slider"></span>
                </label>
              </div>
            </div>

            <div className="form-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Vehicle Photos & Media Gallery</span>
              {photos.length > 0 && (
                <span className="badge-modern badge-blue" style={{ textTransform: "none", letterSpacing: "normal" }}>
                  {photos.length} new photo{photos.length > 1 ? "s" : ""} selected
                </span>
              )}
            </div>
            
            {/* Existing photos (edit mode) */}
            {editId && existingPhotos.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", fontWeight: 700 }}>Current Live Gallery ({existingPhotos.length} photos):</div>
                  <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>Uploading new photos will replace this gallery</span>
                </div>
                <div className="upload-preview-grid">
                  {existingPhotos.map((photo, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--admin-border-subtle)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <img 
                        src={`/uploads/${photo.file_path}`} 
                        alt="Current" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      {photo.is_cover && (
                        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'var(--admin-navy)', color: '#fff', fontSize: '10px', fontWeight: 700, textAlign: 'center', padding: '3px 0', letterSpacing: '0.04em' }}>
                          COVER PHOTO
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div 
              className={`upload-zone ${isDragging ? 'dragover' : ''}`} 
              id="dropZone" 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--admin-accent)" }}>cloud_upload</span>
              <div className="upload-text" style={{ fontSize: "14px", marginTop: "4px" }}>Drag & drop vehicle photos here, or click to browse</div>
              <div className="upload-subtext" style={{ marginTop: "4px" }}>Supports JPEG, PNG, WEBP (up to 10MB each). First image is automatically set as the Cover Photo.</div>
              <div style={{ marginTop: "12px" }}>
                <button type="button" className="btn btn-outline" style={{ padding: "6px 16px", fontSize: "12.5px", pointerEvents: "none" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add_photo_alternate</span>
                  Browse Files
                </button>
              </div>
              <input 
                type="file" 
                id="photoInput" 
                ref={fileInputRef}
                name="photos[]" 
                multiple 
                accept="image/jpeg, image/png, image/webp" 
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
              />
            </div>
            
            {photos.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", marginBottom: "8px", fontWeight: 700 }}>
                  Selected New Photos ({photos.length}) — First photo is Cover:
                </div>
                <div className="upload-preview-grid" id="uploadPreview">
                  {photos.map((file, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--admin-border-subtle)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                        title="Remove photo"
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(15,23,42,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>close</span>
                      </button>
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); makeCover(idx); }}
                          title="Set as cover"
                          style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(15,23,42,0.75)', color: '#fff', border: 'none', borderRadius: '8px', padding: '3px 8px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                        >
                          Set Cover
                        </button>
                      )}
                      {idx === 0 && (
                        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'var(--admin-navy)', color: '#fff', fontSize: '10px', fontWeight: 700, textAlign: 'center', padding: '3px 0', letterSpacing: '0.04em' }}>
                          ★ COVER PHOTO
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <div className="modal-footer-note">
              <span className="material-symbols-outlined" style={{ color: "var(--admin-accent-green)", fontSize: "16px" }}>verified_user</span>
              Validated against handwritten ledger
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" id="addVehicleSubmitBtn" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : (editId ? "Save Changes" : "Save & Inward Vehicle")}
              </button>
            </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
