"use client";

import { useState } from "react";
import styles from "../styles.module.css";
import { useStudents } from "@/hooks/useStudents";
import StudentBarcode from "@/components/StudentBarcode";

export default function BarcodesPage() {
  const { studentsQuery } = useStudents();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const students = (studentsQuery.data ?? []).filter((s) =>
    search ? s.name.toLowerCase().includes(search.toLowerCase()) || s.rfid_tag_uid.includes(search) : true
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(students.map((s) => String(s.id))));
  const clearAll  = () => setSelected(new Set());

  const printSelected = () => {
    const ids = selected.size > 0 ? selected : new Set(students.map((s) => String(s.id)));
    const printStudents = students.filter((s) => ids.has(String(s.id)));

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Barcodes</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #fff; }
          .grid { display: flex; flex-wrap: wrap; gap: 16px; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; width: 200px; text-align: center; break-inside: avoid; }
          .name { font-size: 12px; font-weight: 700; margin: 4px 0 2px; }
          .uid  { font-size: 10px; color: #6b7280; font-family: monospace; }
          .level { font-size: 10px; color: #9ca3af; }
          @media print { .no-print { display: none; } }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
      </head>
      <body>
        <div class="no-print" style="margin-bottom:16px;">
          <button onclick="window.print()" style="padding:10px 24px;background:#8b3b3b;color:white;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">
            🖨️ Print All
          </button>
        </div>
        <div class="grid">
          ${printStudents.map((s) => `
            <div class="card">
              <svg class="barcode" jsbarcode-value="${s.rfid_tag_uid}" jsbarcode-width="1.5" jsbarcode-height="50" jsbarcode-fontsize="10"></svg>
              <div class="name">${s.name}</div>
              <div class="uid">${s.rfid_tag_uid}</div>
              <div class="level">${s.student_level} · ${s.grade_level}</div>
            </div>
          `).join("")}
        </div>
        <script>JsBarcode(".barcode").init();</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <main className={styles.dashboard}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>🏷️ Student Barcodes</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className={styles.button} onClick={selectAll}>Select All</button>
          <button className={styles.button} onClick={clearAll}>Clear</button>
          <button
            className={styles.button}
            onClick={printSelected}
            style={{ background: "#8b3b3b", color: "white", border: "none" }}
          >
            🖨️ Print {selected.size > 0 ? `(${selected.size})` : "All"}
          </button>
        </div>
      </div>

      <input
        className={styles.input}
        placeholder="Search by name or tag UID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ maxWidth: 320 }}
      />

      {studentsQuery.isLoading && <p style={{ color: "#6b7280" }}>Loading students...</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {students.map((s) => {
          const id = String(s.id);
          const isSelected = selected.has(id);
          return (
            <div
              key={id}
              onClick={() => toggleSelect(id)}
              style={{
                background: "#fff", borderRadius: 12, padding: 16,
                border: isSelected ? "2px solid #8b3b3b" : "1px solid #e5e7eb",
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: isSelected ? "0 0 0 3px rgba(139,59,59,0.15)" : "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {isSelected && (
                <div style={{ textAlign: "right", color: "#8b3b3b", fontSize: 16, marginBottom: 4 }}>✓</div>
              )}
              <StudentBarcode uid={s.rfid_tag_uid} width={1.5} height={50} showText={false} />
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#1f2937" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "#8b3b3b", fontFamily: "monospace", marginTop: 2 }}>{s.rfid_tag_uid}</div>
                <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{s.student_level} · {s.grade_level}</div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
