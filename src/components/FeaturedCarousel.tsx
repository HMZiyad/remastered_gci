"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatBDT } from "@/lib/utils";

export interface FeaturedVehicleItem {
  id: number;
  slug: string | null;
  car_name: string;
  package_trim: string | null;
  year_of_manufacture: number | null;
  price_bdt: string | number | null;
  cover_photo: string | null;
  badge_text: string | null;
  auction_grade: string | null;
  engine_cc: number | null;
  fuel_type: string | null;
  mileage_km: number | null;
}

interface FeaturedCarouselProps {
  vehicles: FeaturedVehicleItem[];
}

function formatMileage(km: number | null | undefined) {
  if (km == null) return "N/A";
  if (km >= 1000) {
    return `${Math.round(km / 1000)}k KM`;
  }
  return `${km} KM`;
}

function VehicleCard({ vehicle, index }: { vehicle: FeaturedVehicleItem; index: number }) {
  const [imgError, setImgError] = useState(false);

  // Normalize image URL
  const rawPhoto = vehicle.cover_photo;
  let imageSrc: string | null = null;
  if (rawPhoto && !imgError) {
    if (rawPhoto.startsWith("http://") || rawPhoto.startsWith("https://") || rawPhoto.startsWith("/")) {
      imageSrc = rawPhoto;
    } else {
      imageSrc = `/uploads/${rawPhoto}`;
    }
  }

  const vehicleHref = `/vehicles/${vehicle.slug || vehicle.id}`;

  return (
    <div
      className="featured-carousel-card gci-reveal"
      data-reveal-delay={`${(index % 4) * 100}ms`}
    >
      <Link
        href={vehicleHref}
        className="featured-card-img-placeholder"
        style={{
          display: "block",
          position: "relative",
          height: "220px",
          overflow: "hidden",
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={vehicle.car_name}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "52px", color: "rgba(255, 255, 255, 0.35)" }}
            >
              directions_car
            </span>
          </div>
        )}

        {vehicle.badge_text && (
          <span
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              backgroundColor:
                vehicle.badge_text === "BEST VALUE"
                  ? "var(--tertiary, #ff8c00)"
                  : "var(--primary, #bc001f)",
              color: "#ffffff",
              padding: "4px 9px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            }}
          >
            {vehicle.badge_text}
          </span>
        )}

        {vehicle.auction_grade && (
          <span
            style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              backgroundColor: "rgba(0,0,0,0.78)",
              color: "#ffffff",
              padding: "4px 9px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            ☆ {vehicle.auction_grade} Grade
          </span>
        )}
      </Link>

      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "8px",
              gap: "8px",
            }}
          >
            <p
              className="featured-card-subtitle"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                margin: 0,
              }}
            >
              {vehicle.year_of_manufacture || "—"} • {vehicle.package_trim || "Standard"}
            </p>
            <div
              className="text-price-bdt featured-card-price"
              style={{
                fontSize: "18px",
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              {formatBDT(vehicle.price_bdt, true)}
            </div>
          </div>

          <h3
            className="featured-card-title"
            style={{
              fontSize: "17px",
              fontWeight: 700,
              lineHeight: 1.35,
              marginBottom: "16px",
              minHeight: "44px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {vehicle.car_name}
          </h3>

          <div
            className="featured-card-divider"
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "18px",
              paddingTop: "12px",
            }}
          >
            {vehicle.engine_cc ? (
              <span
                className="featured-card-spec"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                <span className="material-symbols-outlined featured-card-spec-icon" style={{ fontSize: "16px" }}>
                  settings
                </span>
                {vehicle.engine_cc.toLocaleString()}cc
              </span>
            ) : null}

            {vehicle.fuel_type ? (
              <span
                className="featured-card-spec"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                <span className="material-symbols-outlined featured-card-spec-icon" style={{ fontSize: "16px" }}>
                  local_gas_station
                </span>
                {vehicle.fuel_type}
              </span>
            ) : null}

            <span
              className="featured-card-spec"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              <span className="material-symbols-outlined featured-card-spec-icon" style={{ fontSize: "16px" }}>
                speed
              </span>
              {formatMileage(vehicle.mileage_km)}
            </span>
          </div>
        </div>

        <Link
          href={vehicleHref}
          className="featured-view-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 700,
            fontSize: "14px",
            textDecoration: "none",
            marginTop: "auto",
          }}
        >
          <span>View Details</span>
          <span className="material-symbols-outlined" style={{ fontSize: "18px", transition: "transform 0.2s ease" }}>
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  );
}

export function FeaturedCarousel({ vehicles }: FeaturedCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const atStart = el.scrollLeft <= 4;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 6;

    setCanScrollLeft(!atStart);
    setCanScrollRight(!atEnd);

    // Calculate approximate active page/index
    if (el.scrollWidth > el.clientWidth) {
      const scrollFraction = el.scrollLeft / (el.scrollWidth - el.clientWidth);
      const totalSteps = Math.max(1, vehicles.length - 1);
      setActiveIndex(Math.round(scrollFraction * totalSteps));
    } else {
      setActiveIndex(0);
    }
  }, [vehicles.length]);

  useEffect(() => {
    checkScrollState();
    const el = scrollContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      checkScrollState();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", checkScrollState);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [checkScrollState]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.75;
    const targetScroll =
      direction === "left"
        ? Math.max(0, el.scrollLeft - scrollAmount)
        : Math.min(el.scrollWidth - el.clientWidth, el.scrollLeft + scrollAmount);

    el.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  const scrollToCard = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cards = el.querySelectorAll(".featured-carousel-card");
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  };

  if (!vehicles || vehicles.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "rgba(255, 255, 255, 0.8)", padding: "48px 0" }}>
        No featured vehicles available at the moment. Check back soon!
      </div>
    );
  }

  return (
    <div className="featured-carousel-wrapper" style={{ position: "relative", width: "100%" }}>
      {/* Header with Title, Badge, Controls & View All */}
      <div
        className="gci-reveal"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#ffffff",
              marginBottom: "10px",
              backdropFilter: "blur(6px)",
            }}
          >
            <span>AUCTION GRADED IMPORTS</span>
          </div>
          <h2
            className="text-headline-lg"
            style={{
              marginBottom: "8px",
              color: "#ffffff",
              fontWeight: 800,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            Featured Inventory
          </h2>
          <p className="text-body-lg" style={{ color: "rgba(255, 255, 255, 0.92)", margin: 0 }}>
            Our hand-picked selection of high-grade Japanese and European imports.
          </p>
        </div>

        {/* Action Controls: Prev / Next Buttons + View All Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Slider Arrow Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              padding: "4px",
              borderRadius: "9999px",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              backdropFilter: "blur(8px)",
            }}
          >
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous featured cars"
              className="featured-arrow-btn"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canScrollLeft ? "pointer" : "default",
                opacity: canScrollLeft ? 1 : 0.35,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                chevron_left
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Next featured cars"
              className="featured-arrow-btn"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canScrollRight ? "pointer" : "default",
                opacity: canScrollRight ? 1 : 0.35,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                chevron_right
              </span>
            </button>
          </div>

          <Link
            href="/inventory"
            className="gci-btn-shine"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#ffffff",
              color: "#bc001f",
              fontWeight: 700,
              fontSize: "14px",
              padding: "12px 24px",
              borderRadius: "9999px",
              textDecoration: "none",
              boxShadow: "0 10px 28px rgba(0, 0, 0, 0.3)",
              transition:
                "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <span>View All</span>
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              arrow_forward
            </span>
          </Link>
        </div>
      </div>

      {/* Carousel Track Container */}
      <div
        ref={scrollContainerRef}
        className="featured-carousel-track"
        style={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          gap: "var(--featured-gap, 24px)",
          paddingBottom: "16px",
          paddingTop: "6px",
          paddingLeft: "2px",
          paddingRight: "2px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {vehicles.map((v, index) => (
          <VehicleCard key={v.id} vehicle={v} index={index} />
        ))}
      </div>

      {/* Pagination Dots (visible if more vehicles than fit in one view) */}
      {vehicles.length > 3 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            marginTop: "20px",
          }}
        >
          {vehicles.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToCard(idx)}
              aria-label={`Jump to featured vehicle ${idx + 1}`}
              style={{
                width: activeIndex === idx ? "24px" : "8px",
                height: "8px",
                borderRadius: "9999px",
                backgroundColor: activeIndex === idx ? "#ffffff" : "rgba(255, 255, 255, 0.35)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          ))}
        </div>
      )}

      {/* Embedded CSS for Theme (Light vs Dark) & Responsive Carousel */}
      <style jsx global>{`
        /* ------------------------------------------------------------
           THEME TOKENS FOR FEATURED CARDS
           ------------------------------------------------------------ */
        :root {
          --feat-card-bg: #ffffff;
          --feat-card-border: rgba(255, 255, 255, 0.9);
          --feat-card-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
          --feat-card-shadow-hover: 0 24px 50px rgba(0, 0, 0, 0.28);
          --feat-card-title: #181c20;
          --feat-card-subtitle: #6b7280;
          --feat-card-price: #ea081c;
          --feat-card-divider: #f0f0f2;
          --feat-card-spec-text: #4b5563;
          --feat-card-spec-icon: #9ca3af;
          --feat-card-link: #181c20;
          --feat-card-link-hover: #bc001f;
          --feat-card-img-placeholder: #f3f4f5;
          --feat-arrow-bg: #ffffff;
          --feat-arrow-color: #bc001f;
          --feat-arrow-border: rgba(255, 255, 255, 0.3);
        }

        [data-theme="dark"] {
          --feat-card-bg: #121417;
          --feat-card-border: rgba(255, 255, 255, 0.12);
          --feat-card-shadow: 0 18px 44px rgba(0, 0, 0, 0.6);
          --feat-card-shadow-hover: 0 26px 54px rgba(0, 0, 0, 0.85);
          --feat-card-title: #ffffff;
          --feat-card-subtitle: #9ca3af;
          --feat-card-price: #ff4d5e;
          --feat-card-divider: rgba(255, 255, 255, 0.1);
          --feat-card-spec-text: #c2c7d2;
          --feat-card-spec-icon: #8b92a0;
          --feat-card-link: #ffffff;
          --feat-card-link-hover: #ff4d5e;
          --feat-card-img-placeholder: #1a1c22;
          --feat-arrow-bg: #16181d;
          --feat-arrow-color: #ffffff;
          --feat-arrow-border: rgba(255, 255, 255, 0.16);
        }

        /* Hide scrollbars for carousel track */
        .featured-carousel-track::-webkit-scrollbar {
          display: none;
        }

        /* Default: 4 cards visible on screens >= 1280px */
        .featured-carousel-track {
          --featured-gap: 24px;
        }

        .featured-carousel-card {
          flex: 0 0 calc((100% - (3 * 24px)) / 4);
          min-width: 0;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          background-color: var(--feat-card-bg);
          border: 1px solid var(--feat-card-border);
          box-shadow: var(--feat-card-shadow);
          border-radius: 18px;
          overflow: hidden;
          scroll-snap-align: start;
          position: relative;
          transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.25s ease;
        }

        /* 3 cards visible on medium-large screens (1024px to 1279px) */
        @media (max-width: 1279px) {
          .featured-carousel-card {
            flex: 0 0 calc((100% - (2 * 24px)) / 3);
          }
        }

        /* 2 cards visible on tablet screens (640px to 1023px) */
        @media (max-width: 1023px) {
          .featured-carousel-track {
            --featured-gap: 20px;
          }
          .featured-carousel-card {
            flex: 0 0 calc((100% - 20px) / 2);
          }
        }

        /* 1.15 cards visible on mobile screens (< 640px) so the next card peeks */
        @media (max-width: 639px) {
          .featured-carousel-track {
            --featured-gap: 14px;
          }
          .featured-carousel-card {
            flex: 0 0 84%;
          }
        }

        /* Elements inside card adapting smoothly to theme */
        .featured-card-title {
          color: var(--feat-card-title);
          transition: color 0.3s ease;
        }

        .featured-card-subtitle {
          color: var(--feat-card-subtitle);
          transition: color 0.3s ease;
        }

        .featured-card-price {
          color: var(--feat-card-price);
          transition: color 0.3s ease;
        }

        .featured-card-divider {
          border-top: 1px solid var(--feat-card-divider);
          transition: border-color 0.3s ease;
        }

        .featured-card-spec {
          color: var(--feat-card-spec-text);
          transition: color 0.3s ease;
        }

        .featured-card-spec-icon {
          color: var(--feat-card-spec-icon);
          transition: color 0.3s ease;
        }

        .featured-card-img-placeholder {
          background-color: var(--feat-card-img-placeholder);
          transition: background-color 0.3s ease;
        }

        .featured-arrow-btn {
          background-color: var(--feat-arrow-bg);
          color: var(--feat-arrow-color);
          border: 1px solid var(--feat-arrow-border);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.2s ease, opacity 0.2s ease;
        }

        .featured-arrow-btn:hover:not(:disabled) {
          transform: scale(1.06);
        }

        .featured-view-link {
          color: var(--feat-card-link) !important;
          transition: color 0.2s ease, transform 0.2s ease;
        }

        /* Hover elevation and micro-interactions */
        .featured-carousel-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--feat-card-shadow-hover) !important;
        }

        .featured-carousel-card:hover img {
          transform: scale(1.05);
        }

        .featured-carousel-card:hover .featured-view-link {
          color: var(--feat-card-link-hover) !important;
        }

        .featured-carousel-card:hover .featured-view-link span.material-symbols-outlined {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
