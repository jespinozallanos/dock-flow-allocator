import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Anchor, Ship, Home, Navigation, RefreshCw, Satellite, ArrowLeft } from 'lucide-react';

const ShipyardMapSatellite: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [selectedDock, setSelectedDock] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Create embedded Google Maps iframe for ASMAR Talcahuano con vista satelital
    const iframe = document.createElement('iframe');
    iframe.src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3175.123456789!2d-73.1167!3d-36.7167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x966e4d6c8a1f9a17%3A0x123456789abcdef!2sASMAR%20Talcahuano!5e1!3m2!1ses!2scl!4v1643723456789!5m2!1ses!2scl&z=17";
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    
    mapContainer.current.appendChild(iframe);
    setMapLoaded(true);

    // Cleanup
    return () => {
      if (mapContainer.current) {
        mapContainer.current.innerHTML = '';
      }
    };
  }, []);

  const resetView = () => {
    // Refresh iframe to reset view
    if (mapContainer.current) {
      const iframe = mapContainer.current.querySelector('iframe');
      if (iframe) {
        iframe.src = iframe.src;
      }
    }
  };

  const dockInfo = [
    { id: 'dock-1', name: 'Dique Seco N°1', status: 'occupied', capacity: '200m', ships: ['MV Antofagasta'] },
    { id: 'dock-2', name: 'Dique Seco N°2', status: 'available', capacity: '180m', ships: [] },
    { id: 'dock-3', name: 'Dique Flotante', status: 'maintenance', capacity: '150m', ships: [] },
    { id: 'dock-4', name: 'Varadero Norte', status: 'occupied', capacity: '120m', ships: ['Patrullero Marinero'] },
    { id: 'dock-5', name: 'Varadero Sur', status: 'available', capacity: '100m', ships: [] }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-blue-500 text-white';
      case 'maintenance': return 'bg-yellow-500 text-white';
      case 'available': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'occupied': return 'Ocupado';
      case 'maintenance': return 'Mantención';
      case 'available': return 'Disponible';
      default: return 'Desconocido';
    }
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
                <h1 className="text-3xl font-bold text-marine-DEFAULT flex items-center gap-2">
                  <Satellite className="h-8 w-8" />
                  Vista Aérea ASMAR Talcahuano
                </h1>
                <p className="text-muted-foreground">Vista satelital en tiempo real del astillero naval</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetView}
                className="flex items-center gap-1 text-xs"
              >
                <RefreshCw className="h-4 w-4" />
                Recargar Vista
              </Button>
              <Button 
                variant="marine" 
                size="sm"
                onClick={() => window.location.href = '/mapa'}
                className="flex items-center gap-1 text-xs text-black"
              >
                <MapPin className="h-4 w-4" />
                Mapa 2D
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Satellite className="h-5 w-5" />
                    Vista Satelital - ASMAR Talcahuano, Chile
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div 
                    ref={mapContainer}
                    className="w-full h-[600px] rounded-lg overflow-hidden"
                    style={{ minHeight: '600px' }}
                  >
                    {!mapLoaded && (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <div className="text-center">
                          <Satellite className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Cargando vista satelital...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Anchor className="h-5 w-5" />
                    Diques ASMAR
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dockInfo.map((dock) => (
                      <div 
                        key={dock.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedDock === dock.id ? 'bg-marine-DEFAULT/10 border-marine-DEFAULT' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedDock(selectedDock === dock.id ? null : dock.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{dock.name}</h4>
                          <Badge className={getStatusColor(dock.status)}>
                            {getStatusLabel(dock.status)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>Capacidad: {dock.capacity}</div>
                          {dock.ships.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Ship className="h-3 w-3" />
                              <span>{dock.ships[0]}</span>
                            </div>
                          )}
                        </div>
                        
                        {selectedDock === dock.id && dock.ships.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="text-xs">
                              <div className="font-medium mb-1">Buques asignados:</div>
                              {dock.ships.map((ship, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <Ship className="h-3 w-3 text-marine-DEFAULT" />
                                  <span>{ship}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Disponibles:</span>
                      <span className="font-medium text-green-600">
                        {dockInfo.filter(d => d.status === 'available').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Ocupados:</span>
                      <span className="font-medium text-blue-600">
                        {dockInfo.filter(d => d.status === 'occupied').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">En mantención:</span>
                      <span className="font-medium text-yellow-600">
                        {dockInfo.filter(d => d.status === 'maintenance').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total diques:</span>
                      <span className="font-medium">{dockInfo.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p><strong>Ubicación:</strong> Talcahuano, Región del Biobío, Chile</p>
                    <p><strong>Coordenadas:</strong> 36°43'S, 73°07'W</p>
                    <p><strong>Astillero:</strong> ASMAR (Astilleros y Maestranzas de la Armada)</p>
                    <p><strong>Capacidad:</strong> Buques hasta 200m de eslora</p>
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

export default ShipyardMapSatellite;