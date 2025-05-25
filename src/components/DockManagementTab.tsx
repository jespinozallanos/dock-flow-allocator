
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dock } from "@/types/types";
import { EditIcon, AnchorIcon } from "lucide-react";
import DockEditModal from "@/components/DockEditModal";
import { Badge } from "@/components/ui/badge";

interface DockManagementTabProps {
  docks: Dock[];
  onDockUpdate: (updatedDock: Dock) => void;
}

const DockManagementTab: React.FC<DockManagementTabProps> = ({ docks, onDockUpdate }) => {
  const [selectedDock, setSelectedDock] = useState<Dock | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditDock = (dock: Dock) => {
    setSelectedDock(dock);
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operativo":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Operativo</Badge>;
      case "mantenimiento":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">Mantenimiento</Badge>;
      case "fuera-de-servicio":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">Fuera de Servicio</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Desconocido</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Gestión de Diques</CardTitle>
          <CardDescription className="text-sm">
            Configure las dimensiones y el estado operacional de los diques
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4">
            {docks.map((dock) => (
              <Card key={dock.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Dock Name and Status */}
                    <div className="flex items-center min-w-0 flex-1 lg:flex-initial lg:min-w-[200px]">
                      <AnchorIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm sm:text-base truncate">{dock.name}</h3>
                        <div className="mt-1">{getStatusBadge(dock.operationalStatus)}</div>
                      </div>
                    </div>
                    
                    {/* Dock Specifications */}
                    <div className="flex-1 lg:flex-[2]">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs sm:text-sm">
                        <div className="min-w-0">
                          <span className="text-muted-foreground block truncate">Largo:</span>
                          <span className="font-medium">{dock.length}m</span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-muted-foreground block truncate">Ancho:</span>
                          <span className="font-medium">{dock.width || "N/A"}m</span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-muted-foreground block truncate">Calado:</span>
                          <span className="font-medium">{dock.depth}m</span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-muted-foreground block truncate">Marea mín:</span>
                          <span className="font-medium">{dock.minTideLevel}m</span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-muted-foreground block truncate">Viento máx:</span>
                          <span className="font-medium">{dock.maxWindSpeed} nudos</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Edit Button */}
                    <div className="flex justify-end lg:justify-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditDock(dock)}
                        className="flex gap-1 items-center text-xs sm:text-sm"
                      >
                        <EditIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {selectedDock && (
        <DockEditModal 
          dock={selectedDock}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSave={onDockUpdate}
        />
      )}
    </>
  );
};

export default DockManagementTab;
