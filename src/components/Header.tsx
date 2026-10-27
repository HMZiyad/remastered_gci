"use client";

import { useState, useEffect, useRef } from "react";
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
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const isScrolled = currentScrollY > 15;
          setScrolled(isScrolled);

          // Auto-hide when scrolling down past 70px; show immediately on scroll up
          if (!mobileMenuOpen) {
            const diff = currentScrollY - lastScrollY.current;
            if (currentScrollY > 70 && diff > 5) {
              // Scrolling down -> hide navbar
              setHidden(true);
            } else if (diff < -5 || currentScrollY <= 15) {
              // Scrolling up or at the very top -> reveal navbar
              setHidden(false);
            }
          } else {
            setHidden(false);
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen]);

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
        className={`site-header ${scrolled ? "scrolled" : ""} ${hidden ? "nav-hidden" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10000,
          background: "var(--header-bg)",
          backdropFilter: "blur(20px) saturate(1.2)",
          WebkitBackdropFilter: "blur(20px) saturate(1.2)",
          borderBottom: "1px solid var(--glass-border)",
          boxShadow: scrolled ? "var(--header-box-shadow)" : "none",
          transform: hidden && !mobileMenuOpen ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          willChange: "transform",
        }}
      >
        <div
          className="header-inner"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: scrolled ? "62px" : "80px",
            padding: "0 var(--margin-desktop, clamp(40px, 3.2vw, 60px))",
            maxWidth: "100%",
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box",
            transition: "height 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Logo */}
          <Link href="/" className="nav-logo" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <img
              src="/images/logo-transparent.png"
              alt="Good Car Imports"
              style={{
                height: scrolled ? "32px" : "clamp(34px, 5vw, 42px)",
                width: "auto",
                maxWidth: "160px",
                objectFit: "contain",
                transition: "height 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
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
              href="tel:+8801992424492"
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
          top: scrolled ? "62px" : "80px",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "var(--header-bg)",
          backdropFilter: "blur(28px) saturate(1.4)",
          WebkitBackdropFilter: "blur(28px) saturate(1.4)",
          borderTop: "1px solid var(--header-border)",
          zIndex: 9998,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "24px 24px 32px 24px",
          overflowY: "auto",
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? "auto" : "none",
          transform: mobileMenuOpen ? "translateY(0)" : "translateY(-8px)",
          transition: "top 0.25s ease, opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          boxSizing: "border-box",
        }}
      >
        {/* Navigation Links */}
        <nav style={{ width: "100%", paddingTop: "8px" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--stock-label-color)",
              marginBottom: "12px",
              opacity: 0.8,
            }}
          >
            Menu
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
            {NAV_LINKS.map((link, idx) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href) ||
                    (link.href === "/inventory" && pathname.startsWith("/stock"));
              return (
                <li
                  key={link.href}
                  style={{
                    borderBottom: "1px solid var(--stock-card-border)",
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 2px",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "monospace",
                          fontWeight: 600,
                          color: isActive ? "var(--stock-accent-red)" : "var(--stock-label-color)",
                          opacity: isActive ? 1 : 0.5,
                        }}
                      >
                        {`0${idx + 1}`}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-headline, 'Hanken Grotesk', sans-serif)",
                          fontSize: "23px",
                          fontWeight: isActive ? 700 : 500,
                          letterSpacing: "-0.015em",
                          color: isActive ? "var(--stock-accent-red)" : "var(--stock-text-primary)",
                          transition: "color 0.2s ease",
                        }}
                      >
                        {link.label}
                      </span>
                    </div>

                    {isActive && (
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "var(--stock-accent-red)",
                          boxShadow: "0 0 10px var(--stock-accent-red)",
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Minimalist Bottom Actions & Direct Hotline */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* Hotline & Quick Connect Bar */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "14px",
              backgroundColor: "var(--stock-card-bg)",
              border: "1px solid var(--stock-card-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "10.5px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--stock-label-color)",
                  marginBottom: "2px",
                }}
              >
                Hotline & WhatsApp
              </div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--stock-text-primary)",
                  letterSpacing: "0.01em",
                }}
              >
                +880 1992-424492
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <Link
                href="tel:+8801992424492"
                onClick={() => setMobileMenuOpen(false)}
                title="Call hotline"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(230, 25, 46, 0.1)",
                  border: "1px solid rgba(230, 25, 46, 0.25)",
                  color: "var(--stock-accent-red)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "transform 0.15s ease",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>call</span>
              </Link>

              <Link
                href="https://wa.me/8801992424492?text=Hello,%20I%20have%20an%20inquiry%20about%20importing%20a%20vehicle."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                title="WhatsApp message"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(37, 211, 102, 0.1)",
                  border: "1px solid rgba(37, 211, 102, 0.25)",
                  color: "#25D366",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "transform 0.15s ease",
                }}
              >
                <span className="material-symbols-outlined filled" style={{ fontSize: "19px" }}>chat</span>
              </Link>
            </div>
          </div>

          {/* Minimalist Subtext */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
              color: "var(--stock-label-color)",
              padding: "0 2px",
              opacity: 0.7,
            }}
          >
            <span>Good Car Imports</span>
            <span>Direct Japanese Auctions</span>
          </div>
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
