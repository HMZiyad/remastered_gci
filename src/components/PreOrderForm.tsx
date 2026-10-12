"use client";

import { useState } from "react";
import { createPreOrder } from "@/app/actions/inquiry";

export function PreOrderForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{type: "error" | "success", message: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const region = String(formData.get("region") || "Japan");
    const body_style = String(formData.get("body_style") || "");
    const make_model = String(formData.get("make_model") || "");
    const year_from = formData.get("year_from") ? Number(formData.get("year_from")) : null;
    const color = String(formData.get("color") || "");
    const budgetRaw = String(formData.get("budget") || "");
    const timeline = String(formData.get("timeline") || "");
    const notes = String(formData.get("notes") || "");
    const full_name = String(formData.get("full_name") || "");
    const phone = String(formData.get("phone") || "");
    const email = String(formData.get("email") || "");
    const has_whatsapp = formData.get("has_whatsapp") === "on";

    // Convert budget range (Lakhs) to paisa
    let budget_min_bdt: number | null = null;
    let budget_max_bdt: number | null = null;
    if (budgetRaw === "30-40") {
      budget_min_bdt = 300000000;
      budget_max_bdt = 400000000;
    } else if (budgetRaw === "40-60") {
      budget_min_bdt = 400000000;
      budget_max_bdt = 600000000;
    } else if (budgetRaw === "60-80") {
      budget_min_bdt = 600000000;
      budget_max_bdt = 800000000;
    } else if (budgetRaw === "80-100") {
      budget_min_bdt = 800000000;
      budget_max_bdt = 1000000000;
    } else if (budgetRaw === "100-150") {
      budget_min_bdt = 1000000000;
      budget_max_bdt = 1500000000;
    } else if (budgetRaw === "150+") {
      budget_min_bdt = 1500000000;
      budget_max_bdt = 3000000000;
    }

    try {
      const result = await createPreOrder({
        full_name,
        phone,
        email: email || null,
        whatsapp: has_whatsapp ? phone : null,
        make_model,
        region_of_origin: region,
        body_style: body_style || null,
        year_from,
        budget_min_bdt,
        budget_max_bdt,
        timeline: timeline || null,
        color_preference: color || null,
        additional_notes: notes || null,
      });

      if (result.success) {
        setFeedback({
          type: "success",
          message: "Your pre-order request has been received. Our team will contact you shortly with auction options.",
        });
        setStep(4);
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to submit request. Please try again.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 4) {
    return (
      <div style={{ padding: "var(--unit-xl)", textAlign: "center", backgroundColor: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)" }}>
        <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "var(--whatsapp-green)", marginBottom: "var(--unit-md)" }}>check_circle</span>
        <h2 className="text-headline-lg" style={{ marginBottom: "var(--unit-sm)" }}>Request Submitted</h2>
        <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>{feedback?.message}</p>
        <button onClick={() => setStep(1)} style={{ marginTop: "var(--unit-lg)", padding: "12px 32px", backgroundColor: "var(--surface-container-high)", color: "var(--on-surface)", borderRadius: "var(--radius-full)", fontWeight: 600 }}>
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--unit-xl)", backgroundColor: "var(--surface)", padding: "var(--unit-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)" }}>
      
      {/* Stepper Indicator */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--unit-lg)", borderRight: "1px solid var(--surface-container-high)", paddingRight: "var(--unit-md)" }}>
        <div style={{ display: "flex", gap: "16px", opacity: step === 1 ? 1 : 0.5, transition: "opacity var(--transition-fast)" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: step === 1 ? "var(--primary)" : "var(--surface-container-high)", color: step === 1 ? "white" : "var(--on-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>1</div>
          <div>
            <h4 className="text-title-md" style={{ marginBottom: "4px" }}>Vehicle Details</h4>
            <p className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>Make, model & specs</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px", opacity: step === 2 ? 1 : 0.5, transition: "opacity var(--transition-fast)" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: step === 2 ? "var(--primary)" : "var(--surface-container-high)", color: step === 2 ? "white" : "var(--on-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>2</div>
          <div>
            <h4 className="text-title-md" style={{ marginBottom: "4px" }}>Budget & Timeline</h4>
            <p className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>Financial parameters</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px", opacity: step === 3 ? 1 : 0.5, transition: "opacity var(--transition-fast)" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: step === 3 ? "var(--primary)" : "var(--surface-container-high)", color: step === 3 ? "white" : "var(--on-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>3</div>
          <div>
            <h4 className="text-title-md" style={{ marginBottom: "4px" }}>Contact Info</h4>
            <p className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>How we reach you</p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div>
        <form onSubmit={handleSubmit}>
          
          {/* STEP 1 */}
          <div style={{ display: step === 1 ? "block" : "none" }}>
            <div style={{ marginBottom: "var(--unit-lg)" }}>
              <h2 className="text-headline-lg" style={{ marginBottom: "8px" }}>What are you looking for?</h2>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>Tell us the specifics of the vehicle you want to import.</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}>Region of Origin</label>
                <select name="region" required style={{ width: "100%", padding: "12px", borderRadius: "var(--radius)", border: "1px solid var(--surface-container-high)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)" }}>
                  <option value="Japan">Japan (JDM)</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Europe">Europe</option>
                </select>
              </div>
              <div>
                <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}>Body Style</label>
                <select name="body_style" required style={{ width: "100%", padding: "12px", borderRadius: "var(--radius)", border: "1px solid var(--surface-container-high)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)" }}>
                  <option value="">Select Body Style</option>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Crossover">Crossover</option>
                  <option value="MPV">MPV / Minivan</option>
                  <option value="Hatchback">Hatchback</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: "16px" }}>
              <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}>Make & Model</label>
              <input type="text" name="make_model" required placeholder="e.g. Toyota Land Cruiser 300 ZX" style={{ width: "100%", padding: "12px", borderRadius: "var(--radius)", border: "1px solid var(--surface-container-high)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)" }} />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
              <div>
                <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}>Year (From)</label>
                <select name="year_from" style={{ width: "100%", padding: "12px", borderRadius: "var(--radius)", border: "1px solid var(--surface-container-high)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)" }}>
                  <option value="">Any</option>
                  {[...Array(8)].map((_, i) => {
                    const year = 2026 - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}>Color Preference</label>
                <input type="text" name="color" placeholder="e.g. Pearl White, Black" style={{ width: "100%", padding: "12px", borderRadius: "var(--radius)", border: "1px solid var(--surface-container-high)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)" }} />
              </div>
            </div>

            <button type="button" onClick={() => setStep(2)} style={{ padding: "14px 32px", backgroundColor: "var(--primary)", color: "white", fontWeight: 600, borderRadius: "var(--radius-full)", transition: "background var(--transition-fast)" }}>
              Continue to Budget <span className="material-symbols-outlined" style={{ fontSize: "18px", verticalAlign: "middle" }}>arrow_forward</span>
            </button>
          </div>

          {/* STEP 2 */}
          <div style={{ display: step === 2 ? "block" : "none" }}>
            <div style={{ marginBottom: "var(--unit-lg)" }}>
              <h2 className="text-headline-lg" style={{ marginBottom: "8px" }}>Budget & Timeline</h2>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>Help us narrow down the right options within your financial parameters.</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}>Budget Range (Lakh BDT)</label>
                <select name="budget" required style={{ width: "100%", padding: "12px", borderRadius: "var(--radius)", border: "1px solid var(--surface-container-high)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)" }}>
                  <option value="">Select Budget</option>
                  <option value="30-40">30 - 40 Lakhs</option>
                  <option value="40-60">40 - 60 Lakhs</option>
                  <option value="60-80">60 - 80 Lakhs</option>
                  <option value="80-100">80 - 100 Lakhs</option>
                  <option value="100-150">1 - 1.5 Crores</option>
                  <option value="150+">1.5 Crores +</option>
                </select>
              </div>
              <div>
                <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}>Expected Delivery Timeline</label>
                <select name="timeline" required style={{ width: "100%", padding: "12px", borderRadius: "var(--radius)", border: "1px solid var(--surface-container-high)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)" }}>
                  <option value="As soon as possible">As soon as possible</option>
                  <option value="Within 1 month">Within 1 month</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="Just browsing/Researching">Just researching</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}>Additional Requirements</label>
              <textarea name="notes" placeholder="Specific trim packages, features (e.g. Sunroof, Leather seats)..." style={{ width: "100%", padding: "12px", borderRadius: "var(--radius)", border: "1px solid var(--surface-container-high)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)", minHeight: "100px" }}></textarea>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <button type="button" onClick={() => setStep(1)} style={{ padding: "14px 32px", backgroundColor: "transparent", color: "var(--on-surface)", border: "2px solid var(--surface-container-high)", fontWeight: 600, borderRadius: "var(--radius-full)", transition: "background var(--transition-fast)" }}>
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} style={{ padding: "14px 32px", backgroundColor: "var(--primary)", color: "white", fontWeight: 600, borderRadius: "var(--radius-full)", transition: "background var(--transition-fast)" }}>
                Continue to Contact
              </button>
            </div>
          </div>

          {/* STEP 3 */}
          <div style={{ display: step === 3 ? "block" : "none" }}>
            <div style={{ marginBottom: "var(--unit-lg)" }}>
              <h2 className="text-headline-lg" style={{ marginBottom: "8px" }}>Your Details</h2>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>Where should we send the auction options and quotes?</p>
            </div>

            {feedback && feedback.type === "error" && (
              <div style={{ padding: "12px", backgroundColor: "var(--error-container)", color: "var(--on-error-container)", borderRadius: "var(--radius)", marginBottom: "16px", fontSize: "14px" }}>
                {feedback.message}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}>Full Name</label>
              <input type="text" name="full_name" required style={{ width: "100%", padding: "12px", borderRadius: "var(--radius)", border: "1px solid var(--surface-container-high)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}>Phone Number</label>
                <input type="tel" name="phone" required placeholder="+880..." style={{ width: "100%", padding: "12px", borderRadius: "var(--radius)", border: "1px solid var(--surface-container-high)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)" }} />
              </div>
              <div>
                <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}>Email Address</label>
                <input type="email" name="email" style={{ width: "100%", padding: "12px", borderRadius: "var(--radius)", border: "1px solid var(--surface-container-high)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)" }} />
              </div>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", color: "var(--on-surface-variant)" }}>
                <input type="checkbox" name="has_whatsapp" defaultChecked />
                Same number for WhatsApp
              </label>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <button type="button" onClick={() => setStep(2)} disabled={loading} style={{ padding: "14px 32px", backgroundColor: "transparent", color: "var(--on-surface)", border: "2px solid var(--surface-container-high)", fontWeight: 600, borderRadius: "var(--radius-full)", transition: "background var(--transition-fast)" }}>
                Back
              </button>
              <button type="submit" disabled={loading} style={{ padding: "14px 32px", backgroundColor: "var(--primary)", color: "white", fontWeight: 600, borderRadius: "var(--radius-full)", transition: "background var(--transition-fast)", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Submitting..." : "Submit Pre-Order Request"}
              </button>
            </div>
          </div>
          
        </form>
      </div>

    </div>
  );
}
