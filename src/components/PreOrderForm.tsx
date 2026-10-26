"use client";

import { useState } from "react";
import { createPreOrder } from "@/app/actions/inquiry";

export function PreOrderForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  // Controlled Form State
  const [formData, setFormData] = useState({
    region: "Japan",
    body_style: "SUV",
    make_model: "",
    year_from: "2022",
    color: "",
    budget: "40-60",
    timeline: "As soon as possible",
    notes: "",
    full_name: "",
    phone: "",
    email: "",
    has_whatsapp: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNextToStep2 = () => {
    if (!formData.make_model.trim()) {
      setFeedback({ type: "error", message: "Please specify the make & model you want to import." });
      return;
    }
    setFeedback(null);
    setStep(2);
  };

  const handleNextToStep3 = () => {
    if (!formData.budget) {
      setFeedback({ type: "error", message: "Please select an estimated budget range." });
      return;
    }
    setFeedback(null);
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!formData.make_model.trim()) {
      setFeedback({ type: "error", message: "Vehicle Make & Model is required." });
      setStep(1);
      return;
    }
    if (!formData.full_name.trim()) {
      setFeedback({ type: "error", message: "Full Name is required." });
      return;
    }
    if (!formData.phone.trim()) {
      setFeedback({ type: "error", message: "Phone number is required." });
      return;
    }

    setLoading(true);

    // Convert budget range (Lakhs BDT) to paisa (1 Lakh = 10,000,000 paisa)
    let budget_min_bdt: number | null = null;
    let budget_max_bdt: number | null = null;
    if (formData.budget === "30-40") {
      budget_min_bdt = 300000000;
      budget_max_bdt = 400000000;
    } else if (formData.budget === "40-60") {
      budget_min_bdt = 400000000;
      budget_max_bdt = 600000000;
    } else if (formData.budget === "60-80") {
      budget_min_bdt = 600000000;
      budget_max_bdt = 800000000;
    } else if (formData.budget === "80-100") {
      budget_min_bdt = 800000000;
      budget_max_bdt = 1000000000;
    } else if (formData.budget === "100-150") {
      budget_min_bdt = 1000000000;
      budget_max_bdt = 1500000000;
    } else if (formData.budget === "150+") {
      budget_min_bdt = 1500000000;
      budget_max_bdt = 3000000000;
    }

    try {
      const result = await createPreOrder({
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        whatsapp: formData.has_whatsapp ? formData.phone.trim() : null,
        make_model: formData.make_model.trim(),
        region_of_origin: formData.region,
        body_style: formData.body_style || null,
        year_from: formData.year_from ? Number(formData.year_from) : null,
        budget_min_bdt,
        budget_max_bdt,
        timeline: formData.timeline || null,
        color_preference: formData.color.trim() || null,
        additional_notes: formData.notes.trim() || null,
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

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid var(--stock-input-border)",
    backgroundColor: "var(--stock-input-bg)",
    color: "var(--stock-input-color)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s ease, background-color 0.2s ease",
  };

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700 as const,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: "var(--stock-label-color)",
    marginBottom: "8px",
  };

  if (step === 4) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          backgroundColor: "var(--stock-card-bg)",
          borderRadius: "16px",
          border: "1px solid var(--stock-card-border)",
          boxShadow: "var(--stock-card-shadow)",
          maxWidth: "680px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            backgroundColor: "rgba(16, 198, 98, 0.15)",
            border: "2px solid #10c662",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
          }}
        >
          <span className="material-symbols-outlined filled" style={{ fontSize: "38px", color: "#10c662" }}>
            check
          </span>
        </div>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "var(--stock-text-primary)",
            marginBottom: "10px",
            fontFamily: "var(--font-headline, 'Hanken Grotesk', sans-serif)",
          }}
        >
          Pre-Order Request Submitted
        </h2>
        <p
          style={{
            fontSize: "15px",
            lineHeight: 1.6,
            color: "var(--stock-text-secondary)",
            maxWidth: "480px",
            margin: "0 auto 28px auto",
          }}
        >
          {feedback?.message || "Our import specialists will contact you shortly with matching live auction units."}
        </p>
        <button
          type="button"
          onClick={() => {
            setFormData({
              region: "Japan",
              body_style: "SUV",
              make_model: "",
              year_from: "2022",
              color: "",
              budget: "40-60",
              timeline: "As soon as possible",
              notes: "",
              full_name: "",
              phone: "",
              email: "",
              has_whatsapp: true,
            });
            setFeedback(null);
            setStep(1);
          }}
          style={{
            padding: "12px 28px",
            backgroundColor: "var(--stock-accent-red)",
            color: "#ffffff",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            border: "none",
            boxShadow: "0 4px 14px rgba(255, 71, 87, 0.35)",
            transition: "all 0.2s ease",
          }}
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div
      className="pre-order-form-container"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 320px) 1fr",
        gap: "40px",
        backgroundColor: "var(--stock-card-bg)",
        padding: "36px 36px",
        borderRadius: "20px",
        border: "1px solid var(--glass-border)",
        boxShadow: "var(--shadow-card)",
        transition: "background-color 0.25s ease, border-color 0.25s ease",
        maxWidth: "1160px",
        margin: "0 auto",
      }}
    >
      {/* ================= LEFT: STEPPER INDICATOR ================= */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          borderRight: "1px solid var(--glass-border)",
          paddingRight: "28px",
        }}
      >
        {/* Step 1 Indicator */}
        <div
          onClick={() => setStep(1)}
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            opacity: step === 1 ? 1 : 0.45,
            cursor: "pointer",
            transition: "opacity 0.2s ease",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: step === 1 ? "var(--red-vivid)" : "var(--stock-badge-bg)",
              border: step === 1 ? "none" : "1px solid var(--glass-border)",
              boxShadow: step === 1 ? "0 0 16px var(--red-glow)" : "none",
              color: step === 1 ? "#ffffff" : "var(--stock-text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "14px",
              flexShrink: 0,
              transition: "all 0.25s ease",
            }}
          >
            1
          </div>
          <div>
            <h4
              style={{
                margin: "0 0 2px 0",
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--stock-text-primary)",
              }}
            >
              Vehicle Details
            </h4>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--stock-label-color)" }}>
              Make, model & specs
            </p>
          </div>
        </div>

        {/* Step 2 Indicator */}
        <div
          onClick={() => {
            if (formData.make_model.trim()) setStep(2);
          }}
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            opacity: step === 2 ? 1 : 0.45,
            cursor: "pointer",
            transition: "opacity 0.2s ease",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: step === 2 ? "var(--red-vivid)" : "var(--stock-badge-bg)",
              border: step === 2 ? "none" : "1px solid var(--glass-border)",
              boxShadow: step === 2 ? "0 0 16px var(--red-glow)" : "none",
              color: step === 2 ? "#ffffff" : "var(--stock-text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "14px",
              flexShrink: 0,
              transition: "all 0.25s ease",
            }}
          >
            2
          </div>
          <div>
            <h4
              style={{
                margin: "0 0 2px 0",
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--stock-text-primary)",
              }}
            >
              Budget & Timeline
            </h4>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--stock-label-color)" }}>
              Financial parameters
            </p>
          </div>
        </div>

        {/* Step 3 Indicator */}
        <div
          onClick={() => {
            if (formData.make_model.trim()) setStep(3);
          }}
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            opacity: step === 3 ? 1 : 0.45,
            cursor: "pointer",
            transition: "opacity 0.2s ease",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: step === 3 ? "var(--red-vivid)" : "var(--stock-badge-bg)",
              border: step === 3 ? "none" : "1px solid var(--glass-border)",
              boxShadow: step === 3 ? "0 0 16px var(--red-glow)" : "none",
              color: step === 3 ? "#ffffff" : "var(--stock-text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "14px",
              flexShrink: 0,
              transition: "all 0.25s ease",
            }}
          >
            3
          </div>
          <div>
            <h4
              style={{
                margin: "0 0 2px 0",
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--stock-text-primary)",
              }}
            >
              Contact Info
            </h4>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--stock-label-color)" }}>
              How we reach you
            </p>
          </div>
        </div>
      </div>

      {/* ================= RIGHT: FORM CONTENT ================= */}
      <div style={{ width: "100%" }}>
        {feedback && feedback.type === "error" && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "rgba(235, 47, 69, 0.12)",
              border: "1px solid var(--stock-accent-red)",
              color: "var(--stock-accent-red)",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "13.5px",
              fontWeight: 600,
            }}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1: VEHICLE DETAILS */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "var(--stock-text-primary)",
                    margin: "0 0 6px 0",
                    letterSpacing: "-0.01em",
                  }}
                >
                  What are you looking for?
                </h2>
                <p style={{ margin: 0, fontSize: "13.5px", color: "var(--stock-text-secondary)" }}>
                  Tell us the specifics of the vehicle you want to import directly from Japan.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Region of Origin</label>
                  <select name="region" value={formData.region} onChange={handleChange} style={inputStyle}>
                    <option value="Japan">Japan (JDM Auctions)</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Europe">Europe</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Body Style</label>
                  <select name="body_style" value={formData.body_style} onChange={handleChange} style={inputStyle}>
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Crossover">Crossover</option>
                    <option value="MPV">MPV / Minivan</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="HIACE_Van">HIACE Van</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Make & Model *</label>
                <input
                  type="text"
                  name="make_model"
                  value={formData.make_model}
                  onChange={handleChange}
                  placeholder="e.g. Toyota Corolla Cross Hybrid, Land Cruiser 300, Prado..."
                  style={inputStyle}
                />
              </div>

              <div className="preorder-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
                <div>
                  <label style={labelStyle}>Year (From)</label>
                  <select name="year_from" value={formData.year_from} onChange={handleChange} style={inputStyle}>
                    <option value="">Any Year</option>
                    {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Color Preference</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="e.g. Pearl White, Black, Two-Tone"
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextToStep2}
                className="gci-btn-shine"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 28px",
                  background: "var(--red-gradient)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "14px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-red-glow)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <span>Continue to Budget</span>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  arrow_forward
                </span>
              </button>
            </div>
          )}

          {/* STEP 2: BUDGET & TIMELINE */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "var(--stock-text-primary)",
                    margin: "0 0 6px 0",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Budget & Timeline
                </h2>
                <p style={{ margin: 0, fontSize: "13.5px", color: "var(--stock-text-secondary)" }}>
                  Help us narrow down the highest auction grade within your financial target.
                </p>
              </div>

              <div className="preorder-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Budget Range (Lakh BDT)</label>
                  <select name="budget" value={formData.budget} onChange={handleChange} style={inputStyle}>
                    <option value="30-40">30 - 40 Lakhs</option>
                    <option value="40-60">40 - 60 Lakhs</option>
                    <option value="60-80">60 - 80 Lakhs</option>
                    <option value="80-100">80 - 100 Lakhs</option>
                    <option value="100-150">1 - 1.5 Crores</option>
                    <option value="150+">1.5 Crores +</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Expected Delivery Timeline</label>
                  <select name="timeline" value={formData.timeline} onChange={handleChange} style={inputStyle}>
                    <option value="As soon as possible">As soon as possible (Ready to Bid)</option>
                    <option value="Within 1 month">Within 1 month</option>
                    <option value="1-3 months">1 - 3 months</option>
                    <option value="Just researching">Just researching</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "32px" }}>
                <label style={labelStyle}>Additional Requirements / Options</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. Leather interior, Sunroof / Panorama roof, 360 Camera, 4.5+ auction grade..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "transparent",
                    color: "var(--stock-text-primary)",
                    border: "1px solid var(--stock-card-border)",
                    fontWeight: 600,
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextToStep3}
                  className="gci-btn-shine"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 28px",
                    background: "var(--red-gradient)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-red-glow)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <span>Continue to Contact</span>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONTACT INFO */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "var(--stock-text-primary)",
                    margin: "0 0 6px 0",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Your Details
                </h2>
                <p style={{ margin: 0, fontSize: "13.5px", color: "var(--stock-text-secondary)" }}>
                  Where should we send the auction options and quotes?
                </p>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="017XXXXXXXX"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "32px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontSize: "13.5px",
                    color: "var(--stock-text-primary)",
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    name="has_whatsapp"
                    checked={formData.has_whatsapp}
                    onChange={handleChange}
                    style={{
                      width: "16px",
                      height: "16px",
                      accentColor: "var(--stock-accent-red)",
                      cursor: "pointer",
                    }}
                  />
                  <span>Same number for WhatsApp</span>
                </label>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={loading}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "transparent",
                    color: "var(--stock-text-primary)",
                    border: "1px solid var(--stock-card-border)",
                    fontWeight: 600,
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="gci-btn-shine"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "13px 32px",
                    background: "var(--red-gradient)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "var(--shadow-red-glow)",
                    opacity: loading ? 0.7 : 1,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
                  }}
                >
                  {loading ? "Submitting..." : "Submit Pre-Order Request"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .pre-order-form-container {
            grid-template-columns: 1fr !important;
            padding: 24px 16px !important;
          }
          .pre-order-form-container > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid var(--glass-border) !important;
            padding-right: 0 !important;
            padding-bottom: 20px !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 640px) {
          .preorder-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .pre-order-form-container > div:first-child h4 {
            font-size: 13px !important;
          }
          .pre-order-form-container > div:first-child p {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
