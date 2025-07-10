import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface Holiday {
  id: string;
  name: string;
  date: string;
}

interface PlannedLeave {
  id: string;
  name: string;
  employee: string;
  startDate: string;
  endDate: string;
}

const defaultHolidays: Holiday[] = [
  { id: '1', name: 'New Year\'s Day', date: '2025-01-01' },
  { id: '2', name: 'Republic Day', date: '2025-01-26' },
  { id: '3', name: 'Holi', date: '2025-03-14' },
  { id: '4', name: 'Good Friday', date: '2025-04-18' },
  { id: '5', name: 'Independence Day', date: '2025-08-15' },
  { id: '6', name: 'Gandhi Jayanti', date: '2025-10-02' },
  { id: '7', name: 'Diwali', date: '2025-10-20' },
  { id: '8', name: 'Christmas Day', date: '2025-12-25' },
];

const Holidays: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [plannedLeaves, setPlannedLeaves] = useState<PlannedLeave[]>([]);
  const [showPlannedLeaves, setShowPlannedLeaves] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isAddingLeave, setIsAddingLeave] = useState(false);
  const [newLeave, setNewLeave] = useState({ name: '', employee: '', startDate: '', endDate: '' });
  const [progressBarEnabled, setProgressBarEnabled] = useState(false);
  const [progressBarColor, setProgressBarColor] = useState('#10b981');
  const [showHolidaysDialog, setShowHolidaysDialog] = useState(false);
  const [holidaysViewMonth, setHolidaysViewMonth] = useState<Date | null>(null);

  useEffect(() => {
    const savedHolidays = localStorage.getItem('timesheet-holidays');
    const savedLeaves = localStorage.getItem('planned-leaves');
    
    if (savedHolidays) {
      setHolidays(JSON.parse(savedHolidays));
    } else {
      setHolidays(defaultHolidays);
      localStorage.setItem('timesheet-holidays', JSON.stringify(defaultHolidays));
    }
    
    if (savedLeaves) {
      setPlannedLeaves(JSON.parse(savedLeaves));
    }
    
    const savedEnabled = localStorage.getItem('progressbar-enabled');
    const savedColor = localStorage.getItem('progressbar-color');
    
    setProgressBarEnabled(savedEnabled ? JSON.parse(savedEnabled) : false);
    setProgressBarColor(savedColor || '#10b981');
    
    const handleStorageChange = () => {
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
    localStorage.setItem('timesheet-holidays', JSON.stringify(holidays));
    localStorage.setItem('planned-leaves', JSON.stringify(plannedLeaves));
  }, [holidays, plannedLeaves]);

  const getHolidayDates = () => {
    return holidays.map(holiday => new Date(holiday.date));
  };

  const getHolidaysForMonth = (month: Date) => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getMonth() === month.getMonth() && 
             holidayDate.getFullYear() === month.getFullYear();
    });
  };

  const getPlannedLeaveDates = () => {
    const dates: Date[] = [];
    plannedLeaves.forEach(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        dates.push(new Date(date));
      }
    });
    return dates;
  };

  const hasHolidaysThisMonth = () => {
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getMonth() === currentMonth.getMonth() && 
             holidayDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  const handleAddPlannedLeave = () => {
    if (newLeave.name && newLeave.employee && newLeave.startDate && newLeave.endDate) {
      const leave: PlannedLeave = {
        id: Date.now().toString(),
        ...newLeave
      };
      const updatedLeaves = [...plannedLeaves, leave];
      setPlannedLeaves(updatedLeaves);
      setNewLeave({ name: '', employee: '', startDate: '', endDate: '' });
      setIsAddingLeave(false);
    }
  };

  const handleRemovePlannedLeave = (leaveId: string) => {
    const updatedLeaves = plannedLeaves.filter(leave => leave.id !== leaveId);
    setPlannedLeaves(updatedLeaves);
  };

  const handleRemoveHoliday = (holidayId: string) => {
    const updatedHolidays = holidays.filter(holiday => holiday.id !== holidayId);
    setHolidays(updatedHolidays);
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const prevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const togglePlannedLeaves = () => {
    setShowPlannedLeaves(!showPlannedLeaves);
  };

  const handleHolidaysDialogOpen = () => {
    setShowHolidaysDialog(true);
    setHolidaysViewMonth(null);
  };

  const handleMonthSelect = (month: Date) => {
    setHolidaysViewMonth(month);
  };

  const holidayDates = getHolidayDates();
  const leaveDates = getPlannedLeaveDates();

  const headerStyle = progressBarEnabled ? {
    background: `linear-gradient(135deg, ${progressBarColor}, ${progressBarColor}dd)`,
    backgroundSize: '400% 400%',
    animation: 'gradientFlow 15s ease infinite',
  } : {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    border: '1px solid #e2e8f0'
  };

  const CalendarUI = ({ month }: { month: Date }) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
      return firstDay === 0 ? 6 : firstDay - 1;
    };

    const handleDateClick = (day: number) => {
      const clickedDate = new Date(month.getFullYear(), month.getMonth(), day);
      setSelectedDate(clickedDate);
    };

    const renderCalendarDays = () => {
      const daysInMonth = getDaysInMonth(month);
      const firstDay = getFirstDayOfMonth(month);
      const days = [];
      let gridIndex = 0;

      for (let i = 0; i < firstDay; i++) {
        const isWeekendColumn = (gridIndex % 7 === 5) || (gridIndex % 7 === 6);
        days.push(
          <div 
            key={`empty-${i}`} 
            className={`aspect-square ${isWeekendColumn ? 'bg-gray-50' : ''}`}
          ></div>
        );
        gridIndex++;
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isToday = date.toDateString() === new Date().toDateString();
        const isHoliday = holidayDates.some(d => d.toDateString() === date.toDateString());
        const isLeave = showPlannedLeaves && leaveDates.some(d => d.toDateString() === date.toDateString());
        const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
        const isWeekendColumn = (gridIndex % 7 === 5) || (gridIndex % 7 === 6);

        let className = `
          aspect-square flex items-center justify-center cursor-pointer
          border border-black/20 rounded-md
          transition-all duration-200 ease-out
          hover:scale-105 hover:shadow-lg hover:border-black/40
          active:scale-95
          ${isWeekend ? 'text-gray-500' : 'text-black'}
          font-medium
          ${isWeekendColumn ? 'bg-gray-50' : 'bg-white'}
        `;

        if (isHoliday) {
          className += ' bg-red-500 hover:bg-red-600 text-white border-red-600 hover:border-red-700';
        } else if (isLeave) {
          className += ' bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 hover:border-emerald-700';
        } else if (isSelected) {
          className += ' bg-gray-200 border-black hover:bg-gray-300';
        } else if (isToday) {
          className += ' bg-black text-white border-black/50';
        }

        days.push(
          <div
            key={day}
            onClick={() => handleDateClick(day)}
            className={className}
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
              fontSize: '1.8rem'
            }}
          >
            {day}
          </div>
        );
        gridIndex++;
      }

      return days;
    };

    return (
      <div className="w-full">
        <div className="w-[50%] mx-auto">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div className="bg-gray-900 text-white rounded-t-2xl">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors duration-200 text-white"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  
                  <h1 
                    className="text-xl font-bold tracking-tight text-white"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
                      letterSpacing: '-0.025em',
                    }}
                  >
                    {months[month.getMonth()]} {month.getFullYear()}
                  </h1>
                  
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors duration-200 text-white"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>

              <div className="px-2 pb-2">
                <div className="grid grid-cols-7 gap-1 bg-gray-900 p-2 rounded-lg">
                  {daysOfWeek.map((day, index) => (
                    <div
                      key={day}
                      className="text-center py-2 font-bold text-white"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
                        fontSize: '1.0rem'
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-1 bg-gradient-to-br from-gray-50 to-white">
      <Card className="border border-gray-300 shadow-xl overflow-hidden relative bg-white">
        <CardContent className="p-1">
          <div className="flex flex-col gap-4 items-center pt-4">
            <div className="w-[49%] mx-auto flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-2xl bg-gray-100">
                  <CalendarIcon className="h-6 w-6 text-gray-700" />
                </div>
                <h1 className="text-2xl font-light tracking-tight text-gray-900">
                  Calendar
                </h1>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleHolidaysDialogOpen}
                  className="h-9 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center
                    active:scale-[0.98] active:shadow-inner
                    bg-black text-white border border-gray-800 hover:bg-gray-900"
                >
                  <span className="font-medium text-sm">Holidays</span>
                </button>
                
                <button
                  onClick={togglePlannedLeaves}
                  className="h-9 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center
                    active:scale-[0.98] active:shadow-inner
                    bg-black text-white border border-gray-800 hover:bg-gray-900"
                >
                  <span className="font-medium text-sm">Planned Leaves</span>
                </button>
              </div>
            </div>
            
            <CalendarUI month={currentMonth} />
          </div>
          
          {hasHolidaysThisMonth() && (
            <div className="flex justify-center">
              <div className="mt-4 bg-white rounded-xl p-4 shadow-lg border border-gray-300 w-[57%] mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Public Holidays</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {holidays
                    .filter(holiday => {
                      const holidayDate = new Date(holiday.date);
                      return holidayDate.getMonth() === currentMonth.getMonth() && 
                            holidayDate.getFullYear() === currentMonth.getFullYear();
                    })
                    .map(holiday => (
                      <div 
                        key={holiday.id} 
                        className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{holiday.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveHoliday(holiday.id)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          
          {showPlannedLeaves && (
            <div className="flex justify-center">
              <div className="mt-4 bg-white rounded-xl p-4 shadow-lg border border-gray-300 w-[57%] mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Planned Leaves</h3>
                  <Dialog open={isAddingLeave} onOpenChange={setIsAddingLeave}>
                    <DialogTrigger asChild>
                      <Button className="h-9 bg-green-800 hover:bg-green-900 text-white py-1 px-3 rounded-xl shadow font-medium text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Planned Leave
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl border border-gray-300 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Add Planned Leave</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-1">
                          <Label htmlFor="leave-name" className="text-xs font-medium">Leave Name</Label>
                          <Input
                            id="leave-name"
                            value={newLeave.name}
                            onChange={(e) => setNewLeave({...newLeave, name: e.target.value})}
                            placeholder="e.g., Annual Leave"
                            className="rounded-xl border-gray-300 h-10"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="employee" className="text-xs font-medium">Employee</Label>
                          <Input
                            id="employee"
                            value={newLeave.employee}
                            onChange={(e) => setNewLeave({...newLeave, employee: e.target.value})}
                            placeholder="Employee name"
                            className="rounded-xl border-gray-300 h-10"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="startDate" className="text-xs font-medium">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={newLeave.startDate}
                            onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                            className="rounded-xl border-gray-300 h-10"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="endDate" className="text-xs font-medium">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={newLeave.endDate}
                            onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                            className="rounded-xl border-gray-300 h-10"
                          />
                        </div>
                        <Button 
                          onClick={handleAddPlannedLeave} 
                          className="w-full h-10 bg-green-800 hover:bg-green-900 text-white py-2 rounded-xl"
                        >
                          Add Leave
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {plannedLeaves.length > 0 ? (
                    plannedLeaves.map(leave => (
                      <div 
                        key={leave.id} 
                        className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{leave.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {leave.employee} • {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemovePlannedLeave(leave.id)}
                          className="h-7 w-7 p-0 text-green-800 hover:text-green-900 hover:bg-green-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <p>No planned leaves added yet</p>
                      <p className="text-xs mt-1">Click "Add Planned Leave" to create one</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showHolidaysDialog} onOpenChange={setShowHolidaysDialog}>
        <DialogContent className="max-w-4xl rounded-2xl border border-gray-300 shadow-2xl p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {holidaysViewMonth 
                ? `Holidays - ${holidaysViewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` 
                : '2025 Holidays'}
            </DialogTitle>
          </DialogHeader>
          
          {holidaysViewMonth ? (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-300 shadow-lg p-4">
                <CalendarUI month={holidaysViewMonth} />
              </div>
              
              {getHolidaysForMonth(holidaysViewMonth).length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Holidays</h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {getHolidaysForMonth(holidaysViewMonth).map(holiday => (
                      <div 
                        key={holiday.id} 
                        className="p-3 rounded-lg bg-red-50 border border-red-200"
                      >
                        <div className="font-semibold text-gray-900 text-sm">{holiday.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-center">
                <DialogClose asChild>
                  <Button 
                    className="h-10 bg-gray-900 hover:bg-gray-800 text-white py-1 px-4 rounded-xl shadow font-medium"
                    onClick={() => setHolidaysViewMonth(null)}
                  >
                    Back to Year View
                  </Button>
                </DialogClose>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, i) => {
                  const month = new Date(2025, i, 1);
                  const monthHolidays = getHolidaysForMonth(month);
                  return (
                    <div 
                      key={i}
                      className="bg-white rounded-xl border border-gray-300 shadow p-3 cursor-pointer transition-all hover:shadow-md hover:border-gray-400"
                      onClick={() => handleMonthSelect(month)}
                    >
                      <div className="font-semibold text-gray-900 text-sm mb-1">
                        {month.toLocaleDateString('en-US', { month: 'long' })}
                      </div>
                      <div className="text-xs text-gray-600">
                        {monthHolidays.length} {monthHolidays.length === 1 ? 'holiday' : 'holidays'}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {monthHolidays.slice(0, 3).map(holiday => (
                          <div 
                            key={holiday.id} 
                            className="text-[0.65rem] px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full"
                          >
                            {new Date(holiday.date).getDate()}
                          </div>
                        ))}
                        {monthHolidays.length > 3 && (
                          <div className="text-[0.65rem] px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded-full">
                            +{monthHolidays.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-center mt-2">
                <DialogClose asChild>
                  <Button className="h-10 bg-gray-900 hover:bg-gray-800 text-white py-1 px-4 rounded-xl shadow font-medium">
                    Close
                  </Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&display=swap');
        
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default Holidays;