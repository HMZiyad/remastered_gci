"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { formatBDT } from "@/lib/utils";
import "@/app/inventory.css";

export interface SerializedVehicle {
  id: number;
  stock_id: string | null;
  car_name: string;
  package_trim: string | null;
  year_of_manufacture: number | null;
  color_name: string | null;
  auction_grade: string | null;
  mileage_km: number | null;
  engine_cc: number | null;
  transmission: string | null;
  price_bdt: string | null;
  cover_photo: string | null;
  body_type: string | null;
  brand: string | null;
  slug: string | null;
  badge_text: string | null;
  fuel_type: string | null;
}

interface InventoryViewProps {
  initialVehicles: SerializedVehicle[];
  allBrands: string[];
  currentSearch: string;
  currentBrand: string;
  currentBodyTypes: string[];
  currentMinPrice: string;
  currentMaxPrice: string;
  currentGrades: string[];
  currentSort: string;
}

const AUCTION_GRADES = ["8.0", "S", "5.0", "4.5", "4.0", "3.5", "R"];

const BODY_TYPES_LIST = [
  { id: "SUV", label: "SUV" },
  { id: "SEDAN", label: "SEDAN" },
  { id: "HATCHBACK", label: "HATCHBACK" },
  { id: "MPV", label: "MPV" },
  { id: "CROSSOVER", label: "CROSSOVER" },
  { id: "MICROBUS", label: "MICROBUS" },
  { id: "HIACE-VAN", label: "HIACE-VAN" },
];

export function InventoryView({
  initialVehicles,
  allBrands,
  currentSearch,
  currentBrand,
  currentBodyTypes,
  currentMinPrice,
  currentMaxPrice,
  currentGrades,
  currentSort,
}: InventoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Local filter states
  const [search, setSearch] = useState(currentSearch);
  const [brand, setBrand] = useState(currentBrand);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>(currentBodyTypes);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [selectedGrades, setSelectedGrades] = useState<string[]>(currentGrades);
  const [sort, setSort] = useState(currentSort);

  // View mode: 'grid' (cards) by default, or 'list' (desktop only)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Synchronize state when URL query params change
  useEffect(() => {
    setSearch(currentSearch);
    setBrand(currentBrand);
    setSelectedBodyTypes(currentBodyTypes);
    setMinPrice(currentMinPrice);
    setMaxPrice(currentMaxPrice);
    setSelectedGrades(currentGrades);
    setSort(currentSort);
  }, [
    currentSearch,
    currentBrand,
    currentBodyTypes,
    currentMinPrice,
    currentMaxPrice,
    currentGrades,
    currentSort,
  ]);

  // Lock body scroll when floating filter modal is open on mobile
  useEffect(() => {
    if (mobileFilterOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileFilterOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [mobileFilterOpen]);

  // Count active filters
  const activeFiltersCount =
    (search.trim() ? 1 : 0) +
    (brand ? 1 : 0) +
    selectedBodyTypes.length +
    (minPrice.trim() || maxPrice.trim() ? 1 : 0) +
    selectedGrades.length;

  const toggleBodyType = (typeId: string) => {
    setSelectedBodyTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const toggleGrade = (g: string) => {
    setSelectedGrades((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  const executeFilterPush = (newParams: {
    search?: string;
    brand?: string;
    bodyTypes?: string[];
    minPrice?: string;
    maxPrice?: string;
    grades?: string[];
    sortVal?: string;
  }) => {
    const params = new URLSearchParams();

    const s = newParams.search !== undefined ? newParams.search : search;
    const b = newParams.brand !== undefined ? newParams.brand : brand;
    const bt = newParams.bodyTypes !== undefined ? newParams.bodyTypes : selectedBodyTypes;
    const minP = newParams.minPrice !== undefined ? newParams.minPrice : minPrice;
    const maxP = newParams.maxPrice !== undefined ? newParams.maxPrice : maxPrice;
    const gr = newParams.grades !== undefined ? newParams.grades : selectedGrades;
    const st = newParams.sortVal !== undefined ? newParams.sortVal : sort;

    if (s.trim()) params.set("search", s.trim());
    if (b) params.set("brand", b);
    if (bt.length > 0) params.set("body_type", bt.join(","));
    if (minP.trim()) params.set("min_price", minP.trim());
    if (maxP.trim()) params.set("max_price", maxP.trim());
    if (gr.length > 0) params.set("grade", gr.join(","));
    if (st && st !== "latest") params.set("sort", st);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    executeFilterPush({});
    setMobileFilterOpen(false);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    executeFilterPush({ sortVal: newSort });
  };

  const handleReset = () => {
    setSearch("");
    setBrand("");
    setSelectedBodyTypes([]);
    setMinPrice("");
    setMaxPrice("");
    setSelectedGrades([]);
    setSort("latest");
    startTransition(() => {
      router.push(pathname);
    });
    setMobileFilterOpen(false);
  };

  // Reusable Filter Form Fields (used in both desktop sidebar & mobile modal)
  const renderFilterFields = (isModal = false) => (
    <form onSubmit={handleApplyFilters}>
      {/* SECTION: QUICK SEARCH */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "var(--stock-label-color)",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Quick Search
        </label>
        <div style={{ position: "relative" }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: "11px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--stock-label-color)",
              fontSize: "17px",
              pointerEvents: "none",
            }}
          >
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Model name..."
            style={{
              width: "100%",
              padding: "9px 12px 9px 34px",
              backgroundColor: "var(--stock-input-bg)",
              border: "1px solid var(--stock-input-border)",
              borderRadius: "7px",
              color: "var(--stock-input-color)",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease, background-color 0.25s ease",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--stock-accent-red)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--stock-input-border)")}
          />
        </div>
      </div>

      {/* SECTION: BRAND */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "var(--stock-label-color)",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Brand
        </label>
        <div style={{ position: "relative" }}>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 32px 9px 12px",
              backgroundColor: "var(--stock-input-bg)",
              border: "1px solid var(--stock-input-border)",
              borderRadius: "7px",
              color: "var(--stock-input-color)",
              fontSize: "13px",
              appearance: "none",
              outline: "none",
              cursor: "pointer",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease, background-color 0.25s ease",
            }}
          >
            <option value="">All Brands</option>
            {allBrands.map((b) => (
              <option
                key={b}
                value={b}
                style={{ backgroundColor: "var(--stock-card-bg)", color: "var(--stock-text-primary)" }}
              >
                {b}
              </option>
            ))}
          </select>
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--stock-label-color)",
              fontSize: "18px",
              pointerEvents: "none",
            }}
          >
            expand_more
          </span>
        </div>
      </div>

      {/* SECTION: BODY TYPE */}
      <div style={{ marginBottom: "22px" }}>
        <label
          style={{
            display: "block",
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "var(--stock-label-color)",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Body Type
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px 8px",
          }}
        >
          {BODY_TYPES_LIST.map((item) => {
            const checked = selectedBodyTypes.includes(item.id);
            return (
              <label
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  toggleBodyType(item.id);
                }}
              >
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "4px",
                    backgroundColor: checked ? "var(--stock-accent-red)" : "var(--stock-input-bg)",
                    border: checked ? "1.5px solid var(--stock-accent-red)" : "1.5px solid var(--stock-input-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.8 7L9 1"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 600,
                    color: checked ? "var(--stock-text-primary)" : "var(--stock-text-secondary)",
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                    transition: "color 0.15s ease",
                  }}
                >
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* SECTION: PRICE (LAKH BDT) */}
      <div style={{ marginBottom: "22px" }}>
        <label
          style={{
            display: "block",
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "var(--stock-label-color)",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Price (Lakh BDT)
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            style={{
              width: "100%",
              padding: "8px 10px",
              backgroundColor: "var(--stock-input-bg)",
              border: "1px solid var(--stock-input-border)",
              borderRadius: "7px",
              color: "var(--stock-input-color)",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease, background-color 0.25s ease",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--stock-accent-red)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--stock-input-border)")}
          />
          <span style={{ color: "var(--stock-label-color)", fontSize: "14px", fontWeight: 600 }}>—</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            style={{
              width: "100%",
              padding: "8px 10px",
              backgroundColor: "var(--stock-input-bg)",
              border: "1px solid var(--stock-input-border)",
              borderRadius: "7px",
              color: "var(--stock-input-color)",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease, background-color 0.25s ease",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--stock-accent-red)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--stock-input-border)")}
          />
        </div>
      </div>

      {/* SECTION: AUCTION GRADE */}
      <div style={{ marginBottom: isModal ? "10px" : "24px" }}>
        <label
          style={{
            display: "block",
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "var(--stock-label-color)",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          Auction Grade
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "7px",
          }}
        >
          {AUCTION_GRADES.map((g) => {
            const isSelected = selectedGrades.includes(g);
            return (
              <button
                type="button"
                key={g}
                onClick={() => toggleGrade(g)}
                style={{
                  height: "32px",
                  borderRadius: "9999px",
                  backgroundColor: isSelected ? "var(--stock-accent-red)" : "var(--stock-badge-bg)",
                  border: isSelected ? "1px solid var(--stock-accent-red)" : "1px solid var(--stock-badge-border)",
                  color: isSelected ? "#ffffff" : "var(--stock-badge-color)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Apply Button (inside sidebar only) */}
      {!isModal && (
        <button
          type="submit"
          disabled={isPending}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "var(--stock-accent-red)",
            border: "none",
            borderRadius: "8px",
            color: "#ffffff",
            fontSize: "13.5px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(235, 47, 69, 0.35)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? "Filtering..." : "Apply Filters"}
        </button>
      )}
    </form>
  );

  return (
    <div className="stock-page-wrapper">
      <div className="stock-container">

        {/* ========================================================= */}
        {/* MOBILE FILTER & SORT TOOLBAR (visible on screens < 992px)  */}
        {/* ========================================================= */}
        <div className="inventory-mobile-toolbar">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="mobile-filter-trigger-btn"
            aria-label="Open filter options"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              tune
            </span>
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="mobile-filter-count-badge">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="mobile-sort-select-wrap">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="mobile-sort-select"
              aria-label="Sort vehicles"
            >
              <option value="latest">Latest Arrivals</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="mileage">Mileage: Lowest</option>
              <option value="year_desc">Year: Newest</option>
            </select>
            <span className="material-symbols-outlined mobile-sort-arrow">
              expand_more
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ACTIVE FILTER CHIPS (Mobile & Desktop)                    */}
        {/* ========================================================= */}
        {activeFiltersCount > 0 && (
          <div className="inventory-active-chips">
            {search.trim() && (
              <button
                type="button"
                className="active-filter-chip"
                onClick={() => {
                  setSearch("");
                  executeFilterPush({ search: "" });
                }}
              >
                <span>&ldquo;{search.trim()}&rdquo;</span>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
              </button>
            )}

            {brand && (
              <button
                type="button"
                className="active-filter-chip"
                onClick={() => {
                  setBrand("");
                  executeFilterPush({ brand: "" });
                }}
              >
                <span>{brand}</span>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
              </button>
            )}

            {selectedBodyTypes.map((type) => (
              <button
                key={type}
                type="button"
                className="active-filter-chip"
                onClick={() => {
                  const updated = selectedBodyTypes.filter((t) => t !== type);
                  setSelectedBodyTypes(updated);
                  executeFilterPush({ bodyTypes: updated });
                }}
              >
                <span>{type}</span>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
              </button>
            ))}

            {(minPrice.trim() || maxPrice.trim()) && (
              <button
                type="button"
                className="active-filter-chip"
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                  executeFilterPush({ minPrice: "", maxPrice: "" });
                }}
              >
                <span>{minPrice || "0"} – {maxPrice || "Max"} Lac</span>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
              </button>
            )}

            {selectedGrades.map((g) => (
              <button
                key={g}
                type="button"
                className="active-filter-chip"
                onClick={() => {
                  const updated = selectedGrades.filter((item) => item !== g);
                  setSelectedGrades(updated);
                  executeFilterPush({ grades: updated });
                }}
              >
                <span>Grade {g}</span>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
              </button>
            ))}

            <button
              type="button"
              className="active-filter-clear-all"
              onClick={handleReset}
            >
              Clear All
            </button>
          </div>
        )}

        <div className="inventory-main-layout">

          {/* ========================================================= */}
          {/* DESKTOP SIDEBAR: FIXED / STICKY (hidden on mobile < 992px) */}
          {/* ========================================================= */}
          <aside className="inventory-desktop-sidebar">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--stock-text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                Filters
              </h2>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--stock-accent-red)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                RESET
              </button>
            </div>

            {renderFilterFields(false)}
          </aside>

          {/* ========================================================= */}
          {/* MAIN CONTENT AREA: HEADER & CARDS GRID                     */}
          {/* ========================================================= */}
          <main className="inventory-content-area">

            {/* Desktop Top Header Bar */}
            <div className="inventory-top-header">
              <div>
                <h1 className="inventory-title">
                  Current Inventory
                </h1>
                <p className="inventory-subtitle">
                  Showing {initialVehicles.length} high-quality imported vehicles
                </p>
              </div>

              {/* Desktop Controls (Grid/List Switcher + Sort By) */}
              <div className="inventory-desktop-controls">
                
                {/* View Switch Buttons (Desktop Only) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    backgroundColor: "var(--stock-card-bg)",
                    padding: "3px",
                    borderRadius: "8px",
                    border: "1px solid var(--stock-card-border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    title="Grid view"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "6px",
                      backgroundColor: viewMode === "grid" ? "var(--stock-badge-bg)" : "transparent",
                      color: viewMode === "grid" ? "var(--stock-text-primary)" : "var(--stock-label-color)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                      grid_view
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    title="List view"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "6px",
                      backgroundColor: viewMode === "list" ? "var(--stock-badge-bg)" : "transparent",
                      color: viewMode === "list" ? "var(--stock-text-primary)" : "var(--stock-label-color)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                      table_rows
                    </span>
                  </button>
                </div>

                {/* Sort By Dropdown */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "var(--stock-label-color)", fontWeight: 500 }}>
                    Sort by:
                  </span>
                  <div style={{ position: "relative" }}>
                    <select
                      value={sort}
                      onChange={(e) => handleSortChange(e.target.value)}
                      style={{
                        padding: "7px 30px 7px 12px",
                        backgroundColor: "var(--stock-input-bg)",
                        border: "1px solid var(--stock-input-border)",
                        borderRadius: "7px",
                        color: "var(--stock-input-color)",
                        fontSize: "13px",
                        fontWeight: 500,
                        appearance: "none",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="latest">Latest Arrivals</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="mileage">Mileage: Lowest First</option>
                      <option value="year_desc">Year: Newest First</option>
                    </select>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--stock-label-color)",
                        fontSize: "17px",
                        pointerEvents: "none",
                      }}
                    >
                      expand_more
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* ========================================================= */}
            {/* VIEW MODE: DESKTOP TABLE VIEW (automatically hidden on mobile) */}
            {/* ========================================================= */}
            {viewMode === "list" && (
              <div className="stock-table-scroll-container">
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--stock-table-row-border)",
                        backgroundColor: "var(--stock-table-th-bg)",
                      }}
                    >
                      <th style={{ padding: "14px 16px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em", color: "var(--stock-table-th-color)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        CAR BRAND
                      </th>
                      <th style={{ padding: "14px 14px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em", color: "var(--stock-table-th-color)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        PACKAGE
                      </th>
                      <th style={{ padding: "14px 14px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em", color: "var(--stock-table-th-color)", textTransform: "uppercase", textAlign: "center", whiteSpace: "nowrap" }}>
                        YEAR
                      </th>
                      <th style={{ padding: "14px 14px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em", color: "var(--stock-table-th-color)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        COLOR
                      </th>
                      <th style={{ padding: "14px 14px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em", color: "var(--stock-table-th-color)", textTransform: "uppercase", textAlign: "center", whiteSpace: "nowrap" }}>
                        AUC/GRADE
                      </th>
                      <th style={{ padding: "14px 14px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em", color: "var(--stock-table-th-color)", textTransform: "uppercase", textAlign: "right", whiteSpace: "nowrap" }}>
                        MILEAGE (KM)
                      </th>
                      <th style={{ padding: "14px 14px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em", color: "var(--stock-table-th-color)", textTransform: "uppercase", textAlign: "right", whiteSpace: "nowrap" }}>
                        ENGINE/CC
                      </th>
                      <th style={{ padding: "14px 14px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em", color: "var(--stock-table-th-color)", textTransform: "uppercase", textAlign: "center", whiteSpace: "nowrap" }}>
                        TRANS.
                      </th>
                      <th style={{ padding: "14px 20px 14px 14px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em", color: "var(--stock-table-th-color)", textTransform: "uppercase", textAlign: "right", whiteSpace: "nowrap" }}>
                        PRICE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialVehicles.map((v) => {
                      const imageSrc = v.cover_photo
                        ? v.cover_photo.startsWith("http") || v.cover_photo.startsWith("/")
                          ? v.cover_photo
                          : `/uploads/${v.cover_photo}`
                        : null;

                      const formattedPrice = v.price_bdt
                        ? formatBDT(BigInt(v.price_bdt), true)
                        : "-";

                      const formattedMileage =
                        v.mileage_km != null ? v.mileage_km.toLocaleString("en-US") : "-";

                      const formattedEngine =
                        v.engine_cc != null
                          ? `${v.engine_cc.toLocaleString("en-US")}cc`
                          : "-";

                      return (
                        <tr
                          key={v.id}
                          onClick={() => {
                            if (v.slug) router.push(`/vehicles/${v.slug}`);
                          }}
                          style={{
                            borderBottom: "1px solid var(--stock-table-row-border)",
                            cursor: "pointer",
                            transition: "background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "var(--stock-table-hover-bg)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                          }
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div
                                style={{
                                  width: "56px",
                                  height: "38px",
                                  borderRadius: "6px",
                                  overflow: "hidden",
                                  backgroundColor: "var(--stock-badge-bg)",
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: "1px solid var(--stock-card-border)",
                                }}
                              >
                                {imageSrc ? (
                                  <img
                                    src={imageSrc}
                                    alt={v.car_name}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: "20px", color: "var(--stock-label-color)" }}
                                  >
                                    directions_car
                                  </span>
                                )}
                              </div>
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: "13px",
                                  color: "var(--stock-text-primary)",
                                  letterSpacing: "0.02em",
                                  textTransform: "uppercase",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {v.car_name}
                              </span>
                            </div>
                          </td>

                          <td style={{ padding: "12px 14px", fontSize: "12px", fontWeight: 500, color: "var(--stock-text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                            {v.package_trim || "-"}
                          </td>

                          <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 500, color: "var(--stock-text-secondary)", textAlign: "center", whiteSpace: "nowrap" }}>
                            {v.year_of_manufacture || "-"}
                          </td>

                          <td style={{ padding: "12px 14px", fontSize: "12px", fontWeight: 500, color: "var(--stock-text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                            {v.color_name || "-"}
                          </td>

                          <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                            {v.auction_grade ? (
                              <span
                                style={{
                                  display: "inline-block",
                                  backgroundColor: "var(--stock-badge-bg)",
                                  border: "1px solid var(--stock-badge-border)",
                                  color: "var(--stock-text-primary)",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "2px 7px",
                                  borderRadius: "4px",
                                  minWidth: "26px",
                                  textAlign: "center",
                                }}
                              >
                                {v.auction_grade}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 500, color: "var(--stock-text-secondary)", textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                            {formattedMileage}
                          </td>

                          <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 500, color: "var(--stock-text-secondary)", textAlign: "right", whiteSpace: "nowrap" }}>
                            {formattedEngine}
                          </td>

                          <td style={{ padding: "12px 14px", fontSize: "12px", fontWeight: 600, color: "var(--stock-text-secondary)", textAlign: "center", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                            {v.transmission || "AT"}
                          </td>

                          <td style={{ padding: "12px 20px 12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                            <span
                              style={{
                                color: "var(--stock-accent-red)",
                                fontWeight: 700,
                                fontSize: "14px",
                              }}
                            >
                              {formattedPrice}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {initialVehicles.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "var(--stock-label-color)",
                            fontSize: "14px",
                          }}
                        >
                          No vehicles match your selected filters. Try adjusting your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW MODE: CARDS GRID (Always active on mobile / 2-col)   */}
            {/* ========================================================= */}
            {(viewMode === "grid" || true) && (
              <div
                className="inventory-grid-container"
                style={{
                  display: viewMode === "list" ? "none" : "grid",
                }}
              >
                {initialVehicles.map((v) => {
                  const imageSrc = v.cover_photo
                    ? v.cover_photo.startsWith("http") || v.cover_photo.startsWith("/")
                      ? v.cover_photo
                      : `/uploads/${v.cover_photo}`
                    : null;

                  const formattedPrice = v.price_bdt
                    ? formatBDT(BigInt(v.price_bdt), true)
                    : "Call for Price";

                  const formattedMileage =
                    v.mileage_km != null ? `${Math.round(v.mileage_km / 1000)}k KM` : null;

                  return (
                    <div key={v.id} className="stock-card">
                      <Link
                        href={`/vehicles/${v.slug || v.id}`}
                        className="stock-card-img-wrap"
                      >
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={v.car_name}
                            className="stock-card-img"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="stock-card-img-placeholder">
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "36px", color: "var(--stock-label-color)" }}
                            >
                              directions_car
                            </span>
                          </div>
                        )}

                        {v.badge_text && (
                          <span className="stock-badge-tag">
                            {v.badge_text}
                          </span>
                        )}

                        {v.auction_grade && (
                          <span className="stock-badge-grade">
                            Grade {v.auction_grade}
                          </span>
                        )}
                      </Link>

                      <div className="stock-card-content">
                        {/* Subtitle: Year & Package */}
                        <div className="stock-card-sub">
                          {v.year_of_manufacture || ""}{v.year_of_manufacture && v.package_trim ? " • " : ""}{v.package_trim || ""}
                        </div>

                        {/* Title */}
                        <h3 className="stock-card-title">
                          <Link href={`/vehicles/${v.slug || v.id}`}>
                            {v.car_name}
                          </Link>
                        </h3>

                        {/* Price */}
                        <div className="stock-card-price">
                          {formattedPrice}
                        </div>

                        {/* Specs */}
                        <div className="stock-card-specs">
                          {v.engine_cc && <span>{v.engine_cc}cc</span>}
                          {formattedMileage && <span>• {formattedMileage}</span>}
                          {v.color_name && <span>• {v.color_name}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {initialVehicles.length === 0 && (
                  <p
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      color: "var(--stock-label-color)",
                      padding: "60px 0",
                      fontSize: "14px",
                    }}
                  >
                    No vehicles match your selected filters. Try adjusting your search criteria.
                  </p>
                )}
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FLOATING ACTION PILL ON MOBILE (Quick access on scroll)    */}
      {/* ========================================================= */}
      <div className="mobile-floating-filter-wrap">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="mobile-floating-filter-btn"
          aria-label="Filter inventory"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
            tune
          </span>
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span
              style={{
                backgroundColor: "var(--stock-accent-red)",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: "9999px",
                marginLeft: "2px",
              }}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* FLOATING FILTER MODAL FOR MOBILE SCREENS                   */}
      {/* ========================================================= */}
      {mobileFilterOpen && (
        <>
          <div
            className="filter-modal-backdrop"
            onClick={() => setMobileFilterOpen(false)}
          />

          <div
            className="filter-modal-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
          >
            {/* Grab Handle */}
            <div className="filter-modal-handle" />

            {/* Modal Header */}
            <div className="filter-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--stock-accent-red)", fontSize: "22px" }}
                >
                  tune
                </span>
                <h2
                  id="mobile-filter-title"
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    margin: 0,
                    color: "var(--stock-text-primary)",
                  }}
                >
                  Filter Vehicles
                </h2>
                {activeFiltersCount > 0 && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "9999px",
                      background: "var(--stock-accent-red)",
                      color: "#fff",
                    }}
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--stock-accent-red)",
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Close filters"
                  style={{
                    background: "var(--stock-badge-bg)",
                    border: "1px solid var(--stock-card-border)",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--stock-text-primary)",
                    cursor: "pointer",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    close
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="filter-modal-body">
              {renderFilterFields(true)}
            </div>

            {/* Modal Sticky Footer */}
            <div className="filter-modal-footer">
              <button
                type="button"
                onClick={handleReset}
                className="filter-btn-clear"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={(e) => handleApplyFilters(e)}
                disabled={isPending}
                className="filter-btn-apply"
              >
                {isPending ? "Applying..." : `Show Results (${initialVehicles.length})`}
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
