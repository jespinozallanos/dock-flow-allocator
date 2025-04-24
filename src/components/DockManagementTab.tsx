
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Operativo</Badge>;
      case "mantenimiento":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Mantenimiento</Badge>;
      case "fuera-de-servicio":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Fuera de Servicio</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Diques</CardTitle>
          <CardDescription>Configure las dimensiones y el estado operacional de los diques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {docks.map((dock) => (
              <Card key={dock.id} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4">
                  <div className="md:col-span-2 flex items-center">
                    <AnchorIcon className="h-6 w-6 mr-2 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{dock.name}</h3>
                      <div className="mt-1">{getStatusBadge(dock.operationalStatus)}</div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-3">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Largo:</span>{" "}
                        <span className="font-medium">{dock.length}m</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ancho:</span>{" "}
                        <span className="font-medium">{dock.width || "N/A"}m</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Calado:</span>{" "}
                        <span className="font-medium">{dock.depth}m</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Marea mín:</span>{" "}
                        <span className="font-medium">{dock.minTideLevel}m</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Viento máx:</span>{" "}
                        <span className="font-medium">{dock.maxWindSpeed} nudos</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-1 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditDock(dock)}
                      className="flex gap-1 items-center"
                    >
                      <EditIcon className="h-4 w-4" />
                      Editar
                    </Button>
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
