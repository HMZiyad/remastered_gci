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
    <div style={{ width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}>
      {/* ===== TOP 3-PHOTO SPLIT GRID ===== */}
      <div
        className={`vehicle-main-gallery-grid ${photos.length > 1 ? "has-multi-photos" : "has-single-photo"}`}
      >
        {/* Left: Large Main Image */}
        <div
          className="vehicle-gallery-main-img-wrap"
          onClick={() => openLightbox(previewIndex)}
        >
          <img
            src={mainPhoto}
            alt={title}
            className="vehicle-gallery-main-img"
          />
          {photos.length > 0 && (
            <div className="vehicle-gallery-counter-badge">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                photo_camera
              </span>
              <span>{previewIndex + 1}/{photos.length} Photos</span>
            </div>
          )}
        </div>

        {/* Right: 2 Stacked Photos (Auction Sheet & Rear View) - hidden on mobile via CSS */}
        {photos.length > 1 && (
          <div className="vehicle-gallery-stacked-col">
            {/* Top Right: Photo 2 */}
            <div
              className="vehicle-gallery-sub-img-wrap"
              onClick={() => {
                setPreviewIndex(1);
                openLightbox(1);
              }}
            >
              <img
                src={photo2}
                alt={`${title} - Photo 2`}
                className="vehicle-gallery-sub-img"
              />
            </div>

            {/* Bottom Right: Photo 3 */}
            <div
              className="vehicle-gallery-sub-img-wrap"
              onClick={() => {
                const targetIdx = photos.length > 2 ? 2 : 1;
                setPreviewIndex(targetIdx);
                openLightbox(targetIdx);
              }}
            >
              <img
                src={photo3}
                alt={`${title} - Photo 3`}
                className="vehicle-gallery-sub-img"
              />
            </div>
          </div>
        )}
      </div>

      {/* ===== OVERVIEW & DESCRIPTION (CHILDREN) ===== */}
      {children}

      {/* ===== ALL PHOTOS HORIZONTAL ROW WITH SCROLLBAR ===== */}
      {photos.length > 0 && (
        <div style={{ marginTop: "36px", width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--stock-text-primary)",
              margin: "0 0 16px 0",
              letterSpacing: "-0.01em",
            }}
          >
            All Photos {photos.length > 1 ? `(${photos.length})` : ""}
          </h3>

          <div
            ref={scrollRef}
            onScroll={updateScrollProgress}
            style={{
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
              paddingBottom: "8px",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              boxSizing: "border-box",
            }}
          >
            {photos.map((photo, index) => (
              <button
                key={index}
                type="button"
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
                  padding: 0,
                  background: "transparent",
                  outline: "none",
                  display: "block",
                }}
              >
                <img
                  src={photo}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </button>
            ))}
          </div>

          {/* Custom Scroll Indicator Track */}
          {photos.length > 3 && (
            <div
              style={{
                width: "100%",
                maxWidth: "100%",
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
                  backgroundColor: "var(--stock-accent-red)",
                  borderRadius: "2px",
                  transition: "left 0.05s linear",
                }}
              />
            </div>
          )}
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

