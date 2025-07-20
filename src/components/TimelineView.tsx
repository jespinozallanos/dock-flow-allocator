import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Allocation, Ship, Dock, TimelineViewMode, WeatherData } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, CalendarIcon, WavesIcon, CalendarClockIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TimelineViewProps {
  allocations: Allocation[];
  ships: Ship[];
  docks: Dock[];
  weatherData?: WeatherData;
  days?: number;
  onDockClick?: (dock: Dock) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ 
  allocations, 
  ships, 
  docks, 
  weatherData,
  days = 5,
  onDockClick 
}) => {
  const [viewMode, setViewMode] = useState<TimelineViewMode>("week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showTideWindows, setShowTideWindows] = useState<boolean>(true);
  
  const generateTimelineDays = (mode: TimelineViewMode, baseDate: Date): Date[] => {
    const result: Date[] = [];
    const startDate = new Date(baseDate);
    
    if (mode === "week") {
      startDate.setHours(0, 0, 0, 0);
      for (let i = 0; i < days; i++) {
        const day = new Date(startDate);
        day.setDate(day.getDate() + i);
        result.push(day);
      }
    } else if (mode === "month") {
      const year = startDate.getFullYear();
      const month = startDate.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();
      
      for (let i = 1; i <= lastDay; i++) {
        const day = new Date(year, month, i);
        result.push(day);
      }
    }
    
    return result;
  };

  const timelineDays = generateTimelineDays(viewMode, currentDate);
  
  const formatDate = (date: Date) => {
    if (viewMode === "week") {
      return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    } else {
      return date.getDate().toString();
    }
  };
  
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };
  
  const getShipById = (shipId: string) => ships.find(ship => ship.id === shipId);
  const getDockById = (dockId: string) => docks.find(dock => dock.id === dockId);
  
  const allocationsByDock = docks.reduce((acc, dock) => {
    acc[dock.id] = allocations.filter(allocation => allocation.dockId === dock.id);
    return acc;
  }, {} as Record<string, Allocation[]>);

  const isAllocationInDay = (allocation: Allocation, date: Date) => {
    const startTime = new Date(allocation.startTime);
    const endTime = new Date(allocation.endTime);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return (startTime <= dayEnd && endTime >= dayStart);
  };

  const getShipTypeClass = (type: string) => {
    switch (type) {
      case "container":
        return "bg-blue-600";
      case "bulk":
        return "bg-green-600";
      case "tanker":
        return "bg-red-600";
      case "passenger":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Programado";
      case "in-progress":
        return "En Progreso";
      case "completed":
        return "Completado";
      default:
        return status;
    }
  };

  const handlePreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - days);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + days);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const hasSafeTideWindow = (date: Date) => {
    if (!weatherData?.tide.windows) return true;
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return weatherData.tide.windows.some(window => {
      const windowStart = new Date(window.start);
      const windowEnd = new Date(window.end);
      return window.isSafe && 
        windowStart <= dayEnd && 
        windowEnd >= dayStart;
    });
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
    setViewMode("week");
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-medium">Cronograma de Asignación de Diques</h3>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={handlePreviousPeriod} className="h-6 w-6 p-0">
            <ChevronLeftIcon className="h-3 w-3" />
          </Button>
          <div className="font-medium text-xs min-w-[120px] text-center flex items-center">
            {viewMode === "month" 
              ? formatMonthYear(currentDate)
              : `Próximos ${days} días`
            }
          </div>
          <Button variant="outline" size="sm" onClick={handleNextPeriod} className="h-6 w-6 p-0">
            <ChevronRightIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div>
        <Tabs defaultValue="timeline" className="w-full">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between mb-3">
            <TabsList className="h-8">
              <TabsTrigger value="timeline" className="text-xs px-2">Cronograma</TabsTrigger>
              <TabsTrigger value="list" className="text-xs px-2">Vista Lista</TabsTrigger>
            </TabsList>
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="flex items-center space-x-1">
                <Switch
                  id="show-tide-windows"
                  checked={showTideWindows}
                  onCheckedChange={setShowTideWindows}
                  className="scale-75"
                />
                <Label htmlFor="show-tide-windows" className="text-xs">
                  Mostrar mareas
                </Label>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant={viewMode === "week" ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={() => setViewMode("week")}
                  className="flex items-center gap-1 text-xs h-6 px-2"
                >
                  <CalendarIcon className="h-3 w-3" />
                  Semana
                </Button>
                <Button 
                  variant={viewMode === "month" ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={() => setViewMode("month")}
                  className="flex items-center gap-1 text-xs h-6 px-2"
                >
                  <CalendarDaysIcon className="h-3 w-3" />
                  Mes
                </Button>
                <Button 
                  variant="marine" 
                  size="sm" 
                  onClick={handleTodayClick}
                  className="flex items-center gap-1 text-black text-xs h-6 px-2"
                >
                  <CalendarClockIcon className="h-3 w-3" />
                  Hoy
                </Button>
              </div>
            </div>
          </div>
          
          <TabsContent value="timeline" className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    <th className="w-[80px] p-1 text-left text-xs font-medium text-muted-foreground border-r">Diques</th>
                    {timelineDays.map((day, index) => {
                      const hasSafeTide = hasSafeTideWindow(day);
                      return (
                        <th 
                          key={index} 
                          className={`p-1 text-center text-xs font-medium ${showTideWindows && !hasSafeTide ? 'bg-tide-danger/10' : ''}`}
                        >
                          {formatDate(day)}
                          {showTideWindows && !hasSafeTide && (
                            <div className="flex justify-center mt-0.5">
                              <span className="inline-flex items-center rounded-full px-1 py-0.5 text-xs bg-tide-danger/20 text-tide-danger">
                                Marea baja
                              </span>
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {docks.map(dock => (
                     <tr key={dock.id} className="border-t">
                      <td className="p-1 text-xs font-medium border-r">
                        <button 
                          onClick={() => onDockClick?.(dock)}
                          className="text-left hover:text-marine-DEFAULT hover:underline transition-colors"
                        >
                          {dock.name}
                        </button>
                        {dock.operationalStatus !== 'operativo' && (
                          <div className="mt-0.5">
                            <span className={`inline-flex items-center rounded-full px-1 py-0.5 text-xs ${
                              dock.operationalStatus === 'mantenimiento' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {dock.operationalStatus === 'mantenimiento' ? 'Mantención' : 'Fuera Servicio'}
                            </span>
                          </div>
                        )}
                      </td>
                      {timelineDays.map((day, dayIndex) => {
                        const dayAllocations = allocationsByDock[dock.id]?.filter(
                          allocation => isAllocationInDay(allocation, day)
                        ) || [];
                        
                        const hasSafeTide = hasSafeTideWindow(day);
                        
                        return (
                          <td 
                            key={dayIndex} 
                            className={`p-0.5 h-8 relative border ${
                              dock.operationalStatus !== 'operativo' 
                                ? 'bg-gray-50' 
                                : showTideWindows && !hasSafeTide 
                                  ? 'bg-tide-danger/10' 
                                  : ''
                            }`}
                          >
                            {dayAllocations.length > 0 && dock.operationalStatus === 'operativo' ? (
                              <div className="absolute inset-0 flex flex-col">
                                {dayAllocations.map((allocation, i) => {
                                  const ship = getShipById(allocation.shipId);
                                  
                                  if (!ship) {
                                    console.log("Allocation without valid ship", allocation);
                                    return null;
                                  }
                                  
                                  const height = `${100 / dayAllocations.length}%`;
                                  const top = `${(100 / dayAllocations.length) * i}%`;
                                  
                                  return (
                                    <div 
                                      key={`${allocation.id}-${i}`}
                                      className={`absolute rounded text-white text-xs p-0.5 truncate ${getShipTypeClass(ship.type)}`}
                                      style={{ 
                                        height, 
                                        top, 
                                        left: '1px', 
                                        right: '1px' 
                                      }}
                                      title={`${ship.name} (${new Date(allocation.startTime).toLocaleTimeString('es-ES')} - ${new Date(allocation.endTime).toLocaleTimeString('es-ES')})`}
                                    >
                                      <div className="text-xs truncate">{ship.name}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {showTideWindows && (
              <div className="flex items-center gap-2 mt-3 text-xs">
                <span className="font-medium">Leyenda de mareas:</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-tide-danger/20 rounded"></div>
                  <span>Marea insuficiente</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-transparent border rounded"></div>
                  <span>Marea adecuada</span>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="list">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allocations.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-xs">No hay asignaciones programadas</p>
              ) : (
                allocations.map(allocation => {
                  const ship = getShipById(allocation.shipId);
                  const dock = getDockById(allocation.dockId);
                  
                  if (!ship) {
                    console.log("List view: Allocation without valid ship", allocation);
                    return null;
                  }
                  
                  return (
                    <div key={allocation.id} className="flex items-center gap-2 border-b pb-2 text-xs">
                      <div className="w-1/4">
                        <p className="font-medium text-xs">{ship.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{ship.type === 'container' ? 'Contenedor' : 
                          ship.type === 'bulk' ? 'Granel' : 
                          ship.type === 'tanker' ? 'Tanquero' : 'Pasajeros'}</p>
                      </div>
                      <div className="w-1/4">
                        <p className="font-medium text-xs">{dock?.name || 'Dique Desconocido'}</p>
                        <p className="text-xs text-muted-foreground">{dock?.length}m × {dock?.depth}m</p>
                      </div>
                      <div className="w-1/3">
                        <p className="text-xs">
                          <span className="text-muted-foreground mr-1">Inicio:</span>
                          {new Date(allocation.startTime).toLocaleString('es-ES')}
                        </p>
                        <p className="text-xs">
                          <span className="text-muted-foreground mr-1">Fin:</span>
                          {new Date(allocation.endTime).toLocaleString('es-ES')}
                        </p>
                      </div>
                      <div className="w-1/6">
                        <div className={`text-xs inline-flex items-center rounded-full px-1.5 py-0.5 font-medium
                          ${allocation.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : allocation.status === 'in-progress' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-orange-100 text-orange-800'}`
                        }>
                          {translateStatus(allocation.status)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TimelineView;
