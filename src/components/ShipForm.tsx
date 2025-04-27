import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Ship, ShipType } from '@/types/types';
import { addShip } from '@/services/allocationService';
import { toast } from '@/components/ui/use-toast';

interface ShipFormProps {
  onShipAdded: (ship: Ship) => void;
}

const ShipForm: React.FC<ShipFormProps> = ({ onShipAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'container' as ShipType,
    length: 250,
    draft: 10,
    arrivalTime: '',
    departureTime: '',
    cargoType: '',
    priority: 2
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'length' || name === 'draft' || name === 'priority' 
        ? Number(value) 
        : value
    }));
  };

  const handleTypeChange = (value: ShipType) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.arrivalTime || !formData.departureTime) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    // Check that arrival is before departure
    if (new Date(formData.arrivalTime) >= new Date(formData.departureTime)) {
      toast({
        title: "Validation Error",
        description: "Arrival time must be before departure time",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a copy of the form data to ensure we're sending exactly what the user entered
      const shipData = { ...formData };
      
      // Send the exact form data without any modifications
      const newShip = await addShip(shipData);
      
      // Pass the new ship to the parent component
      onShipAdded(newShip);
      
      // Only reset the fields that should be reset, keeping arrival and departure times
      const { arrivalTime, departureTime } = formData;
      
      setFormData({
        name: '',
        type: 'container',
        length: 250,
        draft: 10,
        arrivalTime, // Preserve the arrival time
        departureTime, // Preserve the departure time
        cargoType: '',
        priority: 2
      });
      
      toast({
        title: "Ship Added",
        description: `${newShip.name} has been added successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add ship",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-card rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Add New Ship</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Ship Name*</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Enter ship name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Ship Type*</Label>
          <Select value={formData.type} onValueChange={handleTypeChange}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select ship type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="container">Container</SelectItem>
              <SelectItem value="bulk">Bulk Carrier</SelectItem>
              <SelectItem value="tanker">Tanker</SelectItem>
              <SelectItem value="passenger">Passenger</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="length">Length (meters)*</Label>
          <Input 
            id="length" 
            name="length" 
            type="number" 
            min="50" 
            max="500" 
            value={formData.length} 
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="draft">Draft (meters)*</Label>
          <Input 
            id="draft" 
            name="draft" 
            type="number" 
            min="3" 
            max="25" 
            step="0.1"
            value={formData.draft} 
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="arrivalTime">Expected Arrival Time*</Label>
          <Input 
            id="arrivalTime" 
            name="arrivalTime" 
            type="datetime-local" 
            value={formData.arrivalTime} 
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="departureTime">Expected Departure Time*</Label>
          <Input 
            id="departureTime" 
            name="departureTime" 
            type="datetime-local" 
            value={formData.departureTime} 
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cargoType">Cargo Type</Label>
          <Input 
            id="cargoType" 
            name="cargoType" 
            value={formData.cargoType} 
            onChange={handleChange} 
            placeholder="Cargo type (optional)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priority">Priority (1-5, 1 is highest)</Label>
          <Input 
            id="priority" 
            name="priority" 
            type="number" 
            min="1" 
            max="5" 
            value={formData.priority} 
            onChange={handleChange}
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full mt-6">Add Ship</Button>
    </form>
  );
};

export default ShipForm;
