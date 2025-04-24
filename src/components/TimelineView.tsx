
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Allocation, Ship, Dock } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimelineViewProps {
  allocations: Allocation[];
  ships: Ship[];
  docks: Dock[];
  days?: number;
}

const TimelineView: React.FC<TimelineViewProps> = ({ allocations, ships, docks, days = 5 }) => {
  // Get the first day of the timeline (today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Create an array of days for the timeline
  const timelineDays = Array.from({ length: days }, (_, index) => {
    const day = new Date(today);
    day.setDate(day.getDate() + index);
    return day;
  });
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Get ship and dock details by ID
  const getShipById = (shipId: string) => ships.find(ship => ship.id === shipId);
  const getDockById = (dockId: string) => docks.find(dock => dock.id === dockId);
  
  // Group allocations by dock
  const allocationsByDock = docks.reduce((acc, dock) => {
    acc[dock.id] = allocations.filter(allocation => allocation.dockId === dock.id);
    return acc;
  }, {} as Record<string, Allocation[]>);

  // Check if allocation falls within the timeline day
  const isAllocationInDay = (allocation: Allocation, date: Date) => {
    const startTime = new Date(allocation.startTime);
    const endTime = new Date(allocation.endTime);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return (startTime <= dayEnd && endTime >= dayStart);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dock Allocation Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="space-y-4">
            <div className="grid grid-cols-[100px_1fr] gap-4">
              <div className="font-medium text-muted-foreground">Docks</div>
              <div className="grid grid-cols-5 gap-2">
                {timelineDays.map((day, index) => (
                  <div key={index} className="text-center text-sm font-medium">
                    {formatDate(day)}
                  </div>
                ))}
              </div>
              
              {docks.map(dock => (
                <React.Fragment key={dock.id}>
                  <div className="text-sm font-medium truncate" title={dock.name}>
                    {dock.name}
                  </div>
                  <div className="grid grid-cols-5 gap-2 items-center">
                    {timelineDays.map((day, dayIndex) => {
                      const dayAllocations = allocationsByDock[dock.id]?.filter(
                        allocation => isAllocationInDay(allocation, day)
                      ) || [];
                      
                      return (
                        <div key={dayIndex} className="h-12 relative border rounded bg-muted bg-opacity-50">
                          {dayAllocations.map((allocation, i) => {
                            const ship = getShipById(allocation.shipId);
                            return (
                              <div 
                                key={`${allocation.id}-${i}`}
                                className="absolute inset-0 m-1 rounded bg-primary text-white text-xs p-1 truncate"
                                title={`${ship?.name || 'Unknown Ship'} (${new Date(allocation.startTime).toLocaleTimeString()} - ${new Date(allocation.endTime).toLocaleTimeString()})`}
                              >
                                {ship?.name || 'Ship'}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            <div className="space-y-4">
              {allocations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No allocations scheduled</p>
              ) : (
                allocations.map(allocation => {
                  const ship = getShipById(allocation.shipId);
                  const dock = getDockById(allocation.dockId);
                  
                  return (
                    <div key={allocation.id} className="flex items-center gap-4 border-b pb-3">
                      <div className="w-1/4">
                        <p className="font-medium">{ship?.name || 'Unknown Ship'}</p>
                        <p className="text-sm text-muted-foreground capitalize">{ship?.type}</p>
                      </div>
                      <div className="w-1/4">
                        <p className="font-medium">{dock?.name || 'Unknown Dock'}</p>
                        <p className="text-sm text-muted-foreground">{dock?.length}m × {dock?.depth}m</p>
                      </div>
                      <div className="w-1/4">
                        <p className="text-sm">
                          <span className="text-muted-foreground mr-1">Start:</span>
                          {new Date(allocation.startTime).toLocaleString()}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground mr-1">End:</span>
                          {new Date(allocation.endTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="w-1/4">
                        <div className={`text-xs inline-flex items-center rounded-full px-2.5 py-0.5 font-medium
                          ${allocation.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : allocation.status === 'in-progress' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-orange-100 text-orange-800'}`
                        }>
                          {allocation.status.charAt(0).toUpperCase() + allocation.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimelineView;
