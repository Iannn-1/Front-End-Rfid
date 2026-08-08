"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";

type ScanState = "idle" | "scanning" | "success" | "error";

interface ScanResult {
  studentName: string;
  status: "IN" | "OUT";
  scanTime: string;
}

export default function ScanPage() {
  const scannerRef   = useRef<any>(null);
  const divRef       = useRef<HTMLDivElement>(null);
  const [state, setState]       = useState<ScanState>("idle");
  const [result, setResult]     = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [apiKey, setApiKey]     = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const lastScanned = useRef<string>("");
  const cooldown    = useRef(false);

  // Load saved API key
  useEffect(() => {
    const saved = localStorage.getItem("scan_api_key") ?? "";
    setApiKey(saved);
    if (!saved) setShowKeyInput(true);
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("scan_api_key", key);
    setShowKeyInput(false);
  };

  const startScanner = async () => {
    if (!apiKey) { setShowKeyInput(true); return; }
    setState("scanning");

    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 120 } },
        async (decodedText: string) => {
          if (cooldown.current || decodedText === lastScanned.current) return;
          cooldown.current = true;
          lastScanned.current = decodedText;

          try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
            const res = await axios.post(
              `${apiBase}/rfid/scan`,
              { rfid_tag_uid: decodedText.trim() },
              { headers: { "X-API-Key": apiKey } }
            );
            const { student, log } = res.data.data;
            setResult({
              studentName: student.name,
              status: log.status,
              scanTime: new Date(log.scan_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            });
            setState("success");
            setTimeout(() => { setState("scanning"); setResult(null); cooldown.current = false; lastScanned.current = ""; }, 3000);
          } catch (err: any) {
            const msg = err?.response?.data?.error ?? "Scan failed";
            setErrorMsg(msg);
            setState("error");
            setTimeout(() => { setState("scanning"); setErrorMsg(""); cooldown.current = false; lastScanned.current = ""; }, 3000);
          }
        },
        () => {} // ignore decode errors
      );
    } catch (err: any) {
      setState("idle");
      setErrorMsg("Camera access denied. Please allow camera permission.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    setState("idle");
    lastScanned.current = "";
    cooldown.current = false;
  };

  useEffect(() => { return () => { if (scannerRef.current) scannerRef.current.stop().catch(() => {}); }; }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "#0f172a",
      fontFamily: "system-ui, sans-serif", color: "#fff",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg,#1a237e,#283593)",
        padding: "12px 16px", display: "flex", alignItems: "center",
        justifyContent: "space-between", boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>📡</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 15 }}>Barcode Scanner</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.5px" }}>RFID Attendance</div>
          </div>
        </div>
        <button
          onClick={() => setShowKeyInput(true)}
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}
        >
          ⚙️ API Key
        </button>
      </header>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: 20, gap: 16 }}>

        {/* API Key modal */}
        {showKeyInput && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16,
          }}>
            <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, width: "100%", maxWidth: 360 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>🔑 API Key</h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: "0 0 16px" }}>
                Enter the X-API-Key from the backend .env file
              </p>
              <input
                type="text" defaultValue={apiKey}
                id="api-key-input"
                placeholder="rfid_device_key_abc123"
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 13,
                  background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff", outline: "none", boxSizing: "border-box", marginBottom: 12,
                }}
              />
              <button
                onClick={() => {
                  const val = (document.getElementById("api-key-input") as HTMLInputElement)?.value ?? "";
                  if (val.trim()) saveApiKey(val.trim());
                }}
                style={{ width: "100%", padding: 12, borderRadius: 8, background: "#8b3b3b", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
              >
                Save & Continue
              </button>
            </div>
          </div>
        )}

        {/* Scanner area */}
        <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
          {/* Scanner viewfinder */}
          <div style={{
            background: "#1e293b", borderRadius: 16, overflow: "hidden",
            border: state === "scanning" ? "2px solid #3b82f6" : "2px solid #334155",
            minHeight: 280, position: "relative",
          }}>
            <div id="qr-reader" ref={divRef} style={{ width: "100%" }} />

            {state === "idle" && (
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
              }}>
                <div style={{ fontSize: 48 }}>📷</div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0, textAlign: "center" }}>
                  Tap Start Scanner to begin
                </p>
              </div>
            )}

            {/* Success overlay */}
            {state === "success" && result && (
              <div style={{
                position: "absolute", inset: 0, background: "rgba(16,185,129,0.95)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                borderRadius: 14,
              }}>
                <div style={{ fontSize: 52 }}>✅</div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>{result.status === "IN" ? "Arrived" : "Departed"}</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{result.studentName}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>{result.scanTime}</div>
              </div>
            )}

            {/* Error overlay */}
            {state === "error" && (
              <div style={{
                position: "absolute", inset: 0, background: "rgba(239,68,68,0.95)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                borderRadius: 14,
              }}>
                <div style={{ fontSize: 52 }}>❌</div>
                <div style={{ fontSize: 14, fontWeight: 700, textAlign: "center", padding: "0 16px" }}>{errorMsg}</div>
              </div>
            )}
          </div>

          {/* Scan line animation */}
          {state === "scanning" && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none" }}>
              <style>{`
                @keyframes scanLine {
                  0%   { top: 10%; }
                  50%  { top: 85%; }
                  100% { top: 10%; }
                }
                .scan-line {
                  position: absolute;
                  left: 16px; right: 16px;
                  height: 2px;
                  background: linear-gradient(90deg, transparent, #3b82f6, transparent);
                  animation: scanLine 2s ease-in-out infinite;
                  border-radius: 2px;
                }
              `}</style>
              <div className="scan-line" />
            </div>
          )}
        </div>

        {/* Controls */}
        {state === "idle" ? (
          <button
            onClick={startScanner}
            style={{
              width: "100%", maxWidth: 400, padding: 16, borderRadius: 12, fontSize: 16,
              fontWeight: 700, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
              color: "#fff", border: "none", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
            }}
          >
            📷 Start Scanner
          </button>
        ) : (
          <button
            onClick={stopScanner}
            style={{
              width: "100%", maxWidth: 400, padding: 16, borderRadius: 12, fontSize: 16,
              fontWeight: 700, background: "rgba(255,255,255,0.1)",
              color: "#fff", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer",
            }}
          >
            ⏹ Stop Scanner
          </button>
        )}

        {/* Instructions */}
        <div style={{
          background: "rgba(255,255,255,0.05)", borderRadius: 12,
          padding: 16, width: "100%", maxWidth: 400,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
            How to use
          </div>
          <ol style={{ margin: 0, paddingLeft: 20, color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.8 }}>
            <li>Tap <strong>Start Scanner</strong></li>
            <li>Point camera at a student&apos;s barcode</li>
            <li>Hold steady — scan happens automatically</li>
            <li>Green = success, Red = error</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
