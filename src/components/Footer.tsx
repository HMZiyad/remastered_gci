import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ background: "var(--surface-container-low)", borderTop: "1px solid var(--surface-container)", padding: "var(--margin-desktop) 0 var(--unit-lg)" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--unit-xl)", marginBottom: "var(--margin-desktop)" }}>
          
          {/* Brand & Address */}
          <div>
            <Link href="/" style={{ display: "block", marginBottom: "var(--unit-md)" }}>
              <img src="/images/logo-transparent.png" alt="Good Car Imports" style={{ height: "40px" }} />
            </Link>
            <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginBottom: "var(--unit-md)" }}>
              {process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "56 Inner Circular Road, Eastern Trade Center (6 Floor), Purana Paltan Line, Dhaka-1000, Bangladesh"}
            </p>
            <div style={{ display: "flex", gap: "var(--unit-sm)" }}>
              <a href="https://www.facebook.com/share/1GgiR3HrNP/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--secondary)", padding: "8px", background: "var(--surface-container-high)", borderRadius: "var(--radius-full)" }}>
                FB
              </a>
              <a href="https://www.instagram.com/goodcarimports/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--secondary)", padding: "8px", background: "var(--surface-container-high)", borderRadius: "var(--radius-full)" }}>
                IG
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-title-md" style={{ marginBottom: "var(--unit-md)" }}>Quick Links</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--unit-sm)" }}>
              <li><Link href="/inventory" style={{ color: "var(--on-surface-variant)" }}>Live Inventory</Link></li>
              <li><Link href="/pre-order" style={{ color: "var(--on-surface-variant)" }}>Pre-Order from Japan</Link></li>
              <li><Link href="/about" style={{ color: "var(--on-surface-variant)" }}>About Us</Link></li>
              <li><Link href="/contact" style={{ color: "var(--on-surface-variant)" }}>Contact & Showroom</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-title-md" style={{ marginBottom: "var(--unit-md)" }}>Contact Us</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--unit-sm)" }}>
              <li>
                <a href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE}`} style={{ color: "var(--on-surface-variant)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>call</span>
                  {process.env.NEXT_PUBLIC_COMPANY_PHONE || "+880 19 9242 4492"}
                </a>
              </li>
              <li>
                <a href={`mailto:${process.env.NEXT_PUBLIC_COMPANY_EMAIL}`} style={{ color: "var(--on-surface-variant)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>mail</span>
                  {process.env.NEXT_PUBLIC_COMPANY_EMAIL || "goodcarimports.bd@gmail.com"}
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--tertiary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chat</span>
                  WhatsApp Chat
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--surface-container-high)", paddingTop: "var(--unit-lg)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--unit-md)", color: "var(--on-surface-variant)", fontSize: "14px" }}>
          <div>&copy; 2026 {process.env.NEXT_PUBLIC_COMPANY_NAME || "Good Car Imports"}. All rights reserved.</div>
          <div style={{ display: "flex", gap: "var(--unit-md)" }}>
            <Link href="/privacy" style={{ color: "inherit" }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: "inherit" }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
