```ts
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

// =====================================================
// Allowed Origins
// =====================================================

const allowedOrigins = [
  // Local development
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',

  // Production frontend
  'https://school-os-orpin.vercel.app',
];

// =====================================================
// CORS Configuration
// =====================================================

const corsOptions: cors.CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests without an Origin header
    // (Postman, server-to-server requests, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    console.log(`❌ CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],

  exposedHeaders: [
    'Set-Cookie',
  ],

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options('*', cors(corsOptions));

// =====================================================
// Security Middleware
// =====================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

// =====================================================
// Body Parsing
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// Rate Limiting
// =====================================================

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

// =====================================================
// Routes
// =====================================================

// Authentication
app.use('/api/auth/login', authLimiter);
app.use('/api/auth', authRoutes);

// General API rate limit
app.use('/api', apiLimiter);

// Users
app.use('/api/users', userRoutes);

// Schools
app.use('/api/schools', schoolRoutes);

// Students
app.use('/api/students', studentRoutes);

// Teachers
app.use('/api/teachers', teacherRoutes);

// Classes
app.use('/api/classes', classRoutes);

// Attendance
app.use('/api/attendance', attendanceRoutes);

// Exams
app.use('/api/exams', examRoutes);

// Fees
app.use('/api/fees', feeRoutes);

// Parents
app.use('/api/parent', parentRoutes);

// Notices
app.use('/api/notices', noticeRoutes);

// Calendar
app.use('/api/calendar', calendarRoutes);

// Reports
app.use('/api/reports', reportRoutes);

// Subjects
app.use('/api/subjects', subjectRoutes);

// Settings
app.use('/api/settings', settingsRoutes);

// =====================================================
// Health Check
// =====================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SchoolOS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// =====================================================
// Root Route
// =====================================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SchoolOS Backend API is running',
  });
});

// =====================================================
// 404 Handler
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// =====================================================
// Error Handling
// =====================================================

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('❌ Unhandled error:', err);

    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  }
);

// =====================================================
// Start Server
// =====================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 CORS enabled for:`);
  allowedOrigins.forEach((origin) => {
    console.log(`   ✓ ${origin}`);
  });
});

export default app;
```
