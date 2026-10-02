import { Student } from '@/types';

/**
 * Get the full name of a student in "Last, First Middle" format
 * Supports backward compatibility with old 'name' field
 */
export function getStudentFullName(student: Student | null | undefined): string {
  if (!student) return '';
  
  // Use old name field if it exists (backward compatibility)
  if (student.name) {
    return student.name;
  }
  
  // Otherwise construct from new fields
  const { first_name, last_name, middle_name } = student;
  return `${last_name}, ${first_name}${middle_name ? ' ' + middle_name : ''}`;
}

/**
 * Get initials from student name (for avatars)
 */
export function getStudentInitials(student: Student | null | undefined): string {
  if (!student) return '?';
  
  // Use old name field if it exists
  if (student.name) {
    return student.name
      .split(' ')
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
  
  // Otherwise use first and last name initials
  const { first_name, last_name } = student;
  return `${first_name[0] || ''}${last_name[0] || ''}`.toUpperCase();
}
