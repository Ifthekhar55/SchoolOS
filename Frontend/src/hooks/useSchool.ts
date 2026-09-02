import { useSchool as useSchoolContext } from '../contexts/SchoolContext';

export const useSchool = () => {
  const context = useSchoolContext();
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};