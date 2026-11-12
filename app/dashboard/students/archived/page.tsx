"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, RefreshCw, Search, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ArchivedStudent {
  id: number;
  school_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  student_level: string;
  grade_level: string;
  section: string;
  profile_photo?: string;
  parent_email: string;
  archived: boolean;
}

export default function ArchivedStudentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [restoring, setRestoring] = useState<number | null>(null);

  // Fetch archived students
  const { data: students = [], isLoading, refetch } = useQuery({
    queryKey: ['students', 'archived'],
    queryFn: async () => {
      const response = await api.get('/students?archived=true');
      return response.data.data as ArchivedStudent[];
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: async (studentId: number) => {
      await api.post(`/students/${studentId}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      refetch();
    },
  });

  const handleRestore = async (student: ArchivedStudent) => {
    if (confirm(`Restore ${student.first_name} ${student.last_name} back to active students?`)) {
      setRestoring(student.id);
      try {
        await restoreMutation.mutateAsync(student.id);
        alert('Student restored successfully!');
      } catch (error) {
        alert('Failed to restore student');
      } finally {
        setRestoring(null);
      }
    }
  };

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const schoolId = student.school_id?.toLowerCase() || '';
    return fullName.includes(searchLower) || schoolId.includes(searchLower);
  });

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => router.push("/dashboard/students")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: "#f3f4f6",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            color: "#374151",
            marginBottom: 16,
          }}
        >
          <ArrowLeft size={18} />
          Back to Students
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6b7280, #4b5563)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}>
            <Archive size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#1f2937", margin: 0 }}>
              Archived Students
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0 0" }}>
              {students.length} archived {students.length === 1 ? 'student' : 'students'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              type="text"
              placeholder="Search by name or school ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <button
            onClick={() => refetch()}
            style={{
              padding: "10px 16px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          Loading archived students...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div style={{
          background: "white",
          borderRadius: 16,
          padding: 60,
          textAlign: "center",
          border: "1px solid #e5e7eb",
        }}>
          <Archive size={64} style={{ color: "#d1d5db", margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1f2937", marginBottom: 8 }}>
            {searchTerm ? "No students found" : "No archived students"}
          </h3>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            {searchTerm 
              ? "Try adjusting your search term" 
              : "Archived students will appear here"}
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
        }}>
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 20,
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                position: "relative",
              }}
            >
              {/* Archived Badge */}
              <div style={{
                position: "absolute",
                top: 16,
                right: 16,
                padding: "4px 10px",
                background: "#fef3c7",
                color: "#92400e",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}>
                <Archive size={12} />
                ARCHIVED
              </div>

              {/* Student Info */}
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "#f3f4f6",
                  flexShrink: 0,
                  border: "2px solid #e5e7eb",
                }}>
                  {student.profile_photo ? (
                    <img
                      src={student.profile_photo}
                      alt={`${student.first_name} ${student.last_name}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, #6b7280, #4b5563)",
                      color: "white",
                      fontSize: 20,
                      fontWeight: 700,
                    }}>
                      {student.first_name[0]}{student.last_name[0]}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1f2937",
                    marginBottom: 4,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {student.last_name}, {student.first_name} {student.middle_name?.[0]}.
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>
                    {student.school_id}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    {student.student_level} · {student.grade_level} · {student.section}
                  </div>
                </div>
              </div>

              {/* Parent Email */}
              <div style={{
                fontSize: 11,
                color: "#6b7280",
                marginBottom: 16,
                padding: 8,
                background: "#f9fafb",
                borderRadius: 6,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                📧 {student.parent_email}
              </div>

              {/* Restore Button */}
              <button
                onClick={() => handleRestore(student)}
                disabled={restoring === student.id}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: restoring === student.id ? "#d1d5db" : "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  cursor: restoring === student.id ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {restoring === student.id ? (
                  <>
                    <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
                    Restoring...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Restore Student
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
