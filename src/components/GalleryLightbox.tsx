"use client";

import { useState, useEffect, useCallback } from "react";

interface GalleryLightboxProps {
  photos: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function GalleryLightbox({ photos, initialIndex = 0, isOpen, onClose }: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || photos.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        userSelect: "none",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "12px",
          right: "16px",
          color: "white",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>close</span>
      </button>

      {photos.length > 1 && (
        <button
          onClick={handlePrev}
          style={{
            position: "absolute",
            left: "12px",
            color: "white",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>chevron_left</span>
        </button>
      )}

      <img
        src={photos[currentIndex]}
        alt={`Photo ${currentIndex + 1}`}
        style={{
          maxWidth: "90%",
          maxHeight: "80vh",
          objectFit: "contain",
          borderRadius: "8px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        }}
      />

      {photos.length > 1 && (
        <button
          onClick={handleNext}
          style={{
            position: "absolute",
            right: "12px",
            color: "white",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>chevron_right</span>
        </button>
      )}

      {photos.length > 1 && (
        <div style={{ color: "var(--secondary)", marginTop: "16px", fontSize: "15px", fontWeight: 500 }}>
          {currentIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}
