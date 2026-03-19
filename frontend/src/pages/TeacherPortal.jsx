import { useState } from 'react';
import { TeacherLogin, BehaviorRatingForm } from '../components/teacher';

/**
 * TeacherPortal - Main portal for teacher users
 * Implements two-step flow: Login → Rating Form
 * Preserves exact layout and functionality from original TeacherLoginView and TeacherFormView
 * 
 * @param {Object} props - Component props
 * @param {Array} props.teachers - Array of teacher objects
 * @param {Array} props.expectations - Array of school expectation objects
 * @param {Array} props.children - Array of child objects (students assigned to selected teacher)
 * @param {Function} props.onSubmitReport - Callback when behavior report is submitted
 * @param {Array} props.teacherReports - All teacher reports (for checking who submitted today)
 * @param {Array} props.teachersPendingToday - Array of teacher IDs who haven't submitted today
 * @param {string} props.today - Today's date string
 * @param {string} props.todayKey - Today's date key for tracking
 */
export default function TeacherPortal({
  teachers = [],
  expectations = [],
  children = [],
  onSubmitReport,
  teacherReports = [],
  teachersPendingToday = [],
  today,
  todayKey,
}) {
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const handleLogin = (teacher) => {
    setSelectedTeacher(teacher);
  };

  const handleLogout = () => {
    setSelectedTeacher(null);
  };

  const handleSubmitReport = async (report) => {
    await onSubmitReport(report);
    // After successful submission, return to login screen
    // This allows teacher to submit for another child if needed
    setSelectedTeacher(null);
  };

  // Step 1: Teacher Login
  if (!selectedTeacher) {
    return (
      <TeacherLogin
        teachers={teachers}
        onLogin={handleLogin}
        teachersPendingToday={teachersPendingToday}
      />
    );
  }

  // Step 2: Behavior Rating Form
  return (
    <BehaviorRatingForm
      teacher={selectedTeacher}
      expectations={expectations}
      children={children}
      onSubmit={handleSubmitReport}
      onLogout={handleLogout}
    />
  );
}
