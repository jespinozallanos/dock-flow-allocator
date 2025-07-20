import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Ship, Dock, Allocation } from '@/types/types';
import { ShipIcon, AnchorIcon, Clock } from 'lucide-react';

interface DockShipsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dock: Dock | null;
  ships: Ship[];
  allocations: Allocation[];
}

const DockShipsModal: React.FC<DockShipsModalProps> = ({
  open,
  onOpenChange,
  dock,
  ships,
  allocations
}) => {
  if (!dock) return null;

  const dockAllocations = allocations.filter(a => a.dockId === dock.id);
  const dockShips = dockAllocations.map(allocation => {
    const ship = ships.find(s => s.id === allocation.shipId);
    return ship ? { ship, allocation } : null;
  }).filter(Boolean);

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

  const getShipTypeColor = (type: string) => {
    switch (type) {
      case 'container':
        return 'bg-blue-100 text-blue-800';
      case 'bulk':
        return 'bg-green-100 text-green-800';
      case 'tanker':
        return 'bg-red-100 text-red-800';
      case 'passenger':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AnchorIcon className="h-5 w-5 text-marine-DEFAULT" />
            {dock.name}
          </DialogTitle>
          <DialogDescription>
            Buques asignados a este dique
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-sm text-muted-foreground mb-1">Especificaciones del Dique</div>
            <div className="text-xs space-y-1">
              <div>Dimensiones: {dock.length}m × {dock.depth}m</div>
              <div>Viento máximo: {dock.maxWindSpeed} kt</div>
              <div>Marea mínima: {dock.minTideLevel} m</div>
            </div>
          </div>

          {dockShips.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <ShipIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay buques asignados</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-medium">
                Buques Asignados ({dockShips.length})
              </div>
              
              {dockShips.map(({ ship, allocation }) => (
                <div key={ship.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <ShipIcon className="h-4 w-4 text-marine-DEFAULT" />
                      <div>
                        <div className="font-medium text-sm">{ship.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {ship.length}m
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="secondary" className={getShipTypeColor(ship.type)}>
                        {translateShipType(ship.type)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Inicio: {formatDateTime(allocation.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Fin: {formatDateTime(allocation.endTime)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Estado:</span>
                      <Badge variant="secondary" className={getStatusColor(allocation.status)}>
                        {allocation.status === 'completed' ? 'Completado' :
                         allocation.status === 'in-progress' ? 'En Progreso' :
                         'Programado'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DockShipsModal;