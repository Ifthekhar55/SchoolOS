import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  FileText,
  Calendar,
  Users,
  Tag,
  Clock,
  Upload,
  Trash2,
  Eye,
} from 'lucide-react';
import { Notice, CreateNoticeData, NoticeType, NoticePriority } from '../../types/notice';
import { noticeApi } from '../../services/noticeApi';
import { classApi } from '../../services/classApi';

interface NoticeFormProps {
  notice?: Notice;
  onClose: () => void;
  onSuccess: () => void;
}

const noticeTypes: { value: NoticeType; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'academic', label: 'Academic' },
  { value: 'fee', label: 'Fee' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'event', label: 'Event' },
];

const noticePriorities: { value: NoticePriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const NoticeForm: React.FC<NoticeFormProps> = ({
  notice,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!notice;
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [formData, setFormData] = useState<Partial<CreateNoticeData>>({
    title: '',
    titleBangla: '',
    content: '',
    contentBangla: '',
    type: 'general',
    priority: 'medium',
    publishedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    targetClasses: [],
    targetSections: [],
    attachments: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  useEffect(() => {
    loadClasses();
    if (notice) {
      setFormData({
        title: notice.title,
        titleBangla: notice.titleBangla || '',
        content: notice.content,
        contentBangla: notice.contentBangla || '',
        type: notice.type,
        priority: notice.priority,
        publishedAt: notice.publishedAt ? new Date(notice.publishedAt) : new Date(),
        expiresAt: notice.expiresAt ? new Date(notice.expiresAt) : undefined,
        targetClasses: notice.targetClasses || [],
        targetSections: notice.targetSections || [],
        attachments: notice.attachments || [],
      });
      setSelectedClasses(notice.targetClasses || []);
      setSelectedSections(notice.targetSections || []);
    }
  }, [notice]);

  const loadClasses = async () => {
    try {
      const response = await classApi.getClasses({ page: 1, limit: 999 });
      setClasses(response.classes || []);
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const loadSections = async (classId: string) => {
    try {
      const response = await classApi.getSections(classId);
      setSections(response.sections || []);
    } catch (error) {
      console.error('Failed to load sections:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.content) newErrors.content = 'Content is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const data = {
        ...formData,
        targetClasses: selectedClasses,
        targetSections: selectedSections,
      };

      if (isEditing && notice) {
        await noticeApi.updateNotice(notice.id, { ...data, id: notice.id });
      } else {
        await noticeApi.createNotice(data as CreateNoticeData);
      }
      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save notice' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Notice' : 'Create New Notice'}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditing ? 'Update notice details' : 'Create a new announcement'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6">
          {errors.submit && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              <AlertCircle size={18} />
              {errors.submit}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${
                    errors.title ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  placeholder="Enter notice title"
                />
              </div>
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Title Bangla */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Title (Bangla)
              </label>
              <input
                type="text"
                name="titleBangla"
                value={formData.titleBangla || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="বিজ্ঞপ্তির শিরোনাম"
                dir="rtl"
              />
            </div>

            {/* Content */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content || ''}
                onChange={handleInputChange}
                rows={4}
                className={`w-full rounded-lg border ${
                  errors.content ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                placeholder="Enter notice content..."
              />
              {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
            </div>

            {/* Content Bangla */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Content (Bangla)
              </label>
              <textarea
                name="contentBangla"
                value={formData.contentBangla || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="বিজ্ঞপ্তির বিবরণ"
                dir="rtl"
              />
            </div>

            {/* Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.type ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
              >
                {noticeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
            </div>

            {/* Priority */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.priority ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
              >
                {noticePriorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
              {errors.priority && <p className="mt-1 text-xs text-red-500">{errors.priority}</p>}
            </div>

            {/* Published At */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Publish Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="datetime-local"
                  name="publishedAt"
                  value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Expires At */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Expiry Date
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().slice(0, 16) : ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Target Audience */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Target Audience
              </label>
              <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-2">Classes</p>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((cls) => (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => handleClassToggle(cls.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          selectedClasses.includes(cls.id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Class {cls.name}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedClasses.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-2">Sections</p>
                    <div className="flex flex-wrap gap-2">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => handleSectionToggle(section.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            selectedSections.includes(section.id)
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Section {section.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Attachments
              </label>
              <div className="relative rounded-lg border-2 border-dashed border-slate-200 p-4 text-center hover:border-blue-500 transition-colors">
                <Upload className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-1 text-sm text-slate-500">Click to upload or drag and drop</p>
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => {
                    // Handle file upload
                  }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditing ? 'Update Notice' : 'Create Notice'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};