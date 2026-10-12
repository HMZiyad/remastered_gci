"use client";

import { useState } from "react";
import { GalleryLightbox } from "./GalleryLightbox";

interface InteractiveGalleryProps {
  photos: string[];
  title: string;
}

export function InteractiveGallery({ photos, title }: InteractiveGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const hasPhotos = photos.length > 0;
  const mainPhoto = hasPhotos ? photos[0] : "/images/placeholder-car.svg";
  const photo2 = photos.length > 1 ? photos[1] : "/images/placeholder-car.svg";
  const photo3 = photos.length > 2 ? photos[2] : "/images/placeholder-car.svg";

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gridTemplateRows: "1fr 1fr", gap: "var(--unit-sm)", height: "400px", marginBottom: "var(--unit-xl)" }}>
        
        <div 
          onClick={() => openLightbox(0)}
          style={{ gridRow: "1 / -1", position: "relative", cursor: "pointer", borderRadius: "var(--radius-lg) 0 0 var(--radius-lg)", overflow: "hidden", backgroundColor: "var(--surface-container)" }}
        >
          <img src={mainPhoto} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform var(--transition-slow)" }} onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"} onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"} />
          {photos.length > 1 && (
            <div style={{ position: "absolute", bottom: "16px", left: "16px", backgroundColor: "rgba(0,0,0,0.6)", color: "white", padding: "6px 12px", borderRadius: "var(--radius-full)", fontSize: "13px", fontWeight: 600, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>photo_library</span>
              1/{photos.length} Photos
            </div>
          )}
        </div>

        <div onClick={() => openLightbox(1)} style={{ cursor: "pointer", borderRadius: "0 var(--radius-lg) 0 0", overflow: "hidden", backgroundColor: "var(--surface-container)" }}>
           <img src={photo2} alt={`${title} angle 2`} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform var(--transition-slow)" }} onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"} />
        </div>

        <div onClick={() => openLightbox(2)} style={{ cursor: "pointer", borderRadius: "0 0 var(--radius-lg) 0", overflow: "hidden", backgroundColor: "var(--surface-container)" }}>
           <img src={photo3} alt={`${title} angle 3`} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform var(--transition-slow)" }} onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"} />
        </div>

      </div>

      <GalleryLightbox 
        photos={photos} 
        isOpen={lightboxOpen} 
        initialIndex={lightboxIndex} 
        onClose={() => setLightboxOpen(false)} 
      />
    </>
  );
}
