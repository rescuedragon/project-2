import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface AddHolidayFormProps {
  newHoliday: { name: string; date: string };
  onNewHolidayChange: (holiday: { name: string; date: string }) => void;
  onAddHoliday: () => void;
}

const AddHolidayForm: React.FC<AddHolidayFormProps> = ({
  newHoliday,
  onNewHolidayChange,
  onAddHoliday
}) => {
  return (
    <div className="space-y-2">
      <Label>Add New Holiday</Label>
      <div className="flex gap-2">
        <Input
          value={newHoliday.name}
          onChange={(e) => onNewHolidayChange({...newHoliday, name: e.target.value})}
          placeholder="Holiday name..."
        />
        <Input
          type="date"
          value={newHoliday.date}
          onChange={(e) => onNewHolidayChange({...newHoliday, date: e.target.value})}
        />
        <Button onClick={onAddHoliday}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AddHolidayForm;