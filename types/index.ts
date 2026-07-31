export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
}

export type StudentLevel = 'Elementary' | 'Junior High School' | 'Senior High School' | 'College';
export type StudentStatus = 'Active' | 'Inactive';

export interface Student {
  id: string;
  rfid_tag_uid: string;
  name: string;
  email?: string;
  student_level: StudentLevel;
  grade_level: string;
  section: string;
  course?: string;
  status: StudentStatus;
  profile_photo?: string;
  signature?: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentOptions {
  student_levels: StudentLevel[];
  grade_levels: Record<StudentLevel, string[]>;
  college_courses: Record<string, string[]>;
}

export type AttendanceStatus = 'IN' | 'OUT';

export interface AttendanceLog {
  id: string;
  student_id: string;
  status: AttendanceStatus;
  scan_time: string;
  createdAt?: string;
}

export interface AttendanceLogWithStudent extends AttendanceLog {
  Student: Student;
}

export interface AttendanceStats {
  presentCount: number;
  absentCount: number;
  onTimeCount: number;
  lateCount: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type ApiResponseType<T> = ApiResponse<T> | ApiErrorResponse;

export interface LoginResponse {
  token: string;
  user: User;
}

export interface StudentFormInput {
  rfid_tag_uid: string;
  name: string;
  email?: string;
  student_level: StudentLevel;
  grade_level: string;
  section: string;
  course?: string;
  status?: StudentStatus;
  profile_photo?: string;
  signature?: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
}

export interface RegisterFormInput {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'staff';
}

export interface LoginFormInput {
  email: string;
  password: string;
}
