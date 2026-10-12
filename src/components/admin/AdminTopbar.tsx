"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { globalSearch, SearchResult } from "@/app/actions/search";
import { getRecentNotifications, ActivityNotification } from "@/app/actions/notifications";
import { getLiveForexRates, ForexRates } from "@/app/actions/forex";
import { CurrencyCalculatorModal } from "./CurrencyCalculatorModal";

export function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [forexRates, setForexRates] = useState<ForexRates | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [hasUnread, setHasUnread] = useState(true);

  useEffect(() => {
    setMounted(true);
    getRecentNotifications().then((items) => {
      setNotifications(items);
    });
    getLiveForexRates().then((rates) => {
      setForexRates(rates);
    });

    const handleLiveEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ActivityNotification>;
      if (customEvent.detail) {
        setNotifications((prev) => [
          customEvent.detail,
          ...prev.filter((n) => n.id !== customEvent.detail.id),
        ]);
        setHasUnread(true);
      }
    };

    window.addEventListener("admin:live_event", handleLiveEvent);
    return () => window.removeEventListener("admin:live_event", handleLiveEvent);
  }, []);

  // Close dropdowns when clicking or touching outside
  useEffect(() => {
    function handleClickOutside(e: Event) {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowResults(false);
        setIsMobileSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // ⌘K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("globalSearchInput") as HTMLInputElement;
        input?.focus();
      }
      if (e.key === "Escape") {
        setShowResults(false);
        setShowNotifications(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mobile sidebar toggle handler
  const handleToggleSidebar = () => {
    const sidebar = document.querySelector(".admin-sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (sidebar && overlay) {
      if (sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
        document.body.style.overflow = "";
      } else {
        sidebar.classList.add("open");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    }
  };

  useEffect(() => {
    const overlay = document.getElementById("sidebarOverlay");
    if (overlay) {
      const closeSidebar = () => {
        const sidebar = document.querySelector(".admin-sidebar");
        sidebar?.classList.remove("open");
        overlay.classList.remove("active");
        document.body.style.overflow = "";
      };
      overlay.addEventListener("click", closeSidebar);
      return () => overlay.removeEventListener("click", closeSidebar);
    }
  }, []);

  // Auto-close mobile sidebar drawer upon navigation
  useEffect(() => {
    const sidebar = document.querySelector(".admin-sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (sidebar && overlay && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }, [pathname]);

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setIsSearching(true);
    try {
      const results = await globalSearch(query);
      setSearchResults(results);
      setShowResults(true);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 300);
  };

  const handleResultClick = (link: string) => {
    setShowResults(false);
    setSearchQuery("");
    router.push(link);
  };

  const handleNotifClick = (link: string) => {
    setShowNotifications(false);
    router.push(link);
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Inventory": return { bg: "#e0f2fe", color: "#0284c7" };
      case "Pipeline": return { bg: "#fef3c7", color: "#d97706" };
      case "Sale": return { bg: "#dcfce7", color: "#16a34a" };
      default: return { bg: "#f1f5f9", color: "#475569" };
    }
  };

  const formattedDate = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });

  if (!mounted) return null;

  return (
    <>
      <header className="admin-topbar">
        {/* Left side: Calculator Icon, Date Badge, Forex Pill */}
        <div className="topbar-left">
          <button 
            className="admin-hamburger" 
            id="adminHamburger" 
            aria-label="Toggle sidebar menu"
            onClick={handleToggleSidebar}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <button 
            type="button"
            className="topbar-calc-btn"
            onClick={() => setIsCalcOpen(true)}
            title="Open Currency Converter (BDT ⇄ YEN ⇄ USD)"
            aria-label="Open Currency Converter Calculator"
          >
            <span className="material-symbols-outlined">calculate</span>
          </button>

          <div className="topbar-date-pill">
            <span className="material-symbols-outlined">calendar_today</span>
            <span>{formattedDate}</span>
          </div>

          <button
            type="button"
            className="status-pill-forex-btn"
            onClick={() => setIsCalcOpen(true)}
            title={`Live Forex: ¥1 = ৳${forexRates?.jpyRate ? forexRates.jpyRate.toFixed(2) : "0.78"} | $1 = ৳${forexRates?.usdRate ? forexRates.usdRate.toFixed(1) : "122.0"} (Click to open calculator)`}
          >
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: forexRates?.isLive ? "#16a34a" : "#ca8a04",
              display: "inline-block",
            }} />
            <span>¥1 = ৳{forexRates?.jpyRate ? forexRates.jpyRate.toFixed(2) : "0.78"}</span>
          </button>
        </div>
      
      {/* Right side: Capsule Search Bar & Circle Action Buttons */}
      <div className="topbar-right">
        <div 
          className={`global-search ${isMobileSearchOpen ? "mobile-search-active" : ""}`} 
          ref={searchRef}
        >
          <span className="material-symbols-outlined">search</span>
          <input 
            type="text" 
            id="globalSearchInput" 
            placeholder="Search (VIN, Chassis, Model)..." 
            autoComplete="off"
            value={searchQuery}
            onChange={handleSearchInput}
            onFocus={() => {
              setShowResults(true);
              setIsMobileSearchOpen(true);
            }}
            onClick={() => {
              setShowResults(true);
              setIsMobileSearchOpen(true);
            }}
          />
          {searchQuery ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--admin-text-muted)",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
            </button>
          ) : (
            <span className="search-shortcut">⌘K</span>
          )}

          {isMobileSearchOpen && (
            <button
              type="button"
              className="mobile-search-cancel-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileSearchOpen(false);
                setShowResults(false);
              }}
            >
              Cancel
            </button>
          )}

          {/* Search Dropdown */}
          {showResults && (
            <div className="search-results-dropdown" style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              minWidth: "290px",
              background: "#ffffff",
              border: "1px solid var(--admin-border-subtle)",
              borderRadius: "20px",
              boxShadow: "var(--shadow-dropdown)",
              zIndex: 99999,
              maxHeight: "420px",
              overflowY: "auto",
              padding: "8px",
            }}>
              {isSearching ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "13px" }}>
                  Searching vehicles & pipeline...
                </div>
              ) : searchQuery.length < 2 ? (
                <div style={{ padding: "14px 12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                    Quick Search Suggestions
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {["Toyota", "Prado", "Land Cruiser", "Chassis", "Hybrid", "Available"].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setSearchQuery(term);
                          performSearch(term);
                        }}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "8px",
                          border: "1px solid var(--admin-border-subtle)",
                          background: "var(--admin-subcard)",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "var(--admin-text-main)",
                          cursor: "pointer",
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "13px" }}>
                  No results found for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                searchResults.map((result, idx) => {
                  const badge = getTypeBadgeColor(result.type);
                  return (
                    <button
                      key={`${result.type}-${idx}`}
                      onClick={() => handleResultClick(result.link)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "14px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-subcard)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <span style={{
                        fontSize: "10.5px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "8px",
                        backgroundColor: badge.bg,
                        color: badge.color,
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}>
                        {result.type}
                      </span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--admin-text-main)", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {result.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", fontFamily: "monospace" }}>
                          {result.subtitle}
                        </div>
                      </div>

                      <span style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "8px",
                        backgroundColor: "var(--admin-pill-bg)",
                        color: "var(--admin-text-muted)",
                        textTransform: "uppercase",
                      }}>
                        {result.badge}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Action Icon Buttons */}
        <div 
          className="topbar-notif-wrapper" 
          style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }} 
          ref={notifRef}
        >
          <button 
            type="button"
            className="topbar-circle-btn" 
            title="Notifications" 
            id="notificationBtn"
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications((prev) => !prev);
              setHasUnread(false);
            }}
          >
            <span className="material-symbols-outlined">notifications</span>
            {hasUnread && notifications.length > 0 && (
              <span className="topbar-notif-dot"></span>
            )}
          </button>

          <a 
            href="/admin/report" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="topbar-circle-btn topbar-report-btn" 
            title="Download Full Business Report"
          >
            <span className="material-symbols-outlined">download</span>
          </a>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="topbar-notif-dropdown" style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              right: 0,
              width: "320px",
              maxWidth: "calc(100vw - 24px)",
              background: "#ffffff",
              boxShadow: "var(--shadow-dropdown)",
              borderRadius: "20px",
              border: "1px solid var(--admin-border-subtle)",
              zIndex: 99999,
              overflow: "hidden",
            }}>
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--admin-border-subtle)",
                fontWeight: 800,
                fontSize: "14px",
                color: "var(--admin-text-main)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span>Recent Activities</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-accent-blue)" }}>
                  Live Stream
                </span>
              </div>
              <div style={{ maxHeight: "360px", overflowY: "auto", padding: "6px" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "13px" }}>
                    No recent activities.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotifClick(item.link)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-subcard)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <div style={{ fontWeight: 700, marginBottom: "2px", color: "var(--admin-text-main)" }}>
                        {item.title}
                      </div>
                      <div style={{ color: "var(--admin-text-muted)", fontSize: "12px", marginBottom: "4px" }}>
                        {item.subtitle}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--admin-text-light)" }}>
                        {new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    <CurrencyCalculatorModal 
      isOpen={isCalcOpen} 
      onClose={() => setIsCalcOpen(false)} 
      initialRates={forexRates}
    />
  </>
  );
}
