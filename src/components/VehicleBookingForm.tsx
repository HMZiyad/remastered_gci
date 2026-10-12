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
          className="text-label-sm"
          style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}
        >
          Full Name
        </label>
        <input
          type="text"
          name="full_name"
          required
          placeholder="Enter your name"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "var(--radius)",
            border: "1px solid var(--surface-container-high)",
            backgroundColor: "var(--surface-container-lowest)",
            color: "var(--on-surface)",
          }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          className="text-label-sm"
          style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}
        >
          Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          required
          placeholder="+880..."
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "var(--radius)",
            border: "1px solid var(--surface-container-high)",
            backgroundColor: "var(--surface-container-lowest)",
            color: "var(--on-surface)",
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          className="text-label-sm"
          style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}
        >
          Message (Optional)
        </label>
        <textarea
          name="message"
          placeholder="I would like to inspect this vehicle or request pricing details..."
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "var(--radius)",
            border: "1px solid var(--surface-container-high)",
            backgroundColor: "var(--surface-container-lowest)",
            color: "var(--on-surface)",
            minHeight: "90px",
          }}
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px",
          backgroundColor: "var(--primary)",
          color: "white",
          fontWeight: 600,
          borderRadius: "var(--radius-full)",
          transition: "background var(--transition-fast)",
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer",
          border: "none",
        }}
      >
        {loading ? "Submitting..." : "Book Inspection"}
      </button>
    </form>
  );
}
