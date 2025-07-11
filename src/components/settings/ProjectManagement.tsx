import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Save, X, Trash2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  subprojects: Array<{ id: string; name: string; totalTime: number }>;
  totalTime: number;
}

interface ProjectManagementProps {
  projects: Project[];
  onUpdateProjects: (projects: Project[]) => void;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({
  projects,
  onUpdateProjects
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [newSubprojectName, setNewSubprojectName] = useState('');
  const [selectedProjectForSub, setSelectedProjectForSub] = useState('');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingSubproject, setEditingSubproject] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      const newProject = {
        id: Date.now().toString(),
        name: newProjectName,
        subprojects: [],
        totalTime: 0
      };
      const updatedProjects = [...projects, newProject];
      onUpdateProjects(updatedProjects);
      setNewProjectName('');
    }
  };

  const handleAddSubproject = () => {
    if (newSubprojectName.trim() && selectedProjectForSub) {
      const updatedProjects = projects.map(project => 
        project.id === selectedProjectForSub 
          ? {
              ...project,
              subprojects: [...project.subprojects, {
                id: `${Date.now()}-sub`,
                name: newSubprojectName,
                totalTime: 0
              }]
            }
          : project
      );
      onUpdateProjects(updatedProjects);
      setNewSubprojectName('');
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    onUpdateProjects(updatedProjects);
    
    // Also remove associated time logs
    const savedTimeLogs = localStorage.getItem('timesheet-logs');
    if (savedTimeLogs) {
      const timeLogs = JSON.parse(savedTimeLogs);
      const filteredLogs = timeLogs.filter((log: any) => log.projectId !== projectId);
      localStorage.setItem('timesheet-logs', JSON.stringify(filteredLogs));
    }
  };

  const handleEditProject = (projectId: string, newName: string) => {
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? { ...project, name: newName }
        : project
    );
    onUpdateProjects(updatedProjects);
    
    // Update project names in time logs
    const savedTimeLogs = localStorage.getItem('timesheet-logs');
    if (savedTimeLogs) {
      const timeLogs = JSON.parse(savedTimeLogs);
      const updatedLogs = timeLogs.map((log: any) => 
        log.projectId === projectId 
          ? { ...log, projectName: newName }
          : log
      );
      localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
    }
    
    setEditingProject(null);
    setEditingName('');
  };

  const handleDeleteSubproject = (projectId: string, subprojectId: string) => {
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? {
            ...project,
            subprojects: project.subprojects.filter((sub: any) => sub.id !== subprojectId)
          }
        : project
    );
    onUpdateProjects(updatedProjects);
    
    // Also remove associated time logs
    const savedTimeLogs = localStorage.getItem('timesheet-logs');
    if (savedTimeLogs) {
      const timeLogs = JSON.parse(savedTimeLogs);
      const filteredLogs = timeLogs.filter((log: any) => log.subprojectId !== subprojectId);
      localStorage.setItem('timesheet-logs', JSON.stringify(filteredLogs));
    }
  };

  const handleEditSubproject = (projectId: string, subprojectId: string, newName: string) => {
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? {
            ...project,
            subprojects: project.subprojects.map((sub: any) => 
              sub.id === subprojectId 
                ? { ...sub, name: newName }
                : sub
            )
          }
        : project
    );
    onUpdateProjects(updatedProjects);
    
    // Update subproject names in time logs
    const savedTimeLogs = localStorage.getItem('timesheet-logs');
    if (savedTimeLogs) {
      const timeLogs = JSON.parse(savedTimeLogs);
      const updatedLogs = timeLogs.map((log: any) => 
        log.subprojectId === subprojectId 
          ? { ...log, subprojectName: newName }
          : log
      );
      localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
    }
    
    setEditingSubproject(null);
    setEditingName('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Add New Project</Label>
        <div className="flex gap-2">
          <Input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Enter project name..."
          />
          <Button onClick={handleAddProject}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Add New Subproject</Label>
        <div className="flex gap-2">
          <select 
            value={selectedProjectForSub}
            onChange={(e) => setSelectedProjectForSub(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <Input
            value={newSubprojectName}
            onChange={(e) => setNewSubprojectName(e.target.value)}
            placeholder="Enter subproject name..."
          />
          <Button onClick={handleAddSubproject}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Existing Projects</Label>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {projects.map(project => (
            <div key={project.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                {editingProject === project.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleEditProject(project.id, editingName)}
                      disabled={!editingName.trim()}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {setEditingProject(null); setEditingName('')}}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h4 className="font-medium">{project.name}</h4>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {setEditingProject(project.id); setEditingName(project.name)}}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
              {project.subprojects.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-gray-200">
                  <Label className="text-xs text-muted-foreground mb-2 block">Subprojects:</Label>
                  <div className="space-y-2">
                    {project.subprojects.map((sub: any) => (
                      <div key={sub.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {editingSubproject === sub.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="flex-1 h-8"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleEditSubproject(project.id, sub.id, editingName)}
                              disabled={!editingName.trim()}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {setEditingSubproject(null); setEditingName('')}}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm">• {sub.name}</span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {setEditingSubproject(sub.id); setEditingName(sub.name)}}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSubproject(project.id, sub.id)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;