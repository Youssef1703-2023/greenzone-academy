import type { RequestHandler } from 'express';
import { AdminService } from './admin.service.js';

const admin = new AdminService();

function routeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export const getAdminOverview = asyncHandler(async (_req, res) => {
  res.json(await admin.getOverview());
});

export const getAdminHealth = asyncHandler(async (_req, res) => {
  res.json({
    ...admin.getHealth(),
    translations: await admin.getContentHealth(),
  });
});

export const listCourses = asyncHandler(async (_req, res) => {
  res.json(await admin.listCourses());
});

export const createCourse = asyncHandler(async (req, res) => {
  res.status(201).json(await admin.saveCourse(req.body));
});

export const updateCourse = asyncHandler(async (req, res) => {
  res.json(await admin.saveCourse(req.body, routeParam(req.params.id)));
});

export const deleteCourse = asyncHandler(async (req, res) => {
  res.json(await admin.deleteCourse(routeParam(req.params.id) || ''));
});

export const listPhases = asyncHandler(async (_req, res) => {
  res.json(await admin.listPhases());
});

export const createPhase = asyncHandler(async (req, res) => {
  res.status(201).json(await admin.savePhase(req.body));
});

export const updatePhase = asyncHandler(async (req, res) => {
  res.json(await admin.savePhase(req.body, routeParam(req.params.id)));
});

export const deletePhase = asyncHandler(async (req, res) => {
  res.json(await admin.deletePhase(routeParam(req.params.id) || ''));
});

export const listLessons = asyncHandler(async (_req, res) => {
  res.json(await admin.listLessons());
});

export const createLesson = asyncHandler(async (req, res) => {
  res.status(201).json(await admin.saveLesson(req.body));
});

export const updateLesson = asyncHandler(async (req, res) => {
  res.json(await admin.saveLesson(req.body, routeParam(req.params.id)));
});

export const deleteLesson = asyncHandler(async (req, res) => {
  res.json(await admin.deleteLesson(routeParam(req.params.id) || ''));
});

export const listQuizzes = asyncHandler(async (_req, res) => {
  res.json(await admin.listQuizzes());
});

export const createQuiz = asyncHandler(async (req, res) => {
  res.status(201).json(await admin.saveQuiz(req.body));
});

export const updateQuiz = asyncHandler(async (req, res) => {
  res.json(await admin.saveQuiz(req.body, routeParam(req.params.id)));
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  res.json(await admin.deleteQuiz(routeParam(req.params.id) || ''));
});

export const listStudents = asyncHandler(async (_req, res) => {
  res.json(await admin.listStudents());
});

export const createStudent = asyncHandler(async (req, res) => {
  res.status(201).json(await admin.saveStudent(req.body));
});

export const updateStudent = asyncHandler(async (req, res) => {
  res.json(await admin.saveStudent(req.body, routeParam(req.params.id)));
});

export const updateStudentStatus = asyncHandler(async (req, res) => {
  res.json(await admin.setStudentStatus(routeParam(req.params.id) || '', req.body.status));
});

export const resetStudentProgress = asyncHandler(async (req, res) => {
  res.json(await admin.resetStudentProgress(routeParam(req.params.id) || ''));
});

export const listScores = asyncHandler(async (_req, res) => {
  res.json(await admin.listScores());
});

export const listTranslations = asyncHandler(async (_req, res) => {
  res.json(await admin.listTranslations());
});

export const reviewTranslation = asyncHandler(async (req, res) => {
  res.json(await admin.markTranslationReviewed(routeParam(req.params.id) || ''));
});

export const listAuditLog = asyncHandler(async (_req, res) => {
  res.json(await admin.getAuditLog());
});

export const getAdminSettings = asyncHandler(async (_req, res) => {
  res.json(await admin.getSettings());
});

export const updateAdminSettings = asyncHandler(async (req, res) => {
  res.json(await admin.saveSettings(req.body));
});
