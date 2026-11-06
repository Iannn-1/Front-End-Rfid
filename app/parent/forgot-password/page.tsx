"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, Mail, AlertCircle, CheckCircle } from "lucide-react";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/parents/forgot-password", { email });
      sessionStorage.setItem("resetEmail", email);
      setSuccess(true);
      
      // Redirect to reset verification page after 2 seconds
      setTimeout(() => {
        router.push("/parent/reset-password");
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Failed to send reset code. Please try again.");
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
          <div style={{ 
            width: 80, 
            height: 80, 
            borderRadius: "50%", 
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: "white"
          }}>
            <CheckCircle size={40} strokeWidth={2.5} />
          </div>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Check Your Email!</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", margin: "0 0 24px", fontSize: 14 }}>
            We've sent a 6-digit reset code to <strong style={{ color: "#fff" }}>{email}</strong>. 
            Redirecting...
          </p>
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
          background: "linear-gradient(135deg,#3b82f6,#2563eb)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "white",
          margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
        }}>
          <Radio size={28} strokeWidth={2.5} />
        </div>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>School RFID</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, fontSize: 13 }}>Forgot Password</p>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
        padding: 32, width: "100%", maxWidth: 420,
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Mail size={28} color="#ef4444" strokeWidth={2} />
          </div>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>Reset Your Password</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>
            Enter your email address and we'll send you a code to reset your password
          </p>
        </div>

        {error && (
          <div style={{ 
            background: "rgba(239,68,68,0.15)", 
            border: "1px solid rgba(239,68,68,0.3)", 
            borderRadius: 10, 
            padding: "10px 14px", 
            marginBottom: 20, 
            color: "#f87171", 
            fontSize: 13, 
            display: "flex", 
            alignItems: "center", 
            gap: 8 
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              color: "rgba(255,255,255,0.7)", 
              fontSize: 12, 
              fontWeight: 600, 
              display: "block", 
              marginBottom: 8, 
              textTransform: "uppercase", 
              letterSpacing: "0.5px" 
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="parent@email.com"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                fontSize: 14,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px", 
              borderRadius: 10, 
              fontSize: 14, 
              fontWeight: 700,
              background: "linear-gradient(135deg,#ef4444,#dc2626)", 
              color: "#fff",
              border: "none", 
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 16px rgba(239, 68, 68, 0.4)",
            }}>
            {loading ? "Sending..." : "Send Reset Code →"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
            Remember your password?{" "}
            <Link href="/parent" style={{ color: "#3b82f6", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
