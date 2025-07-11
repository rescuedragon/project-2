import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TimeLog } from '../TimeTracker';

interface EditLogDialogProps {
  editingLog: TimeLog | null;
  editFormData: {
    duration: string;
    description: string;
    startTime: string;
    endTime: string;
  };
  onEditFormDataChange: (data: any) => void;
  onSaveEdit: () => void;
  onCancel: () => void;
}

const EditLogDialog: React.FC<EditLogDialogProps> = ({
  editingLog,
  editFormData,
  onEditFormDataChange,
  onSaveEdit,
  onCancel
}) => {
  return (
    <Dialog open={!!editingLog} onOpenChange={() => onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Time Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Duration (hours)</Label>
            <Input
              value={editFormData.duration}
              onChange={(e) => onEditFormDataChange({...editFormData, duration: e.target.value})}
              placeholder="e.g., 2.5"
              type="number"
              step="0.1"
            />
          </div>
          <div>
            <Label>Start Time</Label>
            <Input
              value={editFormData.startTime}
              onChange={(e) => onEditFormDataChange({...editFormData, startTime: e.target.value})}
              placeholder="e.g., 09:00:00"
            />
          </div>
          <div>
            <Label>End Time</Label>
            <Input
              value={editFormData.endTime}
              onChange={(e) => onEditFormDataChange({...editFormData, endTime: e.target.value})}
              placeholder="e.g., 11:30:00"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={editFormData.description}
              onChange={(e) => onEditFormDataChange({...editFormData, description: e.target.value})}
              placeholder="What did you work on?"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSaveEdit} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditLogDialog;