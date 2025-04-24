
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dock, Ship } from '@/types/types';
import { AnchorIcon, ShipIcon } from 'lucide-react';

interface DockCardProps {
  dock: Dock;
  ships?: Ship[];
  ship?: Ship; // For backward compatibility
  className?: string;
}

const DockCard: React.FC<DockCardProps> = ({ dock, ships = [], ship, className = "" }) => {
  // For backward compatibility
  const allShips = ships.length > 0 ? ships : (ship ? [ship] : []);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-ES', { 
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operativo':
        return 'bg-green-500';
      case 'mantenimiento':
        return 'bg-yellow-500';
      case 'fuera-de-servicio':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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

  return (
    <Card className={`${className} dock-hover h-full transition-shadow duration-200 overflow-hidden ${dock.occupied ? 'border-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{dock.name}</CardTitle>
          <Badge className={getStatusColor(dock.operationalStatus)}>
            {dock.operationalStatus.charAt(0).toUpperCase() + dock.operationalStatus.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Longitud:</span>
            <span>{dock.length}m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profundidad:</span>
            <span>{dock.depth}m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Viento máx:</span>
            <span>{dock.maxWindSpeed} nudos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Marea mín:</span>
            <span>{dock.minTideLevel}m</span>
          </div>
          
          {dock.specializations && dock.specializations.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipos:</span>
              <span className="flex gap-1">
                {dock.specializations.map((spec, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {translateShipType(spec)}
                  </Badge>
                ))}
              </span>
            </div>
          )}
        </div>
        
        {dock.occupied && allShips.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Buques asignados ({allShips.length})</h4>
            <div className="space-y-3">
              {allShips.map((ship, index) => (
                <div key={ship.id} className="flex items-start gap-2">
                  <ShipIcon className={`h-5 w-5 mt-0.5 ${getShipTypeClass(ship.type)}`} />
                  <div>
                    <div className="font-medium">{ship.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {translateShipType(ship.type)} • {ship.length}m × {ship.draft}m
                    </div>
                  </div>
                </div>
              ))}
              
              {dock.occupiedUntil && (
                <div className="text-sm text-muted-foreground mt-2">
                  Ocupado hasta: {formatDate(dock.occupiedUntil)}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DockCard;
