"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/inventory", label: "Stock" },
  { href: "/pre-order", label: "Pre-Order" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`site-header ${scrolled ? "scrolled" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: pathname === "/" && !scrolled && !mobileMenuOpen ? "transparent" : "var(--header-bg)",
          backdropFilter: "blur(20px) saturate(1.2)",
          WebkitBackdropFilter: "blur(20px) saturate(1.2)",
          borderBottom: pathname === "/" && !scrolled && !mobileMenuOpen ? "none" : "1px solid var(--glass-border)",
          boxShadow: pathname === "/" && !scrolled ? "none" : "var(--header-box-shadow)",
          transition: "background-color 0.3s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <div
          className="header-inner"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "80px",
            padding: "0 var(--margin-desktop, clamp(40px, 3.2vw, 60px))",
            maxWidth: "100%",
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Logo */}
          <Link href="/" className="nav-logo" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <img
              src="/images/logo-transparent.png"
              alt="Good Car Imports"
              style={{ height: "clamp(32px, 5vw, 42px)", width: "auto", maxWidth: "160px", objectFit: "contain" }}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav-menu">
            <ul
              style={{
                display: "flex",
                listStyle: "none",
                gap: "32px",
                margin: 0,
                padding: 0,
                alignItems: "center",
              }}
            >
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href) ||
                      (link.href === "/inventory" && pathname.startsWith("/stock"));
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{
                        fontFamily: "var(--font-body, 'Inter', sans-serif)",
                        fontSize: "14px",
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? "var(--nav-link-active)" : "var(--nav-link)",
                        paddingBottom: "4px",
                        borderBottom: isActive ? "2px solid var(--stock-accent-red)" : "2px solid transparent",
                        textDecoration: "none",
                        transition: "color 0.2s ease, border-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.color = "var(--nav-link-hover)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.color = "var(--nav-link)";
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Desktop Actions & Mobile Burger Trigger */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <ThemeToggle />

            {/* Desktop Call CTA */}
            <Link
              href="tel:+8801700000000"
              className="desktop-call-cta gci-btn-shine"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-body, 'Inter', sans-serif)",
                fontSize: "13px",
                fontWeight: 700,
                color: "#ffffff",
                background: "var(--gradient-red-btn)",
                padding: "9px 22px",
                borderRadius: "9999px",
                textDecoration: "none",
                letterSpacing: "0.01em",
                boxShadow: "var(--shadow-red-glow)",
                transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(239, 68, 68, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "var(--shadow-red-glow)";
              }}
            >
              <span>Call Now</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="mobile-burger-button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              style={{
                display: "none", // Controlled by CSS media queries below
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                backgroundColor: "var(--toggle-btn-bg)",
                border: "1px solid var(--toggle-btn-border)",
                cursor: "pointer",
                padding: 0,
                gap: "5px",
                flexShrink: 0,
                touchAction: "manipulation",
                zIndex: 1001,
                transition: "background-color 0.2s ease, border-color 0.2s ease",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: "20px",
                  height: "2px",
                  backgroundColor: "var(--nav-link-hover)",
                  borderRadius: "2px",
                  transition: "transform 0.25s ease, opacity 0.25s ease",
                  transform: mobileMenuOpen ? "translateY(7px) rotate(45deg)" : "none",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: "20px",
                  height: "2px",
                  backgroundColor: "var(--nav-link-hover)",
                  borderRadius: "2px",
                  transition: "opacity 0.25s ease",
                  opacity: mobileMenuOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  display: "block",
                  width: "20px",
                  height: "2px",
                  backgroundColor: "var(--nav-link-hover)",
                  borderRadius: "2px",
                  transition: "transform 0.25s ease, opacity 0.25s ease",
                  transform: mobileMenuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      <div
        className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          top: "80px",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "var(--header-bg)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid var(--header-border)",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "24px 20px 36px 20px",
          overflowY: "auto",
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? "auto" : "none",
          transform: mobileMenuOpen ? "translateY(0)" : "translateY(-12px)",
          transition: "opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Navigation Links List */}
        <nav style={{ width: "100%" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      borderRadius: "12px",
                      backgroundColor: isActive ? "rgba(230, 25, 46, 0.12)" : "var(--stock-badge-bg)",
                      border: isActive ? "1px solid var(--stock-accent-red)" : "1px solid var(--stock-card-border)",
                      fontFamily: "var(--font-headline, 'Hanken Grotesk', sans-serif)",
                      fontSize: "18px",
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? "var(--stock-accent-red)" : "var(--stock-text-primary)",
                      textDecoration: "none",
                      transition: "background-color 0.15s ease, color 0.15s ease",
                    }}
                  >
                    <span>{link.label}</span>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "20px",
                        color: isActive ? "var(--stock-accent-red)" : "var(--stock-label-color)",
                      }}
                    >
                      arrow_forward_ios
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Drawer Bottom Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
          <Link
            href="tel:+8801700000000"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "16px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #bc001f 0%, #e6192e 100%)",
              color: "#ffffff",
              fontFamily: "var(--font-body, 'Inter', sans-serif)",
              fontSize: "16px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(188, 0, 31, 0.4)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>call</span>
            <span>Call Us: +880 1700-000000</span>
          </Link>

          <Link
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801700000000"}?text=Hello,%20I%20have%20an%20inquiry%20about%20importing%20a%20vehicle.`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "14px",
              borderRadius: "12px",
              backgroundColor: "rgba(37, 211, 102, 0.15)",
              border: "1px solid rgba(37, 211, 102, 0.35)",
              color: "#25D366",
              fontFamily: "var(--font-body, 'Inter', sans-serif)",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <span className="material-symbols-outlined filled" style={{ fontSize: "20px" }}>chat</span>
            <span>WhatsApp Quick Chat</span>
          </Link>
        </div>
      </div>

      {/* Header Scoped Media Queries */}
      <style>{`
        @media (max-width: 860px) {
          .desktop-nav-menu {
            display: none !important;
          }
          .desktop-call-cta {
            display: none !important;
          }
          .mobile-burger-button {
            display: flex !important;
          }
          .header-inner {
            padding: 0 16px !important;
          }
        }
        @media (min-width: 861px) {
          .mobile-nav-drawer {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
