import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';

interface WeekSummaryCardProps {
  dateRange: { start: Date; end: Date };
  weekTotal: number;
  daysInRange: Date[];
  progressBarEnabled: boolean;
  progressBarColor: string;
  formatHours: (seconds: number) => string;
  getDayTotal: (date: Date) => number;
  onGoToPreviousWeek: () => void;
  onGoToNextWeek: () => void;
  onGoToCurrentWeek: () => void;
  onOpenTimeBreakdown: () => void;
}

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const WeekSummaryCard: React.FC<WeekSummaryCardProps> = ({
  dateRange,
  weekTotal,
  daysInRange,
  progressBarEnabled,
  progressBarColor,
  formatHours,
  getDayTotal,
  onGoToPreviousWeek,
  onGoToNextWeek,
  onGoToCurrentWeek,
  onOpenTimeBreakdown
}) => {
  const getCurrentDayStyle = (date: Date) => {
    const isToday = new Date().toDateString() === date.toDateString();
    if (!isToday || !progressBarEnabled) return {};
    
    return {
      backgroundColor: hexToRgba(progressBarColor, 0.12),
      border: `1.5px solid ${hexToRgba(progressBarColor, 0.32)}`,
      transform: 'translateY(-1.5px)',
    };
  };

  return (
    <Card className="bg-white border border-[#B0B0B0] shadow-md">
      <CardContent className="p-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* Updated date container with gradient and rounded corners */}
          <div className="bg-gradient-to-r from-[#4D4D4D] to-[#1a1a1a] text-white px-4 py-3 rounded-2xl">
            <h2 className="text-xl font-bold text-white">
              {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
            </h2>
            <p className="text-white text-opacity-80 mt-1">
              {formatHours(weekTotal)} hours this week
            </p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <Button 
              onClick={onGoToPreviousWeek}
              variant="outline" 
              className="border border-[#B0B0B0] text-black"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              onClick={onGoToCurrentWeek}
              className="bg-[#4D4D4D] text-white hover:bg-[#7D7D7D]"
            >
              This Week
            </Button>
            <Button 
              onClick={onGoToNextWeek}
              variant="outline" 
              className="border border-[#B0B0B0] text-black"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {daysInRange.map(day => {
            const dayTotal = getDayTotal(day);
            const isCurrentDay = new Date().toDateString() === day.toDateString() && progressBarEnabled;
            const animatedColor = hexToRgba(progressBarColor, 0.3);
            
            return (
              <div 
                key={day.toISOString()}
                className="relative"
              >
                <button
                  className={`
                    aspect-square flex flex-col items-center justify-between 
                    p-0 rounded-2xl border border-[#E0E0E0] w-full
                    transition-all duration-300
                    bg-gradient-to-b from-white to-[#F8F8F8]
                    hover:shadow-lg hover:border-[#B0B0B0] hover:scale-105
                    focus:outline-none relative overflow-hidden
                  `}
                  style={getCurrentDayStyle(day)}
                  onClick={onOpenTimeBreakdown}
                >
                  {isCurrentDay && (
                    <>
                      {/* Wind animation layers */}
                      <div 
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{
                          background: `linear-gradient(45deg, 
                            ${hexToRgba(progressBarColor, 0)} 0%, 
                            ${animatedColor} 25%, 
                            ${hexToRgba(progressBarColor, 0)} 50%, 
                            ${hexToRgba(progressBarColor, 0.4)} 75%, 
                            ${hexToRgba(progressBarColor, 0)} 100%)`,
                          backgroundSize: '400% 400%',
                          animation: 'windFlow1 18s linear infinite',
                          opacity: 0.8
                        }}
                      />
                      <div 
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{
                          background: `linear-gradient(135deg, 
                            ${hexToRgba(progressBarColor, 0)} 0%, 
                            ${hexToRgba(progressBarColor, 0.2)} 20%, 
                            ${hexToRgba(progressBarColor, 0)} 40%, 
                            ${hexToRgba(progressBarColor, 0.3)} 60%, 
                            ${hexToRgba(progressBarColor, 0)} 80%)`,
                          backgroundSize: '600% 600%',
                          animation: 'windFlow2 22s linear infinite',
                          opacity: 0.6
                        }}
                      />
                      <div 
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{
                          background: `linear-gradient(225deg, 
                            ${hexToRgba(progressBarColor, 0)} 0%, 
                            ${hexToRgba(progressBarColor, 0.15)} 15%, 
                            ${hexToRgba(progressBarColor, 0)} 30%, 
                            ${hexToRgba(progressBarColor, 0.25)} 45%, 
                            ${hexToRgba(progressBarColor, 0)} 60%)`,
                          backgroundSize: '800% 800%',
                          animation: 'windFlow3 26s linear infinite',
                          opacity: 0.4
                        }}
                      />
                    </>
                  )}
                  
                  {/* Combined date string centered */}
                  <div className="w-full flex flex-col items-center justify-center flex-grow z-10 pt-4 px-2">
                    <div className="text-center">
                      <div className="text-base font-semibold text-[#1a1a1a]">
                        {format(day, 'EEE')}
                      </div>
                      <div className="text-5xl font-bold text-[#1a1a1a] mt-1 mb-1">
                        {format(day, 'd')}
                      </div>
                      <div className="text-base font-normal text-[#1a1a1a]">
                        {format(day, 'MMM yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hours at bottom - now occupies entire bottom section */}
                  <div className="w-full mt-auto z-10">
                    <div className="text-xl font-medium bg-[#4D4D4D] text-white px-4 py-3 rounded-b-2xl w-full flex items-center justify-center">
                      {formatHours(dayTotal)} hours
                    </div>
                  </div>
                </button>
                
                {isCurrentDay && (
                  <div className="absolute top-0 right-0 w-2 h-2 rounded-full animate-ping z-10" 
                       style={{ backgroundColor: progressBarColor }} />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Wind animation keyframes */}
        <style>{`
          @keyframes windFlow1 {
            0% { 
              background-position: 0% 0%;
            }
            25% { 
              background-position: 50% 50%;
              opacity: 0.9;
            }
            50% { 
              background-position: 100% 100%;
              opacity: 0.7;
            }
            75% { 
              background-position: 150% 150%;
              opacity: 0.9;
            }
            100% { 
              background-position: 200% 200%;
              opacity: 0.7;
            }
          }
          
          @keyframes windFlow2 {
            0% { 
              background-position: 100% 0%;
            }
            25% { 
              background-position: 150% 50%;
              opacity: 0.7;
            }
            50% { 
              background-position: 200% 100%;
              opacity: 0.5;
            }
            75% { 
              background-position: 250% 150%;
              opacity: 0.7;
            }
            100% { 
              background-position: 300% 200%;
              opacity: 0.5;
            }
          }
          
          @keyframes windFlow3 {
            0% { 
              background-position: 0% 100%;
            }
            25% { 
              background-position: 50% 150%;
              opacity: 0.5;
            }
            50% { 
              background-position: 100% 200%;
              opacity: 0.3;
            }
            75% { 
              background-position: 150% 250%;
              opacity: 0.5;
            }
            100% { 
              background-position: 200% 300%;
              opacity: 0.3;
            }
          }
        `}</style>
      </CardContent>
    </Card>
  );
};

export default WeekSummaryCard;