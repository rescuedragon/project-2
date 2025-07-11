import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Trash2, Pin, Archive, Check, Copy, Download, Upload, Cloud, RefreshCw, Smile, Bookmark, CheckSquare, Star, TrendingUp, Edit, ArrowLeft } from 'lucide-react';

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

interface Entry {
  id: string;
  content: string;
  type: EntryType;
  date: Date;
  reminders?: ReminderSettings;
  completed?: boolean;
  pinned?: boolean;
  archived?: boolean;
  mood?: string;
  tags?: string[];
  attachments?: string[];
  tasks?: Task[];
  gratitude?: string[];
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

type EntryType = 'Diary' | 'Reminder' | 'Note to Self' | 'Meeting Notes' | 'Idea' | 'Journal' | 'To-Do List' | 'Gratitude Log' | 'Dream Log' | 'Mood Tracker';

interface ReminderSettings {
  time: Date;
  recurrence?: 'daily' | 'weekly' | 'monthly';
}

interface FilterOptions {
  type?: EntryType;
  date?: Date;
  status?: 'completed' | 'pending';
}

interface DiaryStats {
  entriesThisMonth: number;
  completedReminders: number;
  streak: number;
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

const journalPrompts = [
  "What was the highlight of your day?",
  "What are you grateful for today?",
  "What did you learn today?",
  "What made you smile today?",
  "What would you do differently if you could relive today?",
  "What are your intentions for tomorrow?",
];

const moodOptions = [
  { value: 'happy', label: '😊 Happy' },
  { value: 'sad', label: '😢 Sad' },
  { value: 'energized', label: '💪 Energized' },
  { value: 'tired', label: '😴 Tired' },
  { value: 'stressed', label: '😫 Stressed' },
  { value: 'calm', label: '😌 Calm' },
  { value: 'excited', label: '🤩 Excited' },
  { value: 'anxious', label: '😰 Anxious' },
];

const PersonalJournal: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>(defaultHolidays);
  const [plannedLeaves, setPlannedLeaves] = useState<PlannedLeave[]>([]);
  const [showPlannedLeaves, setShowPlannedLeaves] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isAddingLeave, setIsAddingLeave] = useState(false);
  const [newLeave, setNewLeave] = useState({ name: '', employee: '', startDate: '', endDate: '' });
  const [holidaysViewMonth, setHolidaysViewMonth] = useState<Date | null>(null);
  const [showHolidaysDialog, setShowHolidaysDialog] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedDateForEntries, setSelectedDateForEntries] = useState<Date | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<DiaryStats>({ entriesThisMonth: 0, completedReminders: 0, streak: 0 });
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [holidayOverviewMode, setHolidayOverviewMode] = useState<'overview' | 'detail'>('overview');
  const [selectedHolidayMonth, setSelectedHolidayMonth] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<Entry[]>([]);

  // Progress bar settings
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(() => {
    const saved = localStorage.getItem('progressbar-enabled');
    return saved ? JSON.parse(saved) : false;
  });
  const [progressBarColor, setProgressBarColor] = useState(() => {
    const saved = localStorage.getItem('progressbar-color');
    return saved || '#000000';
  });

  // Softer color function
  const createSofterColor = (hex: string, softenFactor = 0.5) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const blendR = Math.round(r * softenFactor + 245 * (1 - softenFactor));
    const blendG = Math.round(g * softenFactor + 245 * (1 - softenFactor));
    const blendB = Math.round(b * softenFactor + 245 * (1 - softenFactor));
    return `rgb(${blendR}, ${blendG}, ${blendB})`;
  };

  // Text color based on luminance
  const getTextColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#000000' : '#ffffff';
  };

  // Container styles
  const containerBgColor = useMemo(() => {
    return isAnimationEnabled ? createSofterColor(progressBarColor, 0.6) : '#1f2937';
  }, [isAnimationEnabled, progressBarColor]);

  const containerTextColor = useMemo(() => {
    return isAnimationEnabled ? getTextColor(progressBarColor) : '#000000';
  }, [isAnimationEnabled, progressBarColor]);

  // Event listeners
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'progressbar-color' && e.newValue) setProgressBarColor(e.newValue);
      if (e.key === 'progressbar-enabled' && e.newValue !== null) setIsAnimationEnabled(JSON.parse(e.newValue));
    };

    const handleSettingsChange = () => {
      const savedColor = localStorage.getItem('progressbar-color');
      if (savedColor) setProgressBarColor(savedColor);
      const savedEnabled = localStorage.getItem('progressbar-enabled');
      setIsAnimationEnabled(savedEnabled ? JSON.parse(savedEnabled) : false);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settings-changed', handleSettingsChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-changed', handleSettingsChange);
    };
  }, []);

  // Helper functions
  const getHolidayDates = () => holidays.map(holiday => new Date(holiday.date));
  const getHolidaysForMonth = (month: Date) => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getMonth() === month.getMonth() && holidayDate.getFullYear() === month.getFullYear();
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

  const getHolidayCountForMonth = (month: number, year: number) => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getMonth() === month && holidayDate.getFullYear() === year;
    }).length;
  };

  const handleAddPlannedLeave = () => {
    if (newLeave.name && newLeave.employee && newLeave.startDate && newLeave.endDate) {
      const leave: PlannedLeave = { id: Date.now().toString(), ...newLeave };
      setPlannedLeaves([...plannedLeaves, leave]);
      setNewLeave({ name: '', employee: '', startDate: '', endDate: '' });
      setIsAddingLeave(false);
    }
  };

  const handleRemovePlannedLeave = (leaveId: string) => {
    setPlannedLeaves(plannedLeaves.filter(leave => leave.id !== leaveId));
  };

  const handleRemoveHoliday = (holidayId: string) => {
    setHolidays(holidays.filter(holiday => holiday.id !== holidayId));
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

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Core Functions
  const saveEntry = async (content: string, type: EntryType, date: Date, reminders?: ReminderSettings, mood?: string, tasks?: Task[], gratitude?: string[]) => {
    const id = Date.now().toString();
    const entry: Entry = { id, content, type, date, reminders, mood, tasks, gratitude };
    setEntries([...entries, entry]);
    return id;
  };

  const deleteEntry = async (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const getEntries = async (date?: Date) => {
    if (date) {
      return entries.filter(entry => isSameDay(entry.date, date));
    }
    return entries;
  };

  const updateEntry = async (id: string, updatedFields: Partial<Entry>) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, ...updatedFields } : entry
    ));
  };

  // Additional Functional Features
  const setReminder = async (id: string, reminderTime: Date, recurrence?: 'daily' | 'weekly' | 'monthly') => {
    const reminderSettings: ReminderSettings = { time: reminderTime, recurrence };
    await updateEntry(id, { reminders: reminderSettings });
  };

  const markAsCompleted = async (id: string) => {
    await updateEntry(id, { completed: true });
  };

  const pinEntry = async (id: string) => {
    await updateEntry(id, { pinned: true });
  };

  const archiveEntry = async (id: string) => {
    await updateEntry(id, { archived: true });
  };

  const getStats = async (): Promise<DiaryStats> => {
    const thisMonth = new Date().getMonth();
    const entriesThisMonth = entries.filter(entry => entry.date.getMonth() === thisMonth).length;
    const completedReminders = entries.filter(entry => entry.completed && entry.type === 'Reminder').length;
    
    // Calculate streak
    let currentStreak = 0;
    const today = new Date();
    let checkDate = new Date(today);
    
    while (entries.some(entry => isSameDay(entry.date, checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return { entriesThisMonth, completedReminders, streak: currentStreak };
  };

  useEffect(() => {
    const fetchStats = async () => {
      const statsData = await getStats();
      setStats(statsData);
    };
    fetchStats();
  }, [entries]);

  // Calendar UI Component
  const CalendarUI = ({ month }: { month: Date }) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
      return firstDay === 0 ? 6 : firstDay - 1;
    };

    const handleDateClick = (day: number) => {
      const clickedDate = new Date(month.getFullYear(), month.getMonth(), day);
      setSelectedDateForEntries(clickedDate);
    };

    const renderCalendarDays = () => {
      const daysInMonth = getDaysInMonth(month);
      const firstDay = getFirstDayOfMonth(month);
      const days = [];
      const holidayDates = getHolidayDates();
      const leaveDates = getPlannedLeaveDates();

      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="w-12 h-12"></div>);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const hasEntries = entries.some(entry => isSameDay(entry.date, date));
        const isToday = date.toDateString() === new Date().toDateString();
        const isHoliday = holidayDates.some(d => d.toDateString() === date.toDateString());
        const isLeave = showPlannedLeaves && leaveDates.some(d => d.toDateString() === date.toDateString());
        const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        let className = "w-12 h-12 flex items-center justify-center rounded-lg font-semibold cursor-pointer transition-all duration-200 text-xl relative hover:scale-105";
        if (isWeekend) className += " bg-gray-100 text-gray-500 hover:bg-gray-200";
        else className += " hover:bg-gray-100 text-gray-700";
        if (isToday) className += " bg-blue-500 text-white hover:bg-blue-600";
        else if (isSelected) className += " bg-gray-700 text-white";
        else if (isHoliday) className += " bg-red-500 text-white hover:bg-red-600";
        else if (isLeave) className += " bg-green-500 text-white hover:bg-green-600";

        const dotColor = isToday || isSelected || isHoliday || isLeave ? 'white' : 'black';

        days.push(
          <div key={day} onClick={() => handleDateClick(day)} className={className}>
            {hasEntries && (
              <div
                className={`w-2 h-2 rounded-full ${dotColor === 'white' ? 'bg-white' : 'bg-red-500'} absolute top-1 right-1 animate-pulse`}
              ></div>
            )}
            {day}
          </div>
        );
      }

      return days;
    };

    return (
      <div className="w-full">
        <div className="bg-white rounded-xl shadow-2xl border border-black/5 overflow-hidden backdrop-blur-sm">
          <div className="p-6 shadow-inner" style={{ backgroundColor: containerBgColor, boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.1)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={20} />
                <span className="text-lg font-bold" style={{ color: containerTextColor }}>Calendar</span>
              </div>
              <div className="flex items-center gap-6">
                <button
                  onClick={prevMonth}
                  className="w-9 h-9 rounded-lg bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all font-bold text-lg hover:scale-110"
                  style={{ color: containerTextColor }}
                >
                  ‹
                </button>
                <div className="text-xl font-bold min-w-48 text-center" style={{ color: containerTextColor }}>
                  {months[month.getMonth()]} {month.getFullYear()}
                </div>
                <button
                  onClick={nextMonth}
                  className="w-9 h-9 rounded-lg bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all font-bold text-lg hover:scale-110"
                  style={{ color: containerTextColor }}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {daysOfWeek.map((day, index) => (
                <div key={day} className={`w-12 text-center font-bold py-2 text-lg ${index >= 5 ? 'text-gray-400' : 'text-gray-600'}`}>
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {renderCalendarDays()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Notification Center Component
  const NotificationCenter = () => {
    if (notifications.length === 0) return null;

    const handleCloseNotification = (id: string) => {
      setNotifications(prev => prev.filter(entry => entry.id !== id));
    };

    const handleCloseAll = () => {
      setNotifications([]);
    };

    return (
      <div className="fixed bottom-4 right-4 z-50 space-y-4 max-w-sm">
        {notifications.length > 1 && (
          <div className="flex justify-end">
            <button 
              onClick={handleCloseAll}
              className="text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 px-3 py-1 rounded-lg transition-colors"
            >
              Close All
            </button>
          </div>
        )}
        {notifications.map(entry => (
          <div key={entry.id} className="bg-blue-500 text-white p-4 rounded-lg shadow-xl animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">Reminder</h3>
                <p className="text-sm">{entry.content || 'Reminder notification'}</p>
              </div>
              <button 
                className="ml-4 text-white hover:text-gray-200 text-lg"
                onClick={() => handleCloseNotification(entry.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Entry Popup Component - Show existing entries first
  const EntryPopup = ({ date }: { date: Date }) => {
    const [newEntry, setNewEntry] = useState({ 
      content: '', 
      type: 'Diary' as EntryType, 
      reminderTime: '',
      recurrence: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
      mood: '',
      gratitude: ['', '', ''],
      tasks: [{ id: Date.now().toString(), text: '', completed: false }],
    });
    
    const [journalPrompt] = useState(journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);
    const dayEntries = entries.filter(entry => isSameDay(entry.date, date) && !entry.archived).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    const [viewMode, setViewMode] = useState<'view' | 'create' | 'edit'>('view');

    const handleSaveEntry = async () => {
      // Allow saving without content for To-Do List and Reminder types
      const canSave = newEntry.content.trim() !== '' || 
                      newEntry.type === 'To-Do List' || 
                      newEntry.type === 'Reminder';
      
      if (canSave) {
        const reminders = newEntry.reminderTime ? { 
          time: new Date(newEntry.reminderTime),
          recurrence: newEntry.recurrence !== 'none' ? newEntry.recurrence : undefined
        } : undefined;
        
        const gratitude = newEntry.gratitude.filter(item => item.trim() !== '');
        
        if (editingEntry) {
          await updateEntry(editingEntry.id, {
            content: newEntry.content,
            type: newEntry.type,
            reminders,
            mood: newEntry.mood,
            tasks: newEntry.tasks.filter(task => task.text.trim() !== ''),
            gratitude
          });
          setEditingEntry(null);
        } else {
          await saveEntry(
            newEntry.content, 
            newEntry.type, 
            date, 
            reminders, 
            newEntry.mood,
            newEntry.tasks.filter(task => task.text.trim() !== ''),
            gratitude
          );
        }
        
        setNewEntry({ 
          content: '', 
          type: 'Diary', 
          reminderTime: '',
          recurrence: 'none',
          mood: '',
          gratitude: ['', '', ''],
          tasks: [{ id: Date.now().toString(), text: '', completed: false }],
        });
        setViewMode('view');
      }
    };

    const handleEditEntry = (entry: Entry) => {
      setNewEntry({
        content: entry.content,
        type: entry.type,
        reminderTime: entry.reminders?.time ? entry.reminders.time.toISOString().slice(0, 16) : '',
        recurrence: entry.reminders?.recurrence || 'none',
        mood: entry.mood || '',
        gratitude: entry.gratitude || ['', '', ''],
        tasks: entry.tasks || [{ id: Date.now().toString(), text: '', completed: false }],
      });
      setEditingEntry(entry);
      setViewMode('edit');
    };

    const handleAddTask = () => {
      setNewEntry({
        ...newEntry,
        tasks: [...newEntry.tasks, { id: Date.now().toString(), text: '', completed: false }]
      });
    };

    const handleTaskChange = (id: string, text: string) => {
      setNewEntry({
        ...newEntry,
        tasks: newEntry.tasks.map(task => 
          task.id === id ? { ...task, text } : task
        )
      });
    };

    const handleTaskToggle = (id: string) => {
      setNewEntry({
        ...newEntry,
        tasks: newEntry.tasks.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      });
    };

    const handleGratitudeChange = (index: number, value: string) => {
      const updatedGratitude = [...newEntry.gratitude];
      updatedGratitude[index] = value;
      setNewEntry({ ...newEntry, gratitude: updatedGratitude });
    };

    return (
      <>
        <style>{`
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes bounceIn {
            0% { opacity: 0; transform: scale(0.3); }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }
          .animate-slide-in { animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
          .animate-fade-in { animation: fadeIn 0.3s ease-out; }
          .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
          .animate-bounce-in { animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
          .entry-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .entry-card:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0,0,0,0.12);
          }
          .mood-selector {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .mood-selector:hover {
            transform: scale(1.05);
          }
          .gradient-bg {
            background: linear-gradient(135deg, #000000 0%, #333333 100%);
          }
          .soft-shadow {
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          }
          .save-button {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .save-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
        `}</style>
        
        <DialogContent className="sm:max-w-5xl bg-white text-gray-800 rounded-3xl shadow-2xl p-0 max-h-[90vh] overflow-hidden animate-scale-in">
          {/* Beautiful Header */}
          <div className="gradient-bg p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-full animate-bounce-in">
                  <Bookmark size={24} className="text-white" />
                </div>
                {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </DialogTitle>
              <p className="text-white/80 text-sm">
                {dayEntries.length > 0 
                  ? `${dayEntries.length} ${dayEntries.length === 1 ? 'entry' : 'entries'} for today`
                  : 'Start writing your first entry for today'
                }
              </p>
            </div>
          </div>

          <div className="p-8 overflow-y-auto max-h-[60vh]">
            {viewMode === 'view' && (
              <div className="space-y-6 animate-fade-in">
                {/* Existing Entries */}
                {dayEntries.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Today's Journal</h3>
                    {dayEntries.map((entry, index) => (
                      <div key={entry.id} 
                           className="entry-card bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200 soft-shadow"
                           style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold bg-gradient-to-r from-gray-800 to-black text-white px-3 py-1.5 rounded-full">
                              {entry.type}
                            </span>
                            {entry.mood && (
                              <span className="text-lg bg-white px-3 py-1 rounded-full shadow-sm border">
                                {moodOptions.find(m => m.value === entry.mood)?.label}
                              </span>
                            )}
                            {entry.pinned && (
                              <div className="p-1.5 bg-yellow-100 rounded-full">
                                <Pin size={16} className="text-yellow-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditEntry(entry)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-all duration-200 hover:scale-110"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteEntry(entry.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-all duration-200 hover:scale-110"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        {entry.content && <p className="text-gray-700 mb-4 leading-relaxed">{entry.content}</p>}
                        
                        {entry.tasks && entry.tasks.length > 0 && (
                          <div className="space-y-3 mt-4">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                              <CheckSquare size={16} className="text-green-600" />
                              Tasks
                            </h4>
                            <div className="space-y-2">
                              {entry.tasks.map((task) => (
                                <div key={task.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                                  <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => {
                                      const updatedTasks = entry.tasks?.map(t => 
                                        t.id === task.id ? { ...t, completed: !t.completed } : t
                                      );
                                      updateEntry(entry.id, { tasks: updatedTasks });
                                    }}
                                    className="h-5 w-5 text-green-600 rounded focus:ring-green-500 transition-all duration-200"
                                  />
                                  <span className={`transition-all duration-300 ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                    {task.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {entry.gratitude && entry.gratitude.length > 0 && (
                          <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <Star size={16} className="text-yellow-600" />
                              Gratitude
                            </h4>
                            <ul className="space-y-2">
                              {entry.gratitude.map((item, index) => (
                                <li key={index} className="flex items-center gap-3 text-gray-700">
                                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Beautiful Add Entry Button */}
                <div className="text-center pt-6">
                  <button
                    onClick={() => setViewMode('create')}
                    className="group bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
                  >
                    <div className="p-1 bg-white/20 rounded-full group-hover:rotate-90 transition-transform duration-300">
                      <Plus size={20} />
                    </div>
                    Write New Entry
                  </button>
                </div>

                {dayEntries.length === 0 && (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="text-6xl mb-4">✨</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Your journal awaits</h3>
                    <p className="text-gray-500 mb-8">Start capturing today's moments and thoughts</p>
                  </div>
                )}
              </div>
            )}

            {(viewMode === 'create' || viewMode === 'edit') && (
              <div className="space-y-8 animate-slide-in">
                {/* Journal Prompt */}
                {newEntry.type === 'Diary' && viewMode === 'create' && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 rounded-xl shadow-sm">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 p-2 bg-yellow-100 rounded-full">
                        <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-yellow-800 leading-relaxed">
                          <span className="font-semibold">💡 Journal Prompt:</span> {journalPrompt}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Entry Type & Mood Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="entry-type" className="text-sm font-semibold text-gray-700">Entry Type</Label>
                    <Select
                      value={newEntry.type}
                      onValueChange={(value) => setNewEntry({ ...newEntry, type: value as EntryType })}
                    >
                      <SelectTrigger className="w-full h-12 bg-white border-2 border-gray-200 hover:border-gray-400 rounded-xl focus:ring-2 focus:ring-gray-500 transition-all duration-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-2">
                        <SelectItem value="Diary" className="rounded-lg m-1 p-3">📓 Diary</SelectItem>
                        <SelectItem value="Note to Self" className="rounded-lg m-1 p-3">💭 Note to Self</SelectItem>
                        <SelectItem value="To-Do List" className="rounded-lg m-1 p-3">✅ To-Do List</SelectItem>
                        <SelectItem value="Reminder" className="rounded-lg m-1 p-3">⏰ Reminder</SelectItem>
                        <SelectItem value="Gratitude Log" className="rounded-lg m-1 p-3">🌟 Gratitude Log</SelectItem>
                        <SelectItem value="Journal" className="rounded-lg m-1 p-3">📖 Journal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Mood Tracker */}
                  {newEntry.type === 'Diary' && (
                    <div className="space-y-3">
                      <Label htmlFor="mood" className="text-sm font-semibold text-gray-700">Today's Mood</Label>
                      <Select
                        value={newEntry.mood}
                        onValueChange={(value) => setNewEntry({ ...newEntry, mood: value })}
                      >
                        <SelectTrigger className="w-full h-12 bg-white border-2 border-gray-200 hover:border-gray-400 rounded-xl focus:ring-2 focus:ring-gray-500 transition-all duration-200 mood-selector">
                          <SelectValue placeholder="How are you feeling?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-lg border-2">
                          {moodOptions.map(mood => (
                            <SelectItem key={mood.value} value={mood.value} className="rounded-lg m-1 p-3 hover:bg-gray-50">
                              {mood.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                {/* Main Content Area */}
                {(newEntry.type !== 'To-Do List' && newEntry.type !== 'Reminder') && (
                  <div className="space-y-3">
                    <Label htmlFor="content" className="text-sm font-semibold text-gray-700">Your Thoughts</Label>
                    <div className="relative">
                      <textarea
                        id="content"
                        value={newEntry.content}
                        onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                        placeholder="Write freely about your day, thoughts, and feelings..."
                        className="w-full h-48 p-6 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none transition-all duration-200 text-gray-700 leading-relaxed"
                        style={{ minHeight: '12rem' }}
                      />
                      <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                        {newEntry.content.length} characters
                      </div>
                    </div>
                  </div>
                )}

                {/* Optional Content for To-Do List and Reminder */}
                {(newEntry.type === 'To-Do List' || newEntry.type === 'Reminder') && (
                  <div className="space-y-3">
                    <Label htmlFor="content" className="text-sm font-semibold text-gray-700">
                      Description <span className="text-xs text-gray-500">(optional)</span>
                    </Label>
                    <div className="relative">
                      <textarea
                        id="content"
                        value={newEntry.content}
                        onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                        placeholder="Add any additional notes or context..."
                        className="w-full h-32 p-6 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none transition-all duration-200 text-gray-700 leading-relaxed"
                      />
                    </div>
                  </div>
                )}
                
                {/* To-Do List */}
                {newEntry.type === 'To-Do List' && (
                  <div className="space-y-4 bg-green-50 p-6 rounded-2xl border border-green-200">
                    <Label className="text-sm font-semibold text-green-800 flex items-center gap-2">
                      <CheckSquare size={16} />
                      Today's Tasks
                    </Label>
                    <div className="space-y-3">
                      {newEntry.tasks.map((task) => (
                         <div key={task.id} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-green-100 transition-all duration-500 ease-out" data-task-id={task.id}>
                           <input
                             type="checkbox"
                             checked={task.completed}
                             onChange={() => handleTaskToggle(task.id)}
                             className="h-5 w-5 text-green-600 rounded focus:ring-green-500 transition-all duration-300 ease-out"
                           />
                           <input
                             type="text"
                             value={task.text}
                             onChange={(e) => handleTaskChange(task.id, e.target.value)}
                             placeholder="Add a task..."
                             className={`flex-1 p-2 border-0 focus:outline-none bg-transparent transition-all duration-300 ease-out ${task.completed ? 'line-through opacity-60 text-gray-500' : 'text-gray-700'}`}
                           />
                          <button
                            onClick={() => handleRemoveTask(task.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-all duration-200 hover:scale-110"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={handleAddTask}
                        className="flex items-center gap-2 text-green-600 hover:text-green-800 mt-2 p-2 hover:bg-green-100 rounded-lg transition-all duration-200"
                      >
                        <Plus size={16} /> Add Task
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Gratitude Log */}
                {newEntry.type === 'Gratitude Log' && (
                  <div className="space-y-4 bg-yellow-50 p-6 rounded-2xl border border-yellow-200">
                    <Label className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
                      <Star size={16} />
                      Today I'm grateful for...
                    </Label>
                    {newEntry.gratitude.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-full">
                          <Star size={16} className="text-yellow-600" />
                        </div>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleGratitudeChange(index, e.target.value)}
                          placeholder={`Grateful thing #${index + 1}`}
                          className="flex-1 p-3 border-2 border-yellow-200 rounded-xl focus:outline-none focus:border-yellow-400 bg-white transition-all duration-200"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Reminder Settings */}
                {newEntry.type === 'Reminder' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-6 rounded-2xl border border-blue-200">
                    <div>
                      <Label htmlFor="reminder-time" className="text-sm font-semibold text-blue-800">Remind me at</Label>
                      <Input
                        type="datetime-local"
                        id="reminder-time"
                        value={newEntry.reminderTime}
                        onChange={(e) => setNewEntry({ ...newEntry, reminderTime: e.target.value })}
                        className="w-full mt-2 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recurrence" className="text-sm font-semibold text-blue-800">Repeat</Label>
                      <Select
                        value={newEntry.recurrence}
                        onValueChange={(value) => setNewEntry({ ...newEntry, recurrence: value as any })}
                      >
                        <SelectTrigger className="w-full mt-2 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Does not repeat" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="none">Does not repeat</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveEntry}
                    className="flex-1 save-button bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-800 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg flex items-center justify-center gap-3 transition-all duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
                    {editingEntry ? 'Update Entry' : 'Save Entry'}
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('view');
                      setEditingEntry(null);
                      setNewEntry({ 
                        content: '', 
                        type: 'Diary', 
                        reminderTime: '',
                        recurrence: 'none',
                        mood: '',
                        gratitude: ['', '', ''],
                        tasks: [{ id: Date.now().toString(), text: '', completed: false }],
                      });
                    }}
                    className="px-6 py-4 text-gray-600 hover:text-gray-800 border-2 border-gray-200 hover:border-gray-300 rounded-2xl font-semibold transition-all duration-200 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </>
    );
  };

  // Holiday Overview Component
  const HolidayOverview = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();

    const handleMonthClick = (monthIndex: number) => {
      const selectedMonth = new Date(currentYear, monthIndex, 1);
      setSelectedHolidayMonth(selectedMonth);
      setHolidayOverviewMode('detail');
    };

    return (
      <DialogContent className="sm:max-w-4xl bg-white text-black rounded-3xl shadow-2xl p-0 max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="gradient-bg p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-full">
                <Calendar size={24} className="text-white" />
              </div>
              Holiday Overview {currentYear}
            </DialogTitle>
            <p className="text-white/80 text-sm">
              View holidays by month and plan your year
            </p>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {months.map((month, index) => {
              const monthDate = new Date(currentYear, index, 1);
              const holidaysInMonth = getHolidaysForMonth(monthDate);
              const holidayCount = holidaysInMonth.length;
              
              return (
                <button
                  key={month}
                  onClick={() => handleMonthClick(index)}
                  className="group p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-gray-400 rounded-2xl transition-all duration-500 ease-out hover:scale-105 hover:shadow-xl"
                >
                  <div className="text-center">
                    <h3 className="font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">{month}</h3>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-gray-600 group-hover:text-blue-600 transition-colors">{holidayCount}</span>
                      <span className="text-sm text-gray-500">
                        {holidayCount === 1 ? 'holiday' : 'holidays'}
                      </span>
                    </div>
                    {holidayCount > 0 && (
                      <div className="flex flex-wrap justify-center gap-1 mb-2">
                         {holidaysInMonth.map(holiday => {
                           const day = new Date(holiday.date).getDate();
                           return (
                             <div 
                               key={holiday.id} 
                               className="w-6 h-6 bg-red-500 text-white rounded-full shadow-lg hover:scale-125 transition-transform duration-200 flex items-center justify-center text-xs font-bold"
                               title={`${holiday.name} - ${day}`}
                             >
                               {day}
                             </div>
                           );
                         })}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    );
  };

  // Holiday Detail Component
  const HolidayDetail = () => {
    if (!selectedHolidayMonth) return null;

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const holidaysInMonth = getHolidaysForMonth(selectedHolidayMonth);

    return (
      <DialogContent className="sm:max-w-3xl bg-white text-black rounded-3xl shadow-2xl p-0 max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="gradient-bg p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => setHolidayOverviewMode('overview')}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-200"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <Calendar size={24} className="text-white" />
                {months[selectedHolidayMonth.getMonth()]} {selectedHolidayMonth.getFullYear()}
              </DialogTitle>
            </div>
            <p className="text-white/80 text-sm">
              {holidaysInMonth.length} {holidaysInMonth.length === 1 ? 'holiday' : 'holidays'} this month
            </p>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {holidaysInMonth.length > 0 ? (
            <div className="space-y-4">
              {holidaysInMonth.map((holiday, index) => (
                <div 
                  key={holiday.id} 
                  className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-2xl hover:border-gray-400 transition-all duration-200 hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <Calendar size={20} className="text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{holiday.name}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(holiday.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-all duration-200 hover:scale-110"
                    onClick={() => handleRemoveHoliday(holiday.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No holidays this month</h3>
              <p className="text-gray-500">This month is all work days!</p>
            </div>
          )}
        </div>
      </DialogContent>
    );
  };

  // Reminder notifications effect
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      entries.forEach(entry => {
        if (entry.reminders && !entry.completed) {
          const reminderTime = new Date(entry.reminders.time);
          const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
          
          // Show notification if within 1 minute of reminder time
          if (timeDiff <= 60000) {
            setNotifications(prev => {
              // Check if this entry is already in the notifications
              if (prev.some(n => n.id === entry.id)) return prev;
              return [...prev, entry];
            });
          }
        }
      });
    };
    
    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [entries]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-black p-6 font-sans" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <style>
        {`
          .task-completed {
            animation: taskComplete 1s ease-out;
          }
          
          @keyframes taskComplete {
            0% {
              transform: scale(1);
              background-color: transparent;
            }
            50% {
              transform: scale(1.05);
              background-color: rgba(34, 197, 94, 0.1);
            }
            100% {
              transform: scale(1);
              background-color: transparent;
            }
          }
        `}
      </style>
      
      <NotificationCenter />
      
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <div className="px-6 py-4 mb-8">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-4">
              <button
                style={{ backgroundColor: containerBgColor, color: containerTextColor }}
                className="px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => setShowPlannedLeaves(!showPlannedLeaves)}
              >
                📅 Planned Leaves
              </button>
              <Dialog open={showHolidaysDialog} onOpenChange={(open) => { 
                setShowHolidaysDialog(open); 
                if (!open) { setHolidayOverviewMode('overview'); setSelectedHolidayMonth(null); }
              }}>
                <DialogTrigger asChild>
                  <button
                    style={{ backgroundColor: containerBgColor, color: containerTextColor }}
                    className="px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => { setHolidayOverviewMode('overview'); setSelectedHolidayMonth(null); }}
                  >
                    📅 Holidays
                  </button>
                </DialogTrigger>
                {holidayOverviewMode === 'overview' ? <HolidayOverview /> : <HolidayDetail />}
              </Dialog>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <CalendarUI month={currentMonth} />
          
          {/* Bottom Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Holidays Section */}
            {getHolidaysForMonth(currentMonth).length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b" style={{ backgroundColor: containerBgColor }}>
                  <h3 className="text-lg font-bold" style={{ color: containerTextColor }}>Public Holidays</h3>
                </div>
                <div className="p-6">
                  {getHolidaysForMonth(currentMonth).map(holiday => (
                    <div key={holiday.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div>
                        <h4 className="font-bold text-gray-900">{holiday.name}</h4>
                        <p className="text-sm font-medium text-gray-600">
                          {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        onClick={() => handleRemoveHoliday(holiday.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Planned Leaves Section */}
            {showPlannedLeaves && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: containerBgColor }}>
                  <h3 className="text-lg font-bold" style={{ color: containerTextColor }}>Planned Leaves</h3>
                  <Dialog open={isAddingLeave} onOpenChange={setIsAddingLeave}>
                    <DialogTrigger asChild>
                      <button className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-green-700 transition-all flex items-center gap-1">
                        <Plus size={14} />
                        Add Leave
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white text-black">
                      <DialogHeader>
                        <DialogTitle className="font-bold">Add Planned Leave</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="leave-name" className="font-semibold">Leave Name</Label>
                          <Input
                            id="leave-name"
                            value={newLeave.name}
                            onChange={(e) => setNewLeave({...newLeave, name: e.target.value})}
                            placeholder="e.g., Annual Leave"
                            className="font-medium"
                          />
                        </div>
                        <div>
                          <Label htmlFor="employee" className="font-semibold">Employee</Label>
                          <Input
                            id="employee"
                            value={newLeave.employee}
                            onChange={(e) => setNewLeave({...newLeave, employee: e.target.value})}
                            placeholder="Employee name"
                            className="font-medium"
                          />
                        </div>
                        <div>
                          <Label htmlFor="startDate" className="font-semibold">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={newLeave.startDate}
                            onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                            className="font-medium"
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate" className="font-semibold">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={newLeave.endDate}
                            onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                            className="font-medium"
                          />
                        </div>
                        <Button
                          onClick={handleAddPlannedLeave}
                          className="w-full bg-green-600 hover:bg-green-700 font-semibold"
                        >
                          Add Leave
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="p-6">
                  {plannedLeaves.length > 0 ? (
                    plannedLeaves.map(leave => (
                      <div key={leave.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div>
                          <h4 className="font-bold text-gray-900">{leave.name}</h4>
                          <p className="text-sm font-medium text-gray-600">
                            {leave.employee} • {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          onClick={() => handleRemovePlannedLeave(leave.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📅</div>
                      <p className="font-medium text-gray-900">No planned leaves added yet</p>
                      <p className="text-sm font-medium text-gray-600">Click "Add Leave" to create one</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Entries Dialog */}
        <Dialog open={selectedDateForEntries !== null} onOpenChange={() => setSelectedDateForEntries(null)}>
          {selectedDateForEntries && <EntryPopup date={selectedDateForEntries} />}
        </Dialog>
      </div>
    </div>
  );
};

export default PersonalJournal;