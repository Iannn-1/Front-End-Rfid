"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Radio, AlertCircle, CheckCircle, Home, Clock, Calendar, LogOut, ChevronDown } from "lucide-react";
import axios from "axios";

interface StudentInfo {
  id: number;
  name?: string; // Backward compatibility
  first_name: string;
  last_name: string;
  middle_name?: string;
  grade_level: string;
  section: string;
  student_level: string;
  course?: string;
  profile_photo?: string;
  rfid_tag_uid: string;
  is_primary?: boolean;
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
  const [children, setChildren] = useState<StudentInfo[]>([]);
  const [selectedChild, setSelectedChild] = useState<StudentInfo | null>(null);
  const [currentStatus, setCurrentStatus] = useState<"IN" | "OUT" | null>(null);
  const [logs, setLogs]       = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchChildren = useCallback(async () => {
    const token = localStorage.getItem("parent_token");
    if (!token) return [];

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
      const res = await axios.get(`${apiUrl}/parents/children`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data.children || [];
    } catch (err: any) {
      console.error("Failed to fetch children:", err);
      return [];
    }
  }, []);

  const fetchChildData = useCallback(async (rfidTag: string) => {
    const token = localStorage.getItem("parent_token");
    if (!token) return null;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
      const res = await axios.get(`${apiUrl}/parents/child?rfid_tag_uid=${rfidTag}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err: any) {
      console.error("Failed to fetch child data:", err);
      return null;
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    const token = localStorage.getItem("parent_token");
    const storedParent = localStorage.getItem("parent_user");
    if (!token || !storedParent) { 
      router.push("/parent"); 
      return; 
    }

    setParent(JSON.parse(storedParent));
    setLoading(true);
    setError(null);

    try {
      // Fetch all children
      const childrenList = await fetchChildren();
      setChildren(childrenList);

      if (childrenList.length === 0) {
        setError("No children found in your account");
        setLoading(false);
        return;
      }

      // Select primary child or first child
      const primary = childrenList.find((c: StudentInfo) => c.is_primary);
      const childToSelect = primary || childrenList[0];
      
      // Fetch data for selected child
      const childData = await fetchChildData(childToSelect.rfid_tag_uid);
      if (childData) {
        setSelectedChild(childData.student);
        setCurrentStatus(childData.currentStatus);
        setLogs(childData.logs);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) { 
        router.push("/parent"); 
        return; 
      }
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [router, fetchChildren, fetchChildData]);

  const handleChildSelect = async (child: StudentInfo) => {
    setShowDropdown(false);
    if (child.rfid_tag_uid === selectedChild?.rfid_tag_uid) return;

    setLoading(true);
    const childData = await fetchChildData(child.rfid_tag_uid);
    if (childData) {
      setSelectedChild(childData.student);
      setCurrentStatus(childData.currentStatus);
      setLogs(childData.logs);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInitialData();
    
    // Set up auto-refresh interval
    const id = setInterval(() => {
      if (selectedChild) {
        fetchChildData(selectedChild.rfid_tag_uid).then(childData => {
          if (childData) {
            setCurrentStatus(childData.currentStatus);
            setLogs(childData.logs);
          }
        });
      }
    }, 30_000);
    
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            background: "linear-gradient(135deg,#3b82f6,#2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "white",
          }}>
            <Radio size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 14, lineHeight: 1.2 }}>School RFID</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Parent Portal</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Child Selector Dropdown */}
          {children.length > 1 && selectedChild && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  background: "rgba(255,255,255,0.15)", 
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff", 
                  padding: "7px 12px", 
                  borderRadius: 8, 
                  fontSize: 13,
                  fontWeight: 600, 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8,
                  minWidth: 150,
                }}>
                <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedChild.first_name} {selectedChild.last_name}
                </span>
                <ChevronDown size={14} style={{ transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>

              {showDropdown && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "#fff",
                  borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  minWidth: 200,
                  overflow: "hidden",
                  zIndex: 100,
                }}>
                  {children.map((child) => (
                    <button
                      key={child.rfid_tag_uid}
                      onClick={() => handleChildSelect(child)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: child.rfid_tag_uid === selectedChild?.rfid_tag_uid ? "#e8f4f8" : "#fff",
                        border: "none",
                        borderBottom: "1px solid #e5e7eb",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: child.rfid_tag_uid === selectedChild?.rfid_tag_uid ? 700 : 600,
                        color: "#1f2937",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (child.rfid_tag_uid !== selectedChild?.rfid_tag_uid) {
                          e.currentTarget.style.background = "#f3f4f6";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (child.rfid_tag_uid !== selectedChild?.rfid_tag_uid) {
                          e.currentTarget.style.background = "#fff";
                        }
                      }}>
                      {child.first_name} {child.last_name}
                      {child.is_primary && (
                        <span style={{ 
                          marginLeft: 8, 
                          fontSize: 10, 
                          padding: "2px 6px", 
                          background: "#fef3c7", 
                          color: "#92400e", 
                          borderRadius: 4,
                          fontWeight: 700,
                        }}>PRIMARY</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button onClick={handleLogout}
            style={{
              background: "rgba(239, 68, 68, 0.2)", 
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#fff", 
              padding: "7px 14px", 
              borderRadius: 8, 
              fontSize: 13,
              fontWeight: 600, 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: 6,
            }}>
            <LogOut size={14} />
            Log Out
          </button>
        </div>
      </header>

      <div style={{ padding: "20px 16px", maxWidth: 600, margin: "0 auto" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: "#64748b", fontSize: 14 }}>
            Loading attendance data...
          </div>
        )}

        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 12, padding: 16, color: "#dc2626", fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {!loading && !error && selectedChild && (
          <>
            {/* Greeting */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ color: "#1f2937", fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>
                Hello, {parent?.name?.split(" ")[0]}!
              </h2>
              <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
                {children.length > 1 ? `Viewing: ` : `Your child: `}
                <strong>{selectedChild.name || `${selectedChild.last_name}, ${selectedChild.first_name}${selectedChild.middle_name ? ' ' + selectedChild.middle_name : ''}`}</strong>
              </p>
            </div>

            {/* Student card */}
            <div style={{
              background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)", display: "flex", gap: 16, alignItems: "center",
            }}>
              {selectedChild.profile_photo ? (
                <img src={selectedChild.profile_photo} alt={`${selectedChild.first_name} ${selectedChild.last_name}`}
                  style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", border: "3px solid #e5e7eb", flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 70, height: 70, borderRadius: "50%", background: "#e5e7eb",
                  display: "grid", placeItems: "center", fontSize: 24, fontWeight: 800, flexShrink: 0,
                }}>
                  {selectedChild.first_name[0]}{selectedChild.last_name[0]}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#1f2937", marginBottom: 4 }}>
                  {selectedChild.last_name}, {selectedChild.first_name} {selectedChild.middle_name || ''}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{selectedChild.student_level} · {selectedChild.grade_level} · {selectedChild.section}</div>
                {selectedChild.course && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{selectedChild.course}</div>}
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
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                {currentStatus === "IN" && (
                  <>
                    <CheckCircle size={20} strokeWidth={2.5} />
                    Currently Inside School
                  </>
                )}
                {currentStatus === "OUT" && (
                  <>
                    <Home size={20} strokeWidth={2.5} />
                    Left School
                  </>
                )}
                {!currentStatus && (
                  <>
                    <Clock size={20} strokeWidth={2.5} />
                    No scan today yet
                  </>
                )}
              </div>
            </div>

            {/* Weekly attendance */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#1f2937", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={18} />
                Weekly Attendance
              </div>

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
                            {formatDate(new Date(day.date).toISOString())}
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
