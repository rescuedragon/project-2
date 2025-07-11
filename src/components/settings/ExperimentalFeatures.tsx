import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExperimentalFeaturesProps {
  progressBarEnabled: boolean;
  progressBarColor: string;
  frequentSubprojectsEnabled: boolean;
  colorCodedProjectsEnabled: boolean;
  onProgressBarToggle: (enabled: boolean) => void;
  onProgressBarColorChange: (color: string) => void;
  onFrequentSubprojectsToggle: (enabled: boolean) => void;
  onColorCodedProjectsToggle: (enabled: boolean) => void;
}

const ExperimentalFeatures: React.FC<ExperimentalFeaturesProps> = ({
  progressBarEnabled,
  progressBarColor,
  frequentSubprojectsEnabled,
  colorCodedProjectsEnabled,
  onProgressBarToggle,
  onProgressBarColorChange,
  onFrequentSubprojectsToggle,
  onColorCodedProjectsToggle
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Experimental Features</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base">Animated Progress Bar</Label>
              <p className="text-sm text-muted-foreground">
                Turn the "Total Time Today" panel into an animated progress bar with 8-hour target
              </p>
            </div>
            <Switch
              checked={progressBarEnabled}
              onCheckedChange={onProgressBarToggle}
            />
          </div>
          
          {progressBarEnabled && (
            <div className="ml-4 p-4 bg-muted rounded-lg space-y-3">
              <div className="space-y-2">
                <Label>Progress Bar Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={progressBarColor}
                    onChange={(e) => onProgressBarColorChange(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={progressBarColor}
                    onChange={(e) => onProgressBarColorChange(e.target.value)}
                    placeholder="#10b981"
                    className="font-mono"
                  />
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Preview: The progress bar will fill as you log time entries throughout the day.
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base">Frequent Subprojects</Label>
              <p className="text-sm text-muted-foreground">
                Show frequently used subprojects as quick selection buttons in the Time Tracker
              </p>
            </div>
            <Switch
              checked={frequentSubprojectsEnabled}
              onCheckedChange={onFrequentSubprojectsToggle}
            />
          </div>
          
          {frequentSubprojectsEnabled && (
            <div className="ml-4 p-4 bg-muted rounded-lg space-y-3">
              <div className="text-sm text-muted-foreground">
                Preview: Quick access buttons for your top 5 most frequently used subprojects will appear below the subproject selector.
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base">Color-Coded Projects</Label>
              <p className="text-sm text-muted-foreground">
                Highlight project names and rows with consistent colors to easily identify project groups
              </p>
            </div>
            <Switch
              checked={colorCodedProjectsEnabled}
              onCheckedChange={onColorCodedProjectsToggle}
            />
          </div>
          
          {colorCodedProjectsEnabled && (
            <div className="ml-4 p-4 bg-muted rounded-lg space-y-3">
              <div className="text-sm text-muted-foreground">
                Preview: Each project and its subprojects will be highlighted with the same soft color across all views for easy identification.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperimentalFeatures;