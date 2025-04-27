import { Button } from "@/components/ui/button";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { Ship } from "@/types/types";
import { Trash2 } from "lucide-react";

interface ShipsTableProps {
  ships: Ship[];
  onSelectShip?: (shipId: string) => void;
  onDeleteShip?: (shipId: string) => void;
}

const ShipsTable: React.FC<ShipsTableProps> = ({ ships, onSelectShip, onDeleteShip }) => {
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
            <TableHead>Ship Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Arrival</TableHead>
            <TableHead>Departure</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ships.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No ships available
              </TableCell>
            </TableRow>
          ) : (
            ships.map((ship) => (
              <TableRow key={ship.id}>
                <TableCell className="font-medium">{ship.name}</TableCell>
                <TableCell className="capitalize">{ship.type}</TableCell>
                <TableCell>{ship.length}m × {ship.draft}m</TableCell>
                <TableCell>{formatDate(ship.arrivalTime)}</TableCell>
                <TableCell>{formatDate(ship.departureTime)}</TableCell>
                <TableCell>{getPriorityLabel(ship.priority)}</TableCell>
                <TableCell className="text-right space-x-2">
                  {onSelectShip && (
                    <Button 
                      variant="marine"
                      onClick={() => onSelectShip(ship.id)}
                      size="sm"
                    >
                      Allocate
                    </Button>
                  )}
                  {onDeleteShip && (
                    <Button
                      variant="destructive"
                      onClick={() => onDeleteShip(ship.id)}
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
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
