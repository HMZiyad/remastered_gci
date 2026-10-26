import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteLoader } from "@/components/SiteLoader";
import { ScrollRevealInit } from "@/components/ScrollRevealInit";
import { Suspense } from "react";


export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteLoader />
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main style={{ flex: 1, paddingTop: "80px" }}>
        {children}
      </main>
      <Footer />
      <ScrollRevealInit />
      
      {/* WhatsApp FAB / Start Chat */}
      <a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801700000000"}?text=Hello,%20I%20have%20an%20inquiry%20about%20a%20vehicle.`}
        target="_blank"
        rel="noopener noreferrer"
        id="whatsapp-fab"
        aria-label="Start Chat on WhatsApp"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          backgroundColor: "#10c662",
          color: "#ffffff",
          padding: "10px 18px",
          borderRadius: "9999px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 6px 20px rgba(16, 198, 98, 0.4)",
          zIndex: 900,
          textDecoration: "none",
          fontWeight: 700,
          fontSize: "13.5px",
          fontFamily: "var(--font-body, 'Inter', sans-serif)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <span className="material-symbols-outlined filled" style={{ fontSize: "18px" }}>chat</span>
        <span>Start Chat</span>
      </a>
    </>
  );
}
