import { Router } from 'express';
import { getAdminStats } from './course.controller.js';

export const courseRoutes = Router();

courseRoutes.get('/admin/stats', getAdminStats);
