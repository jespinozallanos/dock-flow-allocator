
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ship, ShipType } from "@/types/types";
import { Edit } from "lucide-react";

interface ShipEditModalProps {
  ship: Ship;
  onShipUpdate: (updatedShip: Ship) => void;
}

const ShipEditModal: React.FC<ShipEditModalProps> = ({ ship, onShipUpdate }) => {
  const [open, setOpen] = useState(false);
  const [editedShip, setEditedShip] = useState<Ship>({ ...ship });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShipUpdate(editedShip);
    setOpen(false);
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateChange = (field: 'arrivalTime' | 'departureTime', value: string) => {
    const isoString = new Date(value).toISOString();
    setEditedShip(prev => ({ ...prev, [field]: isoString }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Barco</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Barco</Label>
            <Input
              id="name"
              value={editedShip.name}
              onChange={(e) => setEditedShip(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={editedShip.type}
              onValueChange={(value: ShipType) => setEditedShip(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="container">Contenedores</SelectItem>
                <SelectItem value="bulk">Graneles</SelectItem>
                <SelectItem value="tanker">Tanquero</SelectItem>
                <SelectItem value="passenger">Pasajeros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Eslora (m)</Label>
              <Input
                id="length"
                type="number"
                value={editedShip.length}
                onChange={(e) => setEditedShip(prev => ({ ...prev, length: Number(e.target.value) }))}
                required
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="draft">Calado (m)</Label>
              <Input
                id="draft"
                type="number"
                step="0.1"
                value={editedShip.draft}
                onChange={(e) => setEditedShip(prev => ({ ...prev, draft: Number(e.target.value) }))}
                required
                min="0.1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <Select
              value={editedShip.priority.toString()}
              onValueChange={(value) => setEditedShip(prev => ({ ...prev, priority: Number(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Muy Alta</SelectItem>
                <SelectItem value="2">Alta</SelectItem>
                <SelectItem value="3">Media</SelectItem>
                <SelectItem value="4">Baja</SelectItem>
                <SelectItem value="5">Muy Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="arrivalTime">Hora de Llegada</Label>
            <Input
              id="arrivalTime"
              type="datetime-local"
              value={formatDateForInput(editedShip.arrivalTime)}
              onChange={(e) => handleDateChange('arrivalTime', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departureTime">Hora de Salida</Label>
            <Input
              id="departureTime"
              type="datetime-local"
              value={formatDateForInput(editedShip.departureTime)}
              onChange={(e) => handleDateChange('departureTime', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargoType">Tipo de Carga (Opcional)</Label>
            <Input
              id="cargoType"
              value={editedShip.cargoType || ''}
              onChange={(e) => setEditedShip(prev => ({ ...prev, cargoType: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="marine">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShipEditModal;
