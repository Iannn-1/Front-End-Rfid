"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "../../styles.module.css";
import { useAttendance } from "@/hooks/useAttendance";
import { useStudents } from "@/hooks/useStudents";
import { AttendanceLogWithStudent } from "@/types";

// All grade/year levels grouped by student level
const LEVEL_GROUPS = [
  {
    group: "Elementary",
    levels: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"],
    color: "#065f46", bg: "#d1fae5",
  },
  {
    group: "Junior High School",
    levels: ["Grade 7", "Grade 8", "Grade 9", "Grade 10"],
    color: "#1e40af", bg: "#dbeafe",
  },
  {
    group: "Senior High School",
    levels: ["Grade 11", "Grade 12"],
    color: "#5b21b6", bg: "#ede9fe",
  },
  {
    group: "College",
    levels: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"],
    color: "#92400e", bg: "#fef3c7",
  },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function AttendanceTracker() {
  const { data: logs = [], isLoading } = useAttendance();
  const { studentsQuery } = useStudents();
  const students = studentsQuery.data ?? [];

  const [filterLevel, setFilterLevel]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery]   = useState("");
  const [viewMode, setViewMode]         = useState<"summary" | "list">("summary");

  // Build a set of student_ids that scanned IN today (first IN = present)
  const presentStudentIds = useMemo(() => {
    const seen = new Set<string>();
    // logs are DESC — find first IN per student (i.e. last in array)
    const reversed = [...logs].reverse();
    for (const log of reversed) {
      if (log.status === "IN") seen.add(String(log.student_id));
    }
    return seen;
  }, [logs]);

  // Latest scan per student
  const latestByStudent = useMemo(() => {
    const map = new Map<string, AttendanceLogWithStudent>();
    for (const log of [...logs].reverse()) {
      map.set(String(log.student_id), log);
    }
    return map;
  }, [logs]);

  // Build attendance records from students + logs
  const records = useMemo(() => {
    return students.map((s) => {
      const sid = String(s.id);
      const latest = latestByStudent.get(sid);
      const isPresent = presentStudentIds.has(sid);
      const currentStatus = latest?.status ?? null;
      return {
        id: String(s.id),
        name: s.name,
        grade_level: s.grade_level,
        student_level: s.student_level,
        section: s.section,
        course: s.course,
        profile_photo: s.profile_photo,
        status: isPresent ? "present" : "absent",
        currentScan: currentStatus,
        checkInTime: latest && latest.status === "IN" ? latest.scan_time : null,
        lastSeen: latest ? latest.scan_time : null,
      };
    });
  }, [students, latestByStudent, presentStudentIds]);

  // Filtered records
  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filterLevel && r.student_level !== filterLevel) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.grade_level.toLowerCase().includes(q);
      }
      return true;
    });
  }, [records, filterLevel, filterStatus, searchQuery]);

  const total   = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent  = records.filter((r) => r.status === "absent").length;
  const rate    = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";

  // Export CSV
  const exportCSV = () => {
    const headers = ["Name", "Level", "Grade", "Section", "Status", "Last Scan", "Check In"];
    const rows = filtered.map((r) => [
      r.name, r.student_level, r.grade_level, r.section, r.status,
      r.currentScan ?? "—",
      r.checkInTime ? formatTime(r.checkInTime) : "—",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `attendance-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Summary cards */}
      <div className={`${styles.grid} ${styles.cols3}`}>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.statLabel}>Total Students</div>
            <div className={styles.statValue}>{total}</div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.statLabel}>Present Today</div>
            <div className={styles.statValue} style={{ color: "#10b981" }}>{present}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Absent: {absent}</div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.statLabel}>Attendance Rate</div>
            <div className={styles.statValue} style={{ color: Number(rate) >= 90 ? "#10b981" : "#f59e0b" }}>
              {rate}%
            </div>
          </div>
        </div>
      </div>

      {/* Main tracker */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Attendance Tracking</h2>
          <div className={styles.controls}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
            <button className={styles.button} onClick={exportCSV}>📥 Export CSV</button>
          </div>
        </div>

        <div className={styles.cardBody}>
          {/* Filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <input
              className={styles.input}
              placeholder="Search student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: "1 1 180px" }}
            />
            <select className={styles.select} value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
              <option value="">All Levels</option>
              <option value="Elementary">Elementary</option>
              <option value="Junior High School">Junior High School</option>
              <option value="Senior High School">Senior High School</option>
              <option value="College">College</option>
            </select>
            <select className={styles.select} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "2px solid #e5e7eb" }}>
            {(["summary", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "8px 16px", background: "none", border: "none", cursor: "pointer",
                  fontWeight: viewMode === mode ? 800 : 500, fontSize: 13,
                  color: viewMode === mode ? "#8b3b3b" : "#6b7280",
                  borderBottom: viewMode === mode ? "2px solid #8b3b3b" : "2px solid transparent",
                  marginBottom: -2, textTransform: "capitalize",
                }}
              >
                {mode === "summary" ? "Summary" : "Detailed List"}
              </button>
            ))}
          </div>

          {isLoading && <div style={{ color: "#6b7280", padding: 20 }}>Loading attendance data...</div>}

          {/* Summary view — grouped by level */}
          {!isLoading && viewMode === "summary" && (
            <div style={{ display: "grid", gap: 16 }}>
              {LEVEL_GROUPS.map(({ group, levels, color, bg }) => {
                const groupRecords = filtered.filter((r) => r.student_level === group);
                if (groupRecords.length === 0) return null;
                const gPresent = groupRecords.filter((r) => r.status === "present").length;
                const gTotal   = groupRecords.length;
                const gRate    = gTotal > 0 ? ((gPresent / gTotal) * 100).toFixed(0) : "0";

                return (
                  <div key={group} style={{ border: `1px solid ${bg}`, borderRadius: 12, overflow: "hidden" }}>
                    {/* Group header */}
                    <div style={{ background: bg, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color }}>{group}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>
                        {gPresent}/{gTotal} · {gRate}%
                      </span>
                    </div>

                    {/* Level rows */}
                    <div style={{ padding: "10px 16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                      {levels.map((level) => {
                        const lvlRecords = groupRecords.filter((r) => r.grade_level === level);
                        if (lvlRecords.length === 0) return null;
                        const lvlPresent = lvlRecords.filter((r) => r.status === "present").length;
                        const lvlTotal   = lvlRecords.length;
                        const lvlRate    = lvlTotal > 0 ? ((lvlPresent / lvlTotal) * 100).toFixed(0) : "0";

                        return (
                          <div key={level} className={styles.card} style={{ margin: 0 }}>
                            <div className={styles.cardBody} style={{ padding: "10px 12px" }}>
                              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{level}</div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                                <span style={{ color: "#6b7280" }}>Present:</span>
                                <span style={{ fontWeight: 700, color: "#10b981" }}>{lvlPresent}/{lvlTotal}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 }}>
                                <span style={{ color: "#6b7280" }}>Rate:</span>
                                <span style={{ fontWeight: 700, color: Number(lvlRate) >= 90 ? "#10b981" : "#f59e0b" }}>{lvlRate}%</span>
                              </div>
                              {/* Mini progress bar */}
                              <div style={{ height: 4, background: "#f3f4f6", borderRadius: 999, marginTop: 8, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${lvlRate}%`, background: Number(lvlRate) >= 90 ? "#10b981" : "#f59e0b", borderRadius: 999, transition: "width 0.5s" }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: 32 }}>
                  No attendance records found.
                </div>
              )}
            </div>
          )}

          {/* List view */}
          {!isLoading && viewMode === "list" && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Level</th>
                    <th>Grade</th>
                    <th>Section</th>
                    <th>Status</th>
                    <th>Current Scan</th>
                    <th>Check In</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: "center", color: "#9ca3af", padding: 24 }}>No records</td></tr>
                  )}
                  {filtered.map((r) => (
                    <tr key={r.id} className={styles.tableRow}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {r.profile_photo ? (
                            <img src={r.profile_photo} alt={r.name} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e5e7eb", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                              {r.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                            </div>
                          )}
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12 }}>{r.student_level}</td>
                      <td style={{ fontSize: 13 }}>{r.grade_level}</td>
                      <td style={{ fontSize: 13 }}>{r.student_level === "College" ? (r.course || "—") : r.section}</td>
                      <td>
                        <span className={styles.badge} style={{
                          background: r.status === "present" ? "#d1fae5" : "#fee2e2",
                          color:      r.status === "present" ? "#065f46" : "#991b1b",
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        {r.currentScan ? (
                          <span className={styles.badge} style={{
                            background: r.currentScan === "IN" ? "#dbeafe" : "#fef3c7",
                            color:      r.currentScan === "IN" ? "#1e40af" : "#92400e",
                          }}>
                            {r.currentScan}
                          </span>
                        ) : "—"}
                      </td>
                      <td style={{ whiteSpace: "nowrap", fontSize: 12, color: "#6b7280" }}>
                        {r.checkInTime ? formatTime(r.checkInTime) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
