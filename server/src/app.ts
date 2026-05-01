import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { courseRoutes } from './modules/courses/course.routes.js';
import { lessonRoutes } from './modules/lessons/lesson.routes.js';
import { translationRoutes } from './modules/translations/translation.routes.js';

export const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '200kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', lessonRoutes);
app.use('/api', translationRoutes);
app.use('/api', adminRoutes);
app.use('/api', courseRoutes);

app.use(errorHandler);
