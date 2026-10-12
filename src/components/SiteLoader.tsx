"use client";

import { useEffect, useState } from "react";

export function SiteLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show once per session
    const hasLoaded = sessionStorage.getItem("gci_loaded");
    
    if (!hasLoaded) {
      setShow(true);
      sessionStorage.setItem("gci_loaded", "true");
      
      // Minimum 2s display time as per legacy
      const timer = setTimeout(() => {
        setShow(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "var(--background)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        transition: "opacity 0.5s ease",
      }}
    >
      <img 
        src="/images/car-loader.gif" 
        alt="Loading..." 
        style={{ width: "120px", height: "auto", marginBottom: "var(--unit-md)" }}
      />
      <div className="text-label-sm" style={{ color: "var(--secondary)", letterSpacing: "2px", textTransform: "uppercase" }}>
        Good Car Imports
      </div>
    </div>
  );
}
