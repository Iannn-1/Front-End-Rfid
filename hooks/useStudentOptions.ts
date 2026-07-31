import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, StudentOptions } from '@/types';

/**
 * Fetches valid student levels, grade options, and college courses
 * from GET /api/v1/students/meta/options.
 *
 * Call this once when the Add/Edit Student form mounts to populate
 * all dropdowns dynamically.
 */
export function useStudentOptions() {
  return useQuery<StudentOptions, Error>({
    queryKey: ['student-options'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<StudentOptions>>('/students/meta/options');
      return res.data.data;
    },
    // Options rarely change — cache for the session
    staleTime: Infinity,
  });
}
