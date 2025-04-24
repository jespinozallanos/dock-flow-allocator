
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dock, Ship } from '@/types/types';
import { AnchorIcon, ShipIcon } from 'lucide-react';

interface DockCardProps {
  dock: Dock;
  ship?: Ship;
  className?: string;
}

const DockCard: React.FC<DockCardProps> = ({ dock, ship, className = "" }) => {
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
                    {spec === 'container' ? 'Contenedor' :
                     spec === 'bulk' ? 'Granel' :
                     spec === 'tanker' ? 'Tanquero' : 'Pasajeros'}
                  </Badge>
                ))}
              </span>
            </div>
          )}
        </div>
        
        {dock.occupied && ship && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              {ship.type === 'container' ? <ShipIcon className="h-6 w-6 text-orange-500" /> :
               ship.type === 'bulk' ? <ShipIcon className="h-6 w-6 text-green-500" /> :
               ship.type === 'tanker' ? <ShipIcon className="h-6 w-6 text-blue-500" /> :
               <ShipIcon className="h-6 w-6 text-purple-500" />}
              <h4 className="font-medium">{ship.name}</h4>
            </div>
            <div className="text-sm space-y-1">
              <div className="text-muted-foreground">
                Hasta: {formatDate(dock.occupiedUntil)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DockCard;
