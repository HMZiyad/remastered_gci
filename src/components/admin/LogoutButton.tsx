"use client";

import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 12px", color: "var(--error)", borderRadius: "var(--radius)", textAlign: "left", fontSize: "14px", fontWeight: 500 }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
      Log Out
    </button>
  );
}
