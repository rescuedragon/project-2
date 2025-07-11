import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Edit, Save, X } from 'lucide-react';
import { format } from 'date-fns';

interface TimeBreakdownTableProps {
  uniqueProjects: Array<{ projectName: string; subprojects: Set<string> }>;
  selectedProjects: Set<string>;
  daysInRange: Date[];
  expandedProjects: Set<string>;
  editingCell: string | null;
  editValue: string;
  colorCodedEnabled: boolean;
  progressBarEnabled: boolean;
  progressBarColor: string;
  getProjectDayTime: (projectName: string, date: Date) => number;
  getSubprojectDayTime: (projectName: string, subprojectName: string, date: Date) => number;
  getProjectTotal: (projectName: string) => number;
  getSubprojectTotal: (projectName: string, subprojectName: string) => number;
  getDayTotal: (date: Date) => number;
  formatHours: (seconds: number) => string;
  getProjectBackgroundStyle: (projectName: string, isSubproject?: boolean) => object;
  getCurrentDayStyle: (date: Date) => object;
  onToggleProjectExpand: (projectName: string) => void;
  onEdit: (projectName: string, subprojectName: string | null, date: Date) => void;
  onSave: (projectName: string, subprojectName: string | null, date: Date) => void;
  onCancel: () => void;
  onEditValueChange: (value: string) => void;
}

const TimeBreakdownTable: React.FC<TimeBreakdownTableProps> = ({
  uniqueProjects,
  selectedProjects,
  daysInRange,
  expandedProjects,
  editingCell,
  editValue,
  colorCodedEnabled,
  progressBarEnabled,
  progressBarColor,
  getProjectDayTime,
  getSubprojectDayTime,
  getProjectTotal,
  getSubprojectTotal,
  getDayTotal,
  formatHours,
  getProjectBackgroundStyle,
  getCurrentDayStyle,
  onToggleProjectExpand,
  onEdit,
  onSave,
  onCancel,
  onEditValueChange
}) => {
  const totalTime = uniqueProjects
    .filter(project => selectedProjects.has(project.projectName))
    .reduce((total, project) => total + getProjectTotal(project.projectName), 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#F8F8F8] border-b border-t border-[#E0E0E0]">
            <th className="text-left py-4 px-4 font-semibold text-[#4D4D4D] border-r border-[#E0E0E0]">Project</th>
            <th className="text-left py-4 px-4 font-semibold text-[#4D4D4D] border-r border-[#E0E0E0]">Subproject</th>
            {daysInRange.map(day => (
              <th 
                key={day.toISOString()} 
                className={`text-center py-4 px-4 font-semibold text-[#4D4D4D] min-w-[100px] border-r border-[#E0E0E0]`}
                style={getCurrentDayStyle(day)}
              >
                <div className="font-bold">{format(day, 'EEE')}</div>
                <div className="text-xs font-normal text-[#7D7D7D]">{format(day, 'M/d')}</div>
              </th>
            ))}
            <th className="text-center py-4 px-4 font-semibold text-[#4D4D4D]">Total</th>
          </tr>
        </thead>
        <tbody>
          {uniqueProjects
            .filter(project => selectedProjects.has(project.projectName))
            .map(project => (
              <React.Fragment key={project.projectName}>
                <tr 
                  className="border-b border-[#F0F0F0] hover:bg-[#F8F8F8] transition-colors"
                  style={getProjectBackgroundStyle(project.projectName)}
                >
                  <td className="py-4 px-4 font-bold text-[#4D4D4D] border-r border-[#E0E0E0]">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => onToggleProjectExpand(project.projectName)}
                      >
                        {expandedProjects.has(project.projectName) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </Button>
                      <span>{project.projectName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#7D7D7D] border-r border-[#E0E0E0]">Project Total</td>
                  {daysInRange.map(day => {
                    const dayTime = getProjectDayTime(project.projectName, day);
                    const cellKey = `${project.projectName}-${format(day, 'yyyy-MM-dd')}`;
                    const isEditing = editingCell === cellKey;
                    
                    return (
                      <td 
                        key={day.toISOString()} 
                        className="py-4 px-4 text-center border-r border-[#E0E0E0]"
                      >
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <Input
                              value={editValue}
                              onChange={(e) => onEditValueChange(e.target.value)}
                              className="w-16 h-8 text-center text-sm border border-[#B0B0B0] rounded"
                              type="number"
                              step="0.1"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => onSave(project.projectName, null, day)}
                              className="h-8 w-8 p-0 bg-[#4D4D4D] text-white"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={onCancel}
                              className="h-8 w-8 p-0 text-[#7D7D7D]"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="flex items-center justify-center gap-1 cursor-pointer hover:bg-[#F0F0F0] rounded px-2 py-1 transition-colors"
                            onClick={() => onEdit(project.projectName, null, day)}
                          >
                            <span className="font-mono text-sm font-medium text-[#4D4D4D]">
                              {formatHours(dayTime)}
                            </span>
                            {dayTime > 0 && (
                              <Edit className="h-3 w-3 text-[#7D7D7D] opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-4 px-4 text-center">
                    <span className="font-mono text-sm font-bold text-[#4D4D4D] bg-[#F0F0F0] px-3 py-1 rounded-lg">
                      {formatHours(getProjectTotal(project.projectName))}
                    </span>
                  </td>
                </tr>
                
                {expandedProjects.has(project.projectName) && 
                  Array.from(project.subprojects).map(subproject => (
                    <tr 
                      key={`${project.projectName}-${subproject}`}
                      className="border-b border-[#F0F0F0] hover:bg-[#F8F8F8] transition-colors"
                      style={getProjectBackgroundStyle(project.projectName, true)}
                    >
                      <td className="py-4 px-4 pl-10 font-medium text-[#4D4D4D] border-r border-[#E0E0E0]"></td>
                      <td className="py-4 px-4 text-[#7D7D7D] border-r border-[#E0E0E0]">{subproject}</td>
                      {daysInRange.map(day => {
                        const dayTime = getSubprojectDayTime(project.projectName, subproject, day);
                        const cellKey = `${project.projectName}-${subproject}-${format(day, 'yyyy-MM-dd')}`;
                        const isEditing = editingCell === cellKey;
                        
                        return (
                          <td 
                            key={day.toISOString()} 
                            className="py-4 px-4 text-center border-r border-[#E0E0E0]"
                          >
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1">
                                <Input
                                  value={editValue}
                                  onChange={(e) => onEditValueChange(e.target.value)}
                                  className="w-16 h-8 text-center text-sm border border-[#B0B0B0] rounded"
                                  type="number"
                                  step="0.1"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={() => onSave(project.projectName, subproject, day)}
                                  className="h-8 w-8 p-0 bg-[#4D4D4D] text-white"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={onCancel}
                                  className="h-8 w-8 p-0 text-[#7D7D7D]"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div 
                                className="flex items-center justify-center gap-1 cursor-pointer hover:bg-[#F0F0F0] rounded px-2 py-1 transition-colors"
                                onClick={() => onEdit(project.projectName, subproject, day)}
                              >
                                <span className="font-mono text-sm font-medium text-[#4D4D4D]">
                                  {formatHours(dayTime)}
                                </span>
                                {dayTime > 0 && (
                                  <Edit className="h-3 w-3 text-[#7D7D7D] opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            )}
                          </td>
                        );
                    })}
                    <td className="py-4 px-4 text-center">
                      <span className="font-mono text-sm font-bold text-[#4D4D4D] bg-[#F0F0F0] px-3 py-1 rounded-lg">
                        {formatHours(getSubprojectTotal(project.projectName, subproject))}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </React.Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-[#4D4D4D] bg-[#F8F8F8]">
            <td className="py-4 px-4 font-bold text-[#4D4D4D] border-r border-[#E0E0E0]">Grand Total</td>
            <td className="py-4 px-4 border-r border-[#E0E0E0]"></td>
            {daysInRange.map(day => (
              <td key={day.toISOString()} className="py-4 px-4 text-center border-r border-[#E0E0E0]">
                <span className="font-mono text-sm font-bold text-[#4D4D4D] bg-[#F0F0F0] px-3 py-1 rounded-lg">
                  {formatHours(getDayTotal(day))}
                </span>
              </td>
            ))}
            <td className="py-4 px-4 text-center">
              <span className="font-mono text-lg font-bold text-[#4D4D4D] bg-[#F0F0F0] px-4 py-2 rounded-lg">
                {formatHours(totalTime)}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default TimeBreakdownTable;