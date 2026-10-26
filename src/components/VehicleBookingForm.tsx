"use client";

import { useState } from "react";
import { createInquiry } from "@/app/actions/inquiry";

export function VehicleBookingForm({
  vehicleId,
  carName,
  chassisCode,
}: {
  vehicleId: number;
  carName: string;
  chassisCode: string;
}) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const fullName = String(formData.get("full_name") || "");
    const phone = String(formData.get("phone") || "");
    const message = String(formData.get("message") || "");

    try {
      const result = await createInquiry({
        full_name: fullName,
        phone,
        interested_in: `${carName} (${chassisCode})`,
        message: message || `Booking inspection request for ${carName}`,
        vehicle_id: vehicleId,
        type: "booking",
      });

      if (result.success) {
        setFeedback({
          type: "success",
          message: "Inspection booking received! Our executive will contact you shortly to confirm the appointment.",
        });
        form.reset();
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to submit booking. Please try again.",
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
        <div
          style={{
            padding: "12px",
            backgroundColor: feedback.type === "success" ? "var(--tertiary-container)" : "var(--error-container)",
            color: feedback.type === "success" ? "var(--on-tertiary-container)" : "var(--on-error-container)",
            borderRadius: "var(--radius)",
            marginBottom: "16px",
            fontSize: "13px",
            lineHeight: 1.4,
          }}
        >
          {feedback.message}
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--stock-label-color)",
            marginBottom: "6px",
          }}
        >
          FULL NAME
        </label>
        <input
          type="text"
          name="full_name"
          required
          placeholder="Enter your name"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid var(--glass-border)",
            backgroundColor: "var(--stock-input-bg)",
            color: "var(--stock-input-color)",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s ease, background-color 0.25s ease, color 0.25s ease",
          }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--stock-label-color)",
            marginBottom: "6px",
          }}
        >
          PHONE NUMBER
        </label>
        <input
          type="tel"
          name="phone"
          required
          placeholder="+880..."
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid var(--glass-border)",
            backgroundColor: "var(--stock-input-bg)",
            color: "var(--stock-input-color)",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s ease, background-color 0.25s ease, color 0.25s ease",
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--stock-label-color)",
            marginBottom: "6px",
          }}
        >
          MESSAGE (OPTIONAL)
        </label>
        <textarea
          name="message"
          rows={3}
          placeholder="I would like to inspect this vehicle..."
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid var(--glass-border)",
            backgroundColor: "var(--stock-input-bg)",
            color: "var(--stock-input-color)",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            resize: "vertical",
            minHeight: "80px",
            transition: "border-color 0.2s ease, background-color 0.25s ease, color 0.25s ease",
          }}
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="gci-btn-shine"
        style={{
          width: "100%",
          padding: "13px",
          background: "var(--red-gradient)",
          color: "#ffffff",
          fontWeight: 700,
          fontSize: "14px",
          borderRadius: "10px",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          boxShadow: "var(--shadow-red-glow)",
          opacity: loading ? 0.7 : 1,
          transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
        }}
      >
        {loading ? "Submitting..." : "BOOK INSPECTION"}
      </button>
    </form>
  );
}
