"use client";

import { useMemo, useState } from "react";
import styles from "../../styles.module.css";
import { useStudents } from "@/hooks/useStudents";

export default function TagsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { studentsQuery } = useStudents();

  // Derive tag rows from students
  const allTags = useMemo(() => {
    return (studentsQuery.data ?? []).map((s) => ({
      id: String(s.id),
      uid: s.rfid_tag_uid,
      ownerName: s.name,
      ownerLevel: s.student_level,
      gradeLevel: s.grade_level,
      status: s.status, // 'Active' | 'Inactive'
      lastSeen: s.updatedAt ?? null,
      photoUrl: s.profile_photo,
    }));
  }, [studentsQuery.data]);

  // Client-side search + filter
  const filtered = useMemo(() => {
    let rows = allTags;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (t) =>
          t.uid.toLowerCase().includes(q) ||
          t.ownerName.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      rows = rows.filter((t) => t.status === statusFilter);
    }
    return rows;
  }, [allTags, search, statusFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rows = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const loading = studentsQuery.isLoading;
  const error = studentsQuery.error?.message ?? null;

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Tags</h2>
        <div className={styles.controls}>
          <input
            className={styles.input}
            placeholder="Search UID/Owner"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          />
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
          >
            <option value="">All status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className={styles.cardBody}>
        {loading && <div aria-busy>Loading tags...</div>}
        {error && <div role="alert">Error: {error}</div>}

        {!loading && !error && (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tag UID</th>
                    <th>Owner</th>
                    <th>Level</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "#6b7280", padding: 24 }}>
                        No tags found
                      </td>
                    </tr>
                  )}
                  {rows.map((t) => (
                    <tr key={t.id} className={styles.tableRow} style={{ cursor: 'default' }}>
                      <td style={{ fontWeight: 700, fontFamily: "monospace" }}>{t.uid}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {t.photoUrl ? (
                            <img
                              src={t.photoUrl}
                              alt={t.ownerName}
                              style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e5e7eb", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                              {t.ownerName.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                            </div>
                          )}
                          <span>{t.ownerName}</span>
                        </div>
                      </td>
                      <td>{t.ownerLevel}</td>
                      <td>{t.gradeLevel}</td>
                      <td>
                        <span
                          className={styles.badge}
                          style={{
                            background: t.status === "Active" ? "#d1fae5" : "#fee2e2",
                            color: t.status === "Active" ? "#065f46" : "#991b1b",
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap", color: "#6b7280", fontSize: 13 }}>
                        {t.lastSeen ? new Date(t.lastSeen).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginTop: 12 }}>
              <div className={styles.controls}>
                <button className={styles.button} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
                <span style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>Page {page} / {totalPages}</span>
                <button className={styles.button} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
              </div>
              <div className={styles.controls}>
                <label style={{ fontSize: 12, color: "#6b7280" }}>Rows:</label>
                <select className={styles.select} value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
