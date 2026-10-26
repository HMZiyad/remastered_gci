"use client";

import Link from "next/link";

export function Footer() {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: "Good Car Imports",
          text: "Authentic Japanese and European vehicle imports in Bangladesh.",
          url: window.location.origin,
        })
        .catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      alert("Website link copied to clipboard!");
    }
  };

  return (
    <footer
      style={{
        backgroundColor: "var(--stock-card-bg)",
        borderTop: "none",
        color: "var(--stock-text-primary)",
        paddingTop: "54px",
        paddingBottom: "32px",
        transition: "background-color 0.25s ease, border-color 0.25s ease",
        fontFamily: "var(--font-body, 'Inter', sans-serif)",
        position: "relative",
      }}
    >
      {/* Gradient divider at top */}
      <div style={{ position: "absolute", top: 0, left: "5%", right: "5%", height: "1px", background: "var(--gradient-divider)" }} />
      <div className="container" style={{ maxWidth: "100%", width: "100%", padding: "0 var(--margin-desktop, clamp(40px, 3.2vw, 60px))" }}>
        
        {/* ========================================================= */}
        {/* TOP SECTION: 4 COLUMNS                                    */}
        {/* ========================================================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "40px 32px",
            marginBottom: "48px",
            alignItems: "flex-start",
          }}
        >
          {/* COLUMN 1: BRAND LOGO + BIO + ACTION ICONS */}
          <div style={{ maxWidth: "320px" }}>
            <Link href="/" style={{ display: "inline-block", marginBottom: "16px" }}>
              <img
                src="/images/logo-transparent.png"
                alt="Good Car Imports"
                style={{ height: "38px", width: "auto", objectFit: "contain" }}
              />
            </Link>
            <p
              style={{
                fontSize: "13px",
                lineHeight: "1.65",
                color: "var(--stock-text-secondary)",
                margin: "0 0 20px 0",
              }}
            >
              Your trusted partner for authentic Japanese and European vehicle imports in Bangladesh.
            </p>

            {/* 3 Circular Action Buttons (Phone, Email, Share) */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {/* Phone */}
              <a
                href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE || "+8801992424492"}`}
                aria-label="Call Good Car Imports"
                title="Call Us"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--stock-badge-bg)",
                  border: "1px solid var(--stock-badge-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--stock-text-secondary)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--stock-accent-red)";
                  e.currentTarget.style.borderColor = "var(--stock-accent-red)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--stock-text-secondary)";
                  e.currentTarget.style.borderColor = "var(--stock-badge-border)";
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>

              {/* Email */}
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_COMPANY_EMAIL || "goodcarimports.bd@gmail.com"}`}
                aria-label="Email Good Car Imports"
                title="Send Email"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--stock-badge-bg)",
                  border: "1px solid var(--stock-badge-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--stock-text-secondary)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--stock-accent-red)";
                  e.currentTarget.style.borderColor = "var(--stock-accent-red)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--stock-text-secondary)";
                  e.currentTarget.style.borderColor = "var(--stock-badge-border)";
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </a>

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share Website"
                title="Share Website"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--stock-badge-bg)",
                  border: "1px solid var(--stock-badge-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--stock-text-secondary)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--stock-accent-red)";
                  e.currentTarget.style.borderColor = "var(--stock-accent-red)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--stock-text-secondary)";
                  e.currentTarget.style.borderColor = "var(--stock-badge-border)";
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
          </div>

          {/* COLUMN 2: COMPANY */}
          <div>
            <h4
              style={{
                fontSize: "11.5px",
                fontWeight: 700,
                color: "var(--stock-accent-red)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
              }}
            >
              COMPANY
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li>
                <Link
                  href="/about"
                  style={{
                    fontSize: "13.5px",
                    color: "var(--stock-text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--stock-text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stock-text-secondary)")}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/pre-order"
                  style={{
                    fontSize: "13.5px",
                    color: "var(--stock-text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--stock-text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stock-text-secondary)")}
                >
                  Pre-Order Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/inventory"
                  style={{
                    fontSize: "13.5px",
                    color: "var(--stock-text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--stock-text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stock-text-secondary)")}
                >
                  Stock
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: SUPPORT */}
          <div>
            <h4
              style={{
                fontSize: "11.5px",
                fontWeight: 700,
                color: "var(--stock-accent-red)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
              }}
            >
              SUPPORT
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li>
                <Link
                  href="/contact"
                  style={{
                    fontSize: "13.5px",
                    color: "var(--stock-text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--stock-text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stock-text-secondary)")}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  style={{
                    fontSize: "13.5px",
                    color: "var(--stock-text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--stock-text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stock-text-secondary)")}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  style={{
                    fontSize: "13.5px",
                    color: "var(--stock-text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--stock-text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stock-text-secondary)")}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  style={{
                    fontSize: "13.5px",
                    color: "var(--stock-text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--stock-text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stock-text-secondary)")}
                >
                  Locate Us
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: OUR OFFICE + SOCIAL ICONS */}
          <div>
            <h4
              style={{
                fontSize: "11.5px",
                fontWeight: 700,
                color: "var(--stock-accent-red)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
              }}
            >
              OUR OFFICE
            </h4>
            <div
              style={{
                fontSize: "13.5px",
                lineHeight: "1.6",
                color: "var(--stock-text-secondary)",
                marginBottom: "18px",
              }}
            >
              <div>56 Inner Circular Road</div>
              <div>Eastern Trade Center (6 Floor)</div>
              <div>Purana Paltan Line Dhaka-1000</div>
            </div>

            {/* Social Icons: Facebook & Instagram Square Buttons */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <a
                href="https://www.facebook.com/share/1GgiR3HrNP/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Good Car Imports Facebook"
                style={{
                  display: "inline-block",
                  lineHeight: 0,
                  borderRadius: "6px",
                  overflow: "hidden",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.85";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="5" fill="#a0aab8" />
                  <path d="M13.5 19V12.5H15.5L15.8 10H13.5V8.5C13.5 7.8 13.8 7.3 14.8 7.3H16V5.1C15.8 5.1 15 5 14.1 5C12.1 5 10.8 6.2 10.8 8.3V10H8.8V12.5H10.8V19H13.5Z" fill="#111215" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/goodcarimports/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Good Car Imports Instagram"
                style={{
                  display: "inline-block",
                  lineHeight: 0,
                  borderRadius: "6px",
                  overflow: "hidden",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.85";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="5" fill="#a0aab8" />
                  <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" stroke="#111215" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="3" stroke="#111215" strokeWidth="1.6" />
                  <circle cx="15.5" cy="8.5" r="0.9" fill="#111215" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM BAR: COPYRIGHT + UTILITY LINKS                      */}
        {/* ========================================================= */}
        <div
          style={{
            borderTop: "none",
            paddingTop: "24px",
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "12px",
            color: "var(--stock-label-color)",
          }}
        >
          {/* Gradient divider */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "var(--gradient-divider)" }} />
          {/* Left: Copyright */}
          <div>
            &copy; {new Date().getFullYear()} Good Car Imports. All rights reserved. Dhaka, Bangladesh.
          </div>

          {/* Right: Legal & Contact Links */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <Link
              href="/terms"
              style={{
                color: "var(--stock-label-color)",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--stock-text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stock-label-color)")}
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              style={{
                color: "var(--stock-label-color)",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--stock-text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stock-label-color)")}
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              style={{
                color: "var(--stock-label-color)",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--stock-text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stock-label-color)")}
            >
              Contact Us
            </Link>
            <Link
              href="/contact"
              style={{
                color: "var(--stock-label-color)",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--stock-text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stock-label-color)")}
            >
              Locate Us
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
