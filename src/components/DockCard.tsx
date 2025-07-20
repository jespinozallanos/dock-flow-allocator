
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
      <CardHeader className="pb-1">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">{dock.name}</CardTitle>
          <Badge className={`${getStatusColor(dock.operationalStatus)} text-xs px-1 py-0.5`}>
            {dock.operationalStatus === 'operativo' ? 'OK' : 
             dock.operationalStatus === 'mantenimiento' ? 'Mant' : 'FS'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="py-2">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dimensiones:</span>
            <span>{dock.length}m × {dock.depth}m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Viento/Marea:</span>
            <span>{dock.maxWindSpeed}kt / {dock.minTideLevel}m</span>
          </div>
          
          {dock.specializations && dock.specializations.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipos:</span>
              <span className="flex gap-0.5">
                {dock.specializations.slice(0, 2).map((spec, i) => (
                  <Badge key={i} variant="outline" className="text-xs px-1 py-0">
                    {spec === 'container' ? 'Cont' : 
                     spec === 'bulk' ? 'Gran' : 
                     spec === 'tanker' ? 'Tank' : 'Pas'}
                  </Badge>
                ))}
                {dock.specializations.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{dock.specializations.length - 2}</span>
                )}
              </span>
            </div>
          )}
        </div>
        
        {dock.occupied && allShips.length > 0 && (
          <div className="mt-2 pt-2 border-t">
            <h4 className="font-medium text-xs mb-1">Buques ({allShips.length})</h4>
            <div className="space-y-1">
              {allShips.slice(0, 2).map((ship, index) => (
                <div key={ship.id} className="flex items-start gap-1">
                  <ShipIcon className={`h-3 w-3 mt-0.5 ${getShipTypeClass(ship.type)}`} />
                  <div>
                    <div className="font-medium text-xs">{ship.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {ship.length}m × {ship.draft}m
                    </div>
                  </div>
                </div>
              ))}
              
              {allShips.length > 2 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{allShips.length - 2} más...
                </div>
              )}
              
              {dock.occupiedUntil && (
                <div className="text-xs text-muted-foreground mt-1">
                  Hasta: {formatDate(dock.occupiedUntil)}
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
