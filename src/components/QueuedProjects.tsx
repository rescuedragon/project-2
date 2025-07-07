import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Play, Square, Save } from 'lucide-react';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';

export interface QueuedProject {
  id: string;
  projectId: string;
  subprojectId: string;
  projectName: string;
  subprojectName: string;
  elapsedTime: number;
  startTime: Date;
}

interface QueuedProjectsProps {
  queuedProjects: QueuedProject[];
  onResumeProject: (queuedProject: QueuedProject) => void;
  onStopProject: (queuedProjectId: string) => void;
  onLogTime?: (duration: number, description: string, startTime: Date, endTime: Date, projectId: string, subprojectId: string) => void;
}

const QueuedProjects: React.FC<QueuedProjectsProps> = ({
  queuedProjects,
  onResumeProject,
  onStopProject,
  onLogTime
}) => {
  const [stoppingProject, setStoppingProject] = useState<QueuedProject | null>(null);
  const [description, setDescription] = useState('');
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);

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

  const getProjectBackgroundStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    return {
      backgroundColor: generateProjectColor(projectName)
    };
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopClick = (project: QueuedProject) => {
    setStoppingProject(project);
  };

  const handleConfirmStop = () => {
    if (stoppingProject && onLogTime) {
      const endTime = new Date();
      onLogTime(
        stoppingProject.elapsedTime,
        description,
        stoppingProject.startTime,
        endTime,
        stoppingProject.projectId,
        stoppingProject.subprojectId
      );
      onStopProject(stoppingProject.id);
    } else {
      // If no onLogTime callback, just stop the project
      if (stoppingProject) {
        onStopProject(stoppingProject.id);
      }
    }
    setStoppingProject(null);
    setDescription('');
  };

  const handleCancelStop = () => {
    setStoppingProject(null);
    setDescription('');
  };

  if (queuedProjects.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="mt-8 shadow-2xl border-0 bg-gradient-secondary-modern backdrop-blur-xl border border-border/20 hover:border-border/40 transition-all duration-500">
        <CardHeader className="pb-6 border-b border-border/10">
          <CardTitle className="text-xl font-medium text-foreground tracking-tight">Paused Projects</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {queuedProjects.map(project => (
              <div 
                key={project.id} 
                className="flex items-center justify-between p-6 border border-border/30 rounded-2xl bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:border-border/50"
                style={getProjectBackgroundStyle(project.projectName)}
              >
                <div className="flex-1">
                  <div className="font-semibold text-lg text-foreground">{project.projectName}</div>
                  <div className="text-sm text-muted-foreground mt-1">{project.subprojectName}</div>
                  <div className="text-sm text-muted-foreground/80 mt-2 font-mono bg-muted/30 px-3 py-1 rounded-lg inline-block">
                    Paused at: {formatTime(project.elapsedTime)}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    onClick={() => onResumeProject(project)}
                    className="bg-success hover:bg-success/90 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStopClick(project)}
                    className="border-border/60 hover:bg-accent/50 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stop Confirmation Dialog */}
      <Dialog open={!!stoppingProject} onOpenChange={(open) => !open && handleCancelStop()}>
        <DialogContent className="max-w-md rounded-2xl bg-card border border-border/40 shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium tracking-tight">Log Time Entry</DialogTitle>
          </DialogHeader>
          {stoppingProject && (
            <div className="space-y-6">
              <div className="p-6 bg-muted/50 rounded-2xl border border-border/30">
                <div className="font-semibold text-foreground">{stoppingProject.projectName}</div>
                <div className="text-sm text-muted-foreground">{stoppingProject.subprojectName}</div>
                <div className="text-lg font-mono mt-3 text-foreground bg-accent/20 px-3 py-2 rounded-lg inline-block">
                  Duration: {formatTime(stoppingProject.elapsedTime)}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-foreground mb-3 block">Description (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you work on?"
                  rows={3}
                  className="border-border/60 bg-input/50 focus:bg-background rounded-xl transition-all duration-300"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button onClick={handleConfirmStop} className="flex-1 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Save className="h-4 w-4 mr-2" />
                  Save & Stop
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelStop}
                  className="px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QueuedProjects;