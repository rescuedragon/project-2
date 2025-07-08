import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Calendar, BarChart3, ChevronDown, ChevronRight as ChevronRightIcon, Edit, Expand, Minimize2, Download, CalendarIcon, Filter, X, Check, Leaf } from 'lucide-react';
import { TimeLog } from './TimeTracker';
import DailyTimesheet from './DailyTimesheet';
import DateRangeSelector from './DateRangeSelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';

interface WeeklyTimesheetProps {
  timeLogs: TimeLog[];
  onUpdateTime: (logId: string, newDuration: number) => void;
}

interface ProjectTimeData {
  projectId: string;
  projectName: string;
  totalTime: number;
  subprojects: {
    subprojectId: string;
    subprojectName: string;
    dailyTimes: { [key: string]: { time: number; logs: TimeLog[] } };
    totalTime: number;
  }[];
  dailyTimes: { [key: string]: { time: number; logs: TimeLog[] } };
}

const WeeklyTimesheet: React.FC<WeeklyTimesheetProps> = ({ timeLogs, onUpdateTime }) => {
  // Animation keyframes injection
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const existingStyle = document.getElementById('texture-animation-keyframes');
    if (existingStyle) return;
    
    const styleTag = document.createElement('style');
    styleTag.id = 'texture-animation-keyframes';
    styleTag.textContent = `
      @keyframes textureAnimation {
        0% { background-position: 0% 0%; }
        100% { background-position: 200% 200%; }
      }
      @keyframes leavesAnimation {
        0% { background-position: 0% 0%, 0% 0%; }
        50% { background-position: 100% 50%, 50% 100%; }
        100% { background-position: 200% 100%, 100% 200%; }
      }
      @keyframes glassReflection {
        0% { transform: translateX(-100%) rotate(15deg); }
        100% { transform: translateX(100%) rotate(15deg); }
      }
    `;
    document.head.appendChild(styleTag);
  }, []);

  // Base64 encoded leaf texture
  const leafTexture = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMTUwIDE1MCI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBvcGFjaXR5PSIwLjEiPjxwYXRoIGQ9Ik0zOC4wMjkgMTQzLjEyNGMtMy4xNzYtLjI0NC02LjMyMi0uODk4LTkuMjQzLTIuMDM3YTEuNTEgMS41MSAwIDAgMS0uMzY0LS4xMjJjLTEyLjY0My00LjY0Ni0xOC4wODktMTkuODQzLTEyLjI0OC0zNC4wM2MyLjI0LTUuNDYgNi4xMDMtMTEuMDYgMTEuNTQ0LTE2LjU5YTg5LjE4IDg5LjE4IDAgMCAxIDEyLjI5My05LjY5OGM1LjQ0LTQuNDU0IDkuNzYtOC4wMzcgMTIuMzYtMTAuNDI0YzMuODktMy42MTggNi4zMjUtNy4xMjcgNy43NDQtMTAuODk0YzEuNDY0LTMuODg1IDEuODI3LTcuOTU0LjY3LTExLjc2M2EzMy4xIDMzLjEgMCAwIDEtMS4xMDItNS4wMTJjLS4yNDUtMS4yOC0uMzgzLTIuNjA2LS4zODMtMy45NThhMTYuMzkgMTYuMzkgMCAwIDEgLjM1My00LjM0MmMuMzA1LTEuMzgzLjgxNy0yLjY3IDEuNTI0LTMuODI1YTguMTUgOC4xNSAwIDAgMSAzLjIxNC0yLjg1YzEuMjI3LS41ODQgMi42MDQtLjg3IDQuMDc0LS44N2EyMi44MyAyMi44MyAwIDAgMSA0LjQ0OC40NjljMS4zOTUuMzAyIDIuNzUuNzM4IDQuMDIgMS4yODZhMzguODUgMzguODUgMCAwIDEgMy45MzMgMS43ODhjMy4xNCAxLjY0IDYuMDQgMy42NCA4LjYxIDUuOTI0YzYuMDUgNS4zOCAxMS4wMSAxMS45IDE0LjUxIDE5LjA3YTUxLjQzIDUxLjQzIDAgMCAxIDMuMTIgMTEuMDYyYzEuMDkgNS4yNTQuODIgMTAuNzYtLjc4IDE1Ljg0YTE4LjY1IDE4LjY1IDAgMCAxLTIuODQgNS4wN2MtMS4xOCAxLjU2LTIuNzIgMi44OS00LjUyIDMuOTRhMTcuMDQgMTcuMDQgMCAwIDEtNS4xNCAxLjk1Yy0xLjgxLjQ0LTMuNzEuNjItNS41OS41M2EyOC4xIDI4LjEgMCAwIDEtNC4zOS0uNjhjLTEuNDMtLjQ1LTIuNzYtMS4wNi00LjAyLTEuOGExOS45IDE5LjkgMCAwIDEtMy40LTIuNDNjLTEuMDYtLjktMS45NS0xLjk0LTIuNjYtMy4xYTkuMDcgOS4wNyAwIDAgMS0xLjIxLTIuOTljLS4yOC0xLjE2LS4yOC0yLjM3IDAtMy41Mi4xNS0uNTcuNC0xLjEuNzUtMS42YTQuMjYgNC4yNiAwIDAgMSAyLjE4LTEuNjljLjQ4LS4xNS45OS0uMjIgMS41LS4yMmEuNDguNDggMCAwIDEgLjM3LjE0LjU0LjU0IDAgMCAxIC4xMy4zOS4zOC4zOCAwIDAgMS0uMDYuMi42LjYgMCAwIDEtLjE0LjE3bC0uMjEuMTdhNS4xIDUuMSAwIDAgMC0uOTQuODJjLS4yNi4zNS0uNDIuNzUtLjQ4IDEuMTdhMS45IDEuOSAwIDAgMCAuMDYgLjg4Yy4wOS4yNy4yMy41LjQxLjdhMi4zMiAyLjMyIDAgMCAwIDEuNzguNTZjLjUzIDAgMS4wMy0uMTMgMS40OC0uMzZhMy4xIDMuMSAwIDAgMCAxLjE0LTEuMDJjLjI3LS40LjQ0LS44Ni41Mi0xLjM0YTQuNjYgNC42NiAwIDAgMC0uMDktMS44OCA1LjYgNS42IDAgMCAwLS42LTEuNTggNi44IDYuOCAwIDAgMC0xLjA1LTEuMyA3LjYgNy42IDAgMCAxIDIuMTYtLjQ2Yy43IDAgMS4zOC4xOCAxLjk3LjUzYTQuMzQgNC4zNCAwIDAgMSAxLjQ2IDEuNDNjLjM3LjYuNjIgMS4yOC43MiAyLjAyYTUuMDYgNS4wNiAwIDAgMS0uMTkgMi4yIDcuMTYgNy4xNiAwIDAgMS0xLjE0IDIuMjIgOC43IDguNyAwIDAgMS0xLjc3IDEuNzQgOS45IDkuOSAwIDAgMS0yLjI3IDEuMSAxMS40IDExLjQgMCAwIDEtMi42LjUyYy0uODguMDctMS43OC0uMDItMi42NC0uMjhhMTAgMTAgMCAwIDEtMi4zLS44OSA5LjIgOS4yIDAgMCAxLTEuOTQtMS40NCA4LjQgOC40IDAgMCAxLTEuNDgtMS45IDcuNjUgNy42NSAwIDAgMS0xLjAyLTIuMjUgNi42IDYuNiAwIDAgMS0uMzYtMi40YzAtLjg1LjEyLTEuNjkuMzctMi40OWEyMy4yIDIzLjIgMCAwIDEgMy40NC00LjY4YzEuMjYtMS40OSAyLjY0LTIuODkgNC4xMi00LjE3YTU1LjIgNTUuMiAwIDAgMSA0LjY0LTMuMzkgNDAuNSA0MC41IDAgMCAxIDQuODctMi44MyAzMyAzMyAwIDAgMSA0LjkyLTEuOTMgMjQuMzQgMjQuMzQgMCAwIDEgNC43NC0uOTQgMTkuMjQgMTkuMjQgMCAwIDEgNC4zOC4wNiAyMS4wOCAyMS4wOCAwIDAgMSA0LjIyIDEuMDljMS4zNi40NyAyLjYzIDEuMDggMy44IDEuODFhMTIuNjQgMTIuNjQgMCAwIDEgMy4wOCAyLjYyIDExLjYgMTEuNiAwIDAgMSAyLjA1IDMuNzcgMTIuMyAxMi4zIDAgMCAxIC43MiA0LjM3Yy0uMDYgMS40OC0uNDMgMi45Mi0xLjA1IDQuMjZhMTUuMTYgMTUuMTYgMCAwIDEtMi43NyA0LjA0Yy0xLjA4IDEuMDktMi4zNSAyLjAzLTMuNzYgMi43N2ExOC4zIDE4LjMgMCAwIDEtNC41NCAxLjYzYy0xLjU0LjMtMy4xMi40MS00LjcuMzJ6Ii8+PC9nPjwvc3ZnPg==`;

  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getCurrentWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(getCurrentWeekStart());
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: getCurrentWeekStart(),
    end: new Date(getCurrentWeekStart().getTime() + 6 * 24 * 60 * 60 * 1000)
  });
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedDayLogs, setSelectedDayLogs] = useState<TimeLog[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('current-week');
  const [allExpanded, setAllExpanded] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);
  const [progressBarEnabled, setProgressBarEnabled] = useState(false);
  const [progressBarColor, setProgressBarColor] = useState('#10b981');
  
  // Filter states
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  React.useEffect(() => {
    setColorCodedEnabled(isColorCodedProjectsEnabled());
    
    // Load progress bar settings
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

  const getProjectRowStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    return {
      backgroundColor: generateProjectColor(projectName)
    };
  };

  const getSubprojectRowStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    const baseColor = generateProjectColor(projectName);
    // Make subproject rows slightly more transparent
    return {
      backgroundColor: baseColor.replace('0.7', '0.5')
    };
  };

  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Helper function to get current day highlight style
  const getCurrentDayStyle = (date: Date) => {
    if (!isToday(date) || !progressBarEnabled) return {};
    
    return {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: hexToRgba(progressBarColor, 0.25),
      boxShadow: `
        inset 0 0 0 1px rgba(255, 255, 255, 0.4),
        inset 0 0 20px 8px rgba(0, 0, 0, 0.1),
        inset 0 0 40px 16px ${hexToRgba(progressBarColor, 0.15)}
      `,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          linear-gradient(120deg, 
            ${hexToRgba(progressBarColor, 0)} 0%, 
            ${hexToRgba(progressBarColor, 0.4)} 30%, 
            ${hexToRgba(progressBarColor, 0)} 70%),
          url(${leafTexture}) 0 0 repeat
        `,
        backgroundSize: '200% 200%, 150px 150px',
        animation: 'leavesAnimation 18s infinite linear, textureAnimation 6s infinite linear',
        zIndex: -1,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        right: '-50%',
        bottom: '-50%',
        background: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 100%)',
        transform: 'rotate(15deg)',
        animation: 'glassReflection 6s infinite linear',
        zIndex: -1,
      }
    };
  };
  
  const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(1);
  };

  const parseHours = (hours: string) => {
    return parseFloat(hours) * 3600;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Project', 'Subproject', 'Start Time', 'End Time', 'Duration (hrs)', 'Description'];
    const csvData = [
      headers.join(','),
      ...timeLogs
        .filter(log => {
          const logDate = new Date(log.date);
          return logDate >= dateRange.start && logDate <= dateRange.end;
        })
        .map(log => [
          log.date,
          `"${log.projectName}"`,
          `"${log.subprojectName}"`,
          log.startTime,
          log.endTime,
          formatHours(log.duration),
          `"${log.description || ''}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${dateRange.start.toISOString().split('T')[0]}-to-${dateRange.end.toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ start: startDate, end: endDate });
    setCurrentWeekStart(startDate);
  };

  const getDateRange = (range: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (range) {
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'previous-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'previous-quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const prevQuarterStart = (currentQuarter - 1) * 3;
        startDate = new Date(now.getFullYear(), prevQuarterStart, 1);
        endDate = new Date(now.getFullYear(), prevQuarterStart + 3, 0);
        break;
      case 'previous-6-months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'this-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case 'custom':
        setShowCustomRange(true);
        return;
      default: // current-week
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    handleDateRangeChange(startDate, endDate);
  };

  const handleRangeSelect = (range: string) => {
    setSelectedRange(range);
    if (range !== 'custom') {
      setShowCustomRange(false);
    }
    getDateRange(range);
  };

  const handleCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      handleDateRangeChange(customStartDate, customEndDate);
      setSelectedRange('custom');
      setShowCustomRange(false);
    }
  };

  const handleTimeEdit = (logId: string, newValue: string) => {
    const hours = parseFloat(newValue) || 0;
    const seconds = hours * 3600;
    onUpdateTime(logId, seconds);
    setEditingCell(null);
  };

  const getCurrentDateRangeData = () => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    if (selectedRange === 'current-week') {
      const days = [];
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      
      for (let day = 0; day < 5; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + day);
        
        const dayLogs = timeLogs.filter(log => {
          const logDate = new Date(log.date);
          return logDate.toDateString() === date.toDateString();
        });
        
        const totalHours = dayLogs.reduce((sum, log) => sum + log.duration, 0);
        
        days.push({
          date,
          dayName: dayNames[day],
          totalHours,
          logs: dayLogs
        });
      }
      
      const weekTotal = days.reduce((sum, day) => sum + day.totalHours, 0);
      return { weekStart: startDate, weekEnd: endDate, days, weekTotal };
    }
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayLogs = timeLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.toDateString() === currentDate.toDateString();
      });
      
      const totalHours = dayLogs.reduce((sum, log) => sum + log.duration, 0);
      
      days.push({
        date: new Date(currentDate),
        dayName: currentDate.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }),
        totalHours,
        logs: dayLogs
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const totalTime = days.reduce((sum, day) => sum + day.totalHours, 0);
    return { weekStart: startDate, weekEnd: endDate, days, weekTotal: totalTime };
  };

  const getProjectTimeData = (): ProjectTimeData[] => {
    const projectMap = new Map<string, ProjectTimeData>();
    
    timeLogs.forEach(log => {
      const logDate = new Date(log.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      if (logDate < startDate || logDate > endDate) return;
      
      // Apply project filter
      if (selectedProjects.size > 0 && !selectedProjects.has(log.projectId)) return;
      
      const dayKey = selectedRange === 'current-week' 
        ? logDate.toLocaleDateString('en-US', { weekday: 'short' })
        : logDate.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
      
      if (!projectMap.has(log.projectId)) {
        projectMap.set(log.projectId, {
          projectId: log.projectId,
          projectName: log.projectName,
          totalTime: 0,
          subprojects: [],
          dailyTimes: {}
        });
      }
      
      const projectData = projectMap.get(log.projectId)!;
      projectData.totalTime += log.duration;
      
      if (!projectData.dailyTimes[dayKey]) {
        projectData.dailyTimes[dayKey] = { time: 0, logs: [] };
      }
      projectData.dailyTimes[dayKey].time += log.duration;
      projectData.dailyTimes[dayKey].logs.push(log);
      
      let subproject = projectData.subprojects.find(s => s.subprojectId === log.subprojectId);
      if (!subproject) {
        subproject = {
          subprojectId: log.subprojectId,
          subprojectName: log.subprojectName,
          dailyTimes: {},
          totalTime: 0
        };
        projectData.subprojects.push(subproject);
      }
      
      subproject.totalTime += log.duration;
      if (!subproject.dailyTimes[dayKey]) {
        subproject.dailyTimes[dayKey] = { time: 0, logs: [] };
      }
      subproject.dailyTimes[dayKey].time += log.duration;
      subproject.dailyTimes[dayKey].logs.push(log);
    });
    
    let projectsArray = Array.from(projectMap.values());
    
    // Apply sorting
    if (sortColumn) {
      projectsArray.sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;
        
        if (sortColumn === 'project') {
          aValue = a.projectName.toLowerCase();
          bValue = b.projectName.toLowerCase();
        } else if (sortColumn === 'total') {
          aValue = a.totalTime;
          bValue = b.totalTime;
        } else {
          // Day column sorting
          aValue = a.dailyTimes[sortColumn]?.time || 0;
          bValue = b.dailyTimes[sortColumn]?.time || 0;
        }
        
        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }
    
    return projectsArray;
  };

  const handleTimeClick = (logs: TimeLog[]) => {
    setSelectedDayLogs(logs);
    setIsDialogOpen(true);
  };

  const handleDayTimeClick = (logs: TimeLog[]) => {
    setIsDetailedViewOpen(true);
  };

  const handleCellEdit = (projectId: string, subprojectId: string | null, day: string, currentTime: number) => {
    const cellKey = `${projectId}-${subprojectId || 'main'}-${day}`;
    setEditingCell(cellKey);
    setEditValue((currentTime / 3600).toFixed(1));
  };

  const handleSaveCellEdit = (projectId: string, subprojectId: string | null, day: string) => {
    const newDurationHours = parseFloat(editValue) || 0;
    const newDurationSeconds = newDurationHours * 3600;
    
    const projectData = getProjectTimeData().find(p => p.projectId === projectId);
    
    if (projectData) {
      const timeData = subprojectId 
        ? projectData.subprojects.find(s => s.subprojectId === subprojectId)?.dailyTimes[day]
        : projectData.dailyTimes[day];
        
      if (timeData && timeData.logs.length > 0) {
        // Update all logs for this cell to proportionally distribute the new time
        const currentTotalTime = timeData.time;
        const ratio = newDurationSeconds / currentTotalTime;
        
        timeData.logs.forEach(log => {
          const newLogDuration = Math.round(log.duration * ratio);
          onUpdateTime(log.id, newLogDuration);
        });
      }
    }
    
    setEditingCell(null);
    setEditValue('');
  };

  const nextWeek = () => {
    if (selectedRange === 'this-month' || selectedRange === 'previous-month') {
      // For monthly views, move by months
      const newStart = new Date(dateRange.start);
      newStart.setMonth(newStart.getMonth() + 1);
      const newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
      handleDateRangeChange(newStart, newEnd);
    } else {
      // For weekly views, move by weeks
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() + 7);
      const newWeekEnd = new Date(newWeekStart);
      newWeekEnd.setDate(newWeekStart.getDate() + 6);
      newWeekEnd.setHours(23, 59, 59, 999);
      setCurrentWeekStart(newWeekStart);
      setDateRange({ start: newWeekStart, end: newWeekEnd });
    }
  };

  const prevWeek = () => {
    if (selectedRange === 'this-month' || selectedRange === 'previous-month') {
      // For monthly views, move by months
      const newStart = new Date(dateRange.start);
      newStart.setMonth(newStart.getMonth() - 1);
      const newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
      handleDateRangeChange(newStart, newEnd);
    } else {
      // For weekly views, move by weeks
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() - 7);
      const newWeekEnd = new Date(newWeekStart);
      newWeekEnd.setDate(newWeekStart.getDate() + 6);
      newWeekEnd.setHours(23, 59, 59, 999);
      setCurrentWeekStart(newWeekStart);
      setDateRange({ start: newWeekStart, end: newWeekEnd });
    }
  };

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleAllExpansion = () => {
    const projectData = getProjectTimeData();
    if (allExpanded) {
      setExpandedProjects(new Set());
    } else {
      setExpandedProjects(new Set(projectData.map(p => p.projectId)));
    }
    setAllExpanded(!allExpanded);
  };

  const getColumnTotals = () => {
    const projectData = getProjectTimeData();
    const { days } = getCurrentDateRangeData();
    const totals: { [key: string]: number } = { Total: 0 };
    
    days.forEach(day => {
      totals[day.dayName] = 0;
    });
    
    projectData.forEach(project => {
      days.forEach(day => {
        const time = project.dailyTimes[day.dayName]?.time || 0;
        totals[day.dayName] += time;
      });
      totals.Total += project.totalTime;
    });
    
    return totals;
  };

  const nextWeekInExcel = () => {
    const newStart = new Date(dateRange.start);
    const newEnd = new Date(dateRange.end);
    const diffDays = Math.ceil((newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    newStart.setDate(newStart.getDate() + diffDays);
    newEnd.setDate(newEnd.getDate() + diffDays);
    
    handleDateRangeChange(newStart, newEnd);
  };

  const prevWeekInExcel = () => {
    const newStart = new Date(dateRange.start);
    const newEnd = new Date(dateRange.end);
    const diffDays = Math.ceil((newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    newStart.setDate(newStart.getDate() - diffDays);
    newEnd.setDate(newEnd.getDate() - diffDays);
    
    handleDateRangeChange(newStart, newEnd);
  };

  const getWeekNumber = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  };

  const getDisplayTitle = () => {
    switch (selectedRange) {
      case 'this-month':
        return `${dateRange.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      case 'previous-month':
        return `${dateRange.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      case 'previous-quarter':
        return `Q${Math.floor(dateRange.start.getMonth() / 3) + 1} ${dateRange.start.getFullYear()}`;
      case 'previous-6-months':
        return `6 Months Period`;
      case 'this-year':
        return `${dateRange.start.getFullYear()}`;
      case 'custom':
        return `Custom Range`;
      default:
        return `Week ${getWeekNumber(currentWeekStart)}`;
    }
  };

  const { weekStart, weekEnd, days, weekTotal } = getCurrentDateRangeData();

  // Get all unique projects for filter
  const getAllProjects = () => {
    const projectsMap = new Map();
    timeLogs.forEach(log => {
      if (!projectsMap.has(log.projectId)) {
        projectsMap.set(log.projectId, { id: log.projectId, name: log.projectName });
      }
    });
    return Array.from(projectsMap.values());
  };

  const handleProjectFilterToggle = (projectId: string) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const clearProjectFilters = () => {
    setSelectedProjects(new Set());
  };

  const selectAllProjects = () => {
    const allProjectIds = getAllProjects().map(p => p.id);
    setSelectedProjects(new Set(allProjectIds));
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="bg-gradient-secondary-modern border-border/20 shadow-2xl backdrop-blur-xl hover:border-border/40 transition-all duration-500">
        <CardHeader className="pb-6 border-b border-border/10">
          <CardTitle className="flex flex-col space-y-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-6">
                <Button variant="outline" size="sm" onClick={prevWeek} className="btn-modern shadow-lg hover:shadow-xl rounded-xl border-border/30">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 text-2xl font-medium text-foreground">
                    <Calendar className="h-7 w-7 text-primary" />
                    <span className="whitespace-nowrap tracking-tight">{getDisplayTitle()}</span>
                  </div>
                  <Select value={selectedRange} onValueChange={handleRangeSelect}>
                    <SelectTrigger className="w-52 h-12 border-2 border-border/30 shadow-lg focus:shadow-xl transition-all duration-300 rounded-xl backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/40 shadow-2xl backdrop-blur-xl rounded-xl">
                      <SelectItem value="current-week">Current Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="previous-month">Previous Month</SelectItem>
                      <SelectItem value="previous-quarter">Previous Quarter</SelectItem>
                      <SelectItem value="previous-6-months">Previous 6 Months</SelectItem>
                      <SelectItem value="this-year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={nextWeek} className="btn-modern shadow-lg hover:shadow-xl rounded-xl border-border/30">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-center">
              <div className="text-base text-muted-foreground font-medium bg-muted/30 px-6 py-3 rounded-xl inline-block border border-border/20 shadow-lg backdrop-blur-sm">
                {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 bg-accent/10 px-6 py-4 rounded-2xl border border-border/20 shadow-lg backdrop-blur-sm">
                <BarChart3 className="h-7 w-7 text-accent" />
                <div>
                  <div className="text-3xl font-bold text-foreground tracking-tight">
                    {formatHours(weekTotal)} hrs
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Total Time</div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={exportToCSV} className="btn-modern shadow-lg hover:shadow-xl rounded-xl border-border/30">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="secondary" onClick={() => setIsDetailedViewOpen(true)} className="btn-modern shadow-lg hover:shadow-xl rounded-xl">
                  Excel View
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {selectedRange === 'current-week' ? (
            <div className="grid grid-cols-5 gap-6">
              {days.map(day => (
                <div key={day.dayName} className="text-center animate-scale-in">
                  <div 
                    className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/30 hover:border-border/50 group backdrop-blur-lg relative overflow-hidden"
                    style={getCurrentDayStyle(day.date)}
                  >
                    {isToday(day.date) && progressBarEnabled && (
                      <div 
                        className="absolute inset-0 -z-10"
                        style={{
                          background: `
                            linear-gradient(120deg, 
                              ${hexToRgba(progressBarColor, 0)} 0%, 
                              ${hexToRgba(progressBarColor, 0.4)} 30%, 
                              ${hexToRgba(progressBarColor, 0)} 70%),
                            url(${leafTexture}) 0 0 repeat
                          `,
                          backgroundSize: '200% 200%, 150px 150px',
                          animation: 'leavesAnimation 18s infinite linear, textureAnimation 6s infinite linear',
                        }}
                      />
                    )}
                    <div className="font-semibold text-foreground mb-3 text-xl tracking-tight">{day.dayName}</div>
                    <div className="text-sm text-muted-foreground mb-6 bg-muted/20 px-3 py-2 rounded-lg inline-block border border-border/20">
                      {day.date.getDate()}/{day.date.getMonth() + 1}
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full h-24 flex flex-col items-center justify-center hover:bg-accent/10 rounded-2xl transition-all duration-300 group-hover:scale-105"
                      onClick={() => handleDayTimeClick(day.logs)}
                    >
                      <div className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                        {formatHours(day.totalHours)}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">hours</div>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-4 max-h-80 overflow-y-auto scroll-modern">
              {days.map((day, index) => (
                <div key={index} className="text-center animate-scale-in">
                  <div 
                    className="bg-card rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/30 hover:border-border/50 group backdrop-blur-lg relative overflow-hidden"
                    style={getCurrentDayStyle(day.date)}
                  >
                    {isToday(day.date) && progressBarEnabled && (
                      <div 
                        className="absolute inset-0 -z-10"
                        style={{
                          background: `
                            linear-gradient(120deg, 
                              ${hexToRgba(progressBarColor, 0)} 0%, 
                              ${hexToRgba(progressBarColor, 0.4)} 30%, 
                              ${hexToRgba(progressBarColor, 0)} 70%),
                            url(${leafTexture}) 0 0 repeat
                          `,
                          backgroundSize: '200% 200%, 150px 150px',
                          animation: 'leavesAnimation 18s infinite linear, textureAnimation 6s infinite linear',
                        }}
                      />
                    )}
                    <div className="font-semibold text-foreground text-sm mb-3 tracking-tight">{day.dayName}</div>
                    <Button
                      variant="ghost"
                      className="w-full h-16 flex flex-col items-center justify-center hover:bg-accent/10 rounded-xl transition-all duration-200 group-hover:scale-105"
                      onClick={() => handleDayTimeClick(day.logs)}
                    >
                      <div className="text-2xl font-bold text-foreground tracking-tight">
                        {formatHours(day.totalHours)}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">hrs</div>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Excel-like Detailed View Dialog */}
      <Dialog open={isDetailedViewOpen} onOpenChange={setIsDetailedViewOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] rounded-2xl border-border/40 shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={prevWeekInExcel} className="rounded-xl">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xl font-medium tracking-tight">Weekly Timesheet - Excel View</span>
                <Button variant="outline" size="sm" onClick={nextWeekInExcel} className="rounded-xl">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleAllExpansion}
                  className="flex items-center gap-2 rounded-xl"
                >
                  {allExpanded ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
                  {allExpanded ? 'Collapse All' : 'Expand All'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 rounded-xl"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button variant="outline" size="sm" onClick={exportToCSV} className="rounded-xl">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-muted/30 px-3 py-2 rounded-lg">
                  {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="border-b border-border/30 p-6 bg-muted/20 rounded-xl">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Filter by Projects:</Label>
                  <div className="flex items-center gap-3 mb-4">
                    <Button size="sm" variant="outline" onClick={selectAllProjects} className="rounded-lg">
                      Select All
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearProjectFilters} className="rounded-lg">
                      Clear All
                    </Button>
                    <span className="text-sm text-gray-500 bg-muted/30 px-3 py-1 rounded-lg">
                      {selectedProjects.size > 0 ? `${selectedProjects.size} selected` : 'All projects'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-h-32 overflow-y-auto scroll-modern">
                    {getAllProjects().map(project => (
                      <label key={project.id} className="flex items-center space-x-3 text-sm bg-card/50 p-3 rounded-lg border border-border/20">
                        <input
                          type="checkbox"
                          checked={selectedProjects.size === 0 || selectedProjects.has(project.id)}
                          onChange={() => handleProjectFilterToggle(project.id)}
                          className="rounded"
                        />
                        <span className="truncate">{project.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="overflow-auto">
            <table className="w-full border-collapse border-2 border-border/30 text-sm rounded-xl overflow-hidden shadow-lg">
              <thead>
                <tr className="bg-muted/50 backdrop-blur-sm">
                  <th className="border-2 border-border/30 px-6 py-4 text-left font-semibold min-w-[250px]">
                    <button 
                      onClick={() => handleSort('project')}
                      className="flex items-center gap-2 hover:text-primary transition-colors duration-200"
                    >
                      Project
                      {sortColumn === 'project' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  {days.map(day => (
                    <th key={day.dayName} className="border-2 border-border/30 px-6 py-4 text-center font-semibold min-w-[80px]">
                      <button 
                        onClick={() => handleSort(day.dayName)}
                        className="flex items-center gap-2 hover:text-primary mx-auto transition-colors duration-200"
                      >
                        {day.dayName}
                        {sortColumn === day.dayName && (
                          <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                  ))}
                  <th className="border-2 border-border/30 px-6 py-4 text-center font-semibold min-w-[80px]">
                    <button 
                      onClick={() => handleSort('total')}
                      className="flex items-center gap-2 hover:text-primary mx-auto transition-colors duration-200"
                    >
                      Total
                      {sortColumn === 'total' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {getProjectTimeData().map(project => (
                  <React.Fragment key={project.projectId}>
                    <tr 
                      className="hover:bg-accent/10 transition-all duration-200 bg-card/50 backdrop-blur-sm"
                      style={getProjectRowStyle(project.projectName)}
                    >
                      <td className="border-2 border-border/30 px-6 py-4">
                        <button
                          onClick={() => toggleProjectExpansion(project.projectId)}
                          className="flex items-center gap-3 w-full text-left font-semibold text-foreground hover:text-primary transition-colors duration-200"
                        >
                          {expandedProjects.has(project.projectId) ? 
                            <ChevronDown className="h-5 w-5 flex-shrink-0" /> : 
                            <ChevronRightIcon className="h-5 w-5 flex-shrink-0" />
                          }
                          <span className="truncate">{project.projectName}</span>
                        </button>
                      </td>
                      {days.map(day => {
                        const cellKey = `${project.projectId}-main-${day.dayName}`;
                        const timeData = project.dailyTimes[day.dayName];
                        return (
                          <td key={day.dayName} className="border-2 border-border/30 px-3 py-4 text-center bg-card/30">
                            {editingCell === cellKey ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-16 h-8 text-center text-xs rounded-lg"
                                  onBlur={() => handleSaveCellEdit(project.projectId, null, day.dayName)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSaveCellEdit(project.projectId, null, day.dayName)}
                                  autoFocus
                                />
                              </div>
                            ) : timeData ? (
                              <div className="group relative">
                                <button
                                  onClick={() => handleTimeClick(timeData.logs)}
                                  className="text-foreground hover:text-primary hover:underline font-mono text-sm transition-colors duration-200"
                                >
                                  {formatHours(timeData.time)}
                                </button>
                                <button
                                  onClick={() => handleCellEdit(project.projectId, null, day.dayName, timeData.time)}
                                  className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-accent/20 rounded transition-all duration-200"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="group relative">
                                <button
                                  onClick={() => handleCellEdit(project.projectId, null, day.dayName, 0)}
                                  className="text-muted-foreground hover:text-foreground hover:underline font-mono text-sm w-full transition-colors duration-200"
                                >
                                  0.0
                                </button>
                                <button
                                  onClick={() => handleCellEdit(project.projectId, null, day.dayName, 0)}
                                  className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-accent/20 rounded transition-all duration-200"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="border-2 border-border/30 px-6 py-4 text-center font-bold bg-card/30">
                        {formatHours(project.totalTime)}
                      </td>
                    </tr>
                     {expandedProjects.has(project.projectId) && project.subprojects.map(subproject => (
                       <tr 
                         key={subproject.subprojectId} 
                         className="border-l-4 border-l-primary/50 bg-card/30"
                         style={getSubprojectRowStyle(project.projectName)}
                       >
                         <td className="border-2 border-border/30 px-6 py-4 pl-16 text-muted-foreground">
                           <span className="text-sm italic">└ {subproject.subprojectName}</span>
                         </td>
                         {days.map(day => {
                           const cellKey = `${project.projectId}-${subproject.subprojectId}-${day.dayName}`;
                           const timeData = subproject.dailyTimes[day.dayName];
                           return (
                             <td key={day.dayName} className="border-2 border-border/30 px-3 py-4 text-center">
                               {editingCell === cellKey ? (
                                 <div className="flex items-center gap-1">
                                   <Input
                                     value={editValue}
                                     onChange={(e) => setEditValue(e.target.value)}
                                     className="w-16 h-8 text-center text-xs rounded-lg"
                                     onBlur={() => handleSaveCellEdit(project.projectId, subproject.subprojectId, day.dayName)}
                                     onKeyDown={(e) => e.key === 'Enter' && handleSaveCellEdit(project.projectId, subproject.subprojectId, day.dayName)}
                                     autoFocus
                                   />
                                 </div>
                               ) : timeData ? (
                                 <div className="group relative">
                                   <button
                                     onClick={() => handleTimeClick(timeData.logs)}
                                     className="text-muted-foreground hover:text-foreground hover:underline font-mono text-sm transition-colors duration-200"
                                   >
                                     {formatHours(timeData.time)}
                                   </button>
                                   <button
                                     onClick={() => handleCellEdit(project.projectId, subproject.subprojectId, day.dayName, timeData.time)}
                                     className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-accent/20 rounded transition-all duration-200"
                                   >
                                     <Edit className="h-3 w-3" />
                                   </button>
                                 </div>
                                ) : (
                                  <div className="group relative">
                                    <button
                                      onClick={() => handleCellEdit(project.projectId, subproject.subprojectId, day.dayName, 0)}
                                      className="text-muted-foreground hover:text-foreground hover:underline font-mono text-sm w-full transition-colors duration-200"
                                    >
                                      0.0
                                    </button>
                                    <button
                                      onClick={() => handleCellEdit(project.projectId, subproject.subprojectId, day.dayName, 0)}
                                      className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-accent/20 rounded transition-all duration-200"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                             </td>
                           );
                         })}
                        <td className="border-2 border-border/30 px-6 py-4 text-center font-medium">
                          {formatHours(subproject.totalTime)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                <tr className="bg-muted/70 font-bold border-t-4 border-primary/30 backdrop-blur-sm">
                  <td className="border-2 border-border/30 px-6 py-4 text-left font-bold">
                    Total
                  </td>
                  {days.map(day => {
                    const columnTotal = getColumnTotals();
                    return (
                      <td key={day.dayName} className="border-2 border-border/30 px-6 py-4 text-center font-bold">
                        {formatHours(columnTotal[day.dayName] || 0)}
                      </td>
                    );
                  })}
                  <td className="border-2 border-border/30 px-6 py-4 text-center font-bold">
                    {formatHours(getColumnTotals().Total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Date Range Dialog */}
      <Dialog open={showCustomRange} onOpenChange={setShowCustomRange}>
        <DialogContent className="max-w-md rounded-2xl border-border/40 shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-medium tracking-tight">Select Custom Date Range</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-xl",
                        !customStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate ? format(customStartDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl border-border/40 shadow-xl backdrop-blur-xl" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-xl",
                        !customEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEndDate ? format(customEndDate, "PPP") : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl border-border/40 shadow-xl backdrop-blur-xl" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleCustomDateRange} 
                className="flex-1 bg-primary hover:bg-primary/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={!customStartDate || !customEndDate}
              >
                Apply Range
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCustomRange(false)}
                className="flex-1 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Time Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl rounded-2xl border-border/40 shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium tracking-tight">Time Entries</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto scroll-modern">
            {selectedDayLogs.map(log => (
              <div 
                key={log.id} 
                className="flex items-center justify-between p-6 border border-border/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                style={getProjectRowStyle(log.projectName)}
              >
                <div className="flex-1 grid grid-cols-2 gap-6">
                  <div>
                    <div className="font-semibold text-lg text-foreground">{log.projectName}</div>
                    <div className="text-sm text-muted-foreground">{log.subprojectName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Time Period</div>
                    <div className="text-sm font-mono bg-muted/30 px-2 py-1 rounded-lg inline-block">{log.startTime} - {log.endTime}</div>
                    {log.description && (
                      <div className="text-sm text-muted-foreground mt-2 bg-muted/20 p-2 rounded-lg">
                        <strong>Description:</strong> {log.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-bold text-foreground bg-accent/20 px-3 py-2 rounded-lg">{formatHours(log.duration)} hrs</div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyTimesheet;