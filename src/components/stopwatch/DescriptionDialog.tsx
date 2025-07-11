import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Project, Subproject } from '../TimeTracker';

interface DescriptionDialogProps {
  isOpen: boolean;
  selectedProject: Project | undefined;
  selectedSubproject: Subproject | undefined;
  pendingLogData: {duration: number, startTime: Date, endTime: Date} | null;
  description: string;
  formatTime: (seconds: number) => string;
  onDescriptionChange: (description: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const DescriptionDialog: React.FC<DescriptionDialogProps> = ({
  isOpen,
  selectedProject,
  selectedSubproject,
  pendingLogData,
  description,
  formatTime,
  onDescriptionChange,
  onConfirm,
  onCancel
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md rounded-2xl bg-white p-6 border border-gray-200 shadow-2xl z-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-gray-800 tracking-tight">
            Log Time Entry
          </DialogTitle>
        </DialogHeader>
        {pendingLogData && (
          <div className="space-y-6 py-2">
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="font-medium text-gray-800">{selectedProject?.name}</div>
              <div className="text-sm text-gray-600">{selectedSubproject?.name}</div>
              <div className="text-lg font-mono mt-2 text-gray-700 font-medium">
                {formatTime(pendingLogData.duration)}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </Label>
              <Textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="What did you work on?"
                rows={3}
                className="mt-1 border-gray-300 bg-white text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                onClick={onConfirm}
                className="flex-1 py-4 bg-gradient-to-r from-[#34A853] to-[#2a8c43] text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none"
              >
                Save Entry
              </button>
              <button 
                onClick={onCancel}
                className="py-4 px-6 border border-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-300 hover:bg-gray-50 hover:shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DescriptionDialog;