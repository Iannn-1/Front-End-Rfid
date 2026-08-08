"use client";

import { useAttendance } from "@/hooks/useAttendance";
import styles from "../../styles.module.css";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function LiveFeed() {
  const { data: logs = [], isLoading } = useAttendance();

  // Last 10 scans (logs are DESC)
  const recent = logs.slice(0, 10);

  // Quick stats
  const todayIn  = logs.filter((l) => l.status === "IN").length;
  const todayOut = logs.filter((l) => l.status === "OUT").length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 8 }}>

      {/* Stat: Total IN today */}
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
            Scanned IN Today
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#10b981" }}>{todayIn}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            {todayOut} scanned OUT
          </div>
        </div>
      </div>

      {/* Stat: Total scans */}
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
            Total Scans Today
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#3b82f6" }}>{logs.length}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Last: {logs[0] ? formatTime(logs[0].scan_time) : "—"}
          </div>
        </div>
      </div>

      {/* Live feed */}
      <div className={styles.card} style={{ gridColumn: "span 1" }}>
        <div className={styles.cardHeader} style={{ paddingBottom: 8 }}>
          <h2 style={{ fontSize: 14 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#10b981", marginRight: 6, animation: "pulse 1.5s infinite" }} />
            Live Scan Feed
          </h2>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>auto-refreshes</span>
        </div>
        <div className={styles.cardBody} style={{ padding: "0 16px 12px", maxHeight: 200, overflowY: "auto" }}>
          {isLoading && <div style={{ color: "#9ca3af", fontSize: 13, padding: "12px 0" }}>Loading...</div>}
          {!isLoading && recent.length === 0 && (
            <div style={{ color: "#9ca3af", fontSize: 13, padding: "12px 0" }}>No scans today yet.</div>
          )}
          {recent.map((log) => (
            <div key={log.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 0", borderBottom: "1px solid #f3f4f6",
            }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: log.status === "IN" ? "#d1fae5" : "#fee2e2",
                display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800,
                color: log.status === "IN" ? "#065f46" : "#991b1b",
              }}>
                {log.Student?.name?.split(" ").map((p: string) => p[0]).join("").slice(0, 2) ?? "?"}
              </div>

              {/* Name + info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {log.Student?.name ?? "Unknown"}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                  {log.Student?.grade_level} · {log.Student?.section}
                </div>
              </div>

              {/* Status badge + time */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span style={{
                  padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                  background: log.status === "IN" ? "#d1fae5" : "#fee2e2",
                  color: log.status === "IN" ? "#065f46" : "#991b1b",
                  display: "block", marginBottom: 2,
                }}>
                  {log.status}
                </span>
                <span style={{ fontSize: 10, color: "#9ca3af" }}>{timeAgo(log.scan_time)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
