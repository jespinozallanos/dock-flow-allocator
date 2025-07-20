import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ship, Dock, Allocation } from '@/types/types';
import { getAllocations, getDocks, getShips } from '@/services/allocationService';
import { MapPin, Ship as ShipIcon, Anchor, ZoomIn, ZoomOut, RotateCcw, ArrowLeft } from 'lucide-react';

const ShipyardMap: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [selectedDock, setSelectedDock] = useState<string | null>(null);
  const [ships, setShips] = useState<Ship[]>([]);
  const [docks, setDocks] = useState<Dock[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [shipsData, docksData, allocationsData] = await Promise.all([
          getShips(),
          getDocks(), 
          getAllocations()
        ]);
        setShips(shipsData);
        setDocks(docksData);
        setAllocations(allocationsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Mock positions for visualization
  const dockPositions = {
    'dock-1': { x: 20, y: 30, width: 80, height: 25 },
    'dock-2': { x: 20, y: 60, width: 80, height: 25 },
    'dock-3': { x: 120, y: 30, width: 60, height: 20 },
    'dock-4': { x: 120, y: 55, width: 60, height: 20 },
    'dock-5': { x: 200, y: 30, width: 70, height: 30 }
  };

  const getShipPosition = (dockId: string, shipIndex: number) => {
    const dock = dockPositions[dockId as keyof typeof dockPositions];
    if (!dock) return { x: 0, y: 0 };
    
    return {
      x: dock.x + (shipIndex * 15),
      y: dock.y + 5
    };
  };

  const getDockStatus = (dock: Dock) => {
    if (dock.operationalStatus !== 'operativo') return 'maintenance';
    if (dock.occupied) return 'occupied';
    return 'available';
  };

  const getDockColor = (status: string) => {
    switch (status) {
      case 'occupied': return '#3B82F6'; // Blue
      case 'maintenance': return '#EAB308'; // Yellow
      case 'available': return '#10B981'; // Green
      default: return '#6B7280'; // Gray
    }
  };

  const getShipColor = (type: string) => {
    switch (type) {
      case 'container': return '#2563EB';
      case 'bulk': return '#16A34A';
      case 'tanker': return '#DC2626';
      case 'passenger': return '#9333EA';
      default: return '#6B7280';
    }
  };

  const getAllocatedShips = (dockId: string) => {
    return allocations
      .filter(allocation => allocation.dockId === dockId)
      .map(allocation => ships.find(ship => ship.id === allocation.shipId))
      .filter(Boolean) as Ship[];
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header stripe */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-marine-DEFAULT to-marine-light z-10"></div>
      
      {/* ASMAR Logo */}
      <div className="absolute top-4 right-8 z-30">
        <img src="/lovable-uploads/28e585db-dc69-49ef-9a3e-937fe48ce44c.png" alt="ASMAR Logo" className="h-16 w-auto" />
      </div>
      
      <div className="container py-6 max-w-full px-6 relative z-20">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-marine-DEFAULT">Mapa del Astillero</h1>
                <p className="text-muted-foreground">Vista 2D interactiva de las instalaciones portuarias</p>
              </div>
            </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setZoom(1)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Plano del Astillero ASMAR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 rounded-lg p-4 overflow-auto">
                <svg 
                  width="100%" 
                  height="500" 
                  viewBox={`0 0 ${300 * zoom} ${150 * zoom}`}
                  className="border rounded-lg bg-white"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                >
                  {/* Water background */}
                  <defs>
                    <pattern id="water" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <rect width="20" height="20" fill="#EBF8FF"/>
                      <path d="M 0,10 Q 5,5 10,10 T 20,10" stroke="#3B82F6" strokeWidth="0.5" fill="none"/>
                    </pattern>
                  </defs>
                  
                  <rect width="100%" height="100%" fill="url(#water)" />
                  
                  {/* Coastline */}
                  <path 
                    d="M 0,100 Q 50,95 100,100 T 200,100 L 300,100 L 300,150 L 0,150 Z" 
                    fill="#F3F4F6" 
                    stroke="#D1D5DB" 
                    strokeWidth="1"
                  />
                  
                  {/* Docks */}
                  {docks.map((dock) => {
                    const position = dockPositions[dock.id as keyof typeof dockPositions];
                    if (!position) return null;
                    
                    const status = getDockStatus(dock);
                    const allocatedShips = getAllocatedShips(dock.id);
                    
                    return (
                      <g key={dock.id}>
                        {/* Dock structure */}
                        <rect
                          x={position.x}
                          y={position.y}
                          width={position.width}
                          height={position.height}
                          fill={getDockColor(status)}
                          stroke="#374151"
                          strokeWidth="2"
                          rx="4"
                          className="cursor-pointer"
                          onClick={() => setSelectedDock(dock.id)}
                        />
                        
                        {/* Dock label */}
                        <text
                          x={position.x + position.width/2}
                          y={position.y + position.height/2}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="text-xs font-medium fill-white"
                        >
                          {dock.name}
                        </text>
                        
                        {/* Ships on dock */}
                        {allocatedShips.map((ship, index) => {
                          const shipPos = getShipPosition(dock.id, index);
                          return (
                            <g key={ship.id}>
                              <rect
                                x={shipPos.x}
                                y={shipPos.y}
                                width="12"
                                height="8"
                                fill={getShipColor(ship.type)}
                                stroke="#1F2937"
                                strokeWidth="1"
                                rx="2"
                              />
                              <text
                                x={shipPos.x + 6}
                                y={shipPos.y - 2}
                                textAnchor="middle"
                                className="text-xs fill-gray-700"
                              >
                                {ship.name.substring(0, 6)}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                  
                  {/* Legend */}
                  <g transform="translate(10, 10)">
                    <rect x="0" y="0" width="100" height="80" fill="white" stroke="#D1D5DB" rx="4"/>
                    <text x="5" y="15" className="text-xs font-medium">Leyenda</text>
                    
                    <rect x="5" y="20" width="12" height="8" fill="#10B981"/>
                    <text x="20" y="27" className="text-xs">Disponible</text>
                    
                    <rect x="5" y="32" width="12" height="8" fill="#3B82F6"/>
                    <text x="20" y="39" className="text-xs">Ocupado</text>
                    
                    <rect x="5" y="44" width="12" height="8" fill="#EAB308"/>
                    <text x="20" y="51" className="text-xs">Mantención</text>
                    
                    <rect x="5" y="56" width="12" height="8" fill="#DC2626"/>
                    <text x="20" y="63" className="text-xs">Buque Tanque</text>
                    
                    <rect x="5" y="68" width="12" height="8" fill="#2563EB"/>
                    <text x="20" y="75" className="text-xs">Contenedor</text>
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Dique</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDock ? (
                <div className="space-y-3">
                  {(() => {
                    const dock = docks.find(d => d.id === selectedDock);
                    if (!dock) return <p>Dique no encontrado</p>;
                    
                    const allocatedShips = getAllocatedShips(dock.id);
                    const status = getDockStatus(dock);
                    
                    return (
                      <>
                        <div>
                          <h3 className="font-semibold">{dock.name}</h3>
                          <Badge className={`mt-1 ${
                            status === 'available' ? 'bg-green-500' :
                            status === 'occupied' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}>
                            {status === 'available' ? 'Disponible' :
                             status === 'occupied' ? 'Ocupado' : 'Mantención'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dimensiones:</span>
                            <span>{dock.length}m × {dock.depth}m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Viento máx:</span>
                            <span>{dock.maxWindSpeed} nudos</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Marea mín:</span>
                            <span>{dock.minTideLevel}m</span>
                          </div>
                        </div>
                        
                        {allocatedShips.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Buques Asignados</h4>
                            <div className="space-y-2">
                              {allocatedShips.map(ship => (
                                <div key={ship.id} className="flex items-center gap-2 text-sm">
                                  <ShipIcon className="h-4 w-4" style={{ color: getShipColor(ship.type) }} />
                                  <span>{ship.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {ship.type}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Selecciona un dique en el mapa para ver su información
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Diques disponibles:</span>
                  <span className="font-medium text-green-600">
                    {docks.filter(d => getDockStatus(d) === 'available').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Diques ocupados:</span>
                  <span className="font-medium text-blue-600">
                    {docks.filter(d => getDockStatus(d) === 'occupied').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">En mantención:</span>
                  <span className="font-medium text-yellow-600">
                    {docks.filter(d => getDockStatus(d) === 'maintenance').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Buques asignados:</span>
                  <span className="font-medium">{allocations.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
      </div>
      
      {/* Footer stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-marine-DEFAULT to-marine-light z-10"></div>
    </div>
  );
};

export default ShipyardMap;