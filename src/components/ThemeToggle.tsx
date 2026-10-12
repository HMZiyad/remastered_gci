"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    setIsDark(currentTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setIsDark(!isDark);
  };

  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "var(--surface-container-high)",
        color: "var(--on-surface)",
        transition: "background var(--transition-fast), color var(--transition-fast)",
      }}
    >
      <span className="material-symbols-outlined">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
