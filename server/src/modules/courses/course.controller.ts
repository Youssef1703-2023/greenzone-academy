import type { RequestHandler } from 'express';
import { CourseRepository } from './course.repository.js';

const courses = new CourseRepository();

export const getAdminStats: RequestHandler = async (_req, res, next) => {
  try {
    res.json(await courses.getAdminStats());
  } catch (error) {
    next(error);
  }
};
