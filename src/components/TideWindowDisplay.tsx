
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TideWindow } from '@/types/types';

interface TideWindowDisplayProps {
  tideWindows: TideWindow[];
  className?: string;
}

const TideWindowDisplay: React.FC<TideWindowDisplayProps> = ({ tideWindows, className }) => {
  const now = new Date();
  
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };
  
  const isCurrentWindow = (window: TideWindow) => {
    const start = new Date(window.start);
    const end = new Date(window.end);
    return now >= start && now <= end;
  };
  
  const getWindowStatusClass = (window: TideWindow, isCurrent: boolean) => {
    if (!window.isSafe) {
      return "tide-danger";
    }
    if (isCurrent) {
      return "tide-safe";
    }
    return "tide-warning";
  };

  return (
    <Card className={className}>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-marine-DEFAULT text-lg sm:text-xl">
          Ventanas de Marea
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-3 sm:space-y-4">
          {tideWindows.length === 0 ? (
            <p className="text-muted-foreground text-center py-4 text-sm sm:text-base">
              No hay datos de ventanas de marea disponibles
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {tideWindows.map((window, index) => {
                const isCurrent = isCurrentWindow(window);
                const statusClass = getWindowStatusClass(window, isCurrent);
                
                return (
                  <div key={index} className={`tide-window ${statusClass} relative p-3 sm:p-4 rounded-md`}>
                    <div className="tide-wave"></div>
                    <div 
                      className="tide-level-indicator"
                      style={{ width: `${Math.min(100, (window.level / 9) * 100)}%` }}
                    ></div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 relative z-10">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">
                          {formatDate(window.start)}
                        </p>
                        <p className="text-xs sm:text-sm truncate">
                          {formatTime(window.start)} - {formatTime(window.end)}
                        </p>
                      </div>
                      
                      <div className="flex justify-between sm:justify-end items-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white text-xs sm:text-sm">
                          {isCurrent ? 'Actual' : window.isSafe ? 'Seguro' : 'Inseguro'}
                        </span>
                        
                        <div className="text-white text-xs sm:text-sm font-medium ml-2 sm:ml-4">
                          {window.level.toFixed(1)}m
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TideWindowDisplay;
