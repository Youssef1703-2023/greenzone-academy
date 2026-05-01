import type { RequestHandler } from 'express';
import { LessonService } from './lesson.service.js';

const lessonService = new LessonService();

export const getLessonContent: RequestHandler = async (req, res, next) => {
  try {
    const { courseSlug, phaseId, lessonId } = req.params as {
      courseSlug: string;
      phaseId: string;
      lessonId: string;
    };
    const lang = typeof req.query.lang === 'string' ? req.query.lang : 'en';

    const response = await lessonService.getLessonContent(courseSlug, Number(phaseId), Number(lessonId), lang);
    res.json(response);
  } catch (error) {
    next(error);
  }
};
