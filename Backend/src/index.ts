import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import schoolRoutes from './routes/schoolRoutes';
import studentRoutes from './routes/studentRoutes';
import teacherRoutes from './routes/teacherRoutes';
import classRoutes from './routes/classRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import examRoutes from './routes/examRoutes';
import feeRoutes from './routes/feeRoutes';
import parentRoutes from './routes/parentRoutes';
import noticeRoutes from './routes/noticeRoutes';
import calendarRoutes from './routes/calendarRoutes';
import reportRoutes from './routes/reportRoutes';
import subjectRoutes from './routes/subjectRoutes';
import settingsRoutes from './routes/settingsRoutes';

const app = express();

const PORT = Number(process.env.PORT) || 5001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  'https://school-os-orpin.vercel.app',
];

const corsOptions: cors.CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth', authRoutes);

app.use('/api', apiLimiter);

app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SchoolOS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SchoolOS Backend API is running',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);

    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  }
);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
