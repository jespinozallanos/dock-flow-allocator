
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TimerIcon, ShipIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Allocation, Ship, Dock } from "@/types/types";

interface AllocationStatusCardProps {
  allocations: Allocation[];
  ships?: Ship[];
  docks?: Dock[];
  className?: string;
  onViewAllocations?: () => void;
}

const AllocationStatusCard: React.FC<AllocationStatusCardProps> = ({
  allocations,
  ships = [],
  docks = [],
  className = "",
  onViewAllocations
}) => {
  const getShipById = (shipId: string) => {
    return ships.find(ship => ship.id === shipId);
  };

  const getDockById = (dockId: string) => {
    return docks.find(dock => dock.id === dockId);
  };

  const translateShipType = (type: string) => {
    switch (type) {
      case 'container':
        return 'Contenedor';
      case 'bulk':
        return 'Granel';
      case 'tanker':
        return 'Tanquero';
      case 'passenger':
        return 'Pasajeros';
      default:
        return type;
    }
  };

  const getShipTypeClass = (type: string) => {
    switch (type) {
      case "container":
        return "text-blue-600";
      case "bulk":
        return "text-green-600";
      case "tanker":
        return "text-red-600";
      case "passenger":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }) + ', ' + new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={`${className} overflow-hidden border-l-4 border-l-marine-DEFAULT shadow-md hover:shadow-lg transition-shadow duration-200`}>
      <CardHeader className="bg-gradient-to-r from-marine-DEFAULT/10 to-transparent pb-2">
        <CardTitle className="flex items-center gap-2 text-marine-DEFAULT">
          <TimerIcon className="h-5 w-5" />
          Asignaciones
        </CardTitle>
        <CardDescription>Asignaciones de diques programadas</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="flex flex-col">
          <div className="text-4xl font-bold text-marine-DEFAULT mb-2">
            {allocations.length}
          </div>
          
          <div className="flex justify-between items-center mt-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-muted-foreground">
                {allocations.filter(a => a.status === 'completed').length} Completadas
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-muted-foreground">
                {allocations.filter(a => a.status === 'in-progress').length} En Progreso
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm text-muted-foreground">
                {allocations.filter(a => a.status === 'scheduled').length} Programadas
              </span>
            </div>
          </div>

          {allocations.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Buques asignados ({allocations.length})</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {allocations.slice(0, 3).map((allocation) => {
                  const ship = getShipById(allocation.shipId);
                  const dock = getDockById(allocation.dockId);
                  
                  if (!ship || !dock) return null;
                  
                  return (
                    <div key={allocation.id} className="flex items-start gap-2">
                      <ShipIcon className={`h-5 w-5 mt-0.5 ${getShipTypeClass(ship.type)}`} />
                      <div className="flex-1">
                        <div className="font-medium">{ship.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {translateShipType(ship.type)} • {ship.length}m × {ship.draft}m
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Dique: {dock.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {allocations.length > 3 && (
                  <div className="text-sm text-muted-foreground text-center">
                    +{allocations.length - 3} más...
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground mt-2">
                  Ocupado hasta: {formatDate(allocations[allocations.length - 1]?.endTime || '')}
                </div>
              </div>
            </div>
          )}
          
          {onViewAllocations && (
            <Button variant="outline" size="sm" onClick={onViewAllocations} className="mt-4 w-full">
              Ver detalles
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AllocationStatusCard;
