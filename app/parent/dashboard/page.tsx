"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface StudentInfo {
  id: number;
  name: string;
  grade_level: string;
  section: string;
  student_level: string;
  course?: string;
  profile_photo?: string;
}

interface AttendanceLog {
  id: number;
  status: "IN" | "OUT";
  scan_time: string;
}

interface ParentUser {
  id: number;
  name: string;
  email: string;
  rfid_tag_uid: string;
}

function formatTime(isoStr: string) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(isoStr: string) {
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" });
}

// Group logs by date, get first IN and last OUT per day
function groupByDay(logs: AttendanceLog[]) {
  const map: Record<string, { date: string; timeIn: string | null; timeOut: string | null }> = {};
  for (const log of [...logs].reverse()) {
    const date = new Date(log.scan_time).toDateString();
    if (!map[date]) map[date] = { date, timeIn: null, timeOut: null };
    if (log.status === "IN" && !map[date].timeIn) map[date].timeIn = log.scan_time;
    if (log.status === "OUT") map[date].timeOut = log.scan_time;
  }
  return Object.values(map).reverse();
}

export default function ParentDashboardPage() {
  const router = useRouter();
  const [parent, setParent]   = useState<ParentUser | null>(null);
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [currentStatus, setCurrentStatus] = useState<"IN" | "OUT" | null>(null);
  const [logs, setLogs]       = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("parent_token");
    const storedParent = localStorage.getItem("parent_user");
    if (!token || !storedParent) { router.push("/parent"); return; }

    setParent(JSON.parse(storedParent));
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
      const res = await axios.get(`${apiUrl}/parents/child`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { student, currentStatus, logs } = res.data.data;
      setStudent(student);
      setCurrentStatus(currentStatus);
      setLogs(logs);
    } catch (err: any) {
      if (err?.response?.status === 401) { router.push("/parent"); return; }
      setError(err?.response?.data?.error ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem("parent_token");
    localStorage.removeItem("parent_user");
    router.push("/parent");
  };

  const days = groupByDay(logs);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#e8f4f8 0%,#d0e8f0 100%)",
      fontFamily: "system-ui, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg,#1a237e,#283593)",
        padding: "0 16px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg,#8b3b3b,#c0504d)",
            display: "grid", placeItems: "center", fontSize: 20,
          }}>📡</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 14, lineHeight: 1.2 }}>School RFID</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Parent Portal</div>
          </div>
        </div>
        <button onClick={handleLogout}
          style={{
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff", padding: "7px 14px", borderRadius: 8, fontSize: 13,
            fontWeight: 600, cursor: "pointer",
          }}>
          Log Out
        </button>
      </header>

      <div style={{ padding: "20px 16px", maxWidth: 600, margin: "0 auto" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: "#64748b", fontSize: 14 }}>
            Loading attendance data...
          </div>
        )}

        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 12, padding: 16, color: "#dc2626", fontSize: 14, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && student && (
          <>
            {/* Greeting */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ color: "#8b3b3b", fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>
                Hello, {parent?.name?.split(" ")[0]}! 👋
              </h2>
              <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
                Your child: <strong>{student.name}</strong>
              </p>
            </div>

            {/* Student card */}
            <div style={{
              background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)", display: "flex", gap: 16, alignItems: "center",
            }}>
              {student.profile_photo ? (
                <img src={student.profile_photo} alt={student.name}
                  style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", border: "3px solid #e5e7eb", flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 70, height: 70, borderRadius: "50%", background: "#e5e7eb",
                  display: "grid", placeItems: "center", fontSize: 24, fontWeight: 800, flexShrink: 0,
                }}>
                  {student.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#1f2937", marginBottom: 4 }}>{student.name}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{student.student_level} · {student.grade_level} · {student.section}</div>
                {student.course && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{student.course}</div>}
              </div>
            </div>

            {/* Current status */}
            <div style={{
              background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Current Status</div>
              <div style={{
                padding: "12px 16px", borderRadius: 10, fontSize: 16, fontWeight: 700,
                background: currentStatus === "IN" ? "#d1fae5" : currentStatus === "OUT" ? "#fee2e2" : "#f3f4f6",
                color: currentStatus === "IN" ? "#065f46" : currentStatus === "OUT" ? "#991b1b" : "#6b7280",
              }}>
                {currentStatus === "IN" ? "✅ Currently Inside School" : currentStatus === "OUT" ? "🏠 Left School" : "⏳ No scan today yet"}
              </div>
            </div>

            {/* Weekly attendance */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#1f2937", marginBottom: 16 }}>📅 Weekly Attendance</div>

              {days.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No attendance records in the last 7 days.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#fef3c7" }}>
                        {["Date", "Time In", "Time Out", "Status"].map((h) => (
                          <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#92400e", borderBottom: "2px solid #fde68a", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((day) => (
                        <tr key={day.date} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "10px 12px", color: "#1f2937", fontWeight: 600, whiteSpace: "nowrap" }}>
                            <a href="#" style={{ color: "#1d4ed8", textDecoration: "underline", cursor: "pointer" }}>
                              {formatDate(new Date(day.date).toISOString())}
                            </a>
                          </td>
                          <td style={{ padding: "10px 12px", color: "#374151", whiteSpace: "nowrap" }}>
                            {day.timeIn ? formatTime(day.timeIn) : "-- : --"}
                          </td>
                          <td style={{ padding: "10px 12px", color: "#374151", whiteSpace: "nowrap" }}>
                            {day.timeOut ? formatTime(day.timeOut) : "-- : --"}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{
                              padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                              background: day.timeIn ? "#d1fae5" : "#fee2e2",
                              color: day.timeIn ? "#065f46" : "#991b1b",
                            }}>
                              {day.timeIn ? "Present" : "Absent"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 11, marginTop: 16 }}>
              Auto-refreshes every 30 seconds
            </p>
          </>
        )}
      </div>
    </div>
  );
}
