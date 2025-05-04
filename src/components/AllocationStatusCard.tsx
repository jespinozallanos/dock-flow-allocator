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
  return <Card className={`${className} overflow-hidden border-l-4 border-l-marine-DEFAULT shadow-md hover:shadow-lg transition-shadow duration-200`}>
      <CardHeader className="bg-gradient-to-r from-marine-DEFAULT/10 to-transparent pb-2">
        <CardTitle className="flex items-center gap-2 text-marine-DEFAULT">
          <TimerIcon className="h-5 w-5" />
          Asignaciones
        </CardTitle>
        <CardDescription>Asignaciones de diques programadas</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="flex flex-col">
          <div className="text-4xl font-bold text-marine-DEFAULT mb-2">
            {allocations.length}
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-muted-foreground">
                {allocations.filter(a => a.status === 'completed').length} Completadas
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-muted-foreground">
                {allocations.filter(a => a.status === 'in-progress').length} En Progreso
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm text-muted-foreground">
                {allocations.filter(a => a.status === 'scheduled').length} Programadas
              </span>
            </div>
          </div>
          
          {onViewAllocations && <Button variant="outline" size="sm" onClick={onViewAllocations} className="mt-4 w-full">
              Ver detalles
            </Button>}
        </div>
      </CardContent>
    </Card>;
};
export default AllocationStatusCard;