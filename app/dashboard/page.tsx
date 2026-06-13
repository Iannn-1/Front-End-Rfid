'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import AttendanceTable from '@/components/AttendanceTable';
import StatsCards from '@/components/StatsCards';
import { useAttendance } from '@/hooks/useAttendance';
import { useStats } from '@/hooks/useStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const { data: attendanceData, isLoading: isLoadingAttendance, error: attendanceError } = useAttendance();
  const { data: statsData, isLoading: isLoadingStats, error: statsError } = useStats();

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time attendance overview
            </p>
          </div>

          {/* Stats Cards */}
          {isLoadingStats ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="w-full animate-pulse">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : statsError ? (
            <div className="text-red-500">Error loading stats</div>
          ) : statsData ? (
            <StatsCards stats={statsData} />
          ) : null}

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAttendance ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : attendanceError ? (
                <div className="text-red-500">Error loading attendance data</div>
              ) : attendanceData ? (
                <AttendanceTable logs={attendanceData} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
