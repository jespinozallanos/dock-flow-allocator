
import { Button } from "@/components/ui/button";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { Ship } from "@/types/types";
import { Trash2 } from "lucide-react";
import ShipEditModal from "@/components/ShipEditModal";

interface ShipsTableProps {
  ships: Ship[];
  onSelectShip?: (shipId: string) => void;
  onDeleteShip?: (shipId: string) => void;
  onUpdateShip?: (updatedShip: Ship) => void;
}

const ShipsTable: React.FC<ShipsTableProps> = ({ ships, onSelectShip, onDeleteShip, onUpdateShip }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', { 
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  const getPriorityLabel = (priority: number) => {
    const priorityLabels = {
      1: 'Highest',
      2: 'High',
      3: 'Medium',
      4: 'Low',
      5: 'Lowest'
    };
    return priorityLabels[priority as keyof typeof priorityLabels] || 'Medium';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs py-2">Nombre</TableHead>
            <TableHead className="text-xs py-2">Tipo</TableHead>
            <TableHead className="text-xs py-2">Tamaño</TableHead>
            <TableHead className="text-xs py-2">Llegada</TableHead>
            <TableHead className="text-xs py-2">Prioridad</TableHead>
            <TableHead className="text-right text-xs py-2">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ships.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-16 text-center text-xs">
                No hay buques disponibles
              </TableCell>
            </TableRow>
          ) : (
            ships.map((ship) => (
              <TableRow key={ship.id}>
                <TableCell className="font-medium text-xs py-2">{ship.name}</TableCell>
                <TableCell className="capitalize text-xs py-2">{ship.type}</TableCell>
                <TableCell className="text-xs py-2">{ship.length}m × {ship.draft}m</TableCell>
                <TableCell className="text-xs py-2">{formatDate(ship.arrivalTime)}</TableCell>
                <TableCell className="text-xs py-2">{getPriorityLabel(ship.priority)}</TableCell>
                <TableCell className="text-right space-x-1 py-2">
                  {onSelectShip && (
                    <Button 
                      variant="marine"
                      onClick={() => onSelectShip(ship.id)}
                      size="sm"
                      className="text-xs h-6 px-2"
                    >
                      Asignar
                    </Button>
                  )}
                  {onUpdateShip && (
                    <ShipEditModal 
                      ship={ship} 
                      onShipUpdate={onUpdateShip}
                    />
                  )}
                  {onDeleteShip && (
                    <Button
                      variant="destructive"
                      onClick={() => onDeleteShip(ship.id)}
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ShipsTable;
