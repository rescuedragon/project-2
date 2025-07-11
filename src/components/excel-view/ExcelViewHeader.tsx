import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';

interface ExcelViewHeaderProps {
  onExportToCSV: () => void;
}

const ExcelViewHeader: React.FC<ExcelViewHeaderProps> = ({ onExportToCSV }) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Time Entries
        </div>
        <Button onClick={onExportToCSV} variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </CardTitle>
    </CardHeader>
  );
};

export default ExcelViewHeader;