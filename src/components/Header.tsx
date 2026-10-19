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
          background: scrolled || mobileMenuOpen ? "rgba(10, 10, 10, 0.92)" : "transparent",
          backdropFilter: scrolled || mobileMenuOpen ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled || mobileMenuOpen ? "blur(16px)" : "none",
          borderBottom: scrolled || mobileMenuOpen ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
          boxShadow: scrolled ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "none",
          transition: "background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        }}
      >
        <div
          className="header-inner"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "80px",
            padding: "0 clamp(14px, 3vw, 36px)",
            maxWidth: "var(--container-max, 1400px)",
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
                    : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{
                        fontFamily: "var(--font-body, 'Inter', sans-serif)",
                        fontSize: "14px",
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.8)",
                        paddingBottom: "4px",
                        borderBottom: isActive ? "2px solid #bc001f" : "2px solid transparent",
                        textDecoration: "none",
                        transition: "color 0.2s ease, border-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
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
              className="desktop-call-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "var(--font-body, 'Inter', sans-serif)",
                fontSize: "13px",
                fontWeight: 700,
                color: "#ffffff",
                background: "linear-gradient(135deg, #bc001f 0%, #e6192e 100%)",
                padding: "9px 20px",
                borderRadius: "9999px",
                textDecoration: "none",
                letterSpacing: "0.02em",
                boxShadow: "0 4px 14px rgba(188, 0, 31, 0.35)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(188, 0, 31, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(188, 0, 31, 0.35)";
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>call</span>
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
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
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
                  backgroundColor: "#ffffff",
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
                  backgroundColor: "#ffffff",
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
                  backgroundColor: "#ffffff",
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
          backgroundColor: "rgba(8, 8, 8, 0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
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
                      backgroundColor: isActive ? "rgba(188, 0, 31, 0.2)" : "rgba(255, 255, 255, 0.04)",
                      border: isActive ? "1px solid rgba(188, 0, 31, 0.5)" : "1px solid rgba(255, 255, 255, 0.08)",
                      fontFamily: "var(--font-headline, 'Hanken Grotesk', sans-serif)",
                      fontSize: "18px",
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? "#ffdad7" : "#ffffff",
                      textDecoration: "none",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <span>{link.label}</span>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "20px",
                        color: isActive ? "#bc001f" : "rgba(255, 255, 255, 0.4)",
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
