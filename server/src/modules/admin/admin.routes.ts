import { Router } from 'express';
import {
  createCourse,
  createLesson,
  createPhase,
  createQuiz,
  createStudent,
  deleteCourse,
  deleteLesson,
  deletePhase,
  deleteQuiz,
  getAdminHealth,
  getAdminOverview,
  getAdminSettings,
  listAuditLog,
  listCourses,
  listLessons,
  listPhases,
  listQuizzes,
  listScores,
  listStudents,
  listTranslations,
  resetStudentProgress,
  reviewTranslation,
  updateAdminSettings,
  updateCourse,
  updateLesson,
  updatePhase,
  updateQuiz,
  updateStudent,
  updateStudentStatus,
} from './admin.controller.js';

export const adminRoutes = Router();

adminRoutes.get('/admin/overview', getAdminOverview);
adminRoutes.get('/admin/health', getAdminHealth);

adminRoutes.get('/admin/courses', listCourses);
adminRoutes.post('/admin/courses', createCourse);
adminRoutes.put('/admin/courses/:id', updateCourse);
adminRoutes.delete('/admin/courses/:id', deleteCourse);

adminRoutes.get('/admin/phases', listPhases);
adminRoutes.post('/admin/phases', createPhase);
adminRoutes.put('/admin/phases/:id', updatePhase);
adminRoutes.delete('/admin/phases/:id', deletePhase);

adminRoutes.get('/admin/lessons', listLessons);
adminRoutes.post('/admin/lessons', createLesson);
adminRoutes.put('/admin/lessons/:id', updateLesson);
adminRoutes.delete('/admin/lessons/:id', deleteLesson);

adminRoutes.get('/admin/quizzes', listQuizzes);
adminRoutes.post('/admin/quizzes', createQuiz);
adminRoutes.put('/admin/quizzes/:id', updateQuiz);
adminRoutes.delete('/admin/quizzes/:id', deleteQuiz);

adminRoutes.get('/admin/students', listStudents);
adminRoutes.post('/admin/students', createStudent);
adminRoutes.put('/admin/students/:id', updateStudent);
adminRoutes.patch('/admin/students/:id/status', updateStudentStatus);
adminRoutes.post('/admin/students/:id/reset-progress', resetStudentProgress);

adminRoutes.get('/admin/scores', listScores);
adminRoutes.get('/admin/translations', listTranslations);
adminRoutes.post('/admin/translations/:id/review', reviewTranslation);
adminRoutes.get('/admin/audit-log', listAuditLog);
adminRoutes.get('/admin/settings', getAdminSettings);
adminRoutes.put('/admin/settings', updateAdminSettings);
