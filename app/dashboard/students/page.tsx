import React from "react";
import StudentsTable from "./components/StudentsTable";
import styles from "../styles.module.css";

export const dynamic = "force-dynamic";

export default function StudentsIndexPage() {
  return (
    <main className={styles.dashboard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Students</h1>
        <a 
          href="/dashboard/students/archived"
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #6b7280, #4b5563)",
            color: "white",
            borderRadius: 10,
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          📦 View Archived
        </a>
      </div>
      <StudentsTable />
    </main>
  );
}
