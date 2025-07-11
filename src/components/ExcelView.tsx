import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileSpreadsheet } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { TimeLog } from './TimeTracker';
import WeeklyTimesheet from './WeeklyTimesheet';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';
import ExcelViewHeader from './excel-view/ExcelViewHeader';
import TimeEntryTable from './excel-view/TimeEntryTable';
import EditLogDialog from './excel-view/EditLogDialog';
import AddEntryDialog from './excel-view/AddEntryDialog';

const ExcelView: React.FC = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);
  const [editFormData, setEditFormData] = useState({
    duration: '',
    description: '',
    startTime: '',
    endTime: ''
  });
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    projectId: '',
    subprojectId: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    description: '',
    startTime: '',
    endTime: ''
  });
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);

  // Progress bar settings
  const [progressBarEnabled, setProgressBarEnabled] = useState(() => {
    const saved = localStorage.getItem('progressbar-enabled');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [progressBarColor, setProgressBarColor] = useState(() => {
    const saved = localStorage.getItem('progressbar-color');
    return saved || '#10b981';
  });

  useEffect(() => {
    setColorCodedEnabled(isColorCodedProjectsEnabled());
    
    const handleStorageChange = () => {
      setColorCodedEnabled(isColorCodedProjectsEnabled());
      
      // Update progress bar settings
      const savedEnabled = localStorage.getItem('progressbar-enabled');
      const savedColor = localStorage.getItem('progressbar-color');
      
      setProgressBarEnabled(savedEnabled ? JSON.parse(savedEnabled) : false);
      setProgressBarColor(savedColor || '#10b981');
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settings-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-changed', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const savedTimeLogs = localStorage.getItem('timesheet-logs');
    const savedProjects = localStorage.getItem('timesheet-projects');
    
    if (savedTimeLogs) {
      setTimeLogs(JSON.parse(savedTimeLogs));
    }
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Filter time logs to only show entries for projects that still exist
  const filteredTimeLogs = timeLogs.filter(log => 
    projects.some(project => 
      project.id === log.projectId && 
      project.subprojects.some((sub: any) => sub.id === log.subprojectId)
    )
  );

  // Get current day's total time
  const getCurrentDayTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return filteredTimeLogs
      .filter(log => log.date === today)
      .reduce((total, log) => total + log.duration, 0);
  };

  // Group time logs by day
  const getGroupedTimeLogs = () => {
    const grouped: { [key: string]: { date: string; displayDate: string; logs: TimeLog[]; totalHours: number } } = {};
    
    filteredTimeLogs.forEach(log => {
      const date = log.date;
      if (!grouped[date]) {
        const logDate = new Date(date);
        const today = new Date();
        const isToday = logDate.toDateString() === today.toDateString();
        const isYesterday = logDate.toDateString() === new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString();
        
        let displayDate = logDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        if (isToday) displayDate = `Today - ${displayDate}`;
        else if (isYesterday) displayDate = `Yesterday - ${displayDate}`;
        
        grouped[date] = {
          date,
          displayDate,
          logs: [],
          totalHours: 0
        };
      }
      grouped[date].logs.push(log);
      grouped[date].totalHours += log.duration;
    });
    
    return Object.values(grouped).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getRowBackgroundStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    return {
      backgroundColor: generateProjectColor(projectName)
    };
  };

  const handleUpdateTime = (logId: string, newDuration: number) => {
    const updatedLogs = timeLogs.map(log => 
      log.id === logId ? { ...log, duration: newDuration } : log
    );
    setTimeLogs(updatedLogs);
    localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
  };

  const handleEditLog = (log: TimeLog) => {
    setEditingLog(log);
    setEditFormData({
      duration: formatHours(log.duration),
      description: log.description,
      startTime: log.startTime,
      endTime: log.endTime
    });
  };

  const handleSaveEdit = () => {
    if (editingLog && editFormData.duration) {
      const newDuration = parseHours(editFormData.duration);
      
      const updatedLogs = timeLogs.map(log =>
        log.id === editingLog.id
          ? {
              ...log,
              duration: newDuration,
              description: editFormData.description,
              startTime: editFormData.startTime,
              endTime: editFormData.endTime
            }
          : log
      );
      
      setTimeLogs(updatedLogs);
      localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
      setEditingLog(null);
    }
  };

  const handleDeleteLog = (logId: string) => {
    const updatedLogs = timeLogs.filter(log => log.id !== logId);
    setTimeLogs(updatedLogs);
    localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
  };

  const handleAddEntry = () => {
    if (addFormData.projectId && addFormData.subprojectId && addFormData.duration) {
      const selectedProject = projects.find(p => p.id === addFormData.projectId);
      const selectedSubproject = selectedProject?.subprojects.find((s: any) => s.id === addFormData.subprojectId);
      
      const newLog: TimeLog = {
        id: Date.now().toString(),
        projectId: addFormData.projectId,
        subprojectId: addFormData.subprojectId,
        projectName: selectedProject?.name || '',
        subprojectName: selectedSubproject?.name || '',
        duration: parseHours(addFormData.duration),
        description: addFormData.description,
        date: addFormData.date,
        startTime: addFormData.startTime,
        endTime: addFormData.endTime
      };

      const updatedLogs = [...timeLogs, newLog];
      setTimeLogs(updatedLogs);
      localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
      
      setAddFormData({
        projectId: '',
        subprojectId: '',
        date: new Date().toISOString().split('T')[0],
        duration: '',
        description: '',
        startTime: '',
        endTime: ''
      });
      setIsAddEntryOpen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(1);
  };

  const parseHours = (hours: string) => {
    return parseFloat(hours) * 3600;
  };

  const exportToCSV = () => {
    // Get filtered data based on current view
    const dataToExport = filteredTimeLogs;
    
    if (dataToExport.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = ['Date', 'Project', 'Subproject', 'Start Time', 'End Time', 'Duration', 'Description'];
    const csvData = [
      headers.join(','),
      ...dataToExport.map(log => [
        log.date,
        `"${log.projectName}"`,
        `"${log.subprojectName}"`,
        log.startTime,
        log.endTime,
        formatTime(log.duration),
        `"${log.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const currentDayTotal = getCurrentDayTotal();
  const groupedLogs = getGroupedTimeLogs();

  return (
    <div className="space-y-6">
      <ProgressBar
        currentHours={currentDayTotal}
        targetHours={8}
        color={progressBarColor}
        enabled={progressBarEnabled}
      />

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
          <TabsTrigger value="weekly" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
            <Calendar className="h-4 w-4" />
            Weekly View
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
            <FileSpreadsheet className="h-4 w-4" />
            Daily View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly">
          <WeeklyTimesheet timeLogs={filteredTimeLogs} onUpdateTime={handleUpdateTime} />
        </TabsContent>
        
        <TabsContent value="detailed">
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
            <ExcelViewHeader onExportToCSV={exportToCSV} />
            <CardContent>
              {Object.keys(groupedLogs).length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No time entries yet. Start tracking time to see data here.
                </div>
              ) : (
                <TimeEntryTable
                  groupedLogs={groupedLogs.reduce((acc, group) => {
                    acc[group.date] = group;
                    return acc;
                  }, {} as any)}
                  colorCodedEnabled={colorCodedEnabled}
                  formatHours={formatHours}
                  getRowBackgroundStyle={getRowBackgroundStyle}
                  onEditLog={handleEditLog}
                  onDeleteLog={handleDeleteLog}
                  onAddEntry={() => setIsAddEntryOpen(true)}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditLogDialog
        editingLog={editingLog}
        editFormData={editFormData}
        onEditFormDataChange={setEditFormData}
        onSaveEdit={handleSaveEdit}
        onCancel={() => setEditingLog(null)}
      />

      <AddEntryDialog
        isOpen={isAddEntryOpen}
        projects={projects}
        addFormData={addFormData}
        onAddFormDataChange={setAddFormData}
        onAddEntry={handleAddEntry}
        onCancel={() => setIsAddEntryOpen(false)}
      />
    </div>
  );
};

export default ExcelView;