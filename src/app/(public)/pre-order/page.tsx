import { PreOrderForm } from "@/components/PreOrderForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pre-Order Your Dream Car",
  description: "Source your exact vehicle directly from Japanese auction houses. We handle bidding, shipping, customs, and delivery to Dhaka.",
};

export default function PreOrderPage() {
  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section style={{ backgroundColor: "var(--surface-container-low)", padding: "var(--unit-xl) 0" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: "800px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", color: "var(--primary)", marginBottom: "var(--unit-md)" }}>DIRECT IMPORT SERVICE</div>
          <h1 className="text-display-lg" style={{ marginBottom: "var(--unit-md)" }}>
            Your Dream Car,<br />
            <span style={{ color: "var(--primary)" }}>Exactly As You Want It.</span>
          </h1>
          <p className="text-body-lg" style={{ color: "var(--on-surface-variant)" }}>
            Don't settle for what's available on the showroom floor. Tell us exactly what you want, and we'll source it directly from Japan's largest auction houses.
          </p>
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section style={{ padding: "var(--unit-xl) 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "var(--unit-lg)" }}>
            <h2 className="text-headline-lg" style={{ marginBottom: "var(--unit-xs)" }}>Why Pre-Order With Us?</h2>
            <p className="text-body-lg" style={{ color: "var(--on-surface-variant)" }}>The smartest way to buy your next premium vehicle.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--unit-lg)" }}>
            <div style={{ backgroundColor: "var(--surface)", padding: "var(--unit-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)", textAlign: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "var(--unit-md)" }}>payments</span>
              <h3 className="text-title-md" style={{ marginBottom: "var(--unit-sm)" }}>Maximum Cost Savings</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginBottom: "var(--unit-md)" }}>By bypassing local middlemen and importing directly, you save anywhere from 5% to 15% compared to local ready stock.</p>
              <span style={{ backgroundColor: "var(--surface-container-high)", color: "var(--on-surface)", padding: "4px 12px", borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: 600 }}>Save Money</span>
            </div>
            <div style={{ backgroundColor: "var(--surface)", padding: "var(--unit-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)", textAlign: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "var(--unit-md)" }}>tune</span>
              <h3 className="text-title-md" style={{ marginBottom: "var(--unit-sm)" }}>Exact Specifications</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginBottom: "var(--unit-md)" }}>Choose your preferred color, interior package, specific trim level, and precise mileage. Don't compromise.</p>
              <span style={{ backgroundColor: "var(--surface-container-high)", color: "var(--on-surface)", padding: "4px 12px", borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: 600 }}>Zero Compromise</span>
            </div>
            <div style={{ backgroundColor: "var(--surface)", padding: "var(--unit-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)", textAlign: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "var(--unit-md)" }}>verified</span>
              <h3 className="text-title-md" style={{ marginBottom: "var(--unit-sm)" }}>Verified Auction Sheets</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginBottom: "var(--unit-md)" }}>Review the authentic Japanese auction sheet before bidding. Know the true condition and grade of the car.</p>
              <span style={{ backgroundColor: "var(--surface-container-high)", color: "var(--on-surface)", padding: "4px 12px", borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: 600 }}>100% Transparent</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FORM ===== */}
      <section style={{ padding: "var(--unit-xl) 0", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container">
          <PreOrderForm />
        </div>
      </section>
    </div>
  );
}
