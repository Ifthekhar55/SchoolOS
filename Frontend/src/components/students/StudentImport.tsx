import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
} from 'lucide-react';
import { studentApi } from '../../services/studentApi';

interface StudentImportProps {
  schoolId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentImport: React.FC<StudentImportProps> = ({
  schoolId,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a CSV or Excel file');
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Read file content
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0];
      const data = rows.slice(1).filter(row => row.length > 0).map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = row[index]?.trim() || '';
        });
        return obj;
      });

      // Add schoolId to each student
      const studentsWithSchool = data.map(student => ({
        ...student,
        schoolId,
        rollNumber: parseInt(student.rollNumber) || 0,
        admissionDate: student.admissionDate ? new Date(student.admissionDate) : new Date(),
        birthDate: student.birthDate ? new Date(student.birthDate) : undefined,
      }));

      const result = await studentApi.importStudents(studentsWithSchool);
      setResult(result);
      
      if (result.success && result.successCount > 0) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to import students');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'name', 'nameBangla', 'email', 'phone', 'fatherName', 'fatherPhone',
      'fatherOccupation', 'motherName', 'motherPhone', 'motherOccupation',
      'guardianName', 'guardianPhone', 'guardianRelation', 'class', 'section',
      'rollNumber', 'admissionDate', 'birthDate', 'gender', 'bloodGroup',
      'religion', 'nationality', 'address', 'addressBangla', 'emergencyContact',
      'medicalInfo'
    ];
    const csv = headers.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Import Students</h2>
            <p className="text-sm text-slate-500">
              Bulk import students from CSV or Excel file
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Template Download */}
          <div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <Download size={16} />
              Download Import Template
            </button>
          </div>

          {/* File Upload */}
          <div
            className={`relative rounded-lg border-2 border-dashed ${
              file ? 'border-blue-500 bg-blue-50' : 'border-slate-300'
            } p-8 text-center transition-colors`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls"
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <Upload className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600">
              {file ? file.name : 'Click or drag to upload CSV or Excel file'}
            </p>
            <p className="text-xs text-slate-400">Supported: .csv, .xlsx, .xls</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle size={18} />
                Successfully imported {result.success} students
              </div>
              {result.failed > 0 && (
                <div className="text-sm text-red-600">
                  Failed to import {result.failed} students
                </div>
              )}
              {result.errors && result.errors.length > 0 && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 max-h-40 overflow-y-auto">
                  {result.errors.map((err: any, i: number) => (
                    <div key={i} className="py-1 border-b border-red-100 last:border-0">
                      Row {err.row}: {err.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Import Students
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};