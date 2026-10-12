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
        
        <div style={{ textAlign: "center", marginBottom: "var(--unit-xl)", maxWidth: "800px", margin: "0 auto var(--unit-xl)" }}>
          <h1 className="text-display-lg" style={{ marginBottom: "var(--unit-md)" }}>Get in Touch</h1>
          <p className="text-body-lg" style={{ color: "var(--on-surface-variant)" }}>
            Whether you have a question about our inventory, need assistance with a pre-order, or want to schedule an inspection, our team is ready to help.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--unit-xl)", alignItems: "start" }}>
          
          {/* Contact Form Card */}
          <div style={{ backgroundColor: "var(--surface)", padding: "var(--unit-xl)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)", boxShadow: "var(--shadow-sm)" }}>
            <h2 className="text-headline-lg" style={{ marginBottom: "var(--unit-lg)" }}>Send an Inquiry</h2>
            <ContactForm />
          </div>

          {/* Contact Info Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--unit-lg)" }}>
            
            {/* Map */}
            <div style={{ height: "300px", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--surface-container-high)", position: "relative" }}>
              <iframe src="https://maps.google.com/maps?q=56+Inner+Circular+Road+Eastern+Trade+Center+Dhaka&t=&z=15&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{ border: 0, width: "100%", height: "100%" }}></iframe>
              <a href="https://www.google.com/maps/search/56+Inner+Circular+Road+Eastern+Trade+Center+Dhaka" target="_blank" rel="noopener noreferrer" style={{ position: "absolute", bottom: "16px", left: "16px", backgroundColor: "var(--surface)", color: "var(--on-surface)", padding: "8px 16px", borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", boxShadow: "var(--shadow-modal)" }}>
                Open in Google Maps <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>open_in_new</span>
              </a>
            </div>

            <div style={{ backgroundColor: "var(--surface)", padding: "var(--unit-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-container-high)" }}>
              <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "var(--primary)" }}>location_on</span>
                <div>
                  <h3 className="text-title-md" style={{ marginBottom: "8px" }}>Our Location</h3>
                  <p className="text-body-md" style={{ color: "var(--on-surface-variant)", whiteSpace: "pre-line" }}>{address}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "var(--primary)" }}>call</span>
                <div>
                  <h3 className="text-title-md" style={{ marginBottom: "8px" }}>Call Us</h3>
                  <a href={`tel:${companyPhone1.replace(/\s+/g, '')}`} className="text-body-md" style={{ color: "var(--on-surface-variant)", textDecoration: "none" }}>{companyPhone1}</a>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "var(--primary)" }}>mail</span>
                <div>
                  <h3 className="text-title-md" style={{ marginBottom: "8px" }}>Email</h3>
                  <a href={`mailto:${companyEmail}`} className="text-body-md" style={{ color: "var(--on-surface-variant)", textDecoration: "none" }}>{companyEmail}</a>
                </div>
              </div>

              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", backgroundColor: "var(--whatsapp-green)", color: "white", fontWeight: 600, borderRadius: "var(--radius-full)" }}>
                <span className="material-symbols-outlined filled" style={{ fontSize: "20px" }}>chat</span>
                Chat on WhatsApp
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
