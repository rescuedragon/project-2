import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Download, Filter, ChevronDown, Edit, Save, X } from 'lucide-react';
import { TimeLog } from './TimeTracker';
import { format, startOfWeek, endOfWeek, addDays, subDays, isSameDay, eachDayOfInterval, isToday } from 'date-fns';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WeeklyTimesheetProps {
  timeLogs: TimeLog[];
  onUpdateTime: (logId: string, newDuration: number) => void;
}

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
  const [activeTab, setActiveTab] = useState<'weekly' | 'daily'>('weekly');

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
    return allDays.filter(day => day.getDay() !== 0 && day.getDay() !== 6); // Filter out weekends
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
    const isToday = isSameDay(date, new Date());
    if (!isToday || !progressBarEnabled) return {};
    
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    return {
      backgroundColor: hexToRgba(progressBarColor, 0.12),
      border: `1.5px solid ${hexToRgba(progressBarColor, 0.32)}`,
      boxShadow: `0 3px 9px ${hexToRgba(progressBarColor, 0.16)}`,
      transform: 'translateY(-1.5px)',
    };
  };

  const getDayBoxGlowStyle = (date: Date) => {
    if (!isToday(date) || !progressBarEnabled) return {};
    return {
      boxShadow: `0 0 15px ${progressBarColor}`,
      borderColor: progressBarColor
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
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
      {/* Week Days Card */}
      <Card className="bg-white border border-[#B0B0B0] shadow-md">
        <CardHeader className="py-4 px-6 bg-[#F0F0F0] border-b border-[#B0B0B0]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Tabs */}
              <div className="flex space-x-2">
                <Button 
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'weekly' 
                      ? 'bg-[#4D4D4D] text-white' 
                      : 'bg-white text-[#4D4D4D] border border-[#B0B0B0] hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('weekly')}
                >
                  Weekly View
                </Button>
                <Button 
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'daily' 
                      ? 'bg-[#4D4D4D] text-white' 
                      : 'bg-white text-[#4D4D4D] border border-[#B0B0B0] hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('daily')}
                >
                  Daily View
                </Button>
              </div>
              
              <div className="hidden md:block text-lg font-bold text-[#4D4D4D]">
                Week Days
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <Button onClick={goToPreviousWeek} variant="outline" size="sm" className="border border-[#B0B0B0] text-black">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-[#4D4D4D] font-medium">From:</Label>
                    <input
                      type="date"
                      value={format(dateRange.start, 'yyyy-MM-dd')}
                      onChange={(e) => handleDateRangeChange('start', new Date(e.target.value))}
                      className="border border-[#B0B0B0] rounded px-2 py-1"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-[#4D4D4D] font-medium">To:</Label>
                    <input
                      type="date"
                      value={format(dateRange.end, 'yyyy-MM-dd')}
                      onChange={(e) => handleDateRangeChange('end', new Date(e.target.value))}
                      className="border border-[#B0B0B0] rounded px-2 py-1"
                    />
                  </div>
                </div>
                
                <Button onClick={goToNextWeek} variant="outline" size="sm" className="border border-[#B0B0B0] text-black">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <Button onClick={goToCurrentWeek} className="bg-[#4D4D4D] text-white hover:bg-[#7D7D7D]">
                  This Week
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {daysInRange.map(day => {
              const dayTotal = getDayTotal(day);
              const isCurrentDay = isToday(day);
              
              return (
                <button
                  key={day.toISOString()}
                  className={`
                    aspect-square flex flex-col items-center justify-center 
                    p-4 rounded-2xl border border-[#E0E0E0]
                    transition-all duration-300
                    bg-gradient-to-b from-white to-[#F8F8F8]
                    ${isCurrentDay ? 'ring-2 ring-opacity-50' : ''}
                    hover:shadow-lg hover:border-[#B0B0B0] hover:scale-105
                    focus:outline-none
                  `}
                  style={getDayBoxGlowStyle(day)}
                  onClick={openTimeBreakdown}
                >
                  <div className="text-sm font-semibold text-[#4D4D4D] mb-1">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-2xl font-bold text-[#4D4D4D] mb-2">
                    {format(day, 'd')}
                  </div>
                  <div className="text-xs font-medium text-[#7D7D7D]">
                    {format(day, 'MMM yyyy')}
                  </div>
                  <div className="mt-2 text-sm font-medium bg-[#4D4D4D] text-white px-2 py-1 rounded-full">
                    {formatHours(dayTotal)} hours
                  </div>
                </button>
              );
            })}
          </div>
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
          
          <div className="mt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Button onClick={goToPreviousWeek} variant="outline" size="sm" className="border border-[#B0B0B0] text-black">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-[#4D4D4D] font-medium">From:</Label>
                    <input
                      type="date"
                      value={format(dateRange.start, 'yyyy-MM-dd')}
                      onChange={(e) => handleDateRangeChange('start', new Date(e.target.value))}
                      className="border border-[#B0B0B0] rounded px-2 py-1"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-[#4D4D4D] font-medium">To:</Label>
                    <input
                      type="date"
                      value={format(dateRange.end, 'yyyy-MM-dd')}
                      onChange={(e) => handleDateRangeChange('end', new Date(e.target.value))}
                      className="border border-[#B0B0B0] rounded px-2 py-1"
                    />
                  </div>
                </div>
                
                <Button onClick={goToNextWeek} variant="outline" size="sm" className="border border-[#B0B0B0] text-black">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <Popover open={isProjectFilterOpen} onOpenChange={setIsProjectFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="border border-[#4D4D4D] text-[#4D4D4D] hover:bg-[#4D4D4D] hover:text-white flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filter Projects
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4 bg-white border border-[#B0B0B0] shadow-lg">
                    <div className="space-y-3">
                      <h4 className="font-bold text-[#4D4D4D] border-b border-[#E0E0E0] pb-2">Select Projects</h4>
                      <div className="max-h-60 overflow-y-auto">
                        {uniqueProjects.map(project => (
                          <div key={project.projectName} className="flex items-center gap-2 py-1">
                            <Checkbox
                              id={`project-${project.projectName}`}
                              checked={selectedProjects.has(project.projectName)}
                              onCheckedChange={() => toggleProjectSelection(project.projectName)}
                            />
                            <Label htmlFor={`project-${project.projectName}`} className="text-[#4D4D4D]">
                              {project.projectName}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end pt-2 border-t border-[#E0E0E0]">
                        <Button 
                          size="sm" 
                          onClick={() => setIsProjectFilterOpen(false)}
                          className="bg-[#4D4D4D] text-white hover:bg-[#7D7D7D]"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  onClick={exportToCSV}
                  variant="outline" 
                  className="border border-[#4D4D4D] text-[#4D4D4D] hover:bg-[#4D4D4D] hover:text-white flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                
                <Button onClick={goToCurrentWeek} className="bg-[#4D4D4D] text-white hover:bg-[#7D7D7D]">
                  This Week
                </Button>
              </div>
            </div>
            
            {uniqueProjects.length === 0 ? (
              <div className="text-center py-12 text-[#7D7D7D]">
                <Calendar className="h-16 w-16 mx-auto mb-6 opacity-40" />
                <p className="text-lg font-medium">No time entries for this period</p>
                <p className="text-sm mt-2">Start tracking time to see entries here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#F8F8F8] border-b border-t border-[#E0E0E0]">
                      <th className="text-left py-4 px-4 font-semibold text-[#4D4D4D] border-r border-[#E0E0E0]">Project</th>
                      <th className="text-left py-4 px-4 font-semibold text-[#4D4D4D] border-r border-[#E0E0E0]">Subproject</th>
                      {daysInRange.map(day => (
                        <th 
                          key={day.toISOString()} 
                          className={`text-center py-4 px-4 font-semibold text-[#4D4D4D] min-w-[100px] border-r border-[#E0E0E0] ${isToday(day) && progressBarEnabled ? 'bg-opacity-20' : ''}`}
                          style={getCurrentDayStyle(day)}
                        >
                          <div className="font-bold">{format(day, 'EEE')}</div>
                          <div className="text-xs font-normal text-[#7D7D7D]">{format(day, 'M/d')}</div>
                        </th>
                      ))}
                      <th className="text-center py-4 px-4 font-semibold text-[#4D4D4D]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueProjects
                      .filter(project => selectedProjects.has(project.projectName))
                      .map(project => (
                        <React.Fragment key={project.projectName}>
                          <tr 
                            className="border-b border-[#F0F0F0] hover:bg-[#F8F8F8] transition-colors"
                            style={getProjectBackgroundStyle(project.projectName)}
                          >
                            <td className="py-4 px-4 font-bold text-[#4D4D4D] border-r border-[#E0E0E0]">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => toggleProjectExpand(project.projectName)}
                                >
                                  {expandedProjects.has(project.projectName) ? 
                                    <ChevronDown className="h-4 w-4" /> : 
                                    <ChevronRight className="h-4 w-4" />
                                  }
                                </Button>
                                <span>{project.projectName}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-[#7D7D7D] border-r border-[#E0E0E0]">Project Total</td>
                            {daysInRange.map(day => {
                              const dayTime = getProjectDayTime(project.projectName, day);
                              const cellKey = `${project.projectName}-${format(day, 'yyyy-MM-dd')}`;
                              const isEditing = editingCell === cellKey;
                              
                              return (
                                <td 
                                  key={day.toISOString()} 
                                  className="py-4 px-4 text-center border-r border-[#E0E0E0]"
                                >
                                  {isEditing ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-16 h-8 text-center text-sm border border-[#B0B0B0] rounded"
                                        type="number"
                                        step="0.1"
                                        autoFocus
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleSave(project.projectName, null, day)}
                                        className="h-8 w-8 p-0 bg-[#4D4D4D] text-white"
                                      >
                                        <Save className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleCancel}
                                        className="h-8 w-8 p-0 text-[#7D7D7D]"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div 
                                      className="flex items-center justify-center gap-1 cursor-pointer hover:bg-[#F0F0F0] rounded px-2 py-1 transition-colors"
                                      onClick={() => handleEdit(project.projectName, null, day)}
                                    >
                                      <span className="font-mono text-sm font-medium text-[#4D4D4D]">
                                        {formatHours(dayTime)}
                                      </span>
                                      {dayTime > 0 && (
                                        <Edit className="h-3 w-3 text-[#7D7D7D] opacity-0 group-hover:opacity-100 transition-opacity" />
                                      )}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                            <td className="py-4 px-4 text-center">
                              <span className="font-mono text-sm font-bold text-[#4D4D4D] bg-[#F0F0F0] px-3 py-1 rounded-lg">
                                {formatHours(getProjectTotal(project.projectName))}
                              </span>
                            </td>
                          </tr>
                          
                          {expandedProjects.has(project.projectName) && 
                            Array.from(project.subprojects).map(subproject => (
                              <tr 
                                key={`${project.projectName}-${subproject}`}
                                className="border-b border-[#F0F0F0] hover:bg-[#F8F8F8] transition-colors"
                                style={getProjectBackgroundStyle(project.projectName, true)}
                              >
                                <td className="py-4 px-4 pl-10 font-medium text-[#4D4D4D] border-r border-[#E0E0E0]"></td>
                                <td className="py-4 px-4 text-[#7D7D7D] border-r border-[#E0E0E0]">{subproject}</td>
                                {daysInRange.map(day => {
                                  const dayTime = getSubprojectDayTime(project.projectName, subproject, day);
                                  const cellKey = `${project.projectName}-${subproject}-${format(day, 'yyyy-MM-dd')}`;
                                  const isEditing = editingCell === cellKey;
                                  
                                  return (
                                    <td 
                                      key={day.toISOString()} 
                                      className="py-4 px-4 text-center border-r border-[#E0E0E0]"
                                    >
                                      {isEditing ? (
                                        <div className="flex items-center justify-center gap-1">
                                          <input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-16 h-8 text-center text-sm border border-[#B0B0B0] rounded"
                                            type="number"
                                            step="0.1"
                                            autoFocus
                                          />
                                          <Button
                                            size="sm"
                                            onClick={() => handleSave(project.projectName, subproject, day)}
                                            className="h-8 w-8 p-0 bg-[#4D4D4D] text-white"
                                          >
                                            <Save className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleCancel}
                                            className="h-8 w-8 p-0 text-[#7D7D7D]"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <div 
                                          className="flex items-center justify-center gap-1 cursor-pointer hover:bg-[#F0F0F0] rounded px-2 py-1 transition-colors"
                                          onClick={() => handleEdit(project.projectName, subproject, day)}
                                        >
                                          <span className="font-mono text-sm font-medium text-[#4D4D4D]">
                                            {formatHours(dayTime)}
                                          </span>
                                          {dayTime > 0 && (
                                            <Edit className="h-3 w-3 text-[#7D7D7D] opacity-0 group-hover:opacity-100 transition-opacity" />
                                          )}
                                        </div>
                                      )}
                                    </td>
                                  );
                              })}
                              <td className="py-4 px-4 text-center">
                                <span className="font-mono text-sm font-bold text-[#4D4D4D] bg-[#F0F0F0] px-3 py-1 rounded-lg">
                                  {formatHours(getSubprojectTotal(project.projectName, subproject))}
                                </span>
                              </td>
                            </tr>
                          ))
                        }
                      </React.Fragment>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[#4D4D4D] bg-[#F8F8F8]">
                      <td className="py-4 px-4 font-bold text-[#4D4D4D] border-r border-[#E0E0E0]">Grand Total</td>
                      <td className="py-4 px-4 border-r border-[#E0E0E0]"></td>
                      {daysInRange.map(day => (
                        <td key={day.toISOString()} className="py-4 px-4 text-center border-r border-[#E0E0E0]">
                          <span className="font-mono text-sm font-bold text-[#4D4D4D] bg-[#F0F0F0] px-3 py-1 rounded-lg">
                            {formatHours(getDayTotal(day))}
                          </span>
                        </td>
                      ))}
                      <td className="py-4 px-4 text-center">
                        <span className="font-mono text-lg font-bold text-[#4D4D4D] bg-[#F0F0F0] px-4 py-2 rounded-lg">
                          {formatHours(timeLogs.reduce((total, log) => total + log.duration, 0))}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyTimesheet;