"use client";

import { useState } from "react";
import { login } from "@/app/actions/auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;

    setError("");
    setIsPending(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setError("Email and password are required.");
      setIsPending(false);
      return;
    }

    try {
      // 1. Primary: Direct API authentication (bypasses Server Action cross-origin CSRF on LAN/mobile)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        // Successful login! Perform full navigation so session cookie is recognized everywhere
        window.location.href = "/admin";
        return;
      }

      if (data?.error) {
        setError(data.error);
        setIsPending(false);
        return;
      }

      // If API returned a non-ok status without clear error message
      throw new Error("API login failed, attempting fallback...");
    } catch (apiErr) {
      console.warn("API route failed, trying Server Action fallback...", apiErr);
      // 2. Secondary fallback: Server Action
      try {
        const formData = new FormData();
        formData.append("email", cleanEmail);
        formData.append("password", cleanPassword);
        const result = await login(formData);
        if (result?.error) {
          setError(result.error);
          setIsPending(false);
        }
      } catch (saErr: any) {
        console.error("Login failed:", saErr);
        setError("Unable to authenticate. Please check your credentials and network connection.");
        setIsPending(false);
      }
    }
  };

  const handleFillDemo = () => {
    setEmail("admin@goodcarimports.com");
    setPassword("password123");
    setError("");
  };

  return (
    <div style={{ maxWidth: "420px", width: "100%", margin: "0 auto", padding: "36px 30px", backgroundColor: "#ffffff", borderRadius: "28px", border: "1px solid #e2e8f0", boxShadow: "0 20px 48px -12px rgba(15, 23, 42, 0.08)", boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <img src="/images/logo-transparent.png" alt="Good Car Imports" style={{ height: "44px", margin: "0 auto 16px", display: "block" }} />
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", margin: "0 0 6px" }}>Admin Portal</h1>
        <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>Executive Fleet & Operations Dashboard</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {error && (
          <div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "14px", textAlign: "center", fontSize: "13px", fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 700, color: "#0F172A" }}>Work Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@goodcarimports.com"
            style={{ width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#0F172A", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label htmlFor="password" style={{ display: "block", marginBottom: "6px", fontSize: "12.5px", fontWeight: 700, color: "#0F172A" }}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            style={{ width: "100%", padding: "12px 16px", borderRadius: "14px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#0F172A", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Quick Demo Credentials Helper */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#64748b", padding: "4px 2px" }}>
          <span>Default: <code style={{ color: "#0f172a", fontWeight: 600 }}>admin@goodcarimports.com</code></span>
          <button
            type="button"
            onClick={handleFillDemo}
            style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: 700, cursor: "pointer", padding: "2px 4px", fontSize: "12px" }}
          >
            Auto Fill
          </button>
        </div>

        <button
          type="submit"
          id="signInBtn"
          disabled={isPending}
          style={{ width: "100%", padding: "14px", marginTop: "4px", backgroundColor: "#0F172A", color: "white", fontWeight: 700, fontSize: "14px", borderRadius: "9999px", border: "none", cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1, transition: "all 0.2s ease", boxShadow: "0 4px 14px rgba(15, 23, 42, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          {isPending ? (
            <>
              <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid #ffffff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span>Signing In...</span>
            </>
          ) : (
            "Sign In to Dashboard"
          )}
        </button>
      </form>
    </div>
  );
}
