import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TimeLog } from './TimeTracker';
import { startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { isColorCodedProjectsEnabled } from '@/lib/projectColors';
import WeekSummaryCard from './weekly-timesheet/WeekSummaryCard';
import TimeBreakdown from './TimeBreakdown';

interface WeeklyTimesheetProps {
  timeLogs: TimeLog[];
  onUpdateTime: (logId: string, newDuration: number) => void;
}

const WeeklyTimesheet: React.FC<WeeklyTimesheetProps> = ({ timeLogs, onUpdateTime }) => {
  const [dateRange, setDateRange] = useState({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 })
  });
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);
  const [progressBarEnabled, setProgressBarEnabled] = useState(false);
  const [progressBarColor, setProgressBarColor] = useState('#7D7D7D');
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

  const daysInRange = useMemo(() => {
    const allDays = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    return allDays.filter(day => day.getDay() !== 0 && day.getDay() !== 6);
  }, [dateRange]);

  const getDayTotal = (date: Date) => {
    const isSameDay = (date1: Date, date2: Date) => {
      return date1.toDateString() === date2.toDateString();
    };
    
    return timeLogs
      .filter(log => isSameDay(new Date(log.date), date))
      .reduce((total, log) => total + log.duration, 0);
  };

  const goToPreviousWeek = () => {
    setDateRange(prev => {
      const newStart = new Date(prev.start);
      newStart.setDate(newStart.getDate() - 7);
      const newEnd = new Date(prev.end);
      newEnd.setDate(newEnd.getDate() - 7);
      return { start: newStart, end: newEnd };
    });
  };

  const goToNextWeek = () => {
    setDateRange(prev => {
      const newStart = new Date(prev.start);
      newStart.setDate(newStart.getDate() + 7);
      const newEnd = new Date(prev.end);
      newEnd.setDate(newEnd.getDate() + 7);
      return { start: newStart, end: newEnd };
    });
  };

  const goToCurrentWeek = () => {
    setDateRange({
      start: startOfWeek(new Date(), { weekStartsOn: 1 }),
      end: endOfWeek(new Date(), { weekStartsOn: 1 })
    });
  };

  const openTimeBreakdown = () => {
    setTimeBreakdownDateRange(dateRange);
    setIsModalOpen(true);
  };

  const weekTotal = daysInRange.reduce((total, day) => total + getDayTotal(day), 0);

  return (
    <div className="space-y-6 animate-fade-in font-sans" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
      <WeekSummaryCard
        dateRange={dateRange}
        weekTotal={weekTotal}
        daysInRange={daysInRange}
        progressBarEnabled={progressBarEnabled}
        progressBarColor={progressBarColor}
        formatHours={formatHours}
        getDayTotal={getDayTotal}
        onGoToPreviousWeek={goToPreviousWeek}
        onGoToNextWeek={goToNextWeek}
        onGoToCurrentWeek={goToCurrentWeek}
        onOpenTimeBreakdown={openTimeBreakdown}
      />

      {/* Time Breakdown Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl border border-[#B0B0B0]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-black tracking-tight">
              Time Breakdown - {dateRange.start.toLocaleDateString()} to {dateRange.end.toLocaleDateString()}
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