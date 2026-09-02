import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken, generateRefreshToken } from '../config/jwt';
import { UserRole } from '@prisma/client';

export class AuthService {
  async login(email: string, password: string) {
    // Find user with school
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        school: true,
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Your account has been deactivated. Please contact administrator.');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    };

    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Get permissions based on role
    const permissions = this.getRolePermissions(user.role);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        nameBangla: user.nameBangla,
        email: user.email,
        phone: user.phone,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: user.school.name,
        isActive: user.isActive,
        isVerified: user.isVerified,
        lastLoginAt: user.lastLoginAt,
        avatar: user.avatar,
        permissions,
      },
    };
  }

  async register(data: any) {
    const {
      name,
      nameBangla,
      email,
      phone,
      password,
      role,
      schoolName,
    } = data;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let schoolId: string;

    if (role === 'school_admin') {
      // Create school for school admin
      const school = await prisma.school.create({
        data: {
          name: schoolName,
          phone: phone,
          email: normalizedEmail,
          address: '',
          city: '',
          district: '',
          division: '',
          type: 'english_medium',
          subscriptionPlan: 'starter',
          status: 'active',
        },
      });
      schoolId = school.id;
    } else {
      // For other roles, school_id must be provided
      throw new Error('School ID is required for this role');
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        nameBangla,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        role,
        schoolId,
        isActive: true,
        isVerified: true,
      },
      include: {
        school: true,
      },
    });

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    };

    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const permissions = this.getRolePermissions(user.role);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        nameBangla: user.nameBangla,
        email: user.email,
        phone: user.phone,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: user.school.name,
        isActive: user.isActive,
        isVerified: user.isVerified,
        lastLoginAt: user.lastLoginAt,
        avatar: user.avatar,
        permissions,
      },
    };
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async refreshToken(refreshToken: string) {
    const user = await prisma.user.findFirst({
      where: { refreshToken },
      include: { school: true },
    });

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    };

    const newToken = generateToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const permissions = this.getRolePermissions(user.role);

    return {
      id: user.id,
      name: user.name,
      nameBangla: user.nameBangla,
      email: user.email,
      phone: user.phone,
      role: user.role,
      schoolId: user.schoolId,
      schoolName: user.school.name,
      isActive: user.isActive,
      isVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt,
      avatar: user.avatar,
      permissions,
    };
  }

  private getRolePermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      super_admin: [
        'users_view', 'users_create', 'users_edit', 'users_delete',
        'users_activate', 'users_deactivate', 'users_assign_role',
        'students_view', 'students_create', 'students_edit', 'students_delete', 'students_import',
        'teachers_view', 'teachers_create', 'teachers_edit', 'teachers_delete',
        'classes_view', 'classes_create', 'classes_edit', 'classes_delete',
        'subjects_view', 'subjects_create', 'subjects_edit', 'subjects_delete',
        'attendance_view', 'attendance_mark', 'attendance_report',
        'exams_view', 'exams_create', 'exams_edit', 'exams_delete',
        'results_view', 'results_enter', 'results_publish',
        'fees_view', 'fees_create', 'fees_edit', 'fees_delete', 'fees_collect', 'fees_report',
        'settings_view', 'settings_edit',
        'reports_view', 'reports_create', 'reports_export',
        'system_manage',
      ],
      school_admin: [
        'users_view', 'users_create', 'users_edit', 'users_activate', 'users_deactivate', 'users_assign_role',
        'students_view', 'students_create', 'students_edit', 'students_delete', 'students_import',
        'teachers_view', 'teachers_create', 'teachers_edit', 'teachers_delete',
        'classes_view', 'classes_create', 'classes_edit', 'classes_delete',
        'subjects_view', 'subjects_create', 'subjects_edit', 'subjects_delete',
        'attendance_view', 'attendance_mark', 'attendance_report',
        'exams_view', 'exams_create', 'exams_edit', 'exams_delete',
        'results_view', 'results_enter', 'results_publish',
        'fees_view', 'fees_create', 'fees_edit', 'fees_delete', 'fees_collect', 'fees_report',
        'settings_view', 'settings_edit',
        'reports_view', 'reports_create', 'reports_export',
      ],
      principal: [
        'users_view',
        'students_view',
        'teachers_view',
        'classes_view',
        'subjects_view',
        'attendance_view', 'attendance_report',
        'exams_view',
        'results_view', 'results_publish',
        'fees_view', 'fees_report',
        'reports_view', 'reports_export',
      ],
      teacher: [
        'students_view',
        'teachers_view',
        'classes_view',
        'subjects_view',
        'attendance_view', 'attendance_mark',
        'exams_view',
        'results_view', 'results_enter',
      ],
      student: [
        'students_view',
        'classes_view',
        'subjects_view',
        'attendance_view',
        'exams_view',
        'results_view',
        'fees_view',
      ],
      parent: [
        'students_view',
        'attendance_view',
        'exams_view',
        'results_view',
        'fees_view',
      ],
      accountant: [
        'students_view',
        'fees_view', 'fees_create', 'fees_edit', 'fees_delete', 'fees_collect', 'fees_report',
        'reports_view', 'reports_create', 'reports_export',
      ],
      librarian: [
        'students_view',
        'teachers_view',
      ],
      transport_manager: [
        'students_view',
        'teachers_view',
      ],
      hr_manager: [
        'users_view', 'users_create', 'users_edit',
        'teachers_view', 'teachers_create', 'teachers_edit',
      ],
    };

    return permissions[role] || [];
  }
}

export default new AuthService();