import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { getHealth } from './controllers/health.controller.js';
import { apiLimiter } from './middlewares/rateLimit.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import contactRoutes from './routes/contact.routes.js';
import postRoutes from './routes/post.routes.js';
import projectRoutes from './routes/project.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const app = express();

app.set('trust proxy', env.trustProxy);
app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || origin === env.clientUrl);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    maxAge: 86400,
  }),
);

if (env.isDevelopment) {
  app.use(morgan('dev'));
} else if (env.isProduction) {
  app.use(morgan('combined'));
}

app.get('/api/health', getHealth);
app.use(apiLimiter);

app.use('/api/uploads', express.json({ limit: '8mb' }), uploadRoutes);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb', parameterLimit: 100 }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/projects', projectRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
