import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import AddHolidayForm from './holidays/AddHolidayForm';
import HolidayList from './holidays/HolidayList';

interface Holiday {
  id: string;
  name: string;
  date: string;
}

const Holidays: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '' });

  useEffect(() => {
    const savedHolidays = localStorage.getItem('timesheet-holidays');
    if (savedHolidays) {
      setHolidays(JSON.parse(savedHolidays));
    }
  }, []);

  const handleAddHoliday = () => {
    if (newHoliday.name && newHoliday.date) {
      const holiday: Holiday = {
        id: Date.now().toString(),
        ...newHoliday
      };
      const updatedHolidays = [...holidays, holiday];
      setHolidays(updatedHolidays);
      localStorage.setItem('timesheet-holidays', JSON.stringify(updatedHolidays));
      setNewHoliday({ name: '', date: '' });
    }
  };

  const handleDeleteHoliday = (holidayId: string) => {
    const updatedHolidays = holidays.filter(h => h.id !== holidayId);
    setHolidays(updatedHolidays);
    localStorage.setItem('timesheet-holidays', JSON.stringify(updatedHolidays));
  };

  return (
    <Card className="bg-gradient-secondary-modern border-border/20 shadow-2xl backdrop-blur-xl hover:border-border/40 transition-all duration-500">
      <CardHeader className="border-b border-border/10">
        <CardTitle className="flex items-center gap-3 text-foreground">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-xl tracking-tight">Holidays</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <AddHolidayForm
          newHoliday={newHoliday}
          onNewHolidayChange={setNewHoliday}
          onAddHoliday={handleAddHoliday}
        />
        <HolidayList
          holidays={holidays}
          onDeleteHoliday={handleDeleteHoliday}
        />
      </CardContent>
    </Card>
  );
};

export default Holidays;