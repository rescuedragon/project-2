import React from 'react';
import AddHolidayForm from '../holidays/AddHolidayForm';
import HolidayList from '../holidays/HolidayList';

interface Holiday {
  id: string;
  name: string;
  date: string;
}

interface HolidayManagementProps {
  holidays: Holiday[];
  newHoliday: { name: string; date: string };
  onNewHolidayChange: (holiday: { name: string; date: string }) => void;
  onAddHoliday: () => void;
  onDeleteHoliday: (holidayId: string) => void;
}

const HolidayManagement: React.FC<HolidayManagementProps> = ({
  holidays,
  newHoliday,
  onNewHolidayChange,
  onAddHoliday,
  onDeleteHoliday
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Holiday Management</h3>
        
        <div className="space-y-4">
          <AddHolidayForm
            newHoliday={newHoliday}
            onNewHolidayChange={onNewHolidayChange}
            onAddHoliday={onAddHoliday}
          />
          
          <HolidayList
            holidays={holidays}
            onDeleteHoliday={onDeleteHoliday}
          />
        </div>
      </div>
    </div>
  );
};

export default HolidayManagement;