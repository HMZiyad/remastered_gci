import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Good Car Imports",
  description: "Redefining car imports in Bangladesh. With 15+ years of experience, we provide transparent, high-quality Japanese and European vehicle imports.",
};

export default function AboutPage() {
  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section style={{ padding: "var(--unit-xl) 0" }}>
        <div className="container">
          <div className="about-hero-grid">
            <div className="gci-reveal">
              <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", color: "var(--red-vivid)", marginBottom: "var(--unit-md)" }}>OUR HERITAGE</div>
              <h1 className="text-display-lg" style={{ marginBottom: "var(--unit-md)" }}>Redefining Car Imports in Bangladesh</h1>
              <p className="text-body-lg" style={{ color: "var(--on-surface-variant)", marginBottom: "var(--unit-lg)" }}>
                Good Car Imports was founded with a singular mission: to bring absolute transparency to the vehicle import process. No hidden fees, no tampered mileage, and no fake auction sheets.
              </p>

              <div className="about-stats-grid">
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "var(--gradient-divider)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "var(--gradient-divider)" }} />
                <div>
                  <div className="gci-red-gradient-text" style={{ fontSize: "clamp(26px, 4vw, 32px)", fontWeight: 800 }}>15+</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase" }}>Years Experience</div>
                </div>
                <div>
                  <div className="gci-red-gradient-text" style={{ fontSize: "clamp(26px, 4vw, 32px)", fontWeight: 800 }}>500+</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase" }}>Cars Delivered</div>
                </div>
                <div>
                  <div className="gci-red-gradient-text" style={{ fontSize: "clamp(26px, 4vw, 32px)", fontWeight: 800 }}>100%</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase" }}>Verified Sheets</div>
                </div>
              </div>
            </div>
            <div
              className="gci-reveal about-hero-image"
              data-reveal-delay="150ms"
            >
              <img
                src="/images/stock/corolla-cross-twotone.jpg"
                alt="Good Car Imports Japanese Vehicle Showroom"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  inset: 0,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== VALUES ===== */}
      <section style={{ padding: "var(--unit-xl) 0", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container">
          <h2 className="text-headline-lg gci-reveal" style={{ textAlign: "center", marginBottom: "var(--unit-xl)" }}>Driven by <span className="gci-red-gradient-text">Transparency</span></h2>

          <div className="about-values-grid">
            <div className="gci-reveal" data-reveal-delay="0ms" style={{ backgroundColor: "var(--surface)", padding: "var(--unit-lg)", borderRadius: "var(--radius-xl)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)", transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--red-vivid)", marginBottom: "var(--unit-md)", display: "block" }}>visibility</span>
              <h3 className="text-title-md" style={{ marginBottom: "var(--unit-xs)" }}>Total Transparency</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>We provide original auction sheets and authentic JAAI/JUMVEA certificates for every single vehicle. What you see is exactly what you get.</p>
            </div>
            <div className="gci-reveal" data-reveal-delay="70ms" style={{ backgroundColor: "var(--surface)", padding: "var(--unit-lg)", borderRadius: "var(--radius-xl)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)", transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--red-vivid)", marginBottom: "var(--unit-md)", display: "block" }}>workspace_premium</span>
              <h3 className="text-title-md" style={{ marginBottom: "var(--unit-xs)" }}>Quality Obsessed</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>We strictly import vehicles graded 4.0 and above. Every car undergoes a rigorous physical inspection at the Japan yard before export.</p>
            </div>
            <div className="gci-reveal" data-reveal-delay="140ms" style={{ backgroundColor: "var(--surface)", padding: "var(--unit-lg)", borderRadius: "var(--radius-xl)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)", transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--red-vivid)", marginBottom: "var(--unit-md)", display: "block" }}>local_shipping</span>
              <h3 className="text-title-md" style={{ marginBottom: "var(--unit-xs)" }}>Expert Logistics</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>From winning the auction in Tokyo to handing you the keys in Dhaka, we manage the entire complex supply chain so you don&apos;t have to.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section
        style={{
          background: "linear-gradient(135deg, #991b1b 0%, #dc2626 40%, #ef4444 100%)",
          padding: "76px 24px",
          textAlign: "center",
          color: "#ffffff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow blob */}
        <div style={{ position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-headline, 'Hanken Grotesk', sans-serif)",
              fontSize: "clamp(26px, 4vw, 36px)",
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: "14px",
              letterSpacing: "-0.02em",
            }}
          >
            Ready to Find Your Perfect Drive?
          </h2>
          <p
            style={{
              fontSize: "clamp(14px, 2vw, 16px)",
              lineHeight: 1.6,
              color: "rgba(255, 255, 255, 0.92)",
              maxWidth: "600px",
              margin: "0 auto 32px auto",
              fontFamily: "var(--font-body, 'Inter', sans-serif)",
            }}
          >
            Whether you&apos;re looking for ready stock at our showroom or want to
            pre-order directly from Japan, we&apos;re here to help.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/inventory"
              className="about-cta-outline-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "13px 28px",
                borderRadius: "10px",
                border: "1.5px solid rgba(255, 255, 255, 0.8)",
                color: "#ffffff",
                backgroundColor: "transparent",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                fontFamily: "var(--font-body, 'Inter', sans-serif)",
                transition: "all 0.2s ease",
              }}
            >
              Browse Inventory
            </Link>

            <Link
              href="/contact"
              className="about-cta-solid-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "13px 32px",
                borderRadius: "10px",
                backgroundColor: "#ffffff",
                color: "#ff0000ff",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
                fontFamily: "var(--font-body, 'Inter', sans-serif)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                transition: "all 0.2s ease",
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>

        <style>{`
          .about-hero-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
            gap: var(--unit-xl);
            align-items: center;
          }
          .about-stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--unit-md);
            padding: var(--unit-md) 0;
            position: relative;
          }
          .about-values-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
            gap: var(--unit-lg);
          }
          .about-hero-image {
            border-radius: 16px;
            overflow: hidden;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--glass-border);
            height: 100%;
            min-height: 420px;
            position: relative;
          }
          @media (max-width: 860px) {
            .about-hero-grid {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
            }
            .about-hero-image {
              min-height: 260px !important;
              height: 260px !important;
            }
          }
          @media (max-width: 520px) {
            .about-stats-grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
              text-align: center;
            }
            .about-values-grid {
              grid-template-columns: 1fr !important;
            }
          }
          .about-cta-outline-btn:hover {
            background-color: rgba(255, 255, 255, 0.15) !important;
            border-color: #ffffff !important;
          }
          .about-cta-solid-btn:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25) !important;
          }
        `}</style>
      </section>
    </div>
  );
}
