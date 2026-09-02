import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { ReportDashboard } from '../components/reports/ReportDashboard';
import { ReportList } from '../components/reports/ReportList';
import { ReportBuilder } from '../components/reports/ReportBuilder';
import { ReportViewer } from '../components/reports/ReportViewer';
import { ReportFilters } from '../components/reports/ReportFilters';
import { AttendanceReport } from '../components/reports/AttendanceReport';
import { FeeReport } from '../components/reports/FeeReport';
import { ExamReport } from '../components/reports/ExamReport';
import { useAuth } from '../hooks/useAuth';
import { ProtectedComponent } from '../components/ProtectedComponent';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />

        <main className="space-y-6 p-4 md:p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
              <p className="mt-1 text-sm text-slate-500">
                Generate and view reports for attendance, fees, exams, and more
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-3xl grid-cols-4">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="builder">Builder</TabsTrigger>
                <TabsTrigger value="viewer">Viewer</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <ReportDashboard />
              </TabsContent>

              <TabsContent value="reports">
                <ReportList
                  onSelect={(report) => {
                    setSelectedReport(report);
                    setActiveTab('viewer');
                  }}
                />
              </TabsContent>

              <TabsContent value="builder">
                <ReportBuilder
                  onGenerate={(data) => {
                    setReportData(data);
                    setActiveTab('viewer');
                  }}
                />
              </TabsContent>

              <TabsContent value="viewer">
                {selectedReport ? (
                  <ReportViewer
                    report={selectedReport}
                    onClose={() => {
                      setSelectedReport(null);
                      setActiveTab('reports');
                    }}
                  />
                ) : reportData ? (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900">Generated Report</h2>
                    <AttendanceReport
                      filters={reportData.filters}
                      onGenerate={(data) => setReportData(data)}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-500">No report selected or generated</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};