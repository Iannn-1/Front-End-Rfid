"use client";

import { useState } from "react";

export default function TestScanPage() {
  const [rfidUid, setRfidUid] = useState("2026-0378");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const response = await fetch(`${apiUrl}/rfid/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rfid_tag_uid: rfidUid }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || data.message || "Scan failed");
      }
    } catch (err) {
      setError("Network error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      padding: "40px", 
      background: "linear-gradient(to bottom right, #1e293b, #0f172a)",
      color: "white",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
          🏷️ RFID Scanner Simulator
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "32px" }}>
          Test RFID scanning without physical hardware
        </p>

        <div style={{
          background: "rgba(30, 41, 59, 0.5)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px"
        }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
            RFID Tag UID
          </label>
          <input
            type="text"
            value={rfidUid}
            onChange={(e) => setRfidUid(e.target.value)}
            placeholder="Enter RFID tag UID"
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              borderRadius: "8px",
              color: "white",
              fontSize: "16px",
              marginBottom: "16px"
            }}
          />

          <button
            onClick={handleScan}
            disabled={loading || !rfidUid.trim()}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#475569" : "linear-gradient(to right, #ef4444, #dc2626)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "⏳ Scanning..." : "🔍 Simulate RFID Scan"}
          </button>
        </div>

        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.5)",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
            color: "#fca5a5"
          }}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {result && (
          <div style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.5)",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px"
          }}>
            <h3 style={{ color: "#10b981", marginBottom: "12px", fontSize: "18px", fontWeight: "600" }}>
              ✅ Scan Successful
            </h3>
            <pre style={{
              background: "rgba(0, 0, 0, 0.3)",
              padding: "16px",
              borderRadius: "6px",
              overflow: "auto",
              fontSize: "13px",
              color: "#e2e8f0"
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div style={{
          background: "rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          color: "#93c5fd"
        }}>
          <strong>💡 Quick Test IDs:</strong>
          <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
            <li>2026-0378</li>
            <li>2026-0379</li>
            <li>2026-0380</li>
          </ul>
          <p style={{ marginTop: "12px", color: "#64748b", fontSize: "13px" }}>
            This simulates what happens when a student taps their RFID card on a scanner.
          </p>
        </div>
      </div>
    </div>
  );
}
