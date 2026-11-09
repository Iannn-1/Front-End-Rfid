"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, CheckCircle, Plus, X } from "lucide-react";
import api from "@/lib/api";

export default function ParentRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [rfidTags, setRfidTags] = useState<string[]>([""]);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Auto-fill form from URL parameters (from email link)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const rfidFromUrl = searchParams.get('rfid');
    const emailFromUrl = searchParams.get('email');
    
    if (rfidFromUrl) {
      setRfidTags([rfidFromUrl]);
    }
    if (emailFromUrl) {
      setForm(f => ({ ...f, email: emailFromUrl }));
    }
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleRfidChange = (index: number, value: string) => {
    const newTags = [...rfidTags];
    newTags[index] = value;
    setRfidTags(newTags);
  };

  const addRfidTag = () => {
    setRfidTags([...rfidTags, ""]);
  };

  const removeRfidTag = (index: number) => {
    if (rfidTags.length > 1) {
      setRfidTags(rfidTags.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Filter out empty RFID tags
    const validTags = rfidTags.filter(tag => tag.trim() !== "");
    
    if (validTags.length === 0) {
      setError("At least one RFID tag is required");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/parents/register", {
        ...form,
        rfid_tags: validTags,
      });
      // Store email for verification page
      sessionStorage.setItem("pendingVerificationEmail", form.email);
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
            We&apos;ve sent a 6-digit verification code to <strong style={{ color: "#fff" }}>{form.email}</strong>. 
            Please check your email and verify your account.
          </p>
          <button onClick={() => router.push("/parent/verify")}
            style={{
              padding: "12px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700,
              background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff",
              border: "none", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(59, 130, 246, 0.4)",
            }}>
            Verify Email →
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
          background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
          padding: 8,
        }}>
          <img 
            src="/bc-logo.png" 
            alt="BC Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
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
          You&apos;ll need your child&apos;s RFID Tag ID — found on their student card. You can add multiple children.
        </p>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#f87171", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} />
            {error}
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
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 14, display: "flex", alignItems: "center" }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* RFID Tags */}
          <div>
            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Children&apos;s RFID Tag IDs *
            </label>
            {rfidTags.map((tag, index) => (
              <div key={index} style={{ display: "flex", gap: 8, marginBottom: index < rfidTags.length - 1 ? 8 : 0 }}>
                <input
                  type="text" 
                  value={tag} 
                  onChange={(e) => handleRfidChange(index, e.target.value)} 
                  required={index === 0}
                  placeholder={index === 0 ? "e.g. 2026-7857" : "Additional child (optional)"}
                  style={{
                    flex: 1,
                    padding: "11px 13px", borderRadius: 10, fontSize: 13,
                    border: "1px solid rgba(248,194,46,0.4)", background: "rgba(248,194,46,0.05)",
                    color: "#f8c22e", outline: "none", boxSizing: "border-box", fontFamily: "monospace",
                  }}
                />
                {rfidTags.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeRfidTag(index)}
                    style={{
                      width: 40, 
                      height: 40, 
                      borderRadius: 10, 
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#f87171",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRfidTag}
              style={{
                marginTop: 8,
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                background: "rgba(248,194,46,0.1)",
                border: "1px solid rgba(248,194,46,0.3)",
                color: "#f8c22e",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                width: "100%",
                justifyContent: "center",
              }}>
              <Plus size={14} />
              Add Another Child
            </button>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: "5px 0 0" }}>
              RFID tags must match registered students. The school will provide these IDs.
            </p>
          </div>

          <button type="submit" disabled={loading}
            style={{
              padding: "13px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, marginTop: 4,
              boxShadow: "0 4px 16px rgba(59, 130, 246, 0.4)",
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
