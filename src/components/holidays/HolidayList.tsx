import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

interface Holiday {
  id: string;
  name: string;
  date: string;
}

interface HolidayListProps {
  holidays: Holiday[];
  onDeleteHoliday: (holidayId: string) => void;
}

const HolidayList: React.FC<HolidayListProps> = ({ holidays, onDeleteHoliday }) => {
  return (
    <div className="space-y-2">
      <Label>Existing Holidays</Label>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {holidays.map(holiday => (
          <div key={holiday.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <h4 className="font-medium">{holiday.name}</h4>
              <p className="text-sm text-muted-foreground">{holiday.date}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteHoliday(holiday.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HolidayList;