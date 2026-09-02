import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Users,
  Bell,
  FileText,
} from 'lucide-react';
import { CalendarEvent, CreateEventData, EventType, RecurrencePattern } from '../../types/calendar';
import { calendarApi } from '../../services/calendarApi';

interface EventFormProps {
  event?: CalendarEvent;
  initialDate?: Date;
  onClose: () => void;
  onSuccess: () => void;
}

const eventTypes: { value: EventType; label: string }[] = [
  { value: 'holiday', label: '🎉 Holiday' },
  { value: 'exam', label: '📝 Exam' },
  { value: 'event', label: '📅 Event' },
  { value: 'meeting', label: '🤝 Meeting' },
  { value: 'deadline', label: '⏰ Deadline' },
  { value: 'academic', label: '📚 Academic' },
  { value: 'sports', label: '⚽ Sports' },
  { value: 'cultural', label: '🎭 Cultural' },
  { value: 'other', label: '📌 Other' },
];

const recurrencePatterns: { value: RecurrencePattern; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const colorOptions = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F472B6', '#6366F1', '#22D3EE',
];

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const EventForm: React.FC<EventFormProps> = ({
  event,
  initialDate,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!event;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateEventData>>({
    title: '',
    titleBangla: '',
    description: '',
    descriptionBangla: '',
    type: 'event',
    startDate: initialDate || new Date(),
    endDate: initialDate || new Date(),
    startTime: '',
    endTime: '',
    allDay: false,
    location: '',
    recurrence: 'none',
    recurrenceEndDate: undefined,
    recurrenceDays: [],
    targetClasses: [],
    targetSections: [],
    targetTeachers: [],
    color: '#3B82F6',
    isPublic: true,
    reminder: false,
    reminderMinutes: 30,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  useEffect(() => {
    loadClasses();
    if (event) {
      setFormData({
        title: event.title,
        titleBangla: event.titleBangla || '',
        description: event.description,
        descriptionBangla: event.descriptionBangla || '',
        type: event.type,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        allDay: event.allDay,
        location: event.location || '',
        recurrence: event.recurrence || 'none',
        recurrenceEndDate: event.recurrenceEndDate ? new Date(event.recurrenceEndDate) : undefined,
        recurrenceDays: event.recurrenceDays || [],
        targetClasses: event.targetClasses || [],
        targetSections: event.targetSections || [],
        targetTeachers: event.targetTeachers || [],
        color: event.color || '#3B82F6',
        isPublic: event.isPublic,
        reminder: event.reminder || false,
        reminderMinutes: event.reminderMinutes || 30,
        notes: event.notes || '',
      });
      setSelectedClasses(event.targetClasses || []);
      setSelectedSections(event.targetSections || []);
    }
  }, [event]);

  const loadClasses = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/classes?page=1&limit=999`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const loadSections = async (classId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/classes/${classId}/sections`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );
      const data = await response.json();
      setSections(data.sections || []);
    } catch (error) {
      console.error('Failed to load sections:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.type) newErrors.type = 'Event type is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';

    if (formData.recurrence && formData.recurrence !== 'none') {
      if (!formData.recurrenceEndDate) {
        newErrors.recurrenceEndDate = 'Recurrence end date is required';
      }
    }

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

      if (isEditing && event) {
        await calendarApi.updateEvent(event.id, { ...data, id: event.id });
      } else {
        await calendarApi.createEvent(data as CreateEventData);
      }
      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save event' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [year, month, day] = value.split('-').map(Number);
    setFormData(prev => ({
      ...prev,
      [name]: new Date(year, month - 1, day),
    }));
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Event' : 'Add New Event'}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditing ? 'Update event details' : 'Schedule a new event'}
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
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.title ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                placeholder="Enter event title"
              />
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
                placeholder="ইভেন্টের শিরোনাম"
                dir="rtl"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={3}
                className={`w-full rounded-lg border ${
                  errors.description ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                placeholder="Enter event description"
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* Description Bangla */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Description (Bangla)
              </label>
              <textarea
                name="descriptionBangla"
                value={formData.descriptionBangla || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="ইভেন্টের বিবরণ"
                dir="rtl"
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.type ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
              >
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
            </div>

            {/* Color */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      formData.color === color ? 'border-slate-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate ? formatDateInput(new Date(formData.startDate)) : ''}
                  onChange={handleDateChange}
                  className={`w-full rounded-lg border ${
                    errors.startDate ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                />
              </div>
              {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
            </div>

            {/* End Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate ? formatDateInput(new Date(formData.endDate)) : ''}
                  onChange={handleDateChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Start Time */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Start Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                End Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* All Day */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="allDay"
                  checked={formData.allDay || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                All Day Event
              </label>
            </div>

            {/* Location */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  placeholder="Event location"
                />
              </div>
            </div>

            {/* Recurrence */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Recurrence
              </label>
              <select
                name="recurrence"
                value={formData.recurrence || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
              >
                {recurrencePatterns.map((pattern) => (
                  <option key={pattern.value} value={pattern.value}>
                    {pattern.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Recurrence End Date */}
            {formData.recurrence && formData.recurrence !== 'none' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Recurrence End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    name="recurrenceEndDate"
                    value={formData.recurrenceEndDate ? formatDateInput(new Date(formData.recurrenceEndDate)) : ''}
                    onChange={handleDateChange}
                    className={`w-full rounded-lg border ${
                      errors.recurrenceEndDate ? 'border-red-500' : 'border-slate-200'
                    } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  />
                </div>
                {errors.recurrenceEndDate && <p className="mt-1 text-xs text-red-500">{errors.recurrenceEndDate}</p>}
              </div>
            )}

            {/* Target Audience */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Target Audience
              </label>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-600 mb-2">Classes</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => {
                        setSelectedClasses(prev =>
                          prev.includes(cls.id)
                            ? prev.filter(id => id !== cls.id)
                            : [...prev, cls.id]
                        );
                      }}
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

                {selectedClasses.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-slate-600 mb-2">Sections</p>
                    <div className="flex flex-wrap gap-2">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => {
                            setSelectedSections(prev =>
                              prev.includes(section.id)
                                ? prev.filter(id => id !== section.id)
                                : [...prev, section.id]
                            );
                          }}
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
                  </>
                )}
              </div>
            </div>

            {/* Reminder */}
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="reminder"
                  checked={formData.reminder || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <Bell size={16} className="text-slate-400" />
                Set Reminder
              </label>
              {formData.reminder && (
                <div className="mt-2">
                  <select
                    name="reminderMinutes"
                    value={formData.reminderMinutes || 30}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="5">5 minutes before</option>
                    <option value="10">10 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                    <option value="120">2 hours before</option>
                    <option value="1440">1 day before</option>
                  </select>
                </div>
              )}
            </div>

            {/* Public */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Make Public
              </label>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Additional notes..."
              />
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
                  {isEditing ? 'Update Event' : 'Add Event'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};