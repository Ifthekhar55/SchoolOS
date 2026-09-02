import React, { useState } from 'react';
import { 
  Building2, 
  School, 
  Users, 
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SchoolBasicInfo } from './SchoolBasicInfo';
import { SchoolAcademicSetup } from './SchoolAcademicSetup';
import { SchoolAdminSetup } from './SchoolAdminSetup';
import { SchoolComplete } from './SchoolComplete';
import { SchoolSetupData } from '../../types/school';
import { useSchool } from '../../hooks/useSchool';

const steps = [
  { id: 1, title: 'School Info', icon: Building2 },
  { id: 2, title: 'Academic Setup', icon: School },
  { id: 3, title: 'Admin Account', icon: Users },
  { id: 4, title: 'Complete', icon: CheckCircle },
];

interface SchoolSetupWizardProps {
  onComplete: () => void;
  initialData?: Partial<SchoolSetupData>;
  mode?: 'create' | 'edit';
  schoolId?: string;
}

export const SchoolSetupWizard: React.FC<SchoolSetupWizardProps> = ({
  onComplete,
  initialData,
  mode = 'create',
  schoolId,
}) => {
  const { createSchool, updateSchool } = useSchool();
  const isEditMode = mode === 'edit' && !!schoolId;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SchoolSetupData>>(initialData || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  React.useEffect(() => {
    setFormData(initialData || {});
    setCurrentStep(1);
  }, [initialData]);

  const updateFormData = (data: Partial<SchoolSetupData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      if (isEditMode && schoolId) {
        await updateSchool(schoolId, {
          name: formData.schoolName || '',
          nameBangla: formData.schoolNameBangla || undefined,
          type: formData.schoolType || 'english_medium',
          address: formData.address || '',
          city: formData.city || '',
          district: formData.district || '',
          division: formData.division || '',
          postCode: formData.postCode || '',
          phone: formData.phone || '',
          email: formData.email || '',
          website: formData.website || '',
          establishedYear: formData.establishedYear || undefined,
        });
      } else {
        await createSchool({
          schoolName: formData.schoolName || '',
          schoolNameBangla: formData.schoolNameBangla || '',
          schoolType: formData.schoolType || 'english_medium',
          establishedYear: formData.establishedYear || new Date().getFullYear(),
          address: formData.address || '',
          city: formData.city || '',
          district: formData.district || '',
          division: formData.division || '',
          postCode: formData.postCode || '',
          phone: formData.phone || '',
          email: formData.email || '',
          website: formData.website || '',
          academicYearStart: formData.academicYearStart || new Date(),
          academicYearEnd: formData.academicYearEnd || new Date(),
          classes: formData.classes || [],
          adminName: formData.adminName || '',
          adminEmail: formData.adminEmail || '',
          adminPhone: formData.adminPhone || '',
          adminPassword: formData.adminPassword || '',
          adminConfirmPassword: formData.adminConfirmPassword || '',
        });
      }
      onComplete();
    } catch (error: any) {
      console.error(isEditMode ? 'Failed to update school:' : 'Failed to create school:', error);
      setSubmitError(error.message || (isEditMode ? 'Failed to update school' : 'Failed to create school'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SchoolBasicInfo 
            data={formData} 
            updateData={updateFormData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <SchoolAcademicSetup 
            data={formData} 
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <>
          {submitError && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{submitError}</p>}
          <SchoolAdminSetup 
            data={formData} 
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
          />
          </>
        );
      case 4:
        return (
          <SchoolComplete 
            schoolName={formData.schoolName || 'Your School'}
            onComplete={onComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Setup Your School
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Let's get your school ready for digital management
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const Icon = step.icon;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                        isCompleted
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : isCurrent
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle size={24} />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isCurrent ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {step.id < steps.length && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};