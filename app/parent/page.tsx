"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ParentLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/parents/login", { email, password });
      const { token, parent } = res.data.data;
      localStorage.setItem("parent_token", token);
      localStorage.setItem("parent_user", JSON.stringify(parent));
      router.push("/parent/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 16, fontFamily: "system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: "linear-gradient(135deg,#8b3b3b,#c0504d)",
          display: "grid", placeItems: "center", fontSize: 32,
          margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(192,80,77,0.4)",
        }}>📡</div>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 4px" }}>School RFID</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, fontSize: 14 }}>Parent Portal</p>
      </div>

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
        padding: 32, width: "100%", maxWidth: 400,
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>Welcome back</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: "0 0 24px" }}>Sign in to monitor your child's attendance</p>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#f87171", fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Email Address</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="parent@email.com"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14,
                border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)",
                color: "#fff", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "12px 44px 12px 14px", borderRadius: 10, fontSize: 14,
                  border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)",
                  color: "#fff", outline: "none", boxSizing: "border-box",
                }}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 16 }}>
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{
              padding: "13px", borderRadius: 10, fontSize: 15, fontWeight: 700,
              background: "linear-gradient(135deg,#8b3b3b,#c0504d)", color: "#fff",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, marginTop: 4,
              boxShadow: "0 4px 16px rgba(192,80,77,0.4)",
            }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
          Don&apos;t have an account?{" "}
          <Link href="/parent/register" style={{ color: "#f8c22e", fontWeight: 700, textDecoration: "none" }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
