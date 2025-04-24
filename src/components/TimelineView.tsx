
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Allocation, Ship, Dock } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimelineViewProps {
  allocations: Allocation[];
  ships: Ship[];
  docks: Dock[];
  days?: number;
}

const TimelineView: React.FC<TimelineViewProps> = ({ allocations, ships, docks, days = 5 }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const timelineDays = Array.from({ length: days }, (_, index) => {
    const day = new Date(today);
    day.setDate(day.getDate() + index);
    return day;
  });
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' });
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cronograma de Asignación de Diques</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="timeline">Cronograma</TabsTrigger>
            <TabsTrigger value="list">Vista Lista</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="space-y-4">
            <div className="grid grid-cols-[100px_1fr] gap-4">
              <div className="font-medium text-muted-foreground">Diques</div>
              <div className="grid grid-cols-5 gap-2">
                {timelineDays.map((day, index) => (
                  <div key={index} className="text-center text-sm font-medium">
                    {formatDate(day)}
                  </div>
                ))}
              </div>
              
              {docks.map(dock => (
                <React.Fragment key={dock.id}>
                  <div className="text-sm font-medium truncate" title={dock.name}>
                    {dock.name}
                  </div>
                  <div className="grid grid-cols-5 gap-2 items-center">
                    {timelineDays.map((day, dayIndex) => {
                      const dayAllocations = allocationsByDock[dock.id]?.filter(
                        allocation => isAllocationInDay(allocation, day)
                      ) || [];
                      
                      return (
                        <div key={dayIndex} className="h-12 relative border rounded bg-muted bg-opacity-50">
                          {dayAllocations.length > 0 ? (
                            <div className="absolute inset-0 flex flex-col">
                              {dayAllocations.map((allocation, i) => {
                                const ship = getShipById(allocation.shipId);
                                // Calculate height based on number of allocations
                                const height = `${100 / dayAllocations.length}%`;
                                const top = `${(100 / dayAllocations.length) * i}%`;
                                
                                return (
                                  <div 
                                    key={`${allocation.id}-${i}`}
                                    className={`absolute rounded text-white text-xs p-1 truncate ${ship ? getShipTypeClass(ship.type) : 'bg-gray-500'}`}
                                    style={{ 
                                      height, 
                                      top, 
                                      left: '4px', 
                                      right: '4px' 
                                    }}
                                    title={`${ship?.name || 'Buque Desconocido'} (${new Date(allocation.startTime).toLocaleTimeString('es-ES')} - ${new Date(allocation.endTime).toLocaleTimeString('es-ES')})`}
                                  >
                                    {ship?.name || 'Buque'}
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </React.Fragment>
              ))}
            </div>
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
