
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
    <Card className={`${className} dock-hover transition-shadow duration-200 overflow-hidden ${dock.occupied ? 'border-primary' : ''}`}>
      <CardContent className="p-2 h-full flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-xs">{dock.name}</span>
            <Badge className={`${getStatusColor(dock.operationalStatus)} text-xs px-1 py-0 h-4`}>
              {dock.operationalStatus === 'operativo' ? 'OK' : 
               dock.operationalStatus === 'mantenimiento' ? 'Mant' : 'FS'}
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {dock.length}m×{dock.depth}m • {dock.maxWindSpeed}kt/{dock.minTideLevel}m
          </div>
          
          {dock.occupied && allShips.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {allShips[0].name} {allShips.length > 1 && `+${allShips.length - 1}`}
            </div>
          )}
        </div>
        
        {dock.specializations && dock.specializations.length > 0 && (
          <div className="flex gap-0.5 ml-2">
            {dock.specializations.slice(0, 2).map((spec, i) => (
              <Badge key={i} variant="outline" className="text-xs px-1 py-0 h-4">
                {spec === 'container' ? 'C' : 
                 spec === 'bulk' ? 'G' : 
                 spec === 'tanker' ? 'T' : 'P'}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DockCard;
