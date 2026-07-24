"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, getUser, clearAuth } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/dashboard",            label: "Overview",   icon: "⊞" },
  { href: "/dashboard/attendance", label: "Attendance", icon: "📋" },
  { href: "/dashboard/students",   label: "Students",   icon: "👨‍🎓" },
  { href: "/dashboard/tags",       label: "RFID Tags",  icon: "🏷️" },
  { href: "/dashboard/reports",    label: "Reports",    icon: "📊" },
  { href: "/dashboard/settings",   label: "Settings",   icon: "⚙️" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]           = useState<{ name: string; role: string } | null>(null);
  const [search, setSearch]       = useState("");
  const [showUser, setShowUser]   = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    const u = getUser();
    if (u) setUser({ name: u.name, role: u.role });
  }, [router]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowUser(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Poll notification count
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch("/api/attendance/alerts", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setNotifCount((data.alerts || []).length);
        }
      } catch {}
    };
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30_000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/dashboard/students?search=${encodeURIComponent(search.trim())}`);
  };

  if (!user) return null;

  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  // Active path: exact match for overview, prefix for others
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 220,
        background: "linear-gradient(180deg, #1a0a0a 0%, #2d1010 40%, #1e0b0b 100%)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        boxShadow: "4px 0 20px rgba(0,0,0,0.4)",
      }}>
        {/* Logo */}
        <div style={{
          padding: "22px 20px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg,#c0504d,#8b1a1a)",
              display: "grid", placeItems: "center",
              fontSize: 20, flexShrink: 0,
              boxShadow: "0 4px 12px rgba(192,80,77,0.4)",
            }}>
              📡
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: "#fff", lineHeight: 1.2 }}>School RFID</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.8px", padding: "0 10px", marginBottom: 8 }}>
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: active ? "linear-gradient(135deg,#8b3b3b,#a04040)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.65)",
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  transition: "all 0.15s",
                  position: "relative",
                  boxShadow: active ? "0 4px 12px rgba(139,59,59,0.4)" : "none",
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                <span>{item.label}</span>
                {active && (
                  <div style={{
                    position: "absolute",
                    right: 0, top: "50%",
                    transform: "translateY(-50%)",
                    width: 3, height: 20,
                    background: "#f8c22e",
                    borderRadius: "3px 0 0 3px",
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          fontSize: 11,
          color: "rgba(255,255,255,0.35)",
          textAlign: "center",
        }}>
          RFID System v1.0
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top header bar */}
        <header style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280" }}>
            <span style={{ fontWeight: 600, color: "#374151" }}>Dashboard</span>
            {pathname !== "/dashboard" && (
              <>
                <span>/</span>
                <span style={{ fontWeight: 700, color: "#1f2937", textTransform: "capitalize" }}>
                  {NAV_ITEMS.find((n) => pathname.startsWith(n.href) && n.href !== "/dashboard")?.label ?? ""}
                </span>
              </>
            )}
          </div>

          {/* Right side: search + notifications + user */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Search */}
            <form onSubmit={handleSearch} style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af" }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students, tags..."
                style={{
                  width: 240,
                  padding: "7px 12px 7px 34px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 13,
                  outline: "none",
                  background: "#f9fafb",
                  color: "#1f2937",
                }}
              />
            </form>

            {/* Notification bell */}
            <Link href="/dashboard/attendance" style={{ position: "relative", textDecoration: "none" }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "#f3f4f6", border: "1px solid #e5e7eb",
                display: "grid", placeItems: "center",
                fontSize: 18, cursor: "pointer",
                transition: "background 0.15s",
              }}>
                🔔
              </div>
              {notifCount > 0 && (
                <div style={{
                  position: "absolute", top: -4, right: -4,
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#ef4444", color: "white",
                  fontSize: 10, fontWeight: 700,
                  display: "grid", placeItems: "center",
                  border: "2px solid white",
                }}>
                  {notifCount > 9 ? "9+" : notifCount}
                </div>
              )}
            </Link>

            {/* User dropdown */}
            <div ref={dropRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowUser((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "none", border: "1px solid #e5e7eb",
                  borderRadius: 10, padding: "5px 12px 5px 6px",
                  cursor: "pointer", transition: "background 0.15s",
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "linear-gradient(135deg,#8b3b3b,#c0504d)",
                  display: "grid", placeItems: "center",
                  color: "white", fontWeight: 800, fontSize: 12,
                }}>
                  {initials}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", lineHeight: 1.2 }}>{user.name}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "capitalize" }}>{user.role}</div>
                </div>
                <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 2 }}>▼</span>
              </button>

              {showUser && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "white", borderRadius: 12,
                  border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  minWidth: 180, overflow: "hidden", zIndex: 200,
                }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", textTransform: "capitalize" }}>{user.role}</div>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setShowUser(false)}
                    style={{ display: "block", padding: "10px 16px", fontSize: 13, color: "#374151", textDecoration: "none", fontWeight: 500 }}
                  >
                    ⚙️ Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "10px 16px", fontSize: 13,
                      color: "#dc2626", fontWeight: 700,
                      background: "none", border: "none", cursor: "pointer",
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    ← Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
