export interface SchoolProfile {
  id: string;
  name: string;
  nameBangla?: string;
  type: 'english_medium' | 'bangla_medium' | 'kindergarten' | 'coaching' | 'college';
  address: string;
  city: string;
  district: string;
  division: string;
  postCode?: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  establishedYear?: number;
  subscriptionPlan: 'starter' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'trial';
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicSettings {
  academicYearId: string;
  academicYearName: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  sessionName: string;
  termStructure: Term[];
}

export interface Term {
  id: string;
  name: string;
  nameBangla?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface FeeSettings {
  currency: string;
  currencySymbol: string;
  lateFeeEnabled: boolean;
  lateFeeAmount: number;
  lateFeeAfterDays: number;
  paymentMethods: string[];
  onlinePaymentEnabled: boolean;
  paymentGateways: {
    bkash: boolean;
    nagad: boolean;
    sslcommerz: boolean;
  };
}

export interface GradeSettings {
  system: 'letter' | 'gpa' | 'percentage' | 'cgpa';
  grades: Grade[];
  passingPercentage: number;
  gradePointScale: number;
}

export interface Grade {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gradePoint: number;
  description?: string;
  isPassing: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  attendanceAlerts: boolean;
  feeReminders: boolean;
  examReminders: boolean;
  eventReminders: boolean;
  noticeAlerts: boolean;
  parentCommunication: boolean;
}

export interface SystemSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: 'en' | 'bn';
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number;
}

export interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string;
  retentionDays: number;
  lastBackup?: Date;
  backupSize?: string;
}

export interface SettingsResponse {
  school: SchoolProfile;
  academic: AcademicSettings;
  fees: FeeSettings;
  grades: GradeSettings;
  notifications: NotificationSettings;
  system: SystemSettings;
  backup: BackupSettings;
}