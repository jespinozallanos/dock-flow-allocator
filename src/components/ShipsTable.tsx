
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
    <div className="w-full">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px] px-2 sm:px-4">Ship Name</TableHead>
              <TableHead className="min-w-[80px] px-2 sm:px-4">Type</TableHead>
              <TableHead className="min-w-[100px] px-2 sm:px-4 hidden sm:table-cell">Size</TableHead>
              <TableHead className="min-w-[120px] px-2 sm:px-4 hidden md:table-cell">Arrival</TableHead>
              <TableHead className="min-w-[120px] px-2 sm:px-4 hidden md:table-cell">Departure</TableHead>
              <TableHead className="min-w-[80px] px-2 sm:px-4 hidden lg:table-cell">Priority</TableHead>
              <TableHead className="text-right min-w-[120px] px-2 sm:px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ships.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-sm sm:text-base">
                  No ships available
                </TableCell>
              </TableRow>
            ) : (
              ships.map((ship) => (
                <TableRow key={ship.id}>
                  <TableCell className="font-medium px-2 sm:px-4">
                    <div className="truncate max-w-[100px] sm:max-w-none" title={ship.name}>
                      {ship.name}
                    </div>
                    <div className="sm:hidden text-xs text-muted-foreground capitalize">
                      {ship.type}
                    </div>
                    <div className="sm:hidden text-xs text-muted-foreground">
                      {ship.length}m × {ship.draft}m
                    </div>
                  </TableCell>
                  <TableCell className="capitalize px-2 sm:px-4 hidden sm:table-cell">
                    {ship.type}
                  </TableCell>
                  <TableCell className="px-2 sm:px-4 hidden sm:table-cell">
                    <div className="text-sm">
                      {ship.length}m × {ship.draft}m
                    </div>
                  </TableCell>
                  <TableCell className="px-2 sm:px-4 hidden md:table-cell">
                    <div className="text-sm truncate">
                      {formatDate(ship.arrivalTime)}
                    </div>
                  </TableCell>
                  <TableCell className="px-2 sm:px-4 hidden md:table-cell">
                    <div className="text-sm truncate">
                      {formatDate(ship.departureTime)}
                    </div>
                  </TableCell>
                  <TableCell className="px-2 sm:px-4 hidden lg:table-cell">
                    <div className="text-sm">
                      {getPriorityLabel(ship.priority)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-2 sm:px-4">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-end sm:items-center justify-end">
                      {onSelectShip && (
                        <Button 
                          variant="marine"
                          onClick={() => onSelectShip(ship.id)}
                          size="sm"
                          className="text-xs w-full sm:w-auto"
                        >
                          Allocate
                        </Button>
                      )}
                      <div className="flex gap-1">
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
                            className="p-2"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ShipsTable;
