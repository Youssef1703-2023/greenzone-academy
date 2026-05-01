import type { RequestHandler } from 'express';
import { LessonService } from '../lessons/lesson.service.js';

const lessonService = new LessonService();

export const translateLesson: RequestHandler = async (req, res, next) => {
  try {
    const { lessonId } = req.params as { lessonId: string };
    const { targetLang, forceRefresh } = req.body as { targetLang: string; forceRefresh: boolean };

    const response = await lessonService.translateLesson(lessonId, targetLang, forceRefresh);
    res.json(response);
  } catch (error) {
    next(error);
  }
};
