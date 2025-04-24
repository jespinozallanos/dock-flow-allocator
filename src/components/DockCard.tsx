
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
    return new Date(dateString).toLocaleString('en-US', { 
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  // Determine which icon to display based on ship type
  const getShipIcon = (shipType?: string) => {
    if (!shipType) return <AnchorIcon className="h-6 w-6" />;
  
    return <ShipIcon className="h-6 w-6" />;
  };

  return (
    <Card className={`${className} dock-hover h-full transition-shadow duration-200 overflow-hidden ${dock.occupied ? 'border-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{dock.name}</CardTitle>
          {dock.occupied ? (
            <Badge className="bg-primary">{dock.specializations?.[0] || 'Any'}</Badge>
          ) : (
            <Badge variant="outline">Available</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Length:</span>
            <span>{dock.length}m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Depth:</span>
            <span>{dock.depth}m</span>
          </div>
          
          {dock.specializations && dock.specializations.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Types:</span>
              <span className="flex gap-1">
                {dock.specializations.map((spec, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </span>
            </div>
          )}
        </div>
        
        {dock.occupied && ship && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              {getShipIcon(ship.type)}
              <h4 className="font-medium">{ship.name}</h4>
            </div>
            <div className="text-sm space-y-1">
              <div className="text-muted-foreground">
                Until: {formatDate(dock.occupiedUntil)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DockCard;
