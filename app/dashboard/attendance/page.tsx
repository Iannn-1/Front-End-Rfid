import React from "react";
import AttendanceTracker from "./components/AttendanceTracker";
import LiveFeed from "./components/LiveFeed";
import styles from "../styles.module.css";

export const dynamic = "force-dynamic";

export default function AttendancePage() {
  return (
    <main className={styles.dashboard}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>
        Attendance
      </h1>
      <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 20px" }}>
        Real-time attendance tracking — updates every 30 seconds
      </p>

      {/* Top row: live scan feed */}
      <LiveFeed />

      {/* Main tracker: summary by level + detailed list */}
      <AttendanceTracker />
    </main>
  );
}
