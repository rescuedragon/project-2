import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddEntryDialogProps {
  isOpen: boolean;
  projects: any[];
  addFormData: {
    projectId: string;
    subprojectId: string;
    date: string;
    duration: string;
    description: string;
    startTime: string;
    endTime: string;
  };
  onAddFormDataChange: (data: any) => void;
  onAddEntry: () => void;
  onCancel: () => void;
}

const AddEntryDialog: React.FC<AddEntryDialogProps> = ({
  isOpen,
  projects,
  addFormData,
  onAddFormDataChange,
  onAddEntry,
  onCancel
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Time Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Project</Label>
            <Select 
              value={addFormData.projectId} 
              onValueChange={(value) => onAddFormDataChange({...addFormData, projectId: value, subprojectId: ''})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Subproject</Label>
            <Select 
              value={addFormData.subprojectId} 
              onValueChange={(value) => onAddFormDataChange({...addFormData, subprojectId: value})}
              disabled={!addFormData.projectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subproject" />
              </SelectTrigger>
              <SelectContent>
                {projects
                  .find(p => p.id === addFormData.projectId)
                  ?.subprojects.map((sub: any) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  )) || []}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={addFormData.date}
              onChange={(e) => onAddFormDataChange({...addFormData, date: e.target.value})}
            />
          </div>
          <div>
            <Label>Duration (hours)</Label>
            <Input
              value={addFormData.duration}
              onChange={(e) => onAddFormDataChange({...addFormData, duration: e.target.value})}
              placeholder="e.g., 2.5"
              type="number"
              step="0.1"
            />
          </div>
          <div>
            <Label>Start Time</Label>
            <Input
              value={addFormData.startTime}
              onChange={(e) => onAddFormDataChange({...addFormData, startTime: e.target.value})}
              placeholder="e.g., 09:00:00"
            />
          </div>
          <div>
            <Label>End Time</Label>
            <Input
              value={addFormData.endTime}
              onChange={(e) => onAddFormDataChange({...addFormData, endTime: e.target.value})}
              placeholder="e.g., 11:30:00"
            />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Textarea
              value={addFormData.description}
              onChange={(e) => onAddFormDataChange({...addFormData, description: e.target.value})}
              placeholder="What did you work on?"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onAddEntry} className="flex-1">
              Add Entry
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

export default AddEntryDialog;