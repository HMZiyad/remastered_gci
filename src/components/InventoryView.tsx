"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { formatBDT } from "@/lib/utils";

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

  // View mode: 'list' (table) by default, or 'grid'
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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

  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (brand) params.set("brand", brand);
    if (selectedBodyTypes.length > 0) {
      params.set("body_type", selectedBodyTypes.join(","));
    }
    if (minPrice.trim()) params.set("min_price", minPrice.trim());
    if (maxPrice.trim()) params.set("max_price", maxPrice.trim());
    if (selectedGrades.length > 0) {
      params.set("grade", selectedGrades.join(","));
    }
    if (sort && sort !== "latest") params.set("sort", sort);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
    setMobileFilterOpen(false);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "latest") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
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

  return (
    <div
      className="stock-page-wrapper"
      style={{
        padding: "36px 0 80px 0",
        backgroundColor: "var(--stock-bg)",
        minHeight: "100vh",
        color: "var(--stock-text-primary)",
        transition: "background-color 0.25s ease, color 0.25s ease",
      }}
    >
      <div className="container" style={{ maxWidth: "100%", width: "100%", padding: "0 var(--margin-desktop, clamp(40px, 3.2vw, 60px))" }}>
        
        {/* Mobile Filter Toggle */}
        <div className="mobile-filter-bar" style={{ display: "none", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              backgroundColor: "var(--stock-card-bg)",
              border: "1px solid var(--stock-card-border)",
              borderRadius: "8px",
              color: "var(--stock-text-primary)",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>tune</span>
            <span>{mobileFilterOpen ? "Hide Filters" : "Show Filters"}</span>
          </button>
        </div>

        <div className="inventory-main-layout" style={{ display: "flex", gap: "28px", alignItems: "flex-start" }}>
          
          {/* ========================================================= */}
          {/* LEFT SIDEBAR: FILTERS                                     */}
          {/* ========================================================= */}
          <aside
            className={`inventory-sidebar ${mobileFilterOpen ? "mobile-open" : ""}`}
            style={{
              width: "260px",
              flexShrink: 0,
              backgroundColor: "var(--stock-card-bg)",
              border: "1px solid var(--stock-card-border)",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "var(--stock-card-shadow)",
              position: "sticky",
              top: "96px",
              boxSizing: "border-box",
              transition: "background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
            }}
          >
            {/* Header: Title + RESET */}
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
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                RESET
              </button>
            </div>

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
                  QUICK SEARCH
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
                      transition: "border-color 0.2s ease, background-color 0.25s ease, color 0.25s ease",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--stock-accent-red)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--stock-input-border)")}
                  />
                </div>
              </div>

              {/* SECTION: BRAND */}
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
                  BRAND
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
                      transition: "border-color 0.2s ease, background-color 0.25s ease, color 0.25s ease",
                    }}
                  >
                    <option value="">All Brands</option>
                    {allBrands.map((b) => (
                      <option key={b} value={b} style={{ backgroundColor: "var(--stock-card-bg)", color: "var(--stock-text-primary)" }}>
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
                  BODY TYPE
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px 8px",
                  }}
                >
                  {/* Left Column: SUV, HATCHBACK, CROSSOVER, HIACE-VAN */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { id: "SUV", label: "SUV" },
                      { id: "HATCHBACK", label: "HATCHBACK" },
                      { id: "CROSSOVER", label: "CROSSOVER" },
                      { id: "HIACE-VAN", label: "HIACE-VAN" },
                    ].map((item) => {
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
                              width: "15px",
                              height: "15px",
                              borderRadius: "3px",
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
                              fontSize: "11px",
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

                  {/* Right Column: SEDAN, MPV, MICROBUS */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { id: "SEDAN", label: "SEDAN" },
                      { id: "MPV", label: "MPV" },
                      { id: "MICROBUS", label: "MICROBUS" },
                    ].map((item) => {
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
                              width: "15px",
                              height: "15px",
                              borderRadius: "3px",
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
                              fontSize: "11px",
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
                  PRICE (LAKH BDT)
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
                      textAlign: "left",
                      transition: "border-color 0.2s ease, background-color 0.25s ease, color 0.25s ease",
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
                      textAlign: "left",
                      transition: "border-color 0.2s ease, background-color 0.25s ease, color 0.25s ease",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--stock-accent-red)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--stock-input-border)")}
                  />
                </div>
              </div>

              {/* SECTION: AUCTION GRADE */}
              <div style={{ marginBottom: "24px" }}>
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
                  AUCTION GRADE
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
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
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "var(--stock-accent-red)";
                            e.currentTarget.style.color = "var(--stock-text-primary)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "var(--stock-badge-border)";
                            e.currentTarget.style.color = "var(--stock-badge-color)";
                          }
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* APPLY FILTERS BUTTON */}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(235, 47, 69, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(235, 47, 69, 0.35)";
                }}
              >
                {isPending ? "Filtering..." : "Apply Filters"}
              </button>
            </form>
          </aside>

          {/* ========================================================= */}
          {/* RIGHT CONTENT: HEADER BAR + TABLE / GRID                   */}
          {/* ========================================================= */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {/* Header: Title + Subtitle + View Switcher + Sort */}
            <div
              className="inventory-top-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "26px",
                    fontWeight: 700,
                    color: "var(--stock-text-primary)",
                    letterSpacing: "-0.02em",
                    marginBottom: "4px",
                  }}
                >
                  Current Inventory
                </h1>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--stock-label-color)",
                    margin: 0,
                  }}
                >
                  Showing {initialVehicles.length} high-quality imported vehicles
                </p>
              </div>

              {/* View Switcher & Sort By Controls */}
              <div className="inventory-top-controls" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                
                {/* View Switch Buttons */}
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
                  {/* Grid View Button */}
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

                  {/* List / Table View Button */}
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
                        transition: "background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease",
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
            {/* VIEW MODE: LIST / TABLE VIEW                              */}
            {/* ========================================================= */}
            {viewMode === "list" && (
              <div
                className="stock-table-scroll-container"
                style={{
                  backgroundColor: "var(--stock-card-bg)",
                  border: "1px solid var(--stock-card-border)",
                  borderRadius: "12px",
                  overflowX: "auto",
                  boxShadow: "var(--stock-card-shadow)",
                  transition: "background-color 0.25s ease, border-color 0.25s ease",
                }}
              >
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
                        transition: "background-color 0.25s ease, border-color 0.25s ease",
                      }}
                    >
                      <th
                        style={{
                          padding: "14px 16px",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          color: "var(--stock-table-th-color)",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        CAR BRAND
                      </th>
                      <th
                        style={{
                          padding: "14px 14px",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          color: "var(--stock-table-th-color)",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        PACKAGE
                      </th>
                      <th
                        style={{
                          padding: "14px 14px",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          color: "var(--stock-table-th-color)",
                          textTransform: "uppercase",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        YEAR OF MANUFACTURE
                      </th>
                      <th
                        style={{
                          padding: "14px 14px",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          color: "var(--stock-table-th-color)",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        COLOR
                      </th>
                      <th
                        style={{
                          padding: "14px 14px",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          color: "var(--stock-table-th-color)",
                          textTransform: "uppercase",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        AUC/GRADE
                      </th>
                      <th
                        style={{
                          padding: "14px 14px",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          color: "var(--stock-table-th-color)",
                          textTransform: "uppercase",
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        MILEAGE (KM)
                      </th>
                      <th
                        style={{
                          padding: "14px 14px",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          color: "var(--stock-table-th-color)",
                          textTransform: "uppercase",
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ENGINE/CC
                      </th>
                      <th
                        style={{
                          padding: "14px 14px",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          color: "var(--stock-table-th-color)",
                          textTransform: "uppercase",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        TRANS.
                      </th>
                      <th
                        style={{
                          padding: "14px 20px 14px 14px",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          color: "var(--stock-table-th-color)",
                          textTransform: "uppercase",
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
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
                          {/* CAR BRAND + THUMBNAIL */}
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
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      if (e.currentTarget.parentElement) {
                                        const icon = document.createElement("span");
                                        icon.className = "material-symbols-outlined";
                                        icon.style.fontSize = "20px";
                                        icon.style.color = "var(--stock-label-color)";
                                        icon.innerText = "directions_car";
                                        e.currentTarget.parentElement.appendChild(icon);
                                      }
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
                                  transition: "color 0.25s ease",
                                }}
                              >
                                {v.car_name}
                              </span>
                            </div>
                          </td>

                          {/* PACKAGE */}
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "12px",
                              fontWeight: 500,
                              color: "var(--stock-text-secondary)",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {v.package_trim || "-"}
                          </td>

                          {/* YEAR OF MANUFACTURE */}
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "var(--stock-text-secondary)",
                              textAlign: "center",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {v.year_of_manufacture || "-"}
                          </td>

                          {/* COLOR */}
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "12px",
                              fontWeight: 500,
                              color: "var(--stock-text-secondary)",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {v.color_name || "-"}
                          </td>

                          {/* AUC/GRADE */}
                          <td
                            style={{
                              padding: "12px 14px",
                              textAlign: "center",
                              whiteSpace: "nowrap",
                            }}
                          >
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

                          {/* MILEAGE (KM) */}
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "var(--stock-text-secondary)",
                              textAlign: "right",
                              fontVariantNumeric: "tabular-nums",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formattedMileage}
                          </td>

                          {/* ENGINE/CC */}
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "var(--stock-text-secondary)",
                              textAlign: "right",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formattedEngine}
                          </td>

                          {/* TRANS. */}
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "var(--stock-text-secondary)",
                              textAlign: "center",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {v.transmission || "AT"}
                          </td>

                          {/* PRICE */}
                          <td
                            style={{
                              padding: "12px 20px 12px 14px",
                              textAlign: "right",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span
                              style={{
                                color: "var(--stock-accent-red)",
                                fontWeight: 700,
                                fontSize: "14px",
                                letterSpacing: "0.01em",
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
            {/* VIEW MODE: GRID VIEW                                      */}
            {/* ========================================================= */}
            {viewMode === "grid" && (
              <div
                className="inventory-grid-container"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "20px",
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
                    : "-";

                  const formattedMileage =
                    v.mileage_km != null ? `${Math.round(v.mileage_km / 1000)}k KM` : "-";

                  return (
                    <div
                      key={v.id}
                      style={{
                        backgroundColor: "var(--stock-card-bg)",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid var(--stock-card-border)",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.25s ease",
                        boxShadow: "var(--stock-card-shadow)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <Link
                        href={`/vehicles/${v.slug}`}
                        style={{
                          display: "block",
                          position: "relative",
                          height: "190px",
                          backgroundColor: "var(--stock-badge-bg)",
                        }}
                      >
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={v.car_name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
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
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "40px", color: "var(--stock-label-color)" }}
                            >
                              directions_car
                            </span>
                          </div>
                        )}
                        {v.badge_text && (
                          <span
                            style={{
                              position: "absolute",
                              top: "12px",
                              left: "12px",
                              backgroundColor: "var(--stock-accent-red)",
                              color: "#ffffff",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {v.badge_text}
                          </span>
                        )}
                        {v.auction_grade && (
                          <span
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              backgroundColor: "var(--stock-badge-bg)",
                              backdropFilter: "blur(4px)",
                              color: "var(--stock-text-primary)",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                              border: "1px solid var(--stock-badge-border)",
                            }}
                          >
                            Grade {v.auction_grade}
                          </span>
                        )}
                      </Link>

                      <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            marginBottom: "6px",
                          }}
                        >
                          <span style={{ fontSize: "12.5px", color: "var(--stock-label-color)", fontWeight: 500 }}>
                            {v.year_of_manufacture} • {v.package_trim || "Standard"}
                          </span>
                          <span
                            style={{
                              color: "var(--stock-accent-red)",
                              fontWeight: 700,
                              fontSize: "15px",
                            }}
                          >
                            {formattedPrice}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "var(--stock-text-primary)",
                            marginBottom: "14px",
                            textTransform: "uppercase",
                          }}
                        >
                          <Link href={`/vehicles/${v.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                            {v.car_name}
                          </Link>
                        </h3>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                            marginTop: "auto",
                            paddingTop: "12px",
                            borderTop: "1px solid var(--stock-table-row-border)",
                            fontSize: "12px",
                            color: "var(--stock-label-color)",
                          }}
                        >
                          {v.engine_cc && <span>{v.engine_cc}cc</span>}
                          {v.transmission && <span>• {v.transmission}</span>}
                          {v.mileage_km != null && <span>• {formattedMileage}</span>}
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

      <style>{`
        @media (max-width: 992px) {
          .mobile-filter-bar {
            display: flex !important;
            justifyContent: space-between;
            align-items: center;
          }
          .inventory-main-layout {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .inventory-sidebar {
            display: none !important;
            width: 100% !important;
            position: static !important;
            top: 0 !important;
            margin-bottom: 20px !important;
          }
          .inventory-sidebar.mobile-open {
            display: block !important;
          }
          .inventory-top-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .inventory-top-controls {
            width: 100% !important;
            justify-content: space-between !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 640px) {
          .inventory-grid-container {
            grid-template-columns: 1fr !important;
          }
          .stock-page-wrapper {
            padding: 20px 0 60px 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
