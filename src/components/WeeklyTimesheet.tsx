import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { TimeLog } from './TimeTracker';
import { format, startOfWeek, endOfWeek, addDays, subDays, isSameDay, eachDayOfInterval, isToday } from 'date-fns';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';
import { Label } from '@/components/ui/label';
import DailyTimesheet from './DailyTimesheet';
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
  const [activeTab, setActiveTab] = useState<'weekly' | 'daily'>('weekly');
  const [showTimeBreakdown, setShowTimeBreakdown] = useState(false);

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
    return allDays.filter(day => day.getDay() !== 0 && day.getDay() !== 6); // Filter out weekends
  }, [dateRange]);

  const getDayTotal = (date: Date) => {
    return timeLogs
      .filter(log => isSameDay(new Date(log.date), date))
      .reduce((total, log) => total + log.duration, 0);
  };

  const getDayBoxGlowStyle = (date: Date) => {
    if (!isToday(date) || !progressBarEnabled) return {};
    return {
      boxShadow: `0 0 15px ${progressBarColor}`,
      borderColor: progressBarColor
    };
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

  const handleSwitchToDaily = () => {
    // Dispatch the same event that switches to daily view in the main app
    window.dispatchEvent(new CustomEvent('switchToDailyView'));
  };

  const openTimeBreakdown = () => {
    setShowTimeBreakdown(true);
  };

  if (activeTab === 'daily') {
    return <DailyTimesheet timeLogs={timeLogs} onSwitchToWeeklyView={() => setActiveTab('weekly')} />;
  }

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
                  onClick={handleSwitchToDaily}
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

      {/* Time Breakdown Section */}
      {showTimeBreakdown && (
        <TimeBreakdown
          timeLogs={timeLogs}
          onUpdateTime={onUpdateTime}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      )}
    </div>
  );
};

export default WeeklyTimesheet;