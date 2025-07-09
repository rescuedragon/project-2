import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Trash2, Settings, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

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

// Indian public holidays for 2025
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
  const [showPlannedLeaves, setShowPlannedLeaves] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isAddingLeave, setIsAddingLeave] = useState(false);
  const [newLeave, setNewLeave] = useState({ name: '', employee: '', startDate: '', endDate: '' });
  const [progressBarEnabled, setProgressBarEnabled] = useState(false);
  const [progressBarColor, setProgressBarColor] = useState('#10b981');

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
    
    // Load progress bar settings
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

  const hasLeavesThisMonth = () => {
    return plannedLeaves.some(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      return (startDate.getMonth() === currentMonth.getMonth() && 
             startDate.getFullYear() === currentMonth.getFullYear()) ||
             (endDate.getMonth() === currentMonth.getMonth() && 
             endDate.getFullYear() === currentMonth.getFullYear());
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

  const handleShowPlannedLeavesChange = (checked: boolean | "indeterminate") => {
    setShowPlannedLeaves(checked === true);
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

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-white" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
      <Card className="border-0 shadow-2xl overflow-hidden relative bg-white">
        {/* Header */}
        <CardHeader 
          className="p-8 relative overflow-hidden border-b border-gray-100"
          style={headerStyle}
        >
          <CardTitle className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${progressBarEnabled ? 'bg-white/20' : 'bg-gray-100'}`}>
                <CalendarIcon className={`h-8 w-8 ${progressBarEnabled ? 'text-white' : 'text-gray-700'}`} />
              </div>
              <div>
                <h1 className={`text-3xl font-light tracking-tight ${progressBarEnabled ? 'text-white' : 'text-gray-900'}`}>
                  Calendar
                </h1>
                <p className={`text-lg ${progressBarEnabled ? 'text-white/90' : 'text-gray-600'} mt-1`}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl ${progressBarEnabled ? 'bg-white/10' : 'bg-gray-100'}`}>
                <Checkbox
                  id="show-leaves"
                  checked={showPlannedLeaves}
                  onCheckedChange={handleShowPlannedLeavesChange}
                  className={progressBarEnabled ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600" : ""}
                />
                <Label htmlFor="show-leaves" className={`text-sm font-medium ${progressBarEnabled ? 'text-white' : 'text-gray-700'}`}>
                  Show planned leaves
                </Label>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    progressBarEnabled 
                      ? 'bg-white/10 hover:bg-white/20 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    progressBarEnabled 
                      ? 'bg-white/10 hover:bg-white/20 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Calendar */}
            <div className="flex-1 w-full">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 w-full max-w-none">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="w-full border-0 shadow-none max-w-none"
                  weekStartsOn={1}
                  modifiers={{
                    holiday: holidayDates,
                    leave: showPlannedLeaves ? leaveDates : [],
                    weekend: (date) => date.getDay() === 0 || date.getDay() === 6,
                    today: (date) => date.toDateString() === new Date().toDateString(),
                  }}
                  modifiersClassNames={{
                    holiday: "bg-red-600 text-white font-semibold hover:bg-red-700",
                    leave: "bg-green-800 text-white font-semibold hover:bg-green-900",
                    weekend: "text-gray-400 bg-gray-50",
                    today: "bg-blue-800 text-white font-bold hover:bg-blue-900",
                  }}
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-6",
                    caption: "flex justify-center pt-2 relative items-center mb-8 w-full",
                    caption_label: "text-2xl font-light text-gray-900 tracking-tight",
                    nav: "space-x-1 flex items-center",
                    nav_button: "hidden",
                    table: "w-full border-collapse space-y-2 max-w-none",
                    head_row: "flex mb-4",
                    head_cell: "text-gray-600 rounded-lg flex-1 h-12 font-medium text-sm flex items-center justify-center bg-gray-50 min-w-0",
                    row: "flex w-full mt-3",
                    cell: "flex-1 h-16 text-center text-base p-0 relative flex items-center justify-center min-w-0",
                    day: "w-full h-14 rounded-xl font-medium transition-all duration-200 hover:bg-gray-100 flex items-center justify-center border border-transparent hover:border-gray-200 hover:shadow-sm",
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",
                    day_today: "bg-blue-800 text-white hover:bg-blue-900 border-blue-800",
                    day_outside: "text-gray-300 hover:text-gray-400",
                    day_disabled: "text-gray-300 opacity-50",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                  showOutsideDays={true}
                />
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-96 space-y-8">

              {/* Action Buttons */}

              {showPlannedLeaves && (
                <div className="space-y-4">
                  <Dialog open={isAddingLeave} onOpenChange={setIsAddingLeave}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-800 hover:bg-green-900 text-white py-3 rounded-xl shadow-lg font-medium">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Planned Leave
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Add Planned Leave</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="leave-name" className="text-sm font-medium">Leave Name</Label>
                          <Input
                            id="leave-name"
                            value={newLeave.name}
                            onChange={(e) => setNewLeave({...newLeave, name: e.target.value})}
                            placeholder="e.g., Annual Leave"
                            className="rounded-xl border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employee" className="text-sm font-medium">Employee</Label>
                          <Input
                            id="employee"
                            value={newLeave.employee}
                            onChange={(e) => setNewLeave({...newLeave, employee: e.target.value})}
                            placeholder="Employee name"
                            className="rounded-xl border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={newLeave.startDate}
                            onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                            className="rounded-xl border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={newLeave.endDate}
                            onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                            className="rounded-xl border-gray-300"
                          />
                        </div>
                        <Button 
                          onClick={handleAddPlannedLeave} 
                          className="w-full bg-green-800 hover:bg-green-900 text-white py-3 rounded-xl"
                        >
                          Add Leave
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* This Month's Holidays */}
              {hasHolidaysThisMonth() && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">This Month's Holidays</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {holidays
                      .filter(holiday => {
                        const holidayDate = new Date(holiday.date);
                        return holidayDate.getMonth() === currentMonth.getMonth() && 
                               holidayDate.getFullYear() === currentMonth.getFullYear();
                      })
                      .map(holiday => (
                        <div 
                          key={holiday.id} 
                          className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-gray-900">{holiday.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* This Month's Leaves */}
              {showPlannedLeaves && hasLeavesThisMonth() && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">This Month's Leaves</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {plannedLeaves
                      .filter(leave => {
                        const startDate = new Date(leave.startDate);
                        const endDate = new Date(leave.endDate);
                        return (startDate.getMonth() === currentMonth.getMonth() && 
                               startDate.getFullYear() === currentMonth.getFullYear()) ||
                               (endDate.getMonth() === currentMonth.getMonth() && 
                               endDate.getFullYear() === currentMonth.getFullYear());
                      })
                      .map(leave => (
                        <div 
                          key={leave.id} 
                          className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-gray-900">{leave.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {leave.employee} • {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemovePlannedLeave(leave.id)}
                            className="h-8 w-8 p-0 text-green-800 hover:text-green-900 hover:bg-green-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
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