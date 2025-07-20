import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ArrowLeft
} from 'lucide-react';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'utilization' | 'efficiency' | 'revenue'>('utilization');

  // Mock data for dock utilization over time
  const utilizationData = [
    { date: '01/07', 'DS1': 85, 'DS2': 92, 'Mery': 78, 'Gutierrez': 88, promedio: 85.75 },
    { date: '02/07', 'DS1': 90, 'DS2': 88, 'Mery': 82, 'Gutierrez': 85, promedio: 86.25 },
    { date: '03/07', 'DS1': 78, 'DS2': 95, 'Mery': 88, 'Gutierrez': 92, promedio: 88.25 },
    { date: '04/07', 'DS1': 88, 'DS2': 90, 'Mery': 85, 'Gutierrez': 88, promedio: 87.75 },
    { date: '05/07', 'DS1': 92, 'DS2': 85, 'Mery': 90, 'Gutierrez': 82, promedio: 87.25 },
    { date: '06/07', 'DS1': 85, 'DS2': 88, 'Mery': 92, 'Gutierrez': 90, promedio: 88.75 },
    { date: '07/07', 'DS1': 90, 'DS2': 92, 'Mery': 88, 'Gutierrez': 95, promedio: 91.25 },
    { date: '08/07', 'DS1': 88, 'DS2': 90, 'Mery': 85, 'Gutierrez': 88, promedio: 87.75 },
    { date: '09/07', 'DS1': 92, 'DS2': 88, 'Mery': 90, 'Gutierrez': 92, promedio: 90.5 },
    { date: '10/07', 'DS1': 85, 'DS2': 95, 'Mery': 88, 'Gutierrez': 90, promedio: 89.5 },
    { date: '11/07', 'DS1': 90, 'DS2': 92, 'Mery': 92, 'Gutierrez': 88, promedio: 90.5 },
    { date: '12/07', 'DS1': 88, 'DS2': 90, 'Mery': 88, 'Gutierrez': 92, promedio: 89.5 },
    { date: '13/07', 'DS1': 95, 'DS2': 88, 'Mery': 90, 'Gutierrez': 90, promedio: 90.75 },
    { date: '14/07', 'DS1': 90, 'DS2': 92, 'Mery': 88, 'Gutierrez': 88, promedio: 89.5 },
  ];

  // Efficiency metrics
  const efficiencyData = [
    { metric: 'Tiempo de Atraque', antes: 45, despues: 32, mejora: 28.9 },
    { metric: 'Tiempo de Espera', antes: 120, despues: 85, mejora: 29.2 },
    { metric: 'Utilización Promedio', antes: 72, despues: 89, mejora: 23.6 },
    { metric: 'Conflictos de Programación', antes: 15, despues: 3, mejora: 80.0 },
  ];

  // Ship type distribution
  const shipTypeData = [
    { name: 'Contenedores', value: 42, color: '#2563EB' },
    { name: 'Graneleros', value: 28, color: '#16A34A' },
    { name: 'Tanqueros', value: 18, color: '#DC2626' },
    { name: 'Pasajeros', value: 12, color: '#9333EA' },
  ];

  // Monthly performance
  const monthlyData = [
    { mes: 'Ene', asignaciones: 45, utilizacion: 82, ingresos: 120 },
    { mes: 'Feb', asignaciones: 52, utilizacion: 85, ingresos: 135 },
    { mes: 'Mar', asignaciones: 48, utilizacion: 88, ingresos: 142 },
    { mes: 'Apr', asignaciones: 58, utilizacion: 91, ingresos: 158 },
    { mes: 'May', asignaciones: 62, utilizacion: 89, ingresos: 165 },
    { mes: 'Jun', asignaciones: 55, utilizacion: 87, ingresos: 152 },
    { mes: 'Jul', asignaciones: 67, utilizacion: 93, ingresos: 178 },
  ];

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Últimos 7 días';
      case '30d': return 'Últimos 30 días';
      case '90d': return 'Últimos 90 días';
      case '1y': return 'Último año';
      default: return 'Últimos 30 días';
    }
  };

  const calculateTrend = (data: number[]) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previous = data.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    return ((recent - previous) / previous) * 100;
  };

  const utilizationTrend = calculateTrend(utilizationData.map(d => d.promedio));

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
                <h1 className="text-3xl font-bold text-marine-DEFAULT">Analytics e Informes</h1>
                <p className="text-muted-foreground">Análisis de eficiencia y utilización del astillero digital</p>
              </div>
            </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilización Promedio</p>
                <p className="text-2xl font-bold">89.2%</p>
                <div className="flex items-center text-sm mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">+{utilizationTrend.toFixed(1)}%</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Asignaciones Este Mes</p>
                <p className="text-2xl font-bold">67</p>
                <div className="flex items-center text-sm mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">+21.8%</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Ahorro Promedio</p>
                <p className="text-2xl font-bold">2.3h</p>
                <div className="flex items-center text-sm mt-1">
                  <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">-28.9%</span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eficiencia Operacional</p>
                <p className="text-2xl font-bold">93.1%</p>
                <div className="flex items-center text-sm mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">+15.2%</span>
                </div>
              </div>
              <PieChartIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Utilización de Diques por Día - {getTimeRangeLabel(timeRange)}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, name]}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="DS1" stroke="#2563EB" strokeWidth={2} />
                  <Line type="monotone" dataKey="DS2" stroke="#16A34A" strokeWidth={2} />
                  <Line type="monotone" dataKey="Mery" stroke="#DC2626" strokeWidth={2} />
                  <Line type="monotone" dataKey="Gutierrez" stroke="#9333EA" strokeWidth={2} />
                  <Line type="monotone" dataKey="promedio" stroke="#F59E0B" strokeWidth={3} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo de Buque</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={shipTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {shipTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Comparison */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mejoras de Eficiencia (Antes vs Después del Sistema Digital)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={efficiencyData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="metric" type="category" width={120} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'antes' ? `${value} (antes)` : `${value} (después)`,
                    name === 'antes' ? 'Antes' : 'Después'
                  ]}
                />
                <Legend />
                <Bar dataKey="antes" fill="#EF4444" name="Antes" />
                <Bar dataKey="despues" fill="#10B981" name="Después" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Mensual de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="utilizacion" 
                  stackId="1"
                  stroke="#2563EB" 
                  fill="#2563EB" 
                  fillOpacity={0.3}
                  name="Utilización (%)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="asignaciones" 
                  stroke="#16A34A" 
                  strokeWidth={3}
                  name="Asignaciones"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Table */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Mejora del Sistema Digital</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left">Métrica</th>
                  <th className="border p-3 text-center">Antes del Sistema</th>
                  <th className="border p-3 text-center">Después del Sistema</th>
                  <th className="border p-3 text-center">Mejora (%)</th>
                  <th className="border p-3 text-center">Impacto</th>
                </tr>
              </thead>
              <tbody>
                {efficiencyData.map((row, index) => (
                  <tr key={index}>
                    <td className="border p-3 font-medium">{row.metric}</td>
                    <td className="border p-3 text-center">{row.antes}</td>
                    <td className="border p-3 text-center">{row.despues}</td>
                    <td className="border p-3 text-center">
                      <span className="text-green-600 font-bold">
                        {row.mejora.toFixed(1)}%
                      </span>
                    </td>
                    <td className="border p-3 text-center">
                      <div className="flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600 text-sm font-medium">Positivo</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  
  {/* Footer stripe */}
  <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-marine-DEFAULT to-marine-light z-10"></div>
</div>
  );
};

export default Analytics;