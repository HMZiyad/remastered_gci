import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Good Car Imports. Visit our Baridhara showroom or contact our team for inquiries about imported vehicles.",
};

export default function ContactPage() {
  const companyPhone1 = process.env.NEXT_PUBLIC_COMPANY_PHONE || "+880 19 9242 4492";
  const companyEmail = process.env.NEXT_PUBLIC_COMPANY_EMAIL || "goodcarimports.bd@gmail.com";
  const address = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "56 Inner Circular Road\nEastern Trade Center (6 Floor)\nPurana Paltan Line, Dhaka-1000";
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801992424492";

  return (
    <section style={{ padding: "var(--unit-xl) 0" }}>
      <div className="container">
        
        <div className="gci-reveal" style={{ textAlign: "center", marginBottom: "var(--unit-xl)", maxWidth: "800px", margin: "0 auto var(--unit-xl)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", color: "var(--red-vivid)", marginBottom: "var(--unit-xs)", textTransform: "uppercase" }}>WE&apos;D LOVE TO HEAR FROM YOU</div>
          <h1 className="text-display-lg" style={{ marginBottom: "var(--unit-md)" }}>Get in <span className="gci-red-gradient-text">Touch</span></h1>
          <p className="text-body-lg" style={{ color: "var(--on-surface-variant)" }}>
            Whether you have a question about our inventory, need assistance with a pre-order, or want to schedule an inspection, our team is ready to help.
          </p>
        </div>

        <div className="contact-layout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--unit-xl)", alignItems: "start" }}>
          
          {/* Contact Form Card */}
          <div className="gci-reveal" style={{ backgroundColor: "var(--surface)", padding: "var(--unit-xl)", borderRadius: "var(--radius-xl)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)", transition: "box-shadow 0.3s ease" }}>
            <h2 className="text-headline-lg" style={{ marginBottom: "var(--unit-lg)" }}>Send an Inquiry</h2>
            <ContactForm />
          </div>

          {/* Contact Info Card */}
          <div className="gci-reveal" data-reveal-delay="120ms" style={{ display: "flex", flexDirection: "column", gap: "var(--unit-lg)" }}>
            
            {/* Map */}
            <div style={{ height: "300px", borderRadius: "var(--radius-xl)", overflow: "hidden", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)", position: "relative" }}>
              <iframe src="https://maps.google.com/maps?q=56+Inner+Circular+Road+Eastern+Trade+Center+Dhaka&t=&z=15&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{ border: 0, width: "100%", height: "100%" }}></iframe>
              <a href="https://www.google.com/maps/search/56+Inner+Circular+Road+Eastern+Trade+Center+Dhaka" target="_blank" rel="noopener noreferrer" style={{ position: "absolute", bottom: "16px", left: "16px", backgroundColor: "var(--surface)", color: "var(--on-surface)", padding: "8px 16px", borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", boxShadow: "var(--shadow-modal)", border: "1px solid var(--glass-border)", backdropFilter: "blur(8px)" }}>
                Open in Google Maps <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>open_in_new</span>
              </a>
            </div>

            <div style={{ backgroundColor: "var(--surface)", padding: "var(--unit-xl)", borderRadius: "var(--radius-xl)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-card)" }}>
              <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "flex-start" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "var(--red-glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "var(--red-vivid)" }}>location_on</span>
                </div>
                <div>
                  <h3 className="text-title-md" style={{ marginBottom: "6px" }}>Our Location</h3>
                  <p className="text-body-md" style={{ color: "var(--on-surface-variant)", whiteSpace: "pre-line", lineHeight: 1.5 }}>{address}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "flex-start" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "var(--red-glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "var(--red-vivid)" }}>call</span>
                </div>
                <div>
                  <h3 className="text-title-md" style={{ marginBottom: "6px" }}>Call Us</h3>
                  <a href={`tel:${companyPhone1.replace(/\s+/g, '')}`} className="text-body-md" style={{ color: "var(--on-surface-variant)", textDecoration: "none", transition: "color 0.2s ease" }}>{companyPhone1}</a>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "16px", marginBottom: "32px", alignItems: "flex-start" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "var(--red-glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "var(--red-vivid)" }}>mail</span>
                </div>
                <div>
                  <h3 className="text-title-md" style={{ marginBottom: "6px" }}>Email</h3>
                  <a href={`mailto:${companyEmail}`} className="text-body-md" style={{ color: "var(--on-surface-variant)", textDecoration: "none", transition: "color 0.2s ease" }}>{companyEmail}</a>
                </div>
              </div>

              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="gci-btn-shine" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", backgroundColor: "var(--whatsapp-green)", color: "white", fontWeight: 600, borderRadius: "var(--radius-full)", textDecoration: "none", boxShadow: "0 6px 20px rgba(37, 211, 102, 0.35)", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}>
                <span className="material-symbols-outlined filled" style={{ fontSize: "20px" }}>chat</span>
                Chat on WhatsApp
              </a>
            </div>

          </div>
        </div>

        <style>{`
          @media (max-width: 860px) {
            .contact-layout-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
