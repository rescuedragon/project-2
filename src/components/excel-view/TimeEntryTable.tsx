import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import { TimeLog } from '../TimeTracker';

interface TimeEntryTableProps {
  groupedLogs: { [key: string]: { date: string; displayDate: string; logs: TimeLog[]; totalHours: number } };
  colorCodedEnabled: boolean;
  formatHours: (seconds: number) => string;
  getRowBackgroundStyle: (projectName: string) => object;
  onEditLog: (log: TimeLog) => void;
  onDeleteLog: (logId: string) => void;
  onAddEntry: () => void;
}

const TimeEntryTable: React.FC<TimeEntryTableProps> = ({
  groupedLogs,
  colorCodedEnabled,
  formatHours,
  getRowBackgroundStyle,
  onEditLog,
  onDeleteLog,
  onAddEntry
}) => {
  return (
    <div className="space-y-6">
      {Object.entries(groupedLogs).map(([date, dayGroup]) => (
        <div key={date} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {dayGroup.displayDate}
            </h3>
            <div className="flex items-center gap-4">
              <Button 
                onClick={onAddEntry}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add entry
              </Button>
              <div className="text-right">
                <div className="text-sm text-gray-500">Daily Total</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatHours(dayGroup.totalHours)} hrs
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
                  <th className="border-2 border-gray-300 dark:border-gray-600 px-3 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Project</th>
                  <th className="border-2 border-gray-300 dark:border-gray-600 px-3 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Subproject</th>
                  <th className="border-2 border-gray-300 dark:border-gray-600 px-3 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Start</th>
                  <th className="border-2 border-gray-300 dark:border-gray-600 px-3 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">End</th>
                  <th className="border-2 border-gray-300 dark:border-gray-600 px-3 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Duration (hrs)</th>
                  <th className="border-2 border-gray-300 dark:border-gray-600 px-3 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Description</th>
                  <th className="border-2 border-gray-300 dark:border-gray-600 px-3 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dayGroup.logs
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(log => (
                    <tr 
                      key={log.id} 
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      style={getRowBackgroundStyle(log.projectName)}
                    >
                       <td className="border-2 border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">{log.projectName}</td>
                       <td className="border-2 border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{log.subprojectName}</td>
                       <td className="border-2 border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{log.startTime}</td>
                       <td className="border-2 border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{log.endTime}</td>
                       <td className="border-2 border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                         <span className="font-mono font-bold text-green-700 dark:text-green-400">
                           {formatHours(log.duration)}
                         </span>
                       </td>
                       <td className="border-2 border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{log.description || '-'}</td>
                        <td className="border-2 border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                         <div className="flex gap-1">
                           <Button
                             onClick={() => onEditLog(log)}
                             size="sm"
                             variant="ghost"
                             className="h-6 w-6 p-0"
                           >
                             <Edit className="h-3 w-3" />
                           </Button>
                           <Button
                             onClick={() => onDeleteLog(log.id)}
                             size="sm"
                             variant="ghost"
                             className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                           >
                             <Trash2 className="h-3 w-3" />
                           </Button>
                         </div>
                       </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimeEntryTable;