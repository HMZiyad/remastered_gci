"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GalleryLightbox } from "./GalleryLightbox";

interface InteractiveGalleryProps {
  photos: string[];
  title: string;
  children?: React.ReactNode;
}

export function InteractiveGallery({ photos, title, children }: InteractiveGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Scroll Progress State for "All Photos" row
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumbState, setThumbState] = useState({ widthPercent: 30, leftPercent: 0 });

  const updateScrollProgress = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    if (scrollWidth <= clientWidth) {
      setThumbState({ widthPercent: 100, leftPercent: 0 });
      return;
    }
    const widthRatio = clientWidth / scrollWidth;
    const thumbWidth = Math.max(15, Math.min(80, widthRatio * 100));
    const maxScroll = scrollWidth - clientWidth;
    const scrollPercent = Math.max(0, Math.min(1, scrollLeft / maxScroll));
    const leftPos = scrollPercent * (100 - thumbWidth);
    setThumbState({ widthPercent: thumbWidth, leftPercent: leftPos });
  }, []);

  useEffect(() => {
    updateScrollProgress();
    window.addEventListener("resize", updateScrollProgress);
    return () => window.removeEventListener("resize", updateScrollProgress);
  }, [updateScrollProgress, photos]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const hasPhotos = photos.length > 0;
  const mainPhoto = hasPhotos ? photos[previewIndex] || photos[0] : "/images/placeholder-car.svg";
  const photo2 = photos.length > 1 ? photos[1] : mainPhoto;
  const photo3 = photos.length > 2 ? photos[2] : mainPhoto;

  return (
    <div>
      {/* ===== TOP 3-PHOTO SPLIT GRID ===== */}
      <div
        className="vehicle-main-gallery-grid"
        style={{
          display: "grid",
          gridTemplateColumns: photos.length > 1 ? "1.45fr 1fr" : "1fr",
          gap: "12px",
          height: "460px",
          maxHeight: "460px",
          overflow: "hidden",
          marginBottom: "32px",
          boxSizing: "border-box",
        }}
      >
        {/* Left: Large Main Image */}
        <div
          onClick={() => openLightbox(previewIndex)}
          style={{
            position: "relative",
            height: "460px",
            maxHeight: "460px",
            width: "100%",
            cursor: "pointer",
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: "var(--stock-badge-bg)",
            border: "1px solid var(--stock-card-border)",
            boxSizing: "border-box",
          }}
        >
          <img
            src={mainPhoto}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              transition: "transform 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          {photos.length > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                backgroundColor: "rgba(0, 0, 0, 0.75)",
                color: "#ffffff",
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "12.5px",
                fontWeight: 700,
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                userSelect: "none",
                zIndex: 2,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                photo_camera
              </span>
              <span>1/{photos.length} Photos</span>
            </div>
          )}
        </div>

        {/* Right: 2 Stacked Photos (Auction Sheet & Rear View) */}
        {photos.length > 1 && (
          <div
            style={{
              display: "grid",
              gridTemplateRows: "224px 224px",
              gap: "12px",
              height: "460px",
              maxHeight: "460px",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            {/* Top Right: Photo 2 */}
            <div
              onClick={() => openLightbox(1)}
              style={{
                height: "224px",
                maxHeight: "224px",
                width: "100%",
                cursor: "pointer",
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: "var(--stock-badge-bg)",
                border: "1px solid var(--stock-card-border)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
              }}
            >
              <img
                src={photo2}
                alt={`${title} - Photo 2`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                  transition: "transform 0.3s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>

            {/* Bottom Right: Photo 3 */}
            <div
              onClick={() => openLightbox(2)}
              style={{
                height: "224px",
                maxHeight: "224px",
                width: "100%",
                cursor: "pointer",
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: "var(--stock-badge-bg)",
                border: "1px solid var(--stock-card-border)",
                position: "relative",
                boxSizing: "border-box",
              }}
            >
              <img
                src={photo3}
                alt={`${title} - Photo 3`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                  transition: "transform 0.3s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>
          </div>
        )}
      </div>

      {/* ===== OVERVIEW & DESCRIPTION (CHILDREN) ===== */}
      {children}

      {/* ===== ALL PHOTOS HORIZONTAL ROW WITH SCROLLBAR ===== */}
      {photos.length > 0 && (
        <div style={{ marginTop: "36px" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--stock-text-primary)",
              margin: "0 0 16px 0",
              letterSpacing: "-0.01em",
            }}
          >
            All Photos
          </h3>

          <div
            ref={scrollRef}
            onScroll={updateScrollProgress}
            style={{
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              paddingBottom: "4px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {photos.map((photo, index) => (
              <div
                key={index}
                onClick={() => {
                  setPreviewIndex(index);
                  openLightbox(index);
                }}
                title={`Click to view photo #${index + 1}`}
                style={{
                  flexShrink: 0,
                  width: "108px",
                  height: "72px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  cursor: "pointer",
                  border: previewIndex === index ? "2px solid var(--stock-accent-red)" : "1px solid var(--stock-card-border)",
                  backgroundColor: "var(--stock-card-bg)",
                  transition: "all 0.15s ease",
                }}
              >
                <img
                  src={photo}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Custom Scroll Indicator Track */}
          <div
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "var(--stock-badge-border)",
              borderRadius: "2px",
              position: "relative",
              overflow: "hidden",
              marginTop: "12px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${thumbState.leftPercent}%`,
                width: `${thumbState.widthPercent}%`,
                backgroundColor: "var(--stock-text-primary)",
                borderRadius: "2px",
                transition: "left 0.05s linear",
              }}
            />
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <GalleryLightbox
        photos={photos}
        isOpen={lightboxOpen}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}

