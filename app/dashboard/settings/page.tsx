"use client";

import React, { useState, useEffect } from "react";
import AdminProfile from "./components/AdminProfile";
import UserManagement from "./components/UserManagement";
import RFIDSettings from "./components/RFIDSettings";
import SystemSettings from "./components/SystemSettings";
import NotificationSettings from "./components/NotificationSettings";
import SecuritySettings from "./components/SecuritySettings";
import styles from "../styles.module.css";
import { getUser } from "@/lib/auth";

export default function SettingsPage() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    setUserRole(user?.role || null);
  }, []);

  const isSuperAdmin = userRole === 'superadmin';

  return (
    <main className={styles.dashboard}>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0 0" }}>
          Manage your profile, admin accounts, and system configuration.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        {/* My Profile */}
        <AdminProfile />

        {/* Admin Accounts - Only visible to superadmins */}
        {isSuperAdmin && <UserManagement />}

        {/* RFID + System config */}
        <div className={`${styles.grid} ${styles.cols2}`}>
          <RFIDSettings />
          <SystemSettings />
        </div>

        {/* Notification + Security config */}
        <div className={`${styles.grid} ${styles.cols2}`}>
          <NotificationSettings />
          <SecuritySettings />
        </div>
      </div>
    </main>
  );
}
