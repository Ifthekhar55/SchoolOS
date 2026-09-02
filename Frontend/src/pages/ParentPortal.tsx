import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { ParentDashboard } from '../components/parent/ParentDashboard';
import { ChildAttendance } from '../components/parent/ChildAttendance';
import { ChildFees } from '../components/parent/ChildFees';
import { ChildResults } from '../components/parent/ChildResults';
import { TeacherCommunication } from '../components/parent/TeacherCommunication';
import { ProtectedComponent } from '../components/ProtectedComponent';

export const ParentPortal: React.FC = () => {
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <ProtectedComponent permission="students:view">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-3xl grid-cols-5">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="fees">Fees</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <ParentDashboard
                  onSelectChild={setSelectedChildId}
                  selectedChildId={selectedChildId}
                />
              </TabsContent>

              <TabsContent value="attendance">
                <ChildAttendance childId={selectedChildId} />
              </TabsContent>

              <TabsContent value="fees">
                <ChildFees childId={selectedChildId} />
              </TabsContent>

              <TabsContent value="results">
                <ChildResults childId={selectedChildId} />
              </TabsContent>

              <TabsContent value="messages">
                <TeacherCommunication childId={selectedChildId} />
              </TabsContent>
          </Tabs>
        </div>
      </ProtectedComponent>
    </div>
  );
};