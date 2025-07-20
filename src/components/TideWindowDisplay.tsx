
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TideWindow } from '@/types/types';

interface TideWindowDisplayProps {
  tideWindows: TideWindow[];
  className?: string;
}

const TideWindowDisplay: React.FC<TideWindowDisplayProps> = ({ tideWindows, className }) => {
  // Get the current time
  const now = new Date();
  
  // Format time function
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date function
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };
  
  // Check if window is current
  const isCurrentWindow = (window: TideWindow) => {
    const start = new Date(window.start);
    const end = new Date(window.end);
    return now >= start && now <= end;
  };
  
  // Determine window status class
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
      <CardHeader className="pb-1">
        <CardTitle className="text-marine-DEFAULT text-sm">Ventanas de Marea</CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="space-y-2">
          {tideWindows.length === 0 ? (
            <p className="text-muted-foreground text-center py-2 text-xs">No hay datos de ventanas de marea disponibles</p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {tideWindows.slice(0, 3).map((window, index) => {
                const isCurrent = isCurrentWindow(window);
                const statusClass = getWindowStatusClass(window, isCurrent);
                
                return (
                  <div key={index} className={`tide-window ${statusClass} relative p-2`}>
                    <div className="tide-wave"></div>
                    <div 
                      className="tide-level-indicator"
                      style={{ width: `${Math.min(100, (window.level / 9) * 100)}%` }}
                    ></div>
                    
                    <div className="flex justify-between items-center relative z-10">
                      <div>
                        <p className="font-semibold text-xs">{formatDate(window.start)}</p>
                        <p className="text-xs">{formatTime(window.start)} - {formatTime(window.end)}</p>
                      </div>
                      
                      <div className="text-right">
                        <span className="inline-block px-1 py-0.5 rounded-full bg-white/20 text-white text-xs">
                          {isCurrent ? 'Actual' : window.isSafe ? 'Seguro' : 'Inseguro'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="tide-level-text text-xs">
                      {window.level.toFixed(1)}m
                    </div>
                  </div>
                );
              })}
              
              {tideWindows.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{tideWindows.length - 3} ventanas más...
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TideWindowDisplay;
