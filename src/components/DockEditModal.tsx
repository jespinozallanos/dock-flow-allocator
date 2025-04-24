
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dock, OperationalStatus } from "@/types/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DockEditModalProps {
  dock: Dock;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedDock: Dock) => void;
}

const DockEditModal: React.FC<DockEditModalProps> = ({
  dock,
  open,
  onOpenChange,
  onSave,
}) => {
  const [formData, setFormData] = useState<Dock>({ ...dock });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (name === "length" || name === "depth" || name === "width" || name === "maxWindSpeed" || name === "minTideLevel") {
      setFormData({
        ...formData,
        [name]: parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Dique: {dock.name}</DialogTitle>
          <DialogDescription>
            Actualice las dimensiones y el estado operacional del dique
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="length" className="text-right">
                Largo (m)
              </Label>
              <Input
                id="length"
                name="length"
                type="number"
                value={formData.length}
                onChange={handleInputChange}
                className="col-span-3"
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="width" className="text-right">
                Ancho (m)
              </Label>
              <Input
                id="width"
                name="width"
                type="number"
                value={formData.width || 0}
                onChange={handleInputChange}
                className="col-span-3"
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="depth" className="text-right">
                Calado (m)
              </Label>
              <Input
                id="depth"
                name="depth"
                type="number"
                value={formData.depth}
                onChange={handleInputChange}
                className="col-span-3"
                min="0"
                step="0.1"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minTideLevel" className="text-right">
                Marea mín (m)
              </Label>
              <Input
                id="minTideLevel"
                name="minTideLevel"
                type="number"
                value={formData.minTideLevel}
                onChange={handleInputChange}
                className="col-span-3"
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxWindSpeed" className="text-right">
                Viento máx (nudos)
              </Label>
              <Input
                id="maxWindSpeed"
                name="maxWindSpeed"
                type="number"
                value={formData.maxWindSpeed}
                onChange={handleInputChange}
                className="col-span-3"
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="operationalStatus" className="text-right">
                Estado
              </Label>
              <Select 
                value={formData.operationalStatus}
                onValueChange={(value) => handleSelectChange(value, "operationalStatus")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operativo">Operativo</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="fuera-de-servicio">Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DockEditModal;
