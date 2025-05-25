
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Allocation } from "@/types/types";

interface AllocationStatusCardProps {
  allocations: Allocation[];
  className?: string;
  onViewAllocations?: () => void;
}

const AllocationStatusCard: React.FC<AllocationStatusCardProps> = ({
  allocations,
  className = "",
  onViewAllocations
}) => {
  return (
    <Card className={`${className} overflow-hidden border-l-4 border-l-marine-DEFAULT shadow-md hover:shadow-lg transition-shadow duration-200`}>
      <CardHeader className="bg-gradient-to-r from-marine-DEFAULT/10 to-transparent pb-3 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-marine-DEFAULT text-lg sm:text-xl">
          <TimerIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="truncate">Asignaciones</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Asignaciones de diques programadas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4 px-4 sm:px-6">
        <div className="flex flex-col space-y-4">
          <div className="text-3xl sm:text-4xl font-bold text-marine-DEFAULT">
            {allocations.length}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-muted-foreground truncate">
                {allocations.filter(a => a.status === 'completed').length} Completadas
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-muted-foreground truncate">
                {allocations.filter(a => a.status === 'in-progress').length} En Progreso
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-muted-foreground truncate">
                {allocations.filter(a => a.status === 'scheduled').length} Programadas
              </span>
            </div>
          </div>
          
          {onViewAllocations && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewAllocations} 
              className="mt-4 w-full text-xs sm:text-sm"
            >
              Ver detalles
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AllocationStatusCard;
