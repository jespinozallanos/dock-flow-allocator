import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Ship, Dock, Allocation, WeatherData } from "@/types/types";
import DockCard from "@/components/DockCard";
import ShipsTable from "@/components/ShipsTable";
import ShipForm from "@/components/ShipForm";
import TimelineView from "@/components/TimelineView";
import TideWindowDisplay from "@/components/TideWindowDisplay";
import DockManagementTab from "@/components/DockManagementTab";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllocations, getDocks, getShips, runAllocationModel, updateDockStatus, fetchWeatherData } from "@/services/allocationService";
import { AnchorIcon, ShipIcon, TimerIcon, CloudIcon, SettingsIcon, WavesIcon, DockIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { TooltipProvider } from "@/components/ui/tooltip";
import WeatherStatusCard from "@/components/WeatherStatusCard";
import AllocationStatusCard from "@/components/AllocationStatusCard";
const DockAllocationDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [ships, setShips] = useState<Ship[]>([]);
  const [docks, setDocks] = useState<Dock[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationCriteria, setOptimizationCriteria] = useState<'waiting_time' | 'dock_utilization' | 'balanced'>('balanced');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherWarning, setWeatherWarning] = useState(false);
  const {
    toast
  } = useToast();
  const [windSpeedLimit, setWindSpeedLimit] = useState(8.0);
  const [tideLevelLimit, setTideLevelLimit] = useState(3.0);
  const handleWindSpeedChange = (value: number[]) => {
    setWindSpeedLimit(value[0]);
    if (weatherData) {
      setWeatherData({
        ...weatherData,
        wind: {
          ...weatherData.wind,
          maximum: value[0]
        },
        settings: {
          ...weatherData.settings,
          maxWindSpeed: value[0],
          minTideLevel: tideLevelLimit
        }
      });
    }
  };
  const handleTideLevelChange = (value: number[]) => {
    setTideLevelLimit(value[0]);
    if (weatherData) {
      setWeatherData({
        ...weatherData,
        tide: {
          ...weatherData.tide,
          minimum: value[0]
        },
        settings: {
          ...weatherData.settings,
          minTideLevel: value[0],
          maxWindSpeed: windSpeedLimit
        }
      });
    }
  };
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [shipsData, docksData, allocationsData, weather] = await Promise.all([getShips(), getDocks(), getAllocations(), fetchWeatherData()]);
        setShips(shipsData);
        setDocks(docksData);
        setAllocations(allocationsData);
        const initialWeatherData = {
          ...weather,
          settings: {
            maxWindSpeed: weather.wind.maximum || 8.0,
            minTideLevel: weather.tide.minimum || 3.0
          }
        };
        setWeatherData(initialWeatherData);
        setWindSpeedLimit(initialWeatherData.settings?.maxWindSpeed || 8.0);
        setTideLevelLimit(initialWeatherData.settings?.minTideLevel || 3.0);
        const updatedDocks = await updateDockStatus(allocationsData);
        setDocks(updatedDocks);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Error al cargar datos",
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
    setActiveTab("ships");
  };
  const handleRunAllocationModel = async () => {
    setIsLoading(true);
    setWeatherWarning(false);
    try {
      const modelParams = {
        ships,
        docks,
        existingAllocations: allocations,
        optimizationCriteria,
        weatherSettings: {
          maxWindSpeed: windSpeedLimit,
          minTideLevel: tideLevelLimit
        }
      };
      if (weatherData) {
        weatherData.settings = {
          maxWindSpeed: windSpeedLimit,
          minTideLevel: tideLevelLimit
        };
      }
      const result = await runAllocationModel(modelParams);
      if (result.weatherWarning) {
        setWeatherWarning(true);
        setWeatherData(result.weatherData || null);
        toast({
          title: "Advertencia",
          description: "Condiciones climáticas inadecuadas para asignación de buques",
          variant: "default"
        });
      } else {
        setAllocations(prev => [...prev, ...result.allocations]);
        setWeatherData(result.weatherData || null);
        const updatedDocks = await updateDockStatus([...allocations, ...result.allocations]);
        setDocks(updatedDocks);
        if (result.unassignedShips && result.unassignedShips.length > 0) {
          toast({
            title: "Asignación Completada Parcialmente",
            description: `${result.allocations.length} buques asignados. ${result.unassignedShips.length} buques no pudieron ser asignados.`,
            variant: "default"
          });
        } else {
          toast({
            title: "Asignación Completada",
            description: `${result.allocations.length} buques asignados con éxito`,
            variant: "default"
          });
        }
        if (result.unassignedShips && result.unassignedShips.length > 0) {
          setActiveTab("allocation");
        } else {
          setActiveTab("dashboard");
        }
      }
      if (result.unassignedShips && result.unassignedShips.length > 0) {
        const unassignedContent = <div className="space-y-4">
            <h3 className="font-medium text-lg text-red-600">Buques No Asignados:</h3>
            {result.unassignedShips.map(({
            ship,
            reason
          }) => <div key={ship.id} className="p-4 border rounded-md bg-red-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{ship.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Llegada: {new Date(ship.arrivalTime).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <div className="text-sm text-red-600">
                    Razón: {reason}
                  </div>
                </div>
              </div>)}
          </div>;
        toast({
          title: "Detalles de Buques No Asignados",
          description: unassignedContent,
          duration: 10000
        });
      }
    } catch (error) {
      console.error("Error running allocation model:", error);
      toast({
        title: "Error",
        description: "Falló al ejecutar el modelo de asignación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleDockUpdate = (updatedDock: Dock) => {
    setDocks(prev => prev.map(dock => dock.id === updatedDock.id ? updatedDock : dock));
    toast({
      title: "Dique Actualizado",
      description: `${updatedDock.name} ha sido actualizado correctamente`
    });
  };
  const handleDeleteShip = async (shipId: string) => {
    try {
      setShips(prev => prev.filter(ship => ship.id !== shipId));
      toast({
        title: "Buque Eliminado",
        description: "El buque ha sido eliminado exitosamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el buque",
        variant: "destructive"
      });
    }
  };
  const getShipById = (shipId: string | undefined) => {
    if (!shipId) return undefined;
    return ships.find(s => s.id === shipId);
  };
  const getShipsFromOccupiedString = (occupiedBy: string | undefined) => {
    if (!occupiedBy) return [];
    const shipIds = occupiedBy.split(',');
    return shipIds.map(id => getShipById(id)).filter(Boolean) as Ship[];
  };
  return <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl text-marine-DEFAULT font-bold">Sistema de Asignación de Diques</h1>
        <p className="text-muted-foreground">Optimización de asignación de diques basado en IA</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center bg-slate-900">
          <TabsList className="bg-slate-900">
            <TabsTrigger value="dashboard" className="flex items-center gap-1">
              <AnchorIcon className="w-4 h-4" />
              Panel Principal
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex items-center gap-1">
              <TimerIcon className="w-4 h-4" />
              Asignación
            </TabsTrigger>
            <TabsTrigger value="ships" className="flex items-center gap-1">
              <ShipIcon className="w-4 h-4" />
              Buques
            </TabsTrigger>
            <TabsTrigger value="docks" className="flex items-center gap-1">
              <DockIcon className="w-4 h-4" />
              Diques
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-1">
              <CloudIcon className="w-4 h-4" />
              Clima
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="dashboard" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab("ships")}>
              <CardHeader className="pb-2">
                <CardTitle>Buques</CardTitle>
                <CardDescription>Buques registrados actualmente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ships.length}</div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab("docks")}>
              <CardHeader className="pb-2">
                <CardTitle>Diques Disponibles</CardTitle>
                <CardDescription>Listos para asignación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {docks.filter(dock => !dock.occupied).length} / {docks.length}
                </div>
              </CardContent>
            </Card>
            
            <AllocationStatusCard allocations={allocations} onViewAllocations={() => setActiveTab("allocation")} />
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 space-y-6">
              <Card>
                <CardHeader className="bg-slate-950">
                  <CardTitle className="text-gray-50">Cronograma de Asignación</CardTitle>
                  <CardDescription>Vista general de asignaciones programadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <TimelineView allocations={allocations} ships={ships} docks={docks} weatherData={weatherData || undefined} />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-marine-DEFAULT text-xl">Buques Registrados</CardTitle>
                    <CardDescription>Listado de todos los buques en el sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ShipsTable ships={ships} />
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" onClick={() => setActiveTab("ships")} className="ml-auto">
                      Gestionar Buques
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {docks.map(dock => <DockCard key={dock.id} dock={dock} ships={getShipsFromOccupiedString(dock.occupiedBy)} />)}
              </div>
            </div>

            <div className="space-y-4">
              {weatherData && <WeatherStatusCard weatherData={weatherData} />}
              
              {weatherData?.tide.windows && <TideWindowDisplay tideWindows={weatherData.tide.windows} className="mb-4" />}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="allocation">
          <Card>
            <CardHeader>
              <CardTitle className="text-marine-DEFAULT">Herramienta de Asignación de Atraques</CardTitle>
              <CardDescription>
                Ejecuta el modelo de asignación de atraques basado en IA para optimizar las asignaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {weatherWarning && <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Condiciones climáticas inadecuadas</AlertTitle>
                  <AlertDescription>
                    Las condiciones actuales de marea ({weatherData?.tide.current.toFixed(1)} m) y/o viento ({weatherData?.wind.speed.toFixed(1)} nudos) no permiten la asignación de buques. Se requiere marea mínima de 3m y viento máximo de 8 nudos.
                  </AlertDescription>
                </Alert>}
            
              <div className="max-w-md">
                <label className="text-sm font-medium block mb-2">Criterios de Optimización</label>
                <Select value={optimizationCriteria} onValueChange={value => setOptimizationCriteria(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona criterios de optimización" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waiting_time">Minimizar Tiempo de Espera</SelectItem>
                    <SelectItem value="dock_utilization">Maximizar Uso de Diques</SelectItem>
                    <SelectItem value="balanced">Enfoque Balanceado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border rounded-md p-4 bg-muted/50">
                <h3 className="font-medium mb-2">Buques Pendientes de Asignación</h3>
                <ShipsTable ships={ships.filter(ship => !allocations.some(a => a.shipId === ship.id))} />
              </div>
              
              {weatherData?.tide.windows && <div className="border rounded-md p-4 bg-blue-50">
                  <h3 className="font-medium mb-2 text-marine-DEFAULT flex items-center gap-2">
                    <WavesIcon className="h-4 w-4" />
                    Ventanas de Marea para Asignación
                  </h3>
                  
                  <div className="mb-3 text-sm">
                    <p>El sistema considerará las siguientes ventanas de marea para asignar buques:</p>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {weatherData.tide.windows.filter(window => window.isSafe).map((window, i) => <div key={i} className="p-2 border bg-white rounded flex justify-between items-center text-sm">
                          <span>
                            {new Date(window.start).toLocaleDateString('es-ES')}
                            {' '}
                            {new Date(window.start).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} 
                            - 
                            {new Date(window.end).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                          </span>
                          <span className="font-medium text-tide-safe">
                            {window.level.toFixed(1)}m
                          </span>
                        </div>)}
                    
                    {weatherData.tide.windows.filter(window => window.isSafe).length === 0 && <p className="text-center text-muted-foreground p-4">No hay ventanas seguras disponibles</p>}
                  </div>
                </div>}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" onClick={() => setActiveTab("ships")}>
                Agregar Más Buques
              </Button>
              <Button onClick={handleRunAllocationModel} disabled={isLoading} variant="marine" size="xl" className="transition-all font-bold transform hover:scale-105">
                {isLoading ? "Procesando..." : "Ejecutar Modelo de Asignación"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="ships" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-marine-DEFAULT">Gestión de Buques</CardTitle>
              <CardDescription>Agregar y ver buques en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ShipsTable ships={ships} onDeleteShip={handleDeleteShip} />
            </CardContent>
          </Card>
          
          <ShipForm onShipAdded={handleShipAdded} />
        </TabsContent>
        
        <TabsContent value="docks" className="space-y-8">
          <DockManagementTab docks={docks} onDockUpdate={handleDockUpdate} />
        </TabsContent>
        
        <TabsContent value="weather">
          <Card>
            <CardHeader>
              <CardTitle className="text-marine-DEFAULT">Condiciones Climáticas - Talcahuano, Chile</CardTitle>
              <CardDescription>
                Información en tiempo real de marea y viento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {weatherData ? <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-marine-DEFAULT/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Información de Marea</CardTitle>
                        <CardDescription>
                          Ajuste el nivel mínimo de marea permitido
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-sm">Nivel actual:</span>
                              <div className="flex items-baseline gap-2">
                                <span className={`text-3xl font-bold ${weatherData.tide.current >= tideLevelLimit ? 'text-tide-safe' : 'text-tide-danger'}`}>
                                  {weatherData.tide.current.toFixed(1)}
                                </span>
                                <span>{weatherData.tide.unit}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <label>Nivel mínimo requerido</label>
                                <span className="font-medium">{tideLevelLimit.toFixed(1)} {weatherData.tide.unit}</span>
                              </div>
                              <Slider value={[tideLevelLimit]} onValueChange={handleTideLevelChange} min={2.0} max={5.0} step={0.1} />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Estado:</span>
                              <span className={`font-medium ${weatherData.tide.current >= tideLevelLimit ? 'text-tide-safe' : 'text-tide-danger'}`}>
                                {weatherData.tide.current >= tideLevelLimit ? 'Apto para operación' : 'No apto para operación'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-marine-DEFAULT/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Información de Viento</CardTitle>
                        <CardDescription>
                          Ajuste la velocidad máxima de viento permitida
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-sm">Velocidad actual:</span>
                              <div className="flex items-baseline gap-2">
                                <span className={`text-3xl font-bold ${weatherData.wind.speed <= windSpeedLimit ? 'text-green-600' : 'text-red-600'}`}>
                                  {weatherData.wind.speed.toFixed(1)}
                                </span>
                                <span>{weatherData.wind.unit}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <label>Velocidad máxima permitida</label>
                                <span className="font-medium">{windSpeedLimit.toFixed(1)} {weatherData.wind.unit}</span>
                              </div>
                              <Slider value={[windSpeedLimit]} onValueChange={handleWindSpeedChange} min={5.0} max={15.0} step={0.1} />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Estado:</span>
                              <span className={`font-medium ${weatherData.wind.speed <= windSpeedLimit ? 'text-green-600' : 'text-red-600'}`}>
                                {weatherData.wind.speed <= windSpeedLimit ? 'Apto para operación' : 'No apto para operación'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {weatherData?.tide.windows && <TideWindowDisplay tideWindows={weatherData.tide.windows} />}
                  
                  <Button onClick={async () => {
                try {
                  setIsLoading(true);
                  const newWeatherData = await fetchWeatherData();
                  setWeatherData(newWeatherData);
                  toast({
                    title: "Datos Actualizados",
                    description: "Información climática actualizada correctamente"
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "No se pudo actualizar la información climática",
                    variant: "destructive"
                  });
                } finally {
                  setIsLoading(false);
                }
              }} disabled={isLoading} className="bg-marine-DEFAULT hover:bg-marine-light text-white">
                    {isLoading ? "Actualizando..." : "Actualizar Datos Climáticos"}
                  </Button>
                </div> : <div className="text-center py-12">
                  <p className="text-muted-foreground">Cargando datos climáticos...</p>
                </div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default DockAllocationDashboard;