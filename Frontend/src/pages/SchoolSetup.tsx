import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { SchoolSetupWizard } from '../components/school/SchoolSetupWizard';
import { schoolApi } from '../services/schoolApi';

export const SchoolSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { schoolId } = useParams();
  const initialEditSchool = (location.state as { editSchool?: any } | null)?.editSchool;
  const [fullSchoolData, setFullSchoolData] = useState<any>(initialEditSchool || null);

  useEffect(() => {
    const loadFullSchool = async () => {
      const schoolIdToLoad = initialEditSchool?.id || schoolId;
      if (!schoolIdToLoad) return;

      try {
        const school = await schoolApi.getSchool(schoolIdToLoad);
        setFullSchoolData(school);
      } catch (error) {
        console.error('Failed to load full school details:', error);
      }
    };

    loadFullSchool();
  }, [initialEditSchool, schoolId]);

  const editSchool = fullSchoolData || initialEditSchool;
  const adminUser = Array.isArray(editSchool?.users) ? editSchool.users.find((user: any) => user.role === 'school_admin') : null;
  const academicYear = Array.isArray(editSchool?.academicYears) && editSchool.academicYears.length > 0 ? editSchool.academicYears[0] : null;
  const classesFromSchool = Array.isArray(editSchool?.academicYears)
    ? editSchool.academicYears.flatMap((year: any) => (Array.isArray(year.classes) ? year.classes : []))
    : Array.isArray(editSchool?.classes)
      ? editSchool.classes
      : [];

  const mappedClasses = classesFromSchool.map((entry: any) => ({
    name: entry.name || '',
    nameBangla: entry.nameBangla || '',
    sections: Array.isArray(entry.sections)
      ? entry.sections
          .map((section: any) => (typeof section === 'string' ? section : section?.name))
          .filter(Boolean)
      : ['A'],
    subjects: Array.isArray(entry.classSubjects)
      ? entry.classSubjects
          .map((classSubject: any) => classSubject?.subject?.name || classSubject?.name || '')
          .filter(Boolean)
      : Array.isArray(entry.subjects)
        ? entry.subjects
            .map((subject: any) => (typeof subject === 'string' ? subject : subject?.name))
            .filter(Boolean)
        : [],
  }));

  const initialData = editSchool
    ? {
        schoolName: editSchool.name || '',
        schoolNameBangla: editSchool.nameBangla || '',
        schoolType: editSchool.type || 'english_medium',
        establishedYear: editSchool.establishedYear || new Date().getFullYear(),
        address: editSchool.address || '',
        city: editSchool.city || '',
        district: editSchool.district || '',
        division: editSchool.division || '',
        postCode: editSchool.postCode || '',
        phone: editSchool.phone || '',
        email: editSchool.email || '',
        website: editSchool.website || '',
        academicYearStart: academicYear?.startDate ? new Date(academicYear.startDate) : undefined,
        academicYearEnd: academicYear?.endDate ? new Date(academicYear.endDate) : undefined,
        classes: mappedClasses,
        adminName: adminUser?.name || '',
        adminEmail: adminUser?.email || '',
        adminPhone: adminUser?.phone || '',
        adminPassword: '',
        adminConfirmPassword: '',
      }
    : undefined;

  const handleComplete = () => {
    navigate(editSchool ? '/schools' : '/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SchoolSetupWizard
        onComplete={handleComplete}
        initialData={initialData}
        mode={editSchool ? 'edit' : 'create'}
        schoolId={editSchool?.id}
      />
    </div>
  );
};