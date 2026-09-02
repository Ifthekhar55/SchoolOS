import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { CalendarMonthView } from '../components/calendar/CalendarMonthView';
import { CalendarEvent } from '../types/calendar';
import { EventForm } from '../components/calendar/EventForm';
import { EventDetails } from '../components/calendar/EventDetails';
import { EventList } from '../components/calendar/EventList';
import { useAuth } from '../hooks/useAuth';
import { ProtectedComponent } from '../components/ProtectedComponent';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | undefined>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddEvent = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(undefined);
    setShowForm(true);
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleView = (event: CalendarEvent) => {
    setViewingEvent(event);
    setShowDetails(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingEvent(undefined);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />

        <main className="space-y-6 p-4 md:p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
              <p className="mt-1 text-sm text-slate-500">
                View and manage school events, holidays, and activities
              </p>
            </div>

            <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as any)}>
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>

              <TabsContent value="month">
                <CalendarMonthView
                  key={refreshKey}
                  year={selectedDate.getFullYear()}
                  month={selectedDate.getMonth()}
                  onEventClick={handleView}
                  onEventEdit={handleEdit}
                  onEventDelete={() => {}}
                  onDateClick={(date) => handleAddEvent(date)}
                  onAddEvent={handleAddEvent}
                />
              </TabsContent>

              <TabsContent value="week">
                <div className="text-center py-12 text-slate-500">
                  Week view coming soon
                </div>
              </TabsContent>

              <TabsContent value="day">
                <div className="text-center py-12 text-slate-500">
                  Day view coming soon
                </div>
              </TabsContent>

              <TabsContent value="list">
                <EventList
                  key={refreshKey}
                  onEdit={handleEdit}
                  onView={handleView}
                  onCreate={() => handleAddEvent(new Date())}
                />
              </TabsContent>
            </Tabs>

            {showForm && (
              <EventForm
                event={editingEvent}
                initialDate={selectedDate}
                onClose={() => {
                  setShowForm(false);
                  setEditingEvent(undefined);
                }}
                onSuccess={handleSuccess}
              />
            )}

            {showDetails && viewingEvent && (
              <EventDetails
                event={viewingEvent}
                onClose={() => {
                  setShowDetails(false);
                  setViewingEvent(undefined);
                }}
                onEdit={() => {
                  setShowDetails(false);
                  handleEdit(viewingEvent);
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};