"use client";

import { useState } from "react";
import { createInquiry } from "@/app/actions/inquiry";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{type: "error" | "success", message: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const full_name = String(formData.get("full_name") || "");
    const phone = String(formData.get("phone") || "");
    const email = String(formData.get("email") || "");
    const interested_in = String(formData.get("interested_in") || "");
    const message = String(formData.get("message") || "");

    try {
      const result = await createInquiry({
        full_name,
        phone,
        email,
        interested_in,
        message,
        type: "contact",
      });

      if (result.success) {
        setFeedback({
          type: "success",
          message: "Your message has been sent successfully. Our team will get back to you shortly.",
        });
        form.reset();
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to send message. Please try again.",
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

  return (
    <form onSubmit={handleSubmit}>
      {feedback && (
        <div style={{ padding: "12px", backgroundColor: feedback.type === "success" ? "var(--tertiary-container)" : "var(--error-container)", color: feedback.type === "success" ? "var(--on-tertiary-container)" : "var(--on-error-container)", borderRadius: "var(--radius)", marginBottom: "16px", fontSize: "14px" }}>
          {feedback.message}
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)", fontSize: "12px", fontWeight: 600 }}>Full Name</label>
        <input type="text" name="full_name" required placeholder="John Doe" style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--glass-border)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)", fontSize: "14px", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }} />
      </div>
      
      <div className="contact-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)", fontSize: "12px", fontWeight: 600 }}>Phone Number</label>
          <input type="tel" name="phone" required placeholder="+880..." style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--glass-border)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)", fontSize: "14px", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }} />
        </div>
        <div>
          <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)", fontSize: "12px", fontWeight: 600 }}>Email Address</label>
          <input type="email" name="email" placeholder="john@example.com" style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--glass-border)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)", fontSize: "14px", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }} />
        </div>
      </div>
      
      <div style={{ marginBottom: "16px" }}>
        <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)", fontSize: "12px", fontWeight: 600 }}>Interested In</label>
        <select name="interested_in" style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--glass-border)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)", fontSize: "14px", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Ready Stock Vehicle">Ready Stock Vehicle</option>
          <option value="Pre-Order / Import">Pre-Order / Import</option>
          <option value="Trade-in Evaluation">Trade-in Evaluation</option>
        </select>
      </div>
      
      <div style={{ marginBottom: "24px" }}>
        <label className="text-label-sm" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)", fontSize: "12px", fontWeight: 600 }}>Message</label>
        <textarea name="message" required placeholder="How can we help you today?" style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--glass-border)", backgroundColor: "var(--surface-container-lowest)", color: "var(--on-surface)", minHeight: "120px", fontSize: "14px", lineHeight: 1.5, transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}></textarea>
      </div>
      
      <button type="submit" disabled={loading} className="gci-btn-shine" style={{ width: "100%", padding: "14px", background: "var(--red-gradient)", color: "white", fontWeight: 700, borderRadius: "var(--radius-full)", border: "none", boxShadow: "var(--shadow-red-glow)", cursor: loading ? "not-allowed" : "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease", opacity: loading ? 0.7 : 1 }}>
        {loading ? "Sending..." : "Send Inquiry"}
      </button>

      <style>{`
        @media (max-width: 600px) {
          .contact-form-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </form>
  );
}
