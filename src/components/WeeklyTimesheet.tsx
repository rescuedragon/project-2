import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Calendar, Edit, Save, X } from 'lucide-react';
import { TimeLog } from './TimeTracker';
import { format, startOfWeek, endOfWeek, addDays, subDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';

interface WeeklyTimesheetProps {
  timeLogs: TimeLog[];
  onUpdateTime: (logId: string, newDuration: number) => void;
}

const WeeklyTimesheet: React.FC<WeeklyTimesheetProps> = ({ timeLogs, onUpdateTime }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);
  const [progressBarEnabled, setProgressBarEnabled] = useState(false);
  const [progressBarColor, setProgressBarColor] = useState('#10b981');

  useEffect(() => {
    setColorCodedEnabled(isColorCodedProjectsEnabled());
    
    const savedEnabled = localStorage.getItem('progressbar-enabled');
    const savedColor = localStorage.getItem('progressbar-color');
    
    setProgressBarEnabled(savedEnabled ? JSON.parse(savedEnabled) : false);
    setProgressBarColor(savedColor || '#10b981');
    
    const handleStorageChange = () => {
      setColorCodedEnabled(isColorCodedProjectsEnabled());
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

  const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(1);
  };

  const parseHours = (hours: string) => {
    return parseFloat(hours) * 3600;
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    return Array.from({ length: 5 }, (_, i) => addDays(start, i));
  };

  const getDayTotal = (date: Date) => {
    return timeLogs
      .filter(log => isSameDay(new Date(log.date), date))
      .reduce((total, log) => total + log.duration, 0);
  };

  const getProjectTotal = (projectName: string, subprojectName: string) => {
    return timeLogs
      .filter(log => log.projectName === projectName && log.subprojectName === subprojectName)
      .reduce((total, log) => total + log.duration, 0);
  };

  const getProjectDayTime = (projectName: string, subprojectName: string, date: Date) => {
    return timeLogs
      .filter(log => 
        log.projectName === projectName && 
        log.subprojectName === subprojectName && 
        isSameDay(new Date(log.date), date)
      )
      .reduce((total, log) => total + log.duration, 0);
  };

  const getUniqueProjects = () => {
    const projectMap = new Map();
    timeLogs.forEach(log => {
      const key = `${log.projectName}-${log.subprojectName}`;
      if (!projectMap.has(key)) {
        projectMap.set(key, {
          projectName: log.projectName,
          subprojectName: log.subprojectName,
          projectId: log.projectId,
          subprojectId: log.subprojectId
        });
      }
    });
    return Array.from(projectMap.values());
  };

  const handleEdit = (projectName: string, subprojectName: string, date: Date) => {
    const cellKey = `${projectName}-${subprojectName}-${format(date, 'yyyy-MM-dd')}`;
    const currentTime = getProjectDayTime(projectName, subprojectName, date);
    setEditingCell(cellKey);
    setEditValue(formatHours(currentTime));
  };

  const handleSave = (projectName: string, subprojectName: string, date: Date) => {
    const newDuration = parseHours(editValue);
    const existingLog = timeLogs.find(log => 
      log.projectName === projectName && 
      log.subprojectName === subprojectName && 
      isSameDay(new Date(log.date), date)
    );
    
    if (existingLog) {
      onUpdateTime(existingLog.id, newDuration);
    }
    
    setEditingCell(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const getProjectBackgroundStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    return {
      backgroundColor: generateProjectColor(projectName)
    };
  };

  const getCurrentDayStyle = (date: Date) => {
    const isToday = isSameDay(date, new Date());
    if (!isToday || !progressBarEnabled) return {};
    
    // Convert hex to rgba with reduced opacity
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    return {
      backgroundColor: hexToRgba(progressBarColor, 0.15),
      border: `2px solid ${hexToRgba(progressBarColor, 0.4)}`,
      boxShadow: `0 4px 12px ${hexToRgba(progressBarColor, 0.2)}`,
      transform: 'translateY(-2px)',
    };
  };

  const weekDays = getWeekDays();
  const uniqueProjects = getUniqueProjects();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Navigation */}
      <Card className="bg-gradient-secondary-modern border-border/20 shadow-2xl backdrop-blur-xl hover:border-border/40 transition-all duration-500">
        <CardHeader className="pb-6 border-b border-border/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-foreground">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xl tracking-tight">Weekly View</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={goToPreviousWeek} variant="outline" size="sm" className="btn-modern shadow-lg hover:shadow-xl rounded-xl">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-xl font-bold text-foreground min-w-[300px] text-center bg-muted/30 px-6 py-3 rounded-xl border border-border/20 shadow-lg backdrop-blur-sm">
                {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM d, yyyy')}
              </div>
              <Button onClick={goToNextWeek} variant="outline" size="sm" className="btn-modern shadow-lg hover:shadow-xl rounded-xl">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={goToCurrentWeek} variant="secondary" size="sm" className="btn-modern shadow-lg hover:shadow-xl rounded-xl">
              This Week
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        {weekDays.map((day) => {
          const dayTotal = getDayTotal(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <Card 
              key={day.toISOString()} 
              className="bg-gradient-secondary-modern border-border/20 shadow-xl backdrop-blur-xl hover:border-border/40 transition-all duration-500 hover:shadow-2xl"
              style={getCurrentDayStyle(day)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-lg font-semibold text-foreground mb-2">
                  {format(day, 'EEE')}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  {format(day, 'M/d')}
                </div>
                <div className="text-3xl font-bold text-accent mb-2">
                  {formatHours(dayTotal)}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  HOURS
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Timesheet */}
      <Card className="bg-gradient-secondary-modern border-border/20 shadow-2xl backdrop-blur-xl hover:border-border/40 transition-all duration-500">
        <CardHeader className="border-b border-border/10">
          <CardTitle className="text-xl font-medium text-foreground tracking-tight">Time Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {uniqueProjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-6 opacity-40" />
              <p className="text-lg font-medium">No time entries for this week</p>
              <p className="text-sm mt-2">Start tracking time to see entries here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/20">
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Project</th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Subproject</th>
                    {weekDays.map(day => (
                      <th key={day.toISOString()} className="text-center py-4 px-4 font-semibold text-foreground min-w-[100px]">
                        <div>{format(day, 'EEE')}</div>
                        <div className="text-xs text-muted-foreground font-normal">{format(day, 'M/d')}</div>
                      </th>
                    ))}
                    <th className="text-center py-4 px-4 font-semibold text-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueProjects.map((project, index) => {
                    const cellKey = (date: Date) => `${project.projectName}-${project.subprojectName}-${format(date, 'yyyy-MM-dd')}`;
                    
                    return (
                      <tr 
                        key={`${project.projectName}-${project.subprojectName}`}
                        className="border-b border-border/10 hover:bg-accent/5 transition-colors duration-200"
                        style={getProjectBackgroundStyle(project.projectName)}
                      >
                        <td className="py-4 px-4 font-medium text-foreground">{project.projectName}</td>
                        <td className="py-4 px-4 text-foreground">{project.subprojectName}</td>
                        {weekDays.map(day => {
                          const dayTime = getProjectDayTime(project.projectName, project.subprojectName, day);
                          const isEditing = editingCell === cellKey(day);
                          
                          return (
                            <td key={day.toISOString()} className="py-4 px-4 text-center">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-16 h-8 text-center text-sm"
                                    type="number"
                                    step="0.1"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleSave(project.projectName, project.subprojectName, day)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancel}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div 
                                  className="flex items-center justify-center gap-2 cursor-pointer hover:bg-accent/10 rounded px-2 py-1 transition-colors"
                                  onClick={() => handleEdit(project.projectName, project.subprojectName, day)}
                                >
                                  <span className="font-mono text-sm font-medium text-foreground">
                                    {formatHours(dayTime)}
                                  </span>
                                  {dayTime > 0 && (
                                    <Edit className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-4 px-4 text-center">
                          <span className="font-mono text-sm font-bold text-accent bg-accent/10 px-3 py-1 rounded-lg">
                            {formatHours(getProjectTotal(project.projectName, project.subprojectName))}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border/30 bg-muted/20">
                    <td colSpan={2} className="py-4 px-4 font-bold text-foreground">Total</td>
                    {weekDays.map(day => (
                      <td key={day.toISOString()} className="py-4 px-4 text-center">
                        <span className="font-mono text-sm font-bold text-accent bg-accent/20 px-3 py-1 rounded-lg">
                          {formatHours(getDayTotal(day))}
                        </span>
                      </td>
                    ))}
                    <td className="py-4 px-4 text-center">
                      <span className="font-mono text-lg font-bold text-accent bg-accent/20 px-4 py-2 rounded-lg">
                        {formatHours(timeLogs.reduce((total, log) => total + log.duration, 0))}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyTimesheet;