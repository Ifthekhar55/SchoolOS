import React, { createContext, useState, useContext, useEffect } from 'react';
import { School, SchoolContextType, SchoolSetupData } from '../types/school';
import { schoolApi } from '../services/schoolApi';
import { useAuth } from '../hooks/useAuth';

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && token) {
      loadSchools();
    } else {
      setIsLoading(false);
    }
  }, [user, token]);

  const loadSchools = async () => {
    try {
      setIsLoading(true);
      const data = await schoolApi.getSchools();
      const schoolsArray: School[] = data;
      
      setSchools(schoolsArray);
      
      // If user has a schoolId and no current school is set
      if (user?.schoolId && !currentSchool) {
        const school = schoolsArray.find(s => s.id === user.schoolId);
        if (school) {
          setCurrentSchool(school);
        } else if (schoolsArray.length > 0) {
          // If no matching school, set first one
          setCurrentSchool(schoolsArray[0]);
        }
      } else if (schoolsArray.length > 0 && !currentSchool) {
        // If no current school and user has no schoolId, set first one
        setCurrentSchool(schoolsArray[0]);
      }
    } catch (error) {
      console.error('Failed to load schools:', error);
      setSchools([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createSchool = async (data: SchoolSetupData): Promise<School> => {
    try {
      setIsLoading(true);
      const response = await schoolApi.createSchool(data);
      const newSchool: School = response.school;
      
      setSchools(prev => [...prev, newSchool]);
      setCurrentSchool(newSchool);
      return newSchool;
    } catch (error) {
      console.error('Failed to create school:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSchool = async (id: string, data: Partial<School>) => {
    try {
      const updated = await schoolApi.updateSchool(id, data);
      setSchools(prev => prev.map(s => s.id === id ? updated : s));
      if (currentSchool?.id === id) {
        setCurrentSchool(updated);
      }
    } catch (error) {
      console.error('Failed to update school:', error);
      throw error;
    }
  };

  const setCurrentSchoolHandler = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      setCurrentSchool(school);
      localStorage.setItem('currentSchoolId', schoolId);
    }
  };

  const value: SchoolContextType = {
    currentSchool,
    schools,
    isLoading,
    setCurrentSchool: setCurrentSchoolHandler,
    createSchool,
    updateSchool,
    getSchools: loadSchools,
  };

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};