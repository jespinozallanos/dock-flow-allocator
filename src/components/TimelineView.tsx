
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Allocation, Ship, Dock, TimelineViewMode, WeatherData } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, CalendarIcon, WavesIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TimelineViewProps {
  allocations: Allocation[];
  ships: Ship[];
  docks: Dock[];
  weatherData?: WeatherData;
  days?: number;
}

const TimelineView: React.FC<TimelineViewProps> = ({ 
  allocations, 
  ships, 
  docks, 
  weatherData,
  days = 5 
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

  // Function to determine if a day has a safe tide window
  const hasSafeTideWindow = (date: Date) => {
    if (!weatherData?.tide.windows) return true; // Default to true if no tide data
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Check if any tide window overlaps with this day
    return weatherData.tide.windows.some(window => {
      const windowStart = new Date(window.start);
      const windowEnd = new Date(window.end);
      return window.isSafe && 
        windowStart <= dayEnd && 
        windowEnd >= dayStart;
    });
  };

  const operationalDocks = docks.filter(dock => dock.operationalStatus === 'operativo');

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Cronograma de Asignación de Diques</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousPeriod}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="font-medium min-w-[150px] text-center">
              {viewMode === "month" 
                ? formatMonthYear(currentDate)
                : `Próximos ${days} días`
              }
            </div>
            <Button variant="outline" size="sm" onClick={handleNextPeriod}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline" className="w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between mb-4">
            <TabsList>
              <TabsTrigger value="timeline">Cronograma</TabsTrigger>
              <TabsTrigger value="list">Vista Lista</TabsTrigger>
            </TabsList>
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-tide-windows"
                  checked={showTideWindows}
                  onCheckedChange={setShowTideWindows}
                />
                <Label htmlFor="show-tide-windows" className="text-sm">
                  Mostrar mareas
                </Label>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === "week" ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={() => setViewMode("week")}
                  className="flex items-center gap-1"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Semana
                </Button>
                <Button 
                  variant={viewMode === "month" ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={() => setViewMode("month")}
                  className="flex items-center gap-1"
                >
                  <CalendarDaysIcon className="h-4 w-4" />
                  Mes
                </Button>
              </div>
            </div>
          </div>
          
          <TabsContent value="timeline" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    <th className="w-[100px] p-2 text-left font-medium text-muted-foreground border-r">Diques</th>
                    {timelineDays.map((day, index) => {
                      const hasSafeTide = hasSafeTideWindow(day);
                      return (
                        <th 
                          key={index} 
                          className={`p-2 text-center text-xs font-medium ${showTideWindows && !hasSafeTide ? 'bg-tide-danger/10' : ''}`}
                        >
                          {formatDate(day)}
                          {showTideWindows && !hasSafeTide && (
                            <div className="flex justify-center mt-1">
                              <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs bg-tide-danger/20 text-tide-danger">
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
                  {operationalDocks.map(dock => (
                    <tr key={dock.id} className="border-t">
                      <td className="p-2 text-sm font-medium border-r">
                        {dock.name}
                      </td>
                      {timelineDays.map((day, dayIndex) => {
                        const dayAllocations = allocationsByDock[dock.id]?.filter(
                          allocation => isAllocationInDay(allocation, day)
                        ) || [];
                        
                        const hasSafeTide = hasSafeTideWindow(day);
                        
                        return (
                          <td 
                            key={dayIndex} 
                            className={`p-1 h-12 relative border ${showTideWindows && !hasSafeTide ? 'bg-tide-danger/10' : ''}`}
                          >
                            {dayAllocations.length > 0 ? (
                              <div className="absolute inset-0 flex flex-col">
                                {dayAllocations.map((allocation, i) => {
                                  const ship = getShipById(allocation.shipId);
                                  const height = `${100 / dayAllocations.length}%`;
                                  const top = `${(100 / dayAllocations.length) * i}%`;
                                  
                                  return (
                                    <div 
                                      key={`${allocation.id}-${i}`}
                                      className={`absolute rounded text-white text-xs p-1 truncate ${ship ? getShipTypeClass(ship.type) : 'bg-gray-500'}`}
                                      style={{ 
                                        height, 
                                        top, 
                                        left: '2px', 
                                        right: '2px' 
                                      }}
                                      title={`${ship?.name || 'Buque Desconocido'} (${new Date(allocation.startTime).toLocaleTimeString('es-ES')} - ${new Date(allocation.endTime).toLocaleTimeString('es-ES')})`}
                                    >
                                      {ship?.name || 'Buque'}
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
              <div className="flex items-center gap-2 mt-6 text-sm">
                <span className="font-medium">Leyenda de mareas:</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-tide-danger/20 rounded"></div>
                  <span>Marea insuficiente</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-transparent border rounded"></div>
                  <span>Marea adecuada</span>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="list">
            <div className="space-y-4">
              {allocations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay asignaciones programadas</p>
              ) : (
                allocations.map(allocation => {
                  const ship = getShipById(allocation.shipId);
                  const dock = getDockById(allocation.dockId);
                  
                  return (
                    <div key={allocation.id} className="flex items-center gap-4 border-b pb-3">
                      <div className="w-1/4">
                        <p className="font-medium">{ship?.name || 'Buque Desconocido'}</p>
                        <p className="text-sm text-muted-foreground capitalize">{ship?.type === 'container' ? 'Contenedor' : 
                          ship?.type === 'bulk' ? 'Granel' : 
                          ship?.type === 'tanker' ? 'Tanquero' : 'Pasajeros'}</p>
                      </div>
                      <div className="w-1/4">
                        <p className="font-medium">{dock?.name || 'Dique Desconocido'}</p>
                        <p className="text-sm text-muted-foreground">{dock?.length}m × {dock?.depth}m</p>
                      </div>
                      <div className="w-1/4">
                        <p className="text-sm">
                          <span className="text-muted-foreground mr-1">Inicio:</span>
                          {new Date(allocation.startTime).toLocaleString('es-ES')}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground mr-1">Fin:</span>
                          {new Date(allocation.endTime).toLocaleString('es-ES')}
                        </p>
                      </div>
                      <div className="w-1/4">
                        <div className={`text-xs inline-flex items-center rounded-full px-2.5 py-0.5 font-medium
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
      </CardContent>
    </Card>
  );
};

export default TimelineView;
