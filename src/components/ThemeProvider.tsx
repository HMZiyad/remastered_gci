"use client";

import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // On mount, read from localStorage or default to dark (as per legacy site)
    const storedTheme = localStorage.getItem("theme");
    const initialTheme = storedTheme || "dark";
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  // Prevent flash of incorrect theme before hydration
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
