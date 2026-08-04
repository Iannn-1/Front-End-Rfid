"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ParentRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", rfid_tag_uid: "" });
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/parents/register", form);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
          padding: 40, width: "100%", maxWidth: 400, textAlign: "center",
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Registered!</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", margin: "0 0 24px", fontSize: 14 }}>
            Your account is ready. Sign in to monitor your child&apos;s attendance.
          </p>
          <button onClick={() => router.push("/parent")}
            style={{
              padding: "12px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700,
              background: "linear-gradient(135deg,#8b3b3b,#c0504d)", color: "#fff",
              border: "none", cursor: "pointer",
            }}>
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 16, fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: "linear-gradient(135deg,#8b3b3b,#c0504d)",
          display: "grid", placeItems: "center", fontSize: 28,
          margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(192,80,77,0.4)",
        }}>📡</div>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>School RFID</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, fontSize: 13 }}>Parent Registration</p>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
        padding: 28, width: "100%", maxWidth: 420,
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>Create account</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "0 0 20px" }}>
          You&apos;ll need your child&apos;s RFID Tag ID — found on their student card.
        </p>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#f87171", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { key: "name",        label: "Full Name",          placeholder: "Juan dela Cruz",       type: "text"  },
            { key: "email",       label: "Email Address",      placeholder: "parent@email.com",     type: "email" },
            { key: "phone",       label: "Phone (optional)",   placeholder: "+63912345678",         type: "tel"   },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
              <input
                type={type} value={(form as any)[key]} onChange={set(key as any)}
                required={key !== "phone"} placeholder={placeholder}
                style={{
                  width: "100%", padding: "11px 13px", borderRadius: 10, fontSize: 13,
                  border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)",
                  color: "#fff", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
          ))}

          {/* Password */}
          <div>
            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"} value={form.password} onChange={set("password")} required
                placeholder="Min 8 characters"
                style={{
                  width: "100%", padding: "11px 40px 11px 13px", borderRadius: 10, fontSize: 13,
                  border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)",
                  color: "#fff", outline: "none", boxSizing: "border-box",
                }}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* RFID Tag */}
          <div>
            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>Child&apos;s RFID Tag ID *</label>
            <input
              type="text" value={form.rfid_tag_uid} onChange={set("rfid_tag_uid")} required
              placeholder="e.g. 2026-7857"
              style={{
                width: "100%", padding: "11px 13px", borderRadius: 10, fontSize: 13,
                border: "1px solid rgba(248,194,46,0.4)", background: "rgba(248,194,46,0.05)",
                color: "#f8c22e", outline: "none", boxSizing: "border-box", fontFamily: "monospace",
              }}
            />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: "5px 0 0" }}>
              This must match a registered student tag. The school will provide this ID.
            </p>
          </div>

          <button type="submit" disabled={loading}
            style={{
              padding: "13px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: "linear-gradient(135deg,#8b3b3b,#c0504d)", color: "#fff",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, marginTop: 4,
              boxShadow: "0 4px 16px rgba(192,80,77,0.4)",
            }}>
            {loading ? "Registering..." : "Create Account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 18, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
          Already have an account?{" "}
          <Link href="/parent" style={{ color: "#f8c22e", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
