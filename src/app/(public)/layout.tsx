import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteLoader } from "@/components/SiteLoader";
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
      
      {/* WhatsApp FAB */}
      <a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hello,%20I%20have%20an%20inquiry%20about%20a%20vehicle.`}
        target="_blank"
        rel="noopener noreferrer"
        id="whatsapp-fab"
        aria-label="Chat on WhatsApp"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          backgroundColor: "var(--whatsapp-green)",
          color: "white",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-modal)",
          zIndex: 900,
          transition: "transform var(--transition-fast)",
        }}
      >
        <span className="material-symbols-outlined filled" style={{ fontSize: "28px" }}>chat</span>
      </a>
    </>
  );
}
