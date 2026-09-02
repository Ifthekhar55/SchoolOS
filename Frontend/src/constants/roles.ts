import { Role, UserRole } from '../types/user';

export const ROLE_DEFINITIONS: Record<UserRole, Omit<Role, 'id' | 'createdAt' | 'updatedAt'>> = {
  super_admin: {
    name: 'super_admin',
    displayName: 'Super Admin',
    displayNameBangla: 'সুপার অ্যাডমিন',
    description: 'Full system access across all schools',
    isSystemRole: true,
    permissions: [
      'users:view', 'users:create', 'users:edit', 'users:delete',
      'users:activate', 'users:deactivate', 'users:assign_role',
      'students:view', 'students:create', 'students:edit', 'students:delete', 'students:import',
      'teachers:view', 'teachers:create', 'teachers:edit', 'teachers:delete',
      'classes:view', 'classes:create', 'classes:edit', 'classes:delete',
      'subjects:view', 'subjects:create', 'subjects:edit', 'subjects:delete',
      'attendance:view', 'attendance:mark', 'attendance:report',
      'exams:view', 'exams:create', 'exams:edit', 'exams:delete',
      'results:view', 'results:enter', 'results:publish',
      'fees:view', 'fees:create', 'fees:edit', 'fees:delete', 'fees:collect', 'fees:report',
      'settings:view', 'settings:edit',
      'reports:view', 'reports:create', 'reports:export',
      'system:manage',
    ],
  },
  school_admin: {
    name: 'school_admin',
    displayName: 'School Admin',
    displayNameBangla: 'স্কুল অ্যাডমিন',
    description: 'Full access to a single school',
    isSystemRole: true,
    permissions: [
      'users:view', 'users:create', 'users:edit', 'users:delete', 'users:activate', 'users:deactivate', 'users:assign_role',
      'students:view', 'students:create', 'students:edit', 'students:delete', 'students:import',
      'teachers:view', 'teachers:create', 'teachers:edit', 'teachers:delete',
      'classes:view', 'classes:create', 'classes:edit', 'classes:delete',
      'subjects:view', 'subjects:create', 'subjects:edit', 'subjects:delete',
      'attendance:view', 'attendance:mark', 'attendance:report',
      'exams:view', 'exams:create', 'exams:edit', 'exams:delete',
      'results:view', 'results:enter', 'results:publish',
      'fees:view', 'fees:create', 'fees:edit', 'fees:delete', 'fees:collect', 'fees:report',
      'settings:view', 'settings:edit',
      'reports:view', 'reports:create', 'reports:export',
      'notices:view', 'notices:create', 'notices:edit', 'notices:publish', 'notices:archive', 'notices:delete',
    ],
  },
  principal: {
    name: 'principal',
    displayName: 'Principal',
    displayNameBangla: 'প্রধান শিক্ষক',
    description: 'School leadership with limited admin access',
    isSystemRole: true,
    permissions: [
      'users:view',
      'students:view',
      'teachers:view',
      'classes:view',
      'subjects:view',
      'attendance:view', 'attendance:report',
      'exams:view',
      'results:view', 'results:publish',
      'fees:view', 'fees:report',
      'reports:view', 'reports:export',
      'notices:view', 'notices:create', 'notices:edit', 'notices:publish', 'notices:archive', 'notices:delete',
      'notices:view', 'notices:create', 'notices:edit', 'notices:publish', 'notices:archive', 'notices:delete',
      'notices:view', 'notices:create', 'notices:edit', 'notices:publish',
    ],
  },
  teacher: {
    name: 'teacher',
    displayName: 'Teacher',
    displayNameBangla: 'শিক্ষক',
    description: 'Classroom teacher with academic permissions',
    isSystemRole: true,
    permissions: [
      'students:view',
      'teachers:view',
      'classes:view',
      'subjects:view',
      'attendance:view', 'attendance:mark',
      'exams:view',
      'results:view', 'results:enter',
      'notices:view', 'notices:create', 'notices:edit',
    ],
  },
  student: {
    name: 'student',
    displayName: 'Student',
    displayNameBangla: 'শিক্ষার্থী',
    description: 'Student portal access',
    isSystemRole: true,
    permissions: [
      'students:view',
      'classes:view',
      'subjects:view',
      'attendance:view',
      'exams:view',
      'results:view',
      'fees:view',
    ],
  },
  parent: {
    name: 'parent',
    displayName: 'Parent',
    displayNameBangla: 'অভিভাবক',
    description: 'Parent portal to monitor children',
    isSystemRole: true,
    permissions: [
      'students:view',
      'attendance:view',
      'exams:view',
      'results:view',
      'fees:view',
    ],
  },
  accountant: {
    name: 'accountant',
    displayName: 'Accountant',
    displayNameBangla: 'হিসাবরক্ষক',
    description: 'Fee and finance management',
    isSystemRole: true,
    permissions: [
      'students:view',
      'fees:view', 'fees:create', 'fees:edit', 'fees:delete', 'fees:collect', 'fees:report',
      'reports:view', 'reports:create', 'reports:export',
    ],
  },
  librarian: {
    name: 'librarian',
    displayName: 'Librarian',
    displayNameBangla: 'গ্রন্থাগারিক',
    description: 'Library management',
    isSystemRole: true,
    permissions: [
      'students:view',
      'teachers:view',
    ],
  },
  transport_manager: {
    name: 'transport_manager',
    displayName: 'Transport Manager',
    displayNameBangla: 'পরিবহন ব্যবস্থাপক',
    description: 'Transport and bus tracking',
    isSystemRole: true,
    permissions: [
      'students:view',
      'teachers:view',
    ],
  },
  hr_manager: {
    name: 'hr_manager',
    displayName: 'HR Manager',
    displayNameBangla: 'এইচআর ব্যবস্থাপক',
    description: 'Staff and HR management',
    isSystemRole: true,
    permissions: [
      'users:view', 'users:create', 'users:edit',
      'teachers:view', 'teachers:create', 'teachers:edit',
    ],
  },
};

export const ROLE_OPTIONS = Object.entries(ROLE_DEFINITIONS).map(([key, value]) => ({
  value: key as UserRole,
  label: value.displayName,
  labelBangla: value.displayNameBangla,
  description: value.description,
}));

export const PERMISSION_GROUPS = {
  'User Management': [
    'users:view', 'users:create', 'users:edit', 'users:delete',
    'users:activate', 'users:deactivate', 'users:assign_role',
  ],
  'Student Management': [
    'students:view', 'students:create', 'students:edit', 'students:delete', 'students:import',
  ],
  'Teacher Management': [
    'teachers:view', 'teachers:create', 'teachers:edit', 'teachers:delete',
  ],
  'Academic Management': [
    'classes:view', 'classes:create', 'classes:edit', 'classes:delete',
    'subjects:view', 'subjects:create', 'subjects:edit', 'subjects:delete',
  ],
  'Attendance': [
    'attendance:view', 'attendance:mark', 'attendance:report',
  ],
  'Exams & Results': [
    'exams:view', 'exams:create', 'exams:edit', 'exams:delete',
    'results:view', 'results:enter', 'results:publish',
  ],
  'Fee Management': [
    'fees:view', 'fees:create', 'fees:edit', 'fees:delete', 'fees:collect', 'fees:report',
  ],
  'Settings': [
    'settings:view', 'settings:edit',
  ],
  'Reports': [
    'reports:view', 'reports:create', 'reports:export',
  ],
  'System': [
    'system:manage',
  ],
};