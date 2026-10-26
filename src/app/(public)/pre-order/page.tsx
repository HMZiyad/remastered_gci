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
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#07090c",
          padding: "100px 0 90px 0",
        }}
      >
        {/* Background AI-Generated Image with 60% opacity */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <img
            src="/images/preorder-bg.jpg"
            alt="Japanese Auction Car Direct Import"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 45%",
              opacity: 0.6,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(7, 9, 12, 0.5) 0%, rgba(7, 9, 12, 0.72) 65%, rgba(7, 9, 12, 0.95) 100%)",
            }}
          />
        </div>

        {/* Content Container */}
        <div
          className="container gci-reveal"
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            maxWidth: "820px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "1.5px",
              color: "var(--red-bright)",
              marginBottom: "var(--unit-md)",
              textTransform: "uppercase",
              display: "inline-block",
              padding: "5px 16px",
              borderRadius: "999px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              backdropFilter: "blur(6px)",
            }}
          >
            DIRECT IMPORT SERVICE
          </div>
          <h1
            className="text-display-lg"
            style={{
              marginBottom: "var(--unit-md)",
              color: "#ffffff",
              textShadow: "0 2px 18px rgba(0, 0, 0, 0.7)",
            }}
          >
            Your Dream Car,<br />
            <span className="gci-red-gradient-text">Exactly As You Want It.</span>
          </h1>
          <p
            className="text-body-lg"
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              maxWidth: "680px",
              margin: "0 auto",
              textShadow: "0 1px 8px rgba(0, 0, 0, 0.7)",
            }}
          >
            Don&apos;t settle for what&apos;s available on the showroom floor. Tell us exactly what you want, and we&apos;ll source it directly from Japan&apos;s largest auction houses.
          </p>
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section style={{ padding: "var(--unit-xl) 0" }}>
        <div className="container">
          <div className="gci-reveal" style={{ textAlign: "center", marginBottom: "var(--unit-xl)" }}>
            <h2 className="text-headline-lg" style={{ marginBottom: "var(--unit-xs)" }}>Why Pre-Order <span className="gci-red-gradient-text">With Us?</span></h2>
            <p className="text-body-lg" style={{ color: "var(--on-surface-variant)" }}>The smartest way to buy your next premium vehicle.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--unit-lg)" }}>
            <div
              className="gci-reveal"
              data-reveal-delay="0ms"
              style={{
                backgroundColor: "var(--surface)",
                padding: "var(--unit-xl) var(--unit-lg)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--glass-border)",
                boxShadow: "var(--shadow-card)",
                textAlign: "center",
                transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "var(--red-glow)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--unit-md) auto" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "var(--red-vivid)" }}>payments</span>
              </div>
              <h3 className="text-title-md" style={{ marginBottom: "var(--unit-sm)" }}>Maximum Cost Savings</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginBottom: "var(--unit-lg)", lineHeight: 1.6 }}>By bypassing local middlemen and importing directly, you save anywhere from 5% to 15% compared to local ready stock.</p>
              <span style={{ backgroundColor: "var(--surface-container-high)", color: "var(--on-surface)", padding: "5px 14px", borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: 600, border: "1px solid var(--glass-border)" }}>Save Money</span>
            </div>

            <div
              className="gci-reveal"
              data-reveal-delay="80ms"
              style={{
                backgroundColor: "var(--surface)",
                padding: "var(--unit-xl) var(--unit-lg)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--glass-border)",
                boxShadow: "var(--shadow-card)",
                textAlign: "center",
                transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "var(--red-glow)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--unit-md) auto" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "var(--red-vivid)" }}>tune</span>
              </div>
              <h3 className="text-title-md" style={{ marginBottom: "var(--unit-sm)" }}>Exact Specifications</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginBottom: "var(--unit-lg)", lineHeight: 1.6 }}>Choose your preferred color, interior package, specific trim level, and precise mileage. Don&apos;t compromise.</p>
              <span style={{ backgroundColor: "var(--surface-container-high)", color: "var(--on-surface)", padding: "5px 14px", borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: 600, border: "1px solid var(--glass-border)" }}>Zero Compromise</span>
            </div>

            <div
              className="gci-reveal"
              data-reveal-delay="160ms"
              style={{
                backgroundColor: "var(--surface)",
                padding: "var(--unit-xl) var(--unit-lg)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--glass-border)",
                boxShadow: "var(--shadow-card)",
                textAlign: "center",
                transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "var(--red-glow)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--unit-md) auto" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "var(--red-vivid)" }}>verified</span>
              </div>
              <h3 className="text-title-md" style={{ marginBottom: "var(--unit-sm)" }}>Verified Auction Sheets</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginBottom: "var(--unit-lg)", lineHeight: 1.6 }}>Review the authentic Japanese auction sheet before bidding. Know the true condition and grade of the car.</p>
              <span style={{ backgroundColor: "var(--surface-container-high)", color: "var(--on-surface)", padding: "5px 14px", borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: 600, border: "1px solid var(--glass-border)" }}>100% Transparent</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FORM ===== */}
      <section style={{ padding: "var(--unit-xl) 0", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container gci-reveal">
          <PreOrderForm />
        </div>
      </section>

      {/* ===== 100% TRANSPARENCY AUCTION SHEET SECTION ===== */}
      <section
        style={{
          padding: "80px 0 96px 0",
          backgroundColor: "var(--stock-bg)",
          borderTop: "1px solid var(--stock-card-border)",
          transition: "background-color 0.25s ease",
          position: "relative",
        }}
      >
        <div className="container" style={{ maxWidth: "100%", width: "100%", padding: "0 var(--margin-desktop, clamp(40px, 3.2vw, 60px))" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "48px 64px",
              alignItems: "center",
            }}
          >
            {/* Left: Auction Sheet Card Frame */}
            <div
              className="gci-reveal"
              style={{
                backgroundColor: "var(--stock-card-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: "20px",
                padding: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-card)",
                transition: "background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.3s ease",
              }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: "0 8px 28px rgba(0, 0, 0, 0.25)",
                  width: "100%",
                  maxWidth: "460px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/images/auction-sheet.png"
                  alt="Original Japanese Vehicle Auction Inspection Sheet"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>

            {/* Right: Details & Guarantee Checklist */}
            <div className="gci-reveal" data-reveal-delay="100ms">
              <div
                style={{
                  fontSize: "11.5px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "var(--red-vivid)",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                100% TRANSPARENCY
              </div>

              <h2
                style={{
                  fontFamily: "var(--font-headline, 'Hanken Grotesk', sans-serif)",
                  fontSize: "clamp(28px, 4vw, 36px)",
                  fontWeight: 800,
                  color: "var(--stock-text-primary)",
                  letterSpacing: "-0.02em",
                  margin: "0 0 16px 0",
                  lineHeight: 1.2,
                }}
              >
                Never Guess. <span className="gci-red-gradient-text">Always Verify.</span>
              </h2>

              <p
                style={{
                  fontFamily: "var(--font-body, 'Inter', sans-serif)",
                  fontSize: "15px",
                  lineHeight: "1.65",
                  color: "var(--stock-text-secondary)",
                  margin: "0 0 28px 0",
                  maxWidth: "520px",
                }}
              >
                We provide the original Japanese auction sheet for every vehicle we source. You&apos;ll know
                exactly what you&apos;re buying before placing a bid.
              </p>

              {/* 4 Verified Checklist Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  "Verified Odometer / Mileage",
                  "Detailed Exterior & Interior Grading",
                  "Inspector's Handwritten Notes Translated",
                  "Accident & Repair History Check",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" stroke="#10c662" strokeWidth="2" />
                      <path d="M8 12.5L10.5 15L16 9.5" stroke="#10c662" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span
                      style={{
                        fontFamily: "var(--font-body, 'Inter', sans-serif)",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--stock-text-primary)",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
