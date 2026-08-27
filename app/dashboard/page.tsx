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
      {/* ── Hero banner with school building background + stat cards overlay ── */}
      <div style={{
        position: "relative",
        borderRadius: 20,
        marginBottom: 24,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}>
        {/* Background image - positioned to show building name and logo */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/school-building.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          zIndex: 0,
        }} />
        
        {/* Gradient overlay for readability */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, rgba(30, 58, 138, 0.85) 0%, rgba(131, 24, 67, 0.75) 50%, rgba(30, 58, 138, 0.85) 100%)",
          zIndex: 1,
        }} />
        
        {/* Content wrapper */}
        <div style={{ position: "relative", zIndex: 2, padding: "40px 40px 140px 40px" }}>
          {/* Top section: Greeting + Title + Clock */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 15, color: "#f8c22e", fontWeight: 700, marginBottom: 12 }}>
                {greeting}
              </div>
              <h1 style={{ fontSize: 42, fontWeight: 900, color: "white", margin: 0, lineHeight: 1.1, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                Dashboard Overview
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.95)", marginTop: 10, marginBottom: 0, fontWeight: 500 }}>
                Here's what's happening on campus today
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 6, fontWeight: 600 }}>
                {dateStr}
              </div>
              <div style={{ fontSize: 56, fontWeight: 900, color: "#f8c22e", lineHeight: 1, textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                {timeStr}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 8, fontWeight: 500 }}>
                Have a productive day!
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat Cards Overlay (positioned at bottom of banner) ── */}
        <div style={{
          position: "relative",
          zIndex: 3,
          padding: "0 40px",
          marginTop: -100,
          paddingBottom: 20,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {[
              {
                label: "Total Students",
                value: studentsQuery.isLoading ? null : totalStudents,
                icon: "👥",
                subtext: "1-12 this week",
                color: "#3b82f6",
                bg: "white",
                link: "/dashboard/students",
              },
              {
                label: "Present Today",
                value: statsLoading ? null : presentToday,
                icon: "📅",
                subtext: `${totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0}% of total`,
                color: "#f97316",
                bg: "white",
                link: "/dashboard/attendance",
              },
              {
                label: "Active Tags",
                value: studentsQuery.isLoading ? null : totalStudents,
                icon: "✓",
                subtext: "All systems online",
                color: "#3b82f6",
                bg: "white",
                link: "/dashboard/tags",
              },
              {
                label: "RFID Readers",
                value: 1,
                icon: "📡",
                subtext: "All systems online",
                color: "#f97316",
                bg: "white",
                link: "/dashboard/settings",
              },
            ].map((card, i) => (
              <Link
                key={i}
                href={card.link}
                style={{
                  textDecoration: "none",
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  borderRadius: 14,
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  transition: "all 0.2s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.2)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
                }}
              >
                {/* Icon circle */}
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: i % 2 === 0 ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "linear-gradient(135deg, #f97316, #ea580c)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 24,
                  boxShadow: `0 4px 16px ${card.color}40`,
                }}>
                  {card.icon}
                </div>
                
                {/* Label */}
                <div>
                  <div style={{ 
                    fontSize: 11, 
                    fontWeight: 600, 
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: 5,
                  }}>
                    {card.label}
                  </div>
                  
                  {/* Value */}
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#1f2937", letterSpacing: "-1px", lineHeight: 1 }}>
                    {card.value === null ? "—" : card.value.toLocaleString()}
                  </div>
                  
                  {/* Subtext */}
                  <div style={{ 
                    fontSize: 10, 
                    color: "#9ca3af", 
                    fontWeight: 500,
                    marginTop: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}>
                    <div style={{
                      width: 0,
                      height: 0,
                      borderLeft: "3px solid transparent",
                      borderRight: "3px solid transparent",
                      borderBottom: `5px solid ${i % 2 === 0 ? '#3b82f6' : '#f97316'}`,
                    }} />
                    {card.subtext}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Navigation Cards ── */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
        gap: 12,
        marginBottom: 24,
      }}>
        {[
          { href: "/dashboard/attendance", icon: "📋", label: "Scan Attendance", desc: "Record manually", bgIcon: "#3b82f6" },
          { href: "/dashboard/students",   icon: "👨‍🎓", label: "Students",  desc: "Manage students", bgIcon: "#8b5cf6" },
          { href: "/dashboard/monitor",    icon: "📺", label: "Monitor",    desc: "Live gate display", bgIcon: "#3b82f6" },
          { href: "/dashboard/reports",    icon: "📊", label: "Reports",    desc: "View analytics", bgIcon: "#f97316" },
          { href: "/dashboard/settings",   icon: "⚙️", label: "Settings",   desc: "System preferences", bgIcon: "#6b7280" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              gap: 10,
              padding: "20px 16px", 
              borderRadius: 14,
              background: "white",
              border: "1px solid #f3f4f6",
              textDecoration: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
            }}
          >
            <div style={{
              width: 52, 
              height: 52, 
              borderRadius: "50%",
              background: `${item.bgIcon}15`,
              display: "grid", 
              placeItems: "center", 
              fontSize: 24,
            }}>
              {item.icon}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1f2937", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main Content Grid: Attendance Overview + Campus Summary + Recent Activities ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        
        {/* Today's Attendance Overview with Circular Chart */}
        <div style={{
          background: "white",
          borderRadius: 16,
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          border: "1px solid #f3f4f6",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", margin: 0 }}>
              Today's Attendance Overview
            </h3>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "#10b981",
              fontWeight: 600,
              background: "#d1fae5",
              padding: "4px 10px",
              borderRadius: 999,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
              Live
            </div>
          </div>

          {statsLoading || studentsQuery.isLoading ? (
            <div style={{ color: "#9ca3af", fontSize: 14, textAlign: "center", padding: "40px 0" }}>Loading...</div>
          ) : (
            <>
              {/* Circular Progress */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <div style={{ position: "relative", width: 160, height: 160 }}>
                  <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
                    {/* Background circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="12"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(presentToday / totalStudents) * 440} 440`}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#3b82f6" }} />
                        <stop offset="100%" style={{ stopColor: "#f97316" }} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <div style={{ fontSize: 36, fontWeight: 900, color: "#1f2937", lineHeight: 1 }}>
                      {totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0}%
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginTop: 4 }}>
                      Attendance Rate
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#3b82f6" }} />
                    <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>Present</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>
                    {presentToday} ({totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0}%)
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f97316" }} />
                    <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>Absent</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>
                    {totalStudents - presentToday} ({totalStudents > 0 ? Math.round(((totalStudents - presentToday) / totalStudents) * 100) : 0}%)
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fbbf24" }} />
                    <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>Excused</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>0 (0%)</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Campus Summary */}
        <div style={{
          background: "white",
          borderRadius: 16,
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          border: "1px solid #f3f4f6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 20 }}>
            Campus Summary
          </h3>
          
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "grid",
            placeItems: "center",
            fontSize: 36,
            marginBottom: 16,
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
          }}>
            🏫
          </div>

          <h4 style={{ fontSize: 18, fontWeight: 800, color: "#1f2937", margin: "0 0 8px 0" }}>
            Benedicto College
          </h4>
          <p style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 16 }}>
            Smart Campus, Safe Students.
          </p>

          <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 20 }}>
            The RFID system helps ensure a secure and efficient environment by automating student attendance and monitoring campus activity in real-time.
          </p>

          <Link
            href="/dashboard/reports"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "white",
              borderRadius: 10,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
            }}
          >
            View Full Report
            <span>→</span>
          </Link>
        </div>

        {/* Recent Activities */}
        <div style={{
          background: "white",
          borderRadius: 16,
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          border: "1px solid #f3f4f6",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", margin: 0 }}>
              Recent Activities
            </h3>
            <Link
              href="/dashboard/attendance"
              style={{
                fontSize: 12,
                color: "#3b82f6",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              View all →
            </Link>
          </div>

          {logsLoading ? (
            <div style={{ color: "#9ca3af", fontSize: 14, textAlign: "center", padding: "20px 0" }}>Loading...</div>
          ) : logs.length === 0 ? (
            <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              No recent activity
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {logs.slice(0, 6).map((log, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px",
                    borderRadius: 10,
                    background: "#f9fafb",
                    border: "1px solid #f3f4f6",
                  }}
                >
                  {/* Student Photo */}
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: log.status === 'IN' ? "2px solid #10b981" : "2px solid #ef4444",
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#f3f4f6",
                    position: "relative",
                  }}>
                    {log.Student?.profile_photo ? (
                      <img 
                        src={log.Student.profile_photo} 
                        alt={log.Student.name || 'Student'}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div style="
                                width: 100%; 
                                height: 100%; 
                                display: flex; 
                                align-items: center; 
                                justify-content: center;
                                background: ${log.status === 'IN' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
                                color: white;
                                font-weight: 700;
                                font-size: 12px;
                              ">
                                ${(log.Student?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div style="
                                position: absolute;
                                bottom: -1px;
                                right: -1px;
                                width: 12px;
                                height: 12px;
                                border-radius: 50%;
                                background: ${log.status === 'IN' ? '#10b981' : '#ef4444'};
                                border: 2px solid white;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                              "></div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      // Fallback to initials if no photo
                      <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: log.status === 'IN' ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #ef4444, #dc2626)",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 12,
                      }}>
                        {(log.Student?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {/* Status indicator dot */}
                    <div style={{
                      position: "absolute",
                      bottom: -1,
                      right: -1,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: log.status === 'IN' ? "#10b981" : "#ef4444",
                      border: "2px solid white",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {log.Student?.name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {log.Student?.parent_email || 'No email'}
                    </div>
                  </div>
                  <div style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: log.status === 'IN' ? "#d1fae5" : "#fee2e2",
                    color: log.status === 'IN' ? "#065f46" : "#991b1b",
                    fontSize: 10,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}>
                    {log.status === 'IN' ? 'IN' : 'OUT'}
                  </div>
                  <div style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap" }}>
                    {new Date(log.scan_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Section: Today's Attendance + Main Gate Monitor ── */}
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
