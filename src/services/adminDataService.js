const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ADMIN_BACKEND_UNAVAILABLE = 'Admin backend is unavailable.';

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error?.message || `${ADMIN_BACKEND_UNAVAILABLE} (${response.status})`);
    }

    if (response.status === 204) return null;
    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(ADMIN_BACKEND_UNAVAILABLE, { cause: error });
    }
    throw error;
  }
}

function writeBody(body, method = 'POST') {
  return {
    method,
    body: JSON.stringify(body),
  };
}

export function getCourses() {
  return request('/admin/courses');
}

export function saveCourse(record) {
  return record.id
    ? request(`/admin/courses/${record.id}`, writeBody(record, 'PUT'))
    : request('/admin/courses', writeBody(record));
}

export function deleteCourse(id) {
  return request(`/admin/courses/${id}`, { method: 'DELETE' });
}

export function getPhases() {
  return request('/admin/phases');
}

export function savePhase(record) {
  return record.id
    ? request(`/admin/phases/${record.id}`, writeBody(record, 'PUT'))
    : request('/admin/phases', writeBody(record));
}

export function deletePhase(id) {
  return request(`/admin/phases/${id}`, { method: 'DELETE' });
}

export function getLessons() {
  return request('/admin/lessons');
}

export function saveLesson(record) {
  return record.id
    ? request(`/admin/lessons/${record.id}`, writeBody(record, 'PUT'))
    : request('/admin/lessons', writeBody(record));
}

export function deleteLesson(id) {
  return request(`/admin/lessons/${id}`, { method: 'DELETE' });
}

export function getQuizzes() {
  return request('/admin/quizzes');
}

export function saveQuiz(record) {
  return record.id
    ? request(`/admin/quizzes/${record.id}`, writeBody(record, 'PUT'))
    : request('/admin/quizzes', writeBody(record));
}

export function deleteQuiz(id) {
  return request(`/admin/quizzes/${id}`, { method: 'DELETE' });
}

export function getStudents() {
  return request('/admin/students');
}

export function saveStudent(record) {
  return record.id
    ? request(`/admin/students/${record.id}`, writeBody(record, 'PUT'))
    : request('/admin/students', writeBody(record));
}

export function toggleStudentStatus(student) {
  const status = student.status === 'Disabled' ? 'Active' : 'Disabled';
  return request(`/admin/students/${student.id}/status`, writeBody({ status }, 'PATCH'));
}

export function resetStudentProgress(student) {
  return request(`/admin/students/${student.id}/reset-progress`, writeBody({}));
}

export function getScores() {
  return request('/admin/scores');
}

export function getTranslations() {
  return request('/admin/translations');
}

export function markTranslationReviewed(translation) {
  return request(`/admin/translations/${translation.id}/review`, writeBody({}));
}

export function getAuditLog() {
  return request('/admin/audit-log');
}

export function getAdminSettings() {
  return request('/admin/settings');
}

export function saveAdminSettings(settings) {
  return request('/admin/settings', writeBody(settings, 'PUT'));
}

export function fetchBackendAdminOverview() {
  return request('/admin/overview');
}

export async function getContentHealth() {
  const overview = await fetchBackendAdminOverview();
  return overview.contentHealth || {};
}

export async function getRecentActivity() {
  const overview = await fetchBackendAdminOverview();
  return overview.recentActivity || [];
}

export async function exportPlatformData() {
  const [overview, courses, phases, lessons, quizzes, students, scores, translations, auditLog, settings] = await Promise.all([
    fetchBackendAdminOverview(),
    getCourses(),
    getPhases(),
    getLessons(),
    getQuizzes(),
    getStudents(),
    getScores(),
    getTranslations(),
    getAuditLog(),
    getAdminSettings(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    overview,
    settings,
    courses,
    phases,
    lessons,
    quizzes,
    students,
    scores,
    translations,
    auditLog,
  };
}

export function exportCsv(filename, rows) {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const csvRows = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => {
      const value = row[header] ?? '';
      return `"${String(value).replaceAll('"', '""')}"`;
    }).join(',')),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
