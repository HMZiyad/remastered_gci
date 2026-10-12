import type { Metadata } from "next";

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--unit-xl)", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", color: "var(--primary)", marginBottom: "var(--unit-md)" }}>OUR HERITAGE</div>
              <h1 className="text-display-lg" style={{ marginBottom: "var(--unit-md)" }}>Redefining Car Imports in Bangladesh</h1>
              <p className="text-body-lg" style={{ color: "var(--on-surface-variant)", marginBottom: "var(--unit-lg)" }}>
                Good Car Imports was founded with a singular mission: to bring absolute transparency to the vehicle import process. No hidden fees, no tampered mileage, and no fake auction sheets.
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--unit-md)", padding: "var(--unit-md) 0", borderTop: "1px solid var(--surface-container-high)", borderBottom: "1px solid var(--surface-container-high)" }}>
                <div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--primary)" }}>15+</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase" }}>Years Experience</div>
                </div>
                <div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--primary)" }}>500+</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase" }}>Cars Delivered</div>
                </div>
                <div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--primary)" }}>100%</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase" }}>Verified Sheets</div>
                </div>
              </div>
            </div>
            <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-ambient)", height: "100%", minHeight: "400px", position: "relative" }}>
              <img src="/images/preorder-bg.jpg" alt="Good Car Imports Showroom" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== VALUES ===== */}
      <section style={{ padding: "var(--unit-xl) 0", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container">
          <h2 className="text-headline-lg" style={{ textAlign: "center", marginBottom: "var(--unit-xl)" }}>Driven by <span style={{ color: "var(--primary)" }}>Transparency</span></h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--unit-lg)" }}>
            <div style={{ backgroundColor: "var(--surface)", padding: "var(--unit-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--primary)", marginBottom: "var(--unit-md)" }}>visibility</span>
              <h3 className="text-title-md" style={{ marginBottom: "var(--unit-xs)" }}>Total Transparency</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>We provide original auction sheets and authentic JAAI/JUMVEA certificates for every single vehicle. What you see is exactly what you get.</p>
            </div>
            <div style={{ backgroundColor: "var(--surface)", padding: "var(--unit-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--primary)", marginBottom: "var(--unit-md)" }}>workspace_premium</span>
              <h3 className="text-title-md" style={{ marginBottom: "var(--unit-xs)" }}>Quality Obsessed</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>We strictly import vehicles graded 4.0 and above. Every car undergoes a rigorous physical inspection at the Japan yard before export.</p>
            </div>
            <div style={{ backgroundColor: "var(--surface)", padding: "var(--unit-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--primary)", marginBottom: "var(--unit-md)" }}>local_shipping</span>
              <h3 className="text-title-md" style={{ marginBottom: "var(--unit-xs)" }}>Expert Logistics</h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>From winning the auction in Tokyo to handing you the keys in Dhaka, we manage the entire complex supply chain so you don't have to.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
