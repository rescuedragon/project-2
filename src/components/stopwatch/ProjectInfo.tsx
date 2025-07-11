import React from 'react';
import { Project, Subproject } from '../TimeTracker';
import { generateProjectColor } from '@/lib/projectColors';

interface ProjectInfoProps {
  selectedProject: Project | undefined;
  selectedSubproject: Subproject | undefined;
  colorCodedEnabled: boolean;
}

const ProjectInfo: React.FC<ProjectInfoProps> = ({
  selectedProject,
  selectedSubproject,
  colorCodedEnabled
}) => {
  const showProjectInfo = selectedProject && selectedSubproject;

  const getProjectInfoStyle = () => {
    if (!showProjectInfo || !colorCodedEnabled) return {};
    
    const baseColor = generateProjectColor(selectedProject.name);
    return {
      backgroundColor: baseColor,
      borderColor: baseColor.replace('0.7', '0.9'),
      boxShadow: `0 10px 30px ${baseColor.replace('0.7', '0.3')}, 0 4px 10px rgba(0,0,0,0.1)`
    };
  };

  return (
    <div 
      className={`text-center space-y-2 px-8 py-6 rounded-2xl border shadow-xl backdrop-blur-lg transition-all duration-300 mx-6 mt-6 mb-8 min-w-[320px] max-w-[480px] truncate ${
        showProjectInfo ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={getProjectInfoStyle()}
    >
      {showProjectInfo && (
        <>
          <div className="text-xl font-medium text-gray-800 tracking-tight truncate">
            {selectedProject.name}
          </div>
          <div className="text-sm text-gray-700 font-light truncate">
            {selectedSubproject.name}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectInfo;