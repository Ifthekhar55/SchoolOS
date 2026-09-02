import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default school
  const defaultSchool = await prisma.school.upsert({
    where: { id: 'default-school' },
    update: {},
    create: {
      id: 'default-school',
      name: 'Demo School',
      nameBangla: 'ডেমো স্কুল',
      type: 'english_medium',
      address: '123 Demo Street',
      city: 'Dhaka',
      district: 'Dhaka',
      division: 'Dhaka',
      phone: '01700000000',
      email: 'demo@school.com',
      subscriptionPlan: 'starter',
      status: 'active',
    },
  });

  console.log('✅ Default school created');

  // Create super admin
  const adminPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@schoolos.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@schoolos.com',
      phone: '01700000000',
      password: adminPassword,
      role: UserRole.super_admin,
      schoolId: defaultSchool.id,
      isActive: true,
      isVerified: true,
    },
  });

  console.log('✅ Super admin created');

  // Create school admin
  const schoolAdminPassword = await bcrypt.hash('password123', 10);
  const schoolAdmin = await prisma.user.upsert({
    where: { email: 'school@demo.com' },
    update: {},
    create: {
      name: 'School Admin',
      email: 'school@demo.com',
      phone: '01711111111',
      password: schoolAdminPassword,
      role: UserRole.school_admin,
      schoolId: defaultSchool.id,
      isActive: true,
      isVerified: true,
    },
  });

  console.log('✅ School admin created');

  // Create teacher
  const teacherPassword = await bcrypt.hash('password123', 10);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@demo.com' },
    update: {},
    create: {
      name: 'Demo Teacher',
      email: 'teacher@demo.com',
      phone: '01722222222',
      password: teacherPassword,
      role: UserRole.teacher,
      schoolId: defaultSchool.id,
      isActive: true,
      isVerified: true,
    },
  });

  console.log('✅ Teacher created');

  // Create student
  const studentPassword = await bcrypt.hash('password123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@demo.com' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'student@demo.com',
      phone: '01733333333',
      password: studentPassword,
      role: UserRole.student,
      schoolId: defaultSchool.id,
      isActive: true,
      isVerified: true,
    },
  });

  console.log('✅ Student created');

  // Create parent
  const parentPassword = await bcrypt.hash('password123', 10);
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@demo.com' },
    update: {},
    create: {
      name: 'Demo Parent',
      email: 'parent@demo.com',
      phone: '01744444444',
      password: parentPassword,
      role: UserRole.parent,
      schoolId: defaultSchool.id,
      isActive: true,
      isVerified: true,
    },
  });

  const parentProfile = await prisma.parent.upsert({
    where: { email: 'parent@demo.com' },
    update: {
      userId: parentUser.id,
      schoolId: defaultSchool.id,
      name: 'Demo Parent',
      phone: '01744444444',
    },
    create: {
      userId: parentUser.id,
      schoolId: defaultSchool.id,
      name: 'Demo Parent',
      email: 'parent@demo.com',
      phone: '01744444444',
    },
  });

  await prisma.student.upsert({
    where: { id: 'demo-parent-child' },
    update: {
      parentId: parentProfile.id,
      schoolId: defaultSchool.id,
      name: 'Demo Student',
      class: 'Grade 5',
      section: 'A',
      rollNumber: 1,
      isActive: true,
    },
    create: {
      id: 'demo-parent-child',
      schoolId: defaultSchool.id,
      parentId: parentProfile.id,
      name: 'Demo Student',
      email: 'student@demo.com',
      phone: '01733333333',
      fatherName: 'Demo Parent',
      motherName: 'Demo Mother',
      class: 'Grade 5',
      section: 'A',
      rollNumber: 1,
      admissionDate: new Date('2026-01-01'),
      gender: 'male',
      address: '123 Demo Street',
      emergencyContact: '01744444444',
      isActive: true,
      isVerified: true,
    },
  });

  console.log('✅ Parent created');

  await prisma.feeStructure.createMany({
    data: [
      { schoolId: defaultSchool.id, name: 'Admission Fee', type: 'admission', amount: 2500, frequency: 'one_time', dueDay: 10, lateFee: 0, lateFeeAfterDays: 10, isRecurring: false, isActive: true },
      { schoolId: defaultSchool.id, name: 'Tuition Fee', type: 'tuition', amount: 2500, frequency: 'monthly', dueDay: 10, lateFee: 100, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
      { schoolId: defaultSchool.id, name: 'Exam Fee', type: 'exam', amount: 1200, frequency: 'half_yearly', dueDay: 10, lateFee: 50, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
      { schoolId: defaultSchool.id, name: 'Transport Fee', type: 'transport', amount: 1800, frequency: 'monthly', dueDay: 10, lateFee: 80, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
      { schoolId: defaultSchool.id, name: 'Library Fee', type: 'library', amount: 500, frequency: 'monthly', dueDay: 10, lateFee: 25, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
      { schoolId: defaultSchool.id, name: 'Lab Fee', type: 'lab', amount: 800, frequency: 'monthly', dueDay: 10, lateFee: 40, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
      { schoolId: defaultSchool.id, name: 'Sports Fee', type: 'sports', amount: 600, frequency: 'monthly', dueDay: 10, lateFee: 30, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
      { schoolId: defaultSchool.id, name: 'Development Fee', type: 'development', amount: 1000, frequency: 'yearly', dueDay: 10, lateFee: 50, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
      { schoolId: defaultSchool.id, name: 'Other Fees', type: 'other', amount: 300, frequency: 'monthly', dueDay: 10, lateFee: 20, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Default fee structures created');

  console.log('🎉 Database seeding completed!');
  console.log('📋 Demo Credentials:');
  console.log('  Super Admin: admin@schoolos.com / password123');
  console.log('  School Admin: school@demo.com / password123');
  console.log('  Teacher: teacher@demo.com / password123');
  console.log('  Student: student@demo.com / password123');
  console.log('  Parent: parent@demo.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });