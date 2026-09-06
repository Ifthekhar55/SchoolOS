import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
}).strict();

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  nameBangla: z.string().trim().max(120).optional(),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1).max(30),
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
  role: z.enum(['school_admin', 'teacher', 'student', 'parent']),
  schoolName: z.string().trim().min(1).max(200).optional(),
}).strict().superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    });
  }

  if (data.role === 'school_admin' && !data.schoolName) {
    ctx.addIssue({
      code: 'custom',
      path: ['schoolName'],
      message: 'School name is required for school admins',
    });
  }
});

export const emptyBodySchema = z.object({}).strict();
