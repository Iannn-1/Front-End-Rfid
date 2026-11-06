"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Radio, Mail, CheckCircle, AlertCircle } from "lucide-react";
import api from "@/lib/api";

export default function ParentVerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("pendingVerificationEmail");
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      router.push("/parent/register");
    }
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only numbers

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take last digit
    setCode(newCode);

    // Auto-focus next input
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

  const handleVerify = async (e: React.FormEvent) => {
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
      await api.post("/parents/verify-email", { email, code: verificationCode });
      setSuccess(true);
      sessionStorage.removeItem("pendingVerificationEmail");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/parent");
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    
    try {
      await api.post("/parents/resend-verification", { email });
      setCountdown(60); // 60 second cooldown
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
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
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Email Verified!</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", margin: "0 0 24px", fontSize: 14 }}>
            Your account is now active. Redirecting to login...
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
        <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, fontSize: 13 }}>Email Verification</p>
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
            background: "rgba(59, 130, 246, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Mail size={28} color="#3b82f6" strokeWidth={2} />
          </div>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>Check Your Email</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>
            We sent a 6-digit code to<br />
            <strong style={{ color: "#3b82f6" }}>{email}</strong>
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

        <form onSubmit={handleVerify}>
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
              Enter Verification Code
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
                    border: "2px solid " + (digit ? "#3b82f6" : "rgba(255,255,255,0.15)"),
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                  onBlur={(e) => e.target.style.borderColor = digit ? "#3b82f6" : "rgba(255,255,255,0.15)"}
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
              background: "linear-gradient(135deg,#3b82f6,#2563eb)", 
              color: "#fff",
              border: "none", 
              cursor: (loading || code.some(d => !d)) ? "not-allowed" : "pointer",
              opacity: (loading || code.some(d => !d)) ? 0.5 : 1,
              boxShadow: "0 4px 16px rgba(59, 130, 246, 0.4)",
            }}>
            {loading ? "Verifying..." : "Verify Email →"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 8 }}>
            Didn&apos;t receive the code?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || countdown > 0}
            style={{
              background: "none",
              border: "none",
              color: countdown > 0 ? "rgba(255,255,255,0.3)" : "#3b82f6",
              fontSize: 13,
              fontWeight: 600,
              cursor: (resending || countdown > 0) ? "not-allowed" : "pointer",
              textDecoration: "underline",
            }}>
            {resending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
