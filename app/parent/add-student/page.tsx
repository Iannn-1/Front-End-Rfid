"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Plus, X } from "lucide-react";

export default function AddStudentPage() {
  const router = useRouter();
  const [rfidTags, setRfidTags] = useState<string[]>([""]); // Start with one empty field
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
      setError("Please enter at least one RFID tag");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("parent_token");
      if (!token) {
        router.push("/parent");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
      
      // Add each RFID tag as a new student
      for (const tag of validTags) {
        const response = await fetch(
          `${apiUrl}/parents/add-child`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ rfid_tag_uid: tag }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.error || `Failed to add student with RFID ${tag}`);
        }
      }

      setSuccess(true);
      // Redirect back to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/parent/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#1a237e,#283593)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 20,
          padding: 40,
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
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
            color: "white",
          }}>
            <CheckCircle size={40} strokeWidth={2.5} />
          </div>
          <h2 style={{ color: "#1f2937", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
            Student Added!
          </h2>
          <p style={{ color: "#6b7280", margin: "0 0 24px", fontSize: 14 }}>
            Your new student has been successfully added to your account.
          </p>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#e8f4f8 0%,#d0e8f0 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
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
        <h1 style={{ color: "#1a237e", fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>School RFID</h1>
        <p style={{ color: "#475569", margin: 0, fontSize: 13 }}>Add Another Student</p>
      </div>

      <div style={{
        background: "#fff",
        borderRadius: 20,
        padding: 28,
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
      }}>
        <h2 style={{ color: "#1f2937", fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>
          Add Another Student
        </h2>
        <p style={{ color: "#6b7280", fontSize: 12, margin: "0 0 20px" }}>
          Enter your additional child's RFID Tag ID found on their student card.
        </p>

        {error && (
          <div style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
            color: "#dc2626",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* RFID Tags */}
          <div>
            <label style={{
              color: "#475569",
              fontSize: 11,
              fontWeight: 600,
              display: "block",
              marginBottom: 5,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Student RFID Tag ID(s) *
            </label>
            {rfidTags.map((tag, index) => (
              <div key={index} style={{ display: "flex", gap: 8, marginBottom: index < rfidTags.length - 1 ? 8 : 0 }}>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleRfidChange(index, e.target.value)}
                  required={index === 0}
                  placeholder={index === 0 ? "e.g. 2026-7857" : "Another student (optional)"}
                  style={{
                    flex: 1,
                    padding: "11px 13px",
                    borderRadius: 10,
                    fontSize: 13,
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "monospace",
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
                      background: "#fee2e2",
                      border: "1px solid #fca5a5",
                      color: "#dc2626",
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
                background: "#fef3c7",
                border: "1px solid #fcd34d",
                color: "#92400e",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                width: "100%",
                justifyContent: "center",
              }}>
              <Plus size={14} />
              Add Another Student
            </button>
            <p style={{ color: "#9ca3af", fontSize: 11, margin: "5px 0 0" }}>
              RFID tags must match registered students. Contact the school if you need help.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "13px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              background: "linear-gradient(135deg,#1a237e,#283593)",
              color: "#fff",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: 4,
              boxShadow: "0 4px 16px rgba(26, 35, 126, 0.4)",
            }}>
            {loading ? "Adding Student..." : "Add Student →"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/parent/dashboard")}
            style={{
              padding: "13px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              background: "#f3f4f6",
              color: "#6b7280",
              border: "none",
              cursor: "pointer",
              marginTop: 0,
            }}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
