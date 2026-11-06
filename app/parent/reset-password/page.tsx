"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Radio, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"verify" | "reset">("verify");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const resetEmail = sessionStorage.getItem("resetEmail");
    if (resetEmail) {
      setEmail(resetEmail);
    } else {
      router.push("/parent/forgot-password");
    }
  }, [router]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    pastedData.split("").forEach((digit, i) => {
      if (i < 6) newCode[i] = digit;
    });
    setCode(newCode);
    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      setLoading(false);
      return;
    }

    try {
      await api.post("/parents/verify-reset-code", { email, code: verificationCode });
      setStep("reset");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.post("/parents/reset-password", {
        email,
        code: code.join(""),
        newPassword,
      });
      setSuccess(true);
      sessionStorage.removeItem("resetEmail");
      
      setTimeout(() => {
        router.push("/parent");
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Failed to reset password. Please try again.");
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
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Password Reset!</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", margin: "0 0 24px", fontSize: 14 }}>
            Your password has been reset successfully. Redirecting to login...
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
        <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, fontSize: 13 }}>Reset Password</p>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
        padding: 32, width: "100%", maxWidth: 420,
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        {step === "verify" ? (
          <>
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
                <Lock size={28} color="#ef4444" strokeWidth={2} />
              </div>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>Enter Reset Code</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>
                We sent a 6-digit code to<br />
                <strong style={{ color: "#ef4444" }}>{email}</strong>
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

            <form onSubmit={handleVerifyCode}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  color: "rgba(255,255,255,0.7)", 
                  fontSize: 11, 
                  fontWeight: 600, 
                  display: "block", 
                  marginBottom: 12, 
                  textTransform: "uppercase", 
                  letterSpacing: "0.5px",
                  textAlign: "center"
                }}>
                  Enter Reset Code
                </label>
                
                <div 
                  style={{ 
                    display: "flex", 
                    gap: 8, 
                    justifyContent: "center" 
                  }}
                  onPaste={handlePaste}
                >
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      style={{
                        width: 48,
                        height: 56,
                        textAlign: "center",
                        fontSize: 24,
                        fontWeight: 700,
                        borderRadius: 10,
                        border: "2px solid " + (digit ? "#ef4444" : "rgba(255,255,255,0.15)"),
                        background: "rgba(255,255,255,0.08)",
                        color: "#fff",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#ef4444"}
                      onBlur={(e) => e.target.style.borderColor = digit ? "#ef4444" : "rgba(255,255,255,0.15)"}
                    />
                  ))}
                </div>
                
                <p style={{ 
                  color: "rgba(255,255,255,0.4)", 
                  fontSize: 11, 
                  margin: "10px 0 0", 
                  textAlign: "center" 
                }}>
                  Code expires in 15 minutes
                </p>
              </div>

              <button 
                type="submit" 
                disabled={loading || code.some(d => !d)}
                style={{
                  width: "100%",
                  padding: "13px", 
                  borderRadius: 10, 
                  fontSize: 14, 
                  fontWeight: 700,
                  background: "linear-gradient(135deg,#ef4444,#dc2626)", 
                  color: "#fff",
                  border: "none", 
                  cursor: (loading || code.some(d => !d)) ? "not-allowed" : "pointer",
                  opacity: (loading || code.some(d => !d)) ? 0.5 : 1,
                  boxShadow: "0 4px 16px rgba(239, 68, 68, 0.4)",
                }}>
                {loading ? "Verifying..." : "Verify Code →"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(59, 130, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <Lock size={28} color="#3b82f6" strokeWidth={2} />
              </div>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>Set New Password</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>
                Enter your new password below
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

            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ 
                  color: "rgba(255,255,255,0.7)", 
                  fontSize: 12, 
                  fontWeight: 600, 
                  display: "block", 
                  marginBottom: 8, 
                  textTransform: "uppercase", 
                  letterSpacing: "0.5px" 
                }}>
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    style={{
                      width: "100%",
                      padding: "12px 44px 12px 14px",
                      borderRadius: 10,
                      fontSize: 14,
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.08)",
                      color: "#fff",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ 
                      position: "absolute", 
                      right: 12, 
                      top: "50%", 
                      transform: "translateY(-50%)", 
                      background: "none", 
                      border: "none", 
                      cursor: "pointer", 
                      color: "rgba(255,255,255,0.5)", 
                      display: "flex", 
                      alignItems: "center" 
                    }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  color: "rgba(255,255,255,0.7)", 
                  fontSize: 12, 
                  fontWeight: 600, 
                  display: "block", 
                  marginBottom: 8, 
                  textTransform: "uppercase", 
                  letterSpacing: "0.5px" 
                }}>
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter password"
                    style={{
                      width: "100%",
                      padding: "12px 44px 12px 14px",
                      borderRadius: 10,
                      fontSize: 14,
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.08)",
                      color: "#fff",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ 
                      position: "absolute", 
                      right: 12, 
                      top: "50%", 
                      transform: "translateY(-50%)", 
                      background: "none", 
                      border: "none", 
                      cursor: "pointer", 
                      color: "rgba(255,255,255,0.5)", 
                      display: "flex", 
                      alignItems: "center" 
                    }}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
                  background: "linear-gradient(135deg,#3b82f6,#2563eb)", 
                  color: "#fff",
                  border: "none", 
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.4)",
                }}>
                {loading ? "Resetting..." : "Reset Password →"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
