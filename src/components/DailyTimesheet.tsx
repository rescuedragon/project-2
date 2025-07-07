import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar, Clock, FileSpreadsheet, Filter, Group, X } from 'lucide-react';
import { TimeLog } from './TimeTracker';
import { format, startOfDay, endOfDay, addDays, subDays } from 'date-fns';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface DailyTimesheetProps {
  timeLogs: TimeLog[];
  onSwitchToWeeklyView: () => void;
}

const DailyTimesheet: React.FC<DailyTimesheetProps> = ({ timeLogs, onSwitchToWeeklyView }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);
  const [groupByProject, setGroupByProject] = useState(false);
  const [selectedProjectsFilter, setSelectedProjectsFilter] = useState<Set<string>>(new Set());
  const [selectedSubprojectsFilter, setSelectedSubprojectsFilter] = useState<Set<string>>(new Set());
  const [showProjectFilter, setShowProjectFilter] = useState(false);

  useEffect(() => {
    setColorCodedEnabled(isColorCodedProjectsEnabled());
    
    const handleStorageChange = () => {
      setColorCodedEnabled(isColorCodedProjectsEnabled());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settings-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-changed', handleStorageChange);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDuration = (seconds: number) => {
    const hours = (seconds / 3600).toFixed(2);
    return `${hours}h`;
  };

  const getProjectBackgroundStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    return {
      backgroundColor: generateProjectColor(projectName)
    };
  };

  const dayStart = startOfDay(selectedDate);
  const dayEnd = endOfDay(selectedDate);

  const dailyLogs = timeLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= dayStart && logDate <= dayEnd;
  });

  // Apply project filter
  let filteredLogs = selectedProject === 'all' 
    ? dailyLogs 
    : dailyLogs.filter(log => log.projectName === selectedProject);

  // Apply advanced filters
  if (selectedProjectsFilter.size > 0) {
    filteredLogs = filteredLogs.filter(log => selectedProjectsFilter.has(log.projectName));
  }
  if (selectedSubprojectsFilter.size > 0) {
    filteredLogs = filteredLogs.filter(log => selectedSubprojectsFilter.has(log.subprojectName));
  }

  // Group logs by project name if grouping is enabled
  const groupedLogs = groupByProject 
    ? filteredLogs.reduce((groups, log) => {
        const key = log.projectName;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(log);
        return groups;
      }, {} as Record<string, typeof filteredLogs>)
    : { 'All Entries': filteredLogs };

  const totalDuration = filteredLogs.reduce((sum, log) => sum + log.duration, 0);

  const uniqueProjects = [...new Set(dailyLogs.map(log => log.projectName))];
  const uniqueSubprojects = [...new Set(dailyLogs.map(log => log.subprojectName))];

  const goToPreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleProjectFilterToggle = (projectName: string) => {
    const newSelected = new Set(selectedProjectsFilter);
    if (newSelected.has(projectName)) {
      newSelected.delete(projectName);
    } else {
      newSelected.add(projectName);
    }
    setSelectedProjectsFilter(newSelected);
  };

  const handleSubprojectFilterToggle = (subprojectName: string) => {
    const newSelected = new Set(selectedSubprojectsFilter);
    if (newSelected.has(subprojectName)) {
      newSelected.delete(subprojectName);
    } else {
      newSelected.add(subprojectName);
    }
    setSelectedSubprojectsFilter(newSelected);
  };

  const clearAllFilters = () => {
    setSelectedProjectsFilter(new Set());
    setSelectedSubprojectsFilter(new Set());
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Navigation */}
      <Card className="bg-gradient-secondary-modern border-border/20 shadow-2xl backdrop-blur-xl hover:border-border/40 transition-all duration-500">
        <CardHeader className="pb-6 border-b border-border/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-foreground">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xl tracking-tight">Daily View</span>
            </CardTitle>
            <Button onClick={onSwitchToWeeklyView} variant="secondary" size="sm" className="btn-modern shadow-lg hover:shadow-xl rounded-xl">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Weekly View
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={goToPreviousDay} variant="outline" size="sm" className="btn-modern shadow-lg hover:shadow-xl rounded-xl">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-xl font-bold text-foreground min-w-[300px] text-center bg-muted/30 px-6 py-3 rounded-xl border border-border/20 shadow-lg backdrop-blur-sm">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </div>
              <Button onClick={goToNextDay} variant="outline" size="sm" className="btn-modern shadow-lg hover:shadow-xl rounded-xl">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={goToToday} variant="secondary" size="sm" className="btn-modern shadow-lg hover:shadow-xl rounded-xl">
              Today
            </Button>
          </div>

          {/* Project Filter and Controls */}
          <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/20 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-foreground">Filter by Project:</span>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-52 h-10 shadow-lg border-2 border-border/30 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/40 shadow-2xl backdrop-blur-xl rounded-xl">
                  <SelectItem value="all">All Projects</SelectItem>
                  {uniqueProjects.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={groupByProject ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGroupByProject(!groupByProject)}
                  className="btn-modern shadow-lg hover:shadow-xl rounded-xl"
                >
                  <Group className="h-4 w-4 mr-2" />
                  Group Projects
                </Button>
                
                <Popover open={showProjectFilter} onOpenChange={setShowProjectFilter}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="btn-modern shadow-lg hover:shadow-xl rounded-xl">
                      <Filter className="h-4 w-4 mr-2" />
                      Advanced Filter
                      {(selectedProjectsFilter.size > 0 || selectedSubprojectsFilter.size > 0) && (
                        <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                          {selectedProjectsFilter.size + selectedSubprojectsFilter.size}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 bg-card border-border/40 shadow-2xl backdrop-blur-xl rounded-xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">Filter Options</h4>
                        <Button variant="ghost" size="sm" onClick={() => setShowProjectFilter(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Projects:</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {uniqueProjects.map(project => (
                            <div key={project} className="flex items-center space-x-2">
                              <Checkbox
                                id={`project-${project}`}
                                checked={selectedProjectsFilter.has(project)}
                                onCheckedChange={() => handleProjectFilterToggle(project)}
                              />
                              <Label htmlFor={`project-${project}`} className="text-sm truncate">
                                {project}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Subprojects:</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {uniqueSubprojects.map(subproject => (
                            <div key={subproject} className="flex items-center space-x-2">
                              <Checkbox
                                id={`subproject-${subproject}`}
                                checked={selectedSubprojectsFilter.has(subproject)}
                                onCheckedChange={() => handleSubprojectFilterToggle(subproject)}
                              />
                              <Label htmlFor={`subproject-${subproject}`} className="text-sm truncate">
                                {subproject}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm" onClick={clearAllFilters} className="w-full">
                        Clear All Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-xl border border-border/20 shadow-lg backdrop-blur-sm">
              <Clock className="h-5 w-5 text-accent" />
              <span className="text-base font-bold text-foreground">
                Total: {formatTime(totalDuration)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries */}
      <Card className="bg-gradient-secondary-modern border-border/20 shadow-2xl backdrop-blur-xl hover:border-border/40 transition-all duration-500">
        <CardHeader className="border-b border-border/10">
          <CardTitle className="flex items-center gap-3 text-foreground">
            <span className="text-xl tracking-tight">Time Entries</span>
            <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
              {filteredLogs.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-16 w-16 mx-auto mb-6 opacity-40" />
              <p className="text-lg font-medium">No time entries for this day</p>
              <p className="text-sm mt-2">Start tracking time to see entries here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLogs).map(([groupName, logs]) => {
                const groupTotalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
                
                return (
                  <div key={groupName} className="border border-border/30 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 animate-scale-in backdrop-blur-sm">
                    {/* Group Header */}
                    {groupByProject && groupName !== 'All Entries' && (
                      <div className="bg-primary/5 p-5 border-b border-border/20" style={getProjectBackgroundStyle(groupName)}>
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-bold text-foreground">{groupName}</h3>
                          <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-lg border border-border/20 shadow-lg backdrop-blur-sm">
                            <Clock className="h-4 w-4 text-accent" />
                            <span className="text-lg font-bold text-accent">
                              {formatDuration(groupTotalDuration)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Group Logs */}
                    <div className="divide-y divide-border/20">
                      {logs.map(log => (
                        <div key={log.id} className="p-5 hover:bg-accent/5 transition-all duration-300 group backdrop-blur-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              {!groupByProject && (
                                <p className="text-base font-medium text-foreground mb-1">{log.projectName}</p>
                              )}
                              <p className="text-base font-medium text-foreground mb-1">{log.subprojectName}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{log.startTime} - {log.endTime}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-accent group-hover:scale-105 transition-transform duration-200 bg-accent/10 px-3 py-2 rounded-lg">
                                {formatDuration(log.duration)}
                              </div>
                            </div>
                          </div>
                          {log.description && (
                            <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/20 shadow-lg backdrop-blur-sm">
                              <p className="text-sm text-foreground italic">{log.description}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyTimesheet;