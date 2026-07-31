"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, getUser } from "@/lib/auth";
import { useStats } from "@/hooks/useStats";
import { useStudents } from "@/hooks/useStudents";
import { useAttendance } from "@/hooks/useAttendance";
import styles from "./styles.module.css";

// ── Live clock ──────────────────────────────────────────────────────────────
function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function DashboardPage() {
  const router = useRouter();
  const now    = useClock();

  const timeStr = now
    ? now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "--:--";
  const dateStr = now
    ? now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : "";

  const user = typeof window !== "undefined" ? getUser() : null;
  const greeting = user?.name ? `Good day, ${user.name} 👋` : "Good day 👋";

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  // ── Real backend data ──
  const { data: statsData, isLoading: statsLoading } = useStats();
  const { studentsQuery }                             = useStudents();
  const { data: logs = [], isLoading: logsLoading }  = useAttendance();

  const totalStudents = studentsQuery.data?.length ?? 0;
  const presentToday  = statsData?.presentCount ?? 0;

  // Gate counts from attendance logs
  const enteredToday = logs.filter(l => l.status === 'IN').length;
  const exitedToday  = logs.filter(l => l.status === 'OUT').length;

  if (typeof window !== "undefined" && !isAuthenticated()) return null;

  return (
    <main className={styles.dashboard}>
      {/* ── Hero banner ── */}
      <div className={styles.heroBanner}>
        <div className={styles.heroLeft}>
          <div className={styles.heroGreeting}>{greeting}</div>
          <h1 className={styles.heroTitle}>School RFID Dashboard</h1>
          <p className={styles.heroSub}>{dateStr}</p>
        </div>
        <div className={styles.heroClock}>
          <div className={styles.heroTime}>{timeStr}</div>
          <div className={styles.heroTimeLabel}>Current Time</div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[
          {
            label: "Total Students",
            value: studentsQuery.isLoading ? null : totalStudents,
            icon: "👨‍🎓",
            color: "#a94442",
            bg: "linear-gradient(135deg,#a94442,#c0504d)",
            link: "/dashboard/students",
          },
          {
            label: "Present Today",
            value: statsLoading ? null : presentToday,
            icon: "📋",
            color: "#d67f00",
            bg: "linear-gradient(135deg,#d67f00,#f89406)",
            link: "/dashboard/attendance",
          },
          {
            label: "Active Tags",
            value: studentsQuery.isLoading ? null : totalStudents,
            icon: "🏷️",
            color: "#45a164",
            bg: "linear-gradient(135deg,#45a164,#62b876)",
            link: "/dashboard/tags",
          },
          {
            label: "RFID Readers",
            value: 1,
            icon: "📡",
            color: "#2779a8",
            bg: "linear-gradient(135deg,#2779a8,#3c9acc)",
            link: "/dashboard/settings",
          },
        ].map((card, i) => (
          <Link
            key={i}
            href={card.link}
            style={{
              textDecoration: "none",
              background: card.bg,
              borderRadius: 16,
              padding: "20px 22px",
              color: "white",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              boxShadow: `0 4px 16px ${card.color}35`,
              transition: "transform 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {card.label}
              </span>
              <span style={{ fontSize: 24 }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1 }}>
              {card.value === null ? "—" : card.value.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600 }}>View →</div>
          </Link>
        ))}
      </div>

      {/* ── Quick Navigation ── */}
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
            {[
              { href: "/dashboard/attendance", icon: "📋", label: "Attendance", desc: "Track & analyze" },
              { href: "/dashboard/students",   icon: "👨‍🎓", label: "Students",  desc: "Manage students" },
              { href: "/dashboard/monitor",    icon: "📺", label: "Monitor",    desc: "Live gate display" },
              { href: "/dashboard/reports",    icon: "📊", label: "Reports",    desc: "Generate & export" },
              { href: "/dashboard/settings",   icon: "⚙️", label: "Settings",   desc: "Configure & users" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  padding: "20px 12px", borderRadius: 12,
                  background: "#f9fafb", border: "1px solid #f3f4f6",
                  textDecoration: "none",
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "linear-gradient(135deg,#f3f4f6,#e5e7eb)",
                  display: "grid", placeItems: "center", fontSize: 24,
                }}>
                  {item.icon}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1f2937" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Today's Attendance + Main Gate Monitor ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <AttendancePanel
          presentCount={presentToday}
          totalStudents={totalStudents}
          loading={statsLoading || studentsQuery.isLoading}
        />
        <MainGatePanel
          enteredToday={enteredToday}
          exitedToday={exitedToday}
          loading={logsLoading}
        />
      </div>
    </main>
  );
}

// ── Today's Attendance Panel (Present only) ──────────────────────────────────
function AttendancePanel({
  presentCount,
  totalStudents,
  loading,
}: {
  presentCount: number;
  totalStudents: number;
  loading: boolean;
}) {
  const rate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>📋 Today's Attendance</h2>
        <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
          Live · updates every 5s
        </span>
      </div>
      <div className={styles.cardBody}>
        {loading ? (
          <div style={{ color: "#9ca3af", fontSize: 14 }}>Loading attendance…</div>
        ) : (
          <>
            <div style={{ marginBottom: 18 }}>
              <div style={{
                background: "#d1fae5", borderRadius: 10, padding: "18px 20px",
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{ fontSize: 40 }}>✅</div>
                <div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: "#065f46", lineHeight: 1 }}>
                    {presentCount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46", opacity: 0.8, marginTop: 4 }}>
                    Students Present Today
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Overall Attendance Rate</span>
                <span style={{
                  fontSize: 14, fontWeight: 800,
                  color: rate >= 90 ? "#10b981" : rate >= 75 ? "#f59e0b" : "#ef4444",
                }}>
                  {rate}%
                </span>
              </div>
              <div style={{ height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${rate}%`,
                  background: "linear-gradient(90deg,#10b981,#34d399)",
                  borderRadius: 999, transition: "width 0.6s ease",
                }} />
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                {presentCount} of {totalStudents} students have scanned in today
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Gate Monitor Panel ───────────────────────────────────────────────────
function MainGatePanel({
  enteredToday,
  exitedToday,
  loading,
}: {
  enteredToday: number;
  exitedToday: number;
  loading: boolean;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2>🚪 Main Gate Monitor</h2>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
            Live IN / OUT tracking · updates every 5s
          </div>
        </div>
        <div style={{
          padding: "5px 12px", borderRadius: 999,
          background: "#d1fae5", border: "1px solid #6ee7b7",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#10b981", boxShadow: "0 0 6px rgba(16,185,129,0.7)",
          }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#065f46" }}>ONLINE</span>
        </div>
      </div>
      <div className={styles.cardBody}>
        {loading ? (
          <div style={{ color: "#9ca3af", fontSize: 14 }}>Loading gate data…</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{
              background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
              borderRadius: 14, padding: "16px 18px",
              border: "1px solid #6ee7b7",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 28 }}>🟢</div>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: "#065f46", lineHeight: 1 }}>
                    {enteredToday}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", opacity: 0.75, marginTop: 3 }}>
                    Entered Today
                  </div>
                </div>
              </div>
            </div>
            <div style={{
              background: "linear-gradient(135deg,#fee2e2,#fecaca)",
              borderRadius: 14, padding: "16px 18px",
              border: "1px solid #fca5a5",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 28 }}>🔴</div>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: "#991b1b", lineHeight: 1 }}>
                    {exitedToday}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", opacity: 0.75, marginTop: 3 }}>
                    Exited Today
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
