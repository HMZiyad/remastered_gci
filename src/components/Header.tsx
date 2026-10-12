"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`site-header ${scrolled ? "scrolled" : ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? "var(--glass-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(var(--glass-blur))" : "none",
        borderBottom: scrolled ? "1px solid var(--surface-container-high)" : "none",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        transition: "background-color var(--transition-base), box-shadow var(--transition-base), backdrop-filter var(--transition-base)",
      }}
    >
      <div className="container nav-container" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", height: "80px", padding: "0 var(--margin-desktop)", maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link href="/" className="nav-logo">
            <img src="/images/logo-transparent.png" alt="Good Car Imports" style={{ height: "48px", width: "auto", objectFit: "contain" }} />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ul style={{ display: "flex", listStyle: "none", gap: "var(--unit-lg)", margin: 0, padding: 0, alignItems: "center" }}>
            <li>
              <Link
                href="/"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  fontWeight: pathname === "/" ? 600 : 400,
                  color: pathname === "/" ? "var(--primary)" : "var(--on-surface)",
                  paddingBottom: "4px",
                  borderBottom: pathname === "/" ? "2px solid var(--primary)" : "none",
                  textDecoration: "none",
                  transition: "color var(--transition-fast)"
                }}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/inventory"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  fontWeight: pathname.startsWith("/inventory") ? 600 : 400,
                  color: pathname.startsWith("/inventory") ? "var(--primary)" : "var(--on-surface)",
                  paddingBottom: "4px",
                  borderBottom: pathname.startsWith("/inventory") ? "2px solid var(--primary)" : "none",
                  textDecoration: "none",
                  transition: "color var(--transition-fast)"
                }}
              >
                Stock
              </Link>
            </li>
            <li>
              <Link
                href="/pre-order"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  fontWeight: pathname === "/pre-order" ? 600 : 400,
                  color: pathname === "/pre-order" ? "var(--primary)" : "var(--on-surface)",
                  paddingBottom: "4px",
                  borderBottom: pathname === "/pre-order" ? "2px solid var(--primary)" : "none",
                  textDecoration: "none",
                  transition: "color var(--transition-fast)"
                }}
              >
                Pre-Order
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  fontWeight: pathname === "/about" ? 600 : 400,
                  color: pathname === "/about" ? "var(--primary)" : "var(--on-surface)",
                  paddingBottom: "4px",
                  borderBottom: pathname === "/about" ? "2px solid var(--primary)" : "none",
                  textDecoration: "none",
                  transition: "color var(--transition-fast)"
                }}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  fontWeight: pathname === "/contact" ? 600 : 400,
                  color: pathname === "/contact" ? "var(--primary)" : "var(--on-surface)",
                  paddingBottom: "4px",
                  borderBottom: pathname === "/contact" ? "2px solid var(--primary)" : "none",
                  textDecoration: "none",
                  transition: "color var(--transition-fast)"
                }}
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--unit-md)", justifySelf: "end" }}>
          <ThemeToggle />
          <Link
            href="tel:+8801700000000"
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--on-primary)",
              background: "var(--primary)",
              padding: "10px 24px",
              borderRadius: "9999px",
              textDecoration: "none",
              transition: "background var(--transition-fast), transform var(--transition-fast)",
            }}
          >
            Call Now
          </Link>
        </div>
      </div>
    </header>
  );
}
