import React, { useState, useEffect } from 'react';
import { Project, Subproject } from './TimeTracker';
import { QueuedProject } from './QueuedProjects';
import { generateProjectColor } from '@/lib/projectColors';
import ProjectInfo from './stopwatch/ProjectInfo';
import TimerDisplay from './stopwatch/TimerDisplay';
import ControlButtons from './stopwatch/ControlButtons';
import DescriptionDialog from './stopwatch/DescriptionDialog';

interface StopwatchPanelProps {
  selectedProject: Project | undefined;
  selectedSubproject: Subproject | undefined;
  onLogTime: (duration: number, description: string, startTime: Date, endTime: Date, projectId?: string, subprojectId?: string) => void;
  onPauseProject: (queuedProject: QueuedProject) => void;
  resumedProject?: QueuedProject;
  onResumedProjectHandled: () => void;
}

const StopwatchPanel: React.FC<StopwatchPanelProps> = ({
  selectedProject,
  selectedSubproject,
  onLogTime,
  onPauseProject,
  resumedProject,
  onResumedProjectHandled
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [description, setDescription] = useState('');
  const [pendingLogData, setPendingLogData] = useState<{duration: number, startTime: Date, endTime: Date} | null>(null);
  const [tintOpacity, setTintOpacity] = useState(0);
  const lastUpdateRef = React.useRef<number | null>(null);
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);

  // Load stopwatch state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('stopwatch-state');
    if (savedState) {
      const state = JSON.parse(savedState);
      setIsRunning(state.isRunning);
      setElapsedTime(state.elapsedTime);
      setDisplayTime(state.elapsedTime);
      if (state.startTime) {
        setStartTime(new Date(state.startTime));
      }
    }
  }, []);

  // Handle resumed project
  useEffect(() => {
    if (resumedProject) {
      setElapsedTime(resumedProject.elapsedTime);
      setDisplayTime(resumedProject.elapsedTime);
      setStartTime(resumedProject.startTime);
      setIsRunning(true);
      onResumedProjectHandled();
    }
  }, [resumedProject, onResumedProjectHandled]);

  // Save stopwatch state to localStorage
  useEffect(() => {
    const state = {
      isRunning,
      elapsedTime,
      startTime: startTime?.toISOString()
    };
    localStorage.setItem('stopwatch-state', JSON.stringify(state));
  }, [isRunning, elapsedTime, startTime]);

  // Update project color when project changes
  useEffect(() => {
    const savedColorCoded = localStorage.getItem('color-coded-projects-enabled');
    setColorCodedEnabled(savedColorCoded ? JSON.parse(savedColorCoded) : false);
    
    const handleStorageChange = () => {
      const savedColorCoded = localStorage.getItem('color-coded-projects-enabled');
      setColorCodedEnabled(savedColorCoded ? JSON.parse(savedColorCoded) : false);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settings-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-changed', handleStorageChange);
    };
  }, [selectedProject, selectedSubproject]);

  // Update blue tint opacity based on elapsed time
  useEffect(() => {
    // 8 hours = 28,800 seconds
    const maxTime = 28800;
    const newOpacity = Math.min(0.3, elapsedTime / maxTime * 0.3);
    setTintOpacity(newOpacity);
  }, [elapsedTime]);

  // Smooth animation loop
  useEffect(() => {
    if (isRunning && startTime) {
      const updateAnimation = (timestamp: number) => {
        if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
        const delta = timestamp - lastUpdateRef.current;
        
        // Update display time for smooth animation
        if (delta > 16) { // ~60fps
          const now = new Date();
          const exactElapsed = (now.getTime() - startTime.getTime()) / 1000;
          setDisplayTime(exactElapsed);
          lastUpdateRef.current = timestamp;
        }
        
        requestAnimationFrame(updateAnimation);
      };
      
      requestAnimationFrame(updateAnimation);
    }
    
    return () => {
      lastUpdateRef.current = null;
    };
  }, [isRunning, startTime]);

  // Timer effect for actual seconds counting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const newElapsedTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(newElapsedTime);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedProject || !selectedSubproject) return;
    
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    setElapsedTime(0);
    setDisplayTime(0);
    setTintOpacity(0);
  };

  const handlePause = () => {
    if (!selectedProject || !selectedSubproject || !startTime) return;
    
    const queuedProject: QueuedProject = {
      id: Date.now().toString(),
      projectId: selectedProject.id,
      subprojectId: selectedSubproject.id,
      projectName: selectedProject.name,
      subprojectName: selectedSubproject.name,
      elapsedTime,
      startTime
    };
    
    onPauseProject(queuedProject);
    
    setIsRunning(false);
    setElapsedTime(0);
    setDisplayTime(0);
    setStartTime(null);
    localStorage.removeItem('stopwatch-state');
  };

  const handleStop = () => {
    if (!selectedProject || !selectedSubproject || !startTime) return;
    
    const endTime = new Date();
    const finalDuration = elapsedTime;
    
    if (finalDuration > 0) {
      setPendingLogData({
        duration: finalDuration,
        startTime,
        endTime
      });
      setShowDescriptionDialog(true);
    }
    
    setIsRunning(false);
    setElapsedTime(0);
    setDisplayTime(0);
    setStartTime(null);
    localStorage.removeItem('stopwatch-state');
  };

  const handleConfirmLog = () => {
    if (pendingLogData) {
      onLogTime(pendingLogData.duration, description, pendingLogData.startTime, pendingLogData.endTime);
    }
    setShowDescriptionDialog(false);
    setDescription('');
    setPendingLogData(null);
  };

  const handleCancelLog = () => {
    setShowDescriptionDialog(false);
    setDescription('');
    setPendingLogData(null);
  };

  const canStart = selectedProject && selectedSubproject && !isRunning;
  const canPauseOrStop = isRunning && startTime;

  return (
    <div className="flex flex-col items-center">
      <ProjectInfo
        selectedProject={selectedProject}
        selectedSubproject={selectedSubproject}
        colorCodedEnabled={colorCodedEnabled}
      />
      
      {/* Timer Section */}
      <div className="flex flex-col items-center justify-center space-y-10 px-6 z-10">
        <TimerDisplay
          elapsedTime={elapsedTime}
          isRunning={isRunning}
          displayTime={displayTime}
          tintOpacity={tintOpacity}
          progressBarColor="#4285F4"
          formatTime={formatTime}
        />
        
        <ControlButtons
          isRunning={isRunning}
          canStart={!!canStart}
          canPauseOrStop={!!canPauseOrStop}
          onStart={handleStart}
          onStop={handleStop}
          onPause={handlePause}
        />
      </div>

      <DescriptionDialog
        isOpen={showDescriptionDialog}
        selectedProject={selectedProject}
        selectedSubproject={selectedSubproject}
        pendingLogData={pendingLogData}
        description={description}
        formatTime={formatTime}
        onDescriptionChange={setDescription}
        onConfirm={handleConfirmLog}
        onCancel={handleCancelLog}
      />
    </div>
  );
};

export default StopwatchPanel;