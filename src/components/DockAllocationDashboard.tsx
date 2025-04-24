
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Ship, Dock, Allocation } from "@/types/types";
import DockCard from "@/components/DockCard";
import ShipsTable from "@/components/ShipsTable";
import ShipForm from "@/components/ShipForm";
import TimelineView from "@/components/TimelineView";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllocations, getDocks, getShips, runAllocationModel, updateDockStatus } from "@/services/allocationService";
import { AnchorIcon, ShipIcon, TimerIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DockAllocationDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [ships, setShips] = useState<Ship[]>([]);
  const [docks, setDocks] = useState<Dock[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationCriteria, setOptimizationCriteria] = useState<'waiting_time' | 'dock_utilization' | 'balanced'>('balanced');
  
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [shipsData, docksData, allocationsData] = await Promise.all([
          getShips(),
          getDocks(),
          getAllocations()
        ]);
        
        setShips(shipsData);
        setDocks(docksData);
        setAllocations(allocationsData);
        
        // Update dock status based on allocations
        const updatedDocks = await updateDockStatus(allocationsData);
        setDocks(updatedDocks);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  const handleShipAdded = async (ship: Ship) => {
    setShips(prev => [...prev, ship]);
    
    // Switch to ships view
    setActiveTab("ships");
  };

  const handleRunAllocationModel = async () => {
    setIsLoading(true);
    
    try {
      // Prepare model parameters
      const modelParams = {
        ships,
        docks,
        existingAllocations: allocations,
        optimizationCriteria
      };
      
      // Run the model
      const result = await runAllocationModel(modelParams);
      
      // Update allocations with new results
      setAllocations(prev => [...prev, ...result.allocations]);
      
      // Update dock status
      const updatedDocks = await updateDockStatus([...allocations, ...result.allocations]);
      setDocks(updatedDocks);
      
      toast({
        title: "Allocation Complete",
        description: `${result.allocations.length} ships allocated successfully`
      });
      
      // Switch to dashboard view
      setActiveTab("dashboard");
    } catch (error) {
      console.error("Error running allocation model:", error);
      toast({
        title: "Error",
        description: "Failed to run allocation model",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getShipById = (shipId: string | undefined) => {
    if (!shipId) return undefined;
    return ships.find(s => s.id === shipId);
  };

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Ship Dock Allocation System</h1>
        <p className="text-muted-foreground">Optimize berth allocation with our AI-powered system</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-1">
              <AnchorIcon className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex items-center gap-1">
              <TimerIcon className="w-4 h-4" />
              Allocation
            </TabsTrigger>
            <TabsTrigger value="ships" className="flex items-center gap-1">
              <ShipIcon className="w-4 h-4" />
              Ships
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="dashboard" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Ships</CardTitle>
                <CardDescription>Currently registered ships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ships.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Available Docks</CardTitle>
                <CardDescription>Ready for allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {docks.filter(dock => !dock.occupied).length} / {docks.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Allocations</CardTitle>
                <CardDescription>Scheduled berth allocations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{allocations.length}</div>
              </CardContent>
            </Card>
          </div>
          
          <TimelineView 
            allocations={allocations} 
            ships={ships} 
            docks={docks} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-3">
              <h2 className="text-xl font-semibold mb-4">Current Dock Status</h2>
            </div>
            {docks.map(dock => (
              <DockCard 
                key={dock.id} 
                dock={dock}
                ship={getShipById(dock.occupiedBy)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="allocation">
          <Card>
            <CardHeader>
              <CardTitle>Berth Allocation Tool</CardTitle>
              <CardDescription>
                Run the AI-powered berth allocation model to optimize dock assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-md">
                <label className="text-sm font-medium block mb-2">Optimization Criteria</label>
                <Select 
                  value={optimizationCriteria} 
                  onValueChange={(value) => setOptimizationCriteria(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select optimization criteria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waiting_time">Minimize Waiting Time</SelectItem>
                    <SelectItem value="dock_utilization">Maximize Dock Utilization</SelectItem>
                    <SelectItem value="balanced">Balanced Approach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border rounded-md p-4 bg-muted/50">
                <h3 className="font-medium mb-2">Ships Pending Allocation</h3>
                <ShipsTable 
                  ships={ships.filter(ship => 
                    !allocations.some(a => a.shipId === ship.id)
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" onClick={() => setActiveTab("ships")}>
                Add More Ships
              </Button>
              <Button onClick={handleRunAllocationModel} disabled={isLoading}>
                {isLoading ? "Processing..." : "Run Allocation Model"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="ships" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Ship Management</CardTitle>
              <CardDescription>Add and view ships in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <ShipsTable ships={ships} />
            </CardContent>
          </Card>
          
          <ShipForm onShipAdded={handleShipAdded} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DockAllocationDashboard;
