import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AttendanceLogWithStudent, ApiResponse } from '@/types';

const fetchAttendance = async (): Promise<AttendanceLogWithStudent[]> => {
  const response = await api.get<ApiResponse<AttendanceLogWithStudent[]>>('/dashboard/attendance');
  return response.data?.data || [];
};

export const useAttendance = (refetchInterval = 1000) => {
  return useQuery<AttendanceLogWithStudent[], Error>({
    queryKey: ['attendance', 'today'],
    queryFn: fetchAttendance,
    refetchInterval, // Fast 1-second polling for immediate response on RFID tap
    retry: 3,
  });
};
