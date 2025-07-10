import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Download, Filter, ChevronDown, Edit, Save, X } from 'lucide-react';
import { TimeLog } from './TimeTracker';
import { format, startOfWeek, endOfWeek, addDays, subDays, isSameDay, eachDayOfInterval, isToday, parseISO } from 'date-fns';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TimeBreakdown from './TimeBreakdown';

interface WeeklyTimesheetProps {
  timeLogs: TimeLog[];
  onUpdateTime: (logId: string, newDuration: number) => void;
}

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const WeeklyTimesheet: React.FC<WeeklyTimesheetProps> = ({ timeLogs, onUpdateTime }) => {
  const [dateRange, setDateRange] = useState({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 })
  });
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);
  const [progressBarEnabled, setProgressBarEnabled] = useState(false);
  const [progressBarColor, setProgressBarColor] = useState('#7D7D7D');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [isProjectFilterOpen, setIsProjectFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeBreakdownDateRange, setTimeBreakdownDateRange] = useState({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 })
  });

  useEffect(() => {
    setColorCodedEnabled(isColorCodedProjectsEnabled());
    
    const savedEnabled = localStorage.getItem('progressbar-enabled');
    const savedColor = localStorage.getItem('progressbar-color');
    
    setProgressBarEnabled(savedEnabled ? JSON.parse(savedEnabled) : false);
    setProgressBarColor(savedColor || '#7D7D7D');
    
    const handleStorageChange = () => {
      setColorCodedEnabled(isColorCodedProjectsEnabled());
      const savedEnabled = localStorage.getItem('progressbar-enabled');
      const savedColor = localStorage.getItem('progressbar-color');
      
      setProgressBarEnabled(savedEnabled ? JSON.parse(savedEnabled) : false);
      setProgressBarColor(savedColor || '#7D7D7D');
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

  const daysInRange = useMemo(() => {
    const allDays = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    return allDays.filter(day => day.getDay() !== 0 && day.getDay() !== 6);
  }, [dateRange]);

  const getDayTotal = (date: Date) => {
    return timeLogs
      .filter(log => isSameDay(new Date(log.date), date))
      .reduce((total, log) => total + log.duration, 0);
  };

  const getProjectTotal = (projectName: string) => {
    return timeLogs
      .filter(log => log.projectName === projectName)
      .reduce((total, log) => total + log.duration, 0);
  };

  const getSubprojectTotal = (projectName: string, subprojectName: string) => {
    return timeLogs
      .filter(log => 
        log.projectName === projectName && 
        log.subprojectName === subprojectName
      )
      .reduce((total, log) => total + log.duration, 0);
  };

  const getProjectDayTime = (projectName: string, date: Date) => {
    return timeLogs
      .filter(log => 
        log.projectName === projectName && 
        isSameDay(new Date(log.date), date))
      .reduce((total, log) => total + log.duration, 0);
  };

  const getSubprojectDayTime = (projectName: string, subprojectName: string, date: Date) => {
    return timeLogs
      .filter(log => 
        log.projectName === projectName && 
        log.subprojectName === subprojectName && 
        isSameDay(new Date(log.date), date))
      .reduce((total, log) => total + log.duration, 0);
  };

  const uniqueProjects = useMemo(() => {
    const projectMap = new Map<string, { 
      projectName: string; 
      subprojects: Set<string>;
    }>();
    
    timeLogs.forEach(log => {
      if (!projectMap.has(log.projectName)) {
        projectMap.set(log.projectName, {
          projectName: log.projectName,
          subprojects: new Set()
        });
      }
      
      if (log.subprojectName) {
        const project = projectMap.get(log.projectName)!;
        project.subprojects.add(log.subprojectName);
      }
    });
    
    return Array.from(projectMap.values());
  }, [timeLogs]);

  useEffect(() => {
    const allProjects = new Set(uniqueProjects.map(p => p.projectName));
    setSelectedProjects(allProjects);
  }, [uniqueProjects]);

  const handleEdit = (projectName: string, subprojectName: string | null, date: Date) => {
    const cellKey = subprojectName 
      ? `${projectName}-${subprojectName}-${format(date, 'yyyy-MM-dd')}`
      : `${projectName}-${format(date, 'yyyy-MM-dd')}`;
      
    const currentTime = subprojectName
      ? getSubprojectDayTime(projectName, subprojectName, date)
      : getProjectDayTime(projectName, date);
      
    setEditingCell(cellKey);
    setEditValue(formatHours(currentTime));
  };

  const handleSave = (projectName: string, subprojectName: string | null, date: Date) => {
    const newDuration = parseHours(editValue);
    
    const existingLog = timeLogs.find(log => {
      const sameProject = log.projectName === projectName;
      const sameSubproject = log.subprojectName === subprojectName;
      const sameDate = isSameDay(new Date(log.date), date);
      
      return sameProject && sameSubproject && sameDate;
    });
    
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

  const toggleProjectExpand = (projectName: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectName)) {
        newSet.delete(projectName);
      } else {
        newSet.add(projectName);
      }
      return newSet;
    });
  };

  const toggleProjectSelection = (projectName: string) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectName)) {
        newSet.delete(projectName);
      } else {
        newSet.add(projectName);
      }
      return newSet;
    });
  };

  const getProjectBackgroundStyle = (projectName: string, isSubproject: boolean = false) => {
    if (!colorCodedEnabled) return {};
    
    const baseColor = generateProjectColor(projectName);
    
    if (isSubproject) {
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.4)`,
        borderLeft: `3px solid ${baseColor}`
      };
    }
    
    return {
      backgroundColor: baseColor
    };
  };

  const getCurrentDayStyle = (date: Date) => {
    if (!isToday(date) || !progressBarEnabled) return {};
    
    return {
      backgroundColor: hexToRgba(progressBarColor, 0.12),
      border: `1.5px solid ${hexToRgba(progressBarColor, 0.32)}`,
      transform: 'translateY(-1.5px)',
    };
  };

  const exportToCSV = () => {
    const headers = ['Project', 'Subproject', 'Date', 'Hours'];
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    uniqueProjects.forEach(project => {
      if (!selectedProjects.has(project.projectName)) return;
      
      daysInRange.forEach(date => {
        const hours = getProjectDayTime(project.projectName, date);
        if (hours > 0) {
          csvRows.push([
            `"${project.projectName}"`,
            '',
            format(date, 'yyyy-MM-dd'),
            formatHours(hours)
          ].join(','));
        }
      });
      
      if (expandedProjects.has(project.projectName)) {
        project.subprojects.forEach(subproject => {
          daysInRange.forEach(date => {
            const hours = getSubprojectDayTime(project.projectName, subproject, date);
            if (hours > 0) {
              csvRows.push([
                `"${project.projectName}"`,
                `"${subproject}"`,
                format(date, 'yyyy-MM-dd'),
                formatHours(hours)
              ].join(','));
            }
          });
        });
      }
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timesheet_${format(dateRange.start, 'yyyyMMdd')}_to_${format(dateRange.end, 'yyyyMMdd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const goToPreviousWeek = () => {
    setDateRange(prev => ({
      start: subDays(prev.start, 7),
      end: subDays(prev.end, 7)
    }));
  };

  const goToNextWeek = () => {
    setDateRange(prev => ({
      start: addDays(prev.start, 7),
      end: addDays(prev.end, 7)
    }));
  };

  const goToCurrentWeek = () => {
    setDateRange({
      start: startOfWeek(new Date(), { weekStartsOn: 1 }),
      end: endOfWeek(new Date(), { weekStartsOn: 1 })
    });
  };

  const handleDateRangeChange = (type: 'start' | 'end', date: Date | undefined) => {
    if (!date) return;
    setDateRange(prev => ({
      ...prev,
      [type]: date
    }));
  };

  const openTimeBreakdown = () => {
    setTimeBreakdownDateRange(dateRange);
    setIsModalOpen(true);
  };

  const weekTotal = daysInRange.reduce((total, day) => total + getDayTotal(day), 0);

  return (
    <div className="space-y-6 animate-fade-in font-sans" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
      {/* Week Summary Card */}
      <Card className="bg-white border border-[#B0B0B0] shadow-md">
        <CardContent className="p-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            {/* Updated date container with gradient and rounded corners */}
            <div className="bg-gradient-to-r from-[#4D4D4D] to-[#1a1a1a] text-white px-4 py-3 rounded-2xl">
              <h2 className="text-xl font-bold text-white">
                {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
              </h2>
              <p className="text-white text-opacity-80 mt-1">
                {formatHours(weekTotal)} hours this week
              </p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto justify-end">
              <Button 
                onClick={goToPreviousWeek}
                variant="outline" 
                className="border border-[#B0B0B0] text-black"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                onClick={goToCurrentWeek}
                className="bg-[#4D4D4D] text-white hover:bg-[#7D7D7D]"
              >
                This Week
              </Button>
              <Button 
                onClick={goToNextWeek}
                variant="outline" 
                className="border border-[#B0B0B0] text-black"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {daysInRange.map(day => {
              const dayTotal = getDayTotal(day);
              const isCurrentDay = isToday(day) && progressBarEnabled;
              const animatedColor = hexToRgba(progressBarColor, 0.3);
              const dateString = `${format(day, 'EEE')} ${format(day, 'd')} ${format(day, 'MMM yyyy')}`;
              
              return (
                <div 
                  key={day.toISOString()}
                  className="relative"
                >
                  <button
                    className={`
                      aspect-square flex flex-col items-center justify-between 
                      p-0 rounded-2xl border border-[#E0E0E0] w-full
                      transition-all duration-300
                      bg-gradient-to-b from-white to-[#F8F8F8]
                      hover:shadow-lg hover:border-[#B0B0B0] hover:scale-105
                      focus:outline-none relative overflow-hidden
                    `}
                    style={getCurrentDayStyle(day)}
                    onClick={openTimeBreakdown}
                  >
                    {isCurrentDay && (
                      <>
                        {/* Wind animation layers */}
                        <div 
                          className="absolute inset-0 pointer-events-none z-0"
                          style={{
                            background: `linear-gradient(45deg, 
                              ${hexToRgba(progressBarColor, 0)} 0%, 
                              ${animatedColor} 25%, 
                              ${hexToRgba(progressBarColor, 0)} 50%, 
                              ${hexToRgba(progressBarColor, 0.4)} 75%, 
                              ${hexToRgba(progressBarColor, 0)} 100%)`,
                            backgroundSize: '400% 400%',
                            animation: 'windFlow1 18s linear infinite',
                            opacity: 0.8
                          }}
                        />
                        <div 
                          className="absolute inset-0 pointer-events-none z-0"
                          style={{
                            background: `linear-gradient(135deg, 
                              ${hexToRgba(progressBarColor, 0)} 0%, 
                              ${hexToRgba(progressBarColor, 0.2)} 20%, 
                              ${hexToRgba(progressBarColor, 0)} 40%, 
                              ${hexToRgba(progressBarColor, 0.3)} 60%, 
                              ${hexToRgba(progressBarColor, 0)} 80%)`,
                            backgroundSize: '600% 600%',
                            animation: 'windFlow2 22s linear infinite',
                            opacity: 0.6
                          }}
                        />
                        <div 
                          className="absolute inset-0 pointer-events-none z-0"
                          style={{
                            background: `linear-gradient(225deg, 
                              ${hexToRgba(progressBarColor, 0)} 0%, 
                              ${hexToRgba(progressBarColor, 0.15)} 15%, 
                              ${hexToRgba(progressBarColor, 0)} 30%, 
                              ${hexToRgba(progressBarColor, 0.25)} 45%, 
                              ${hexToRgba(progressBarColor, 0)} 60%)`,
                            backgroundSize: '800% 800%',
                            animation: 'windFlow3 26s linear infinite',
                            opacity: 0.4
                          }}
                        />
                      </>
                    )}
                    
                    {/* Combined date string centered */}
                    <div className="w-full flex flex-col items-center justify-center flex-grow z-10 pt-4 px-2">
                      <div className="text-center">
                        <div className="text-base font-semibold text-[#1a1a1a]">
                          {format(day, 'EEE')}
                        </div>
                        <div className="text-5xl font-bold text-[#1a1a1a] mt-1 mb-1">
                          {format(day, 'd')}
                        </div>
                        <div className="text-base font-normal text-[#1a1a1a]">
                          {format(day, 'MMM yyyy')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Hours at bottom - now occupies entire bottom section */}
                    <div className="w-full mt-auto z-10">
                      <div className="text-xl font-medium bg-[#4D4D4D] text-white px-4 py-3 rounded-b-2xl w-full flex items-center justify-center">
                        {formatHours(dayTotal)} hours
                      </div>
                    </div>
                  </button>
                  
                  {isCurrentDay && (
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full animate-ping z-10" 
                         style={{ backgroundColor: progressBarColor }} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Wind animation keyframes */}
          <style>{`
            @keyframes windFlow1 {
              0% { 
                background-position: 0% 0%;
              }
              25% { 
                background-position: 50% 50%;
                opacity: 0.9;
              }
              50% { 
                background-position: 100% 100%;
                opacity: 0.7;
              }
              75% { 
                background-position: 150% 150%;
                opacity: 0.9;
              }
              100% { 
                background-position: 200% 200%;
                opacity: 0.7;
              }
            }
            
            @keyframes windFlow2 {
              0% { 
                background-position: 100% 0%;
              }
              25% { 
                background-position: 150% 50%;
                opacity: 0.7;
              }
              50% { 
                background-position: 200% 100%;
                opacity: 0.5;
              }
              75% { 
                background-position: 250% 150%;
                opacity: 0.7;
              }
              100% { 
                background-position: 300% 200%;
                opacity: 0.5;
              }
            }
            
            @keyframes windFlow3 {
              0% { 
                background-position: 0% 100%;
              }
              25% { 
                background-position: 50% 150%;
                opacity: 0.5;
              }
              50% { 
                background-position: 100% 200%;
                opacity: 0.3;
              }
              75% { 
                background-position: 150% 250%;
                opacity: 0.5;
              }
              100% { 
                background-position: 200% 300%;
                opacity: 0.3;
              }
            }
          `}</style>
        </CardContent>
      </Card>

      {/* Time Breakdown Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl border border-[#B0B0B0]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-black tracking-tight">
              Time Breakdown - {format(dateRange.start, 'MMM d, yyyy')} to {format(dateRange.end, 'MMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          <TimeBreakdown
            timeLogs={timeLogs}
            onUpdateTime={onUpdateTime}
            dateRange={timeBreakdownDateRange}
            onDateRangeChange={setTimeBreakdownDateRange}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyTimesheet;