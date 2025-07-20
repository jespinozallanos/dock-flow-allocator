import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Bell, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Wind, 
  Waves, 
  Wrench,
  Ship,
  Filter,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'weather' | 'maintenance' | 'operations' | 'safety';
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  source: string;
}

const AlertsDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'unacknowledged'>('all');

  // Mock alerts data
  useEffect(() => {
    const mockAlerts: AlertItem[] = [
      {
        id: '1',
        type: 'critical',
        category: 'weather',
        title: 'Viento excede límites operacionales',
        description: 'Velocidad del viento: 15.2 nudos. Límite máximo: 8 nudos. Operaciones suspendidas.',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 min ago
        acknowledged: false,
        source: 'Estación Meteorológica'
      },
      {
        id: '2',
        type: 'warning',
        category: 'maintenance',
        title: 'Dique DS1 requiere mantención programada',
        description: 'Mantención preventiva programada para mañana 08:00. Duración estimada: 4 horas.',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
        acknowledged: true,
        source: 'Sistema de Mantención'
      },
      {
        id: '3',
        type: 'warning',
        category: 'weather',
        title: 'Marea baja detectada',
        description: 'Nivel actual: 2.1m. Mínimo requerido: 3.0m. Ventana operacional en 2 horas.',
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 min ago
        acknowledged: false,
        source: 'Sensor de Marea'
      },
      {
        id: '4',
        type: 'info',
        category: 'operations',
        title: 'Nuevo buque programado para mañana',
        description: 'Atlantic Explorer programado para llegada 09:00. Dique asignado: Mery.',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        acknowledged: true,
        source: 'Sistema de Planificación'
      },
      {
        id: '5',
        type: 'success',
        category: 'operations',
        title: 'Asignación completada exitosamente',
        description: 'Pacific Voyager completó operaciones en Dique Gutierrez. Duración: 6.5 horas.',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        acknowledged: true,
        source: 'Sistema de Asignación'
      },
      {
        id: '6',
        type: 'critical',
        category: 'safety',
        title: 'Zona de seguridad comprometida',
        description: 'Detectado personal no autorizado en área restringida del Dique DS2.',
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 min ago
        acknowledged: false,
        source: 'Sistema de Seguridad'
      }
    ];
    
    setAlerts(mockAlerts);
  }, []);

  const getAlertIcon = (type: string, category: string) => {
    if (category === 'weather') return type === 'critical' ? Wind : Waves;
    if (category === 'maintenance') return Wrench;
    if (category === 'operations') return Ship;
    if (category === 'safety') return AlertTriangle;
    return Bell;
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'outline';
      case 'success': return 'default';
      default: return 'secondary';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unacknowledged') return !alert.acknowledged;
    return alert.type === filter;
  });

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return alertTime.toLocaleDateString('es-ES');
  };

  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter(a => a.type === 'warning' && !a.acknowledged).length;
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

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
                <h1 className="text-3xl font-bold text-marine-DEFAULT">Centro de Alertas</h1>
                <p className="text-muted-foreground">Monitoreo y gestión de alertas del astillero en tiempo real</p>
              </div>
            </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Críticas</p>
                <p className="text-2xl font-bold text-red-700">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Advertencias</p>
                <p className="text-2xl font-bold text-yellow-700">{warningCount}</p>
              </div>
              <Bell className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Sin Revisar</p>
                <p className="text-2xl font-bold text-blue-700">{unacknowledgedCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Total Alertas</p>
                <p className="text-2xl font-bold text-green-700">{alerts.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Alertas
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todas
              </Button>
              <Button 
                variant={filter === 'critical' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('critical')}
              >
                Críticas
              </Button>
              <Button 
                variant={filter === 'warning' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('warning')}
              >
                Advertencias
              </Button>
              <Button 
                variant={filter === 'unacknowledged' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('unacknowledged')}
              >
                Sin Revisar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay alertas</h3>
              <p className="text-muted-foreground">No se encontraron alertas para el filtro seleccionado.</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map(alert => {
            const Icon = getAlertIcon(alert.type, alert.category);
            
            return (
              <Alert key={alert.id} className={getAlertColor(alert.type)}>
                <Icon className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>{alert.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={getBadgeVariant(alert.type)} className="text-xs">
                      {alert.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(alert.timestamp)}
                    </span>
                  </div>
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p>{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Fuente: {alert.source}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {alert.acknowledged ? (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Revisada
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Marcar como Revisada
                        </Button>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            );
          })
        )}
      </div>
    </div>
  </div>
  
  {/* Footer stripe */}
  <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-marine-DEFAULT to-marine-light z-10"></div>
</div>
  );
};

export default AlertsDashboard;