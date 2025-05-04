import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudIcon, WavesIcon, WindIcon } from "lucide-react";
import { WeatherData } from "@/types/types";
interface WeatherStatusCardProps {
  weatherData: WeatherData;
  className?: string;
}
const WeatherStatusCard: React.FC<WeatherStatusCardProps> = ({
  weatherData,
  className = ""
}) => {
  // Format the timestamp to a readable date and time
  const formattedDate = new Date(weatherData.timestamp).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  return <Card className={`border-marine-DEFAULT border-opacity-20 bg-gradient-to-r from-marine-DEFAULT/5 to-transparent ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-marine-DEFAULT">
          <CloudIcon className="h-5 w-5" />
          <span>Condiciones Climáticas - {weatherData.location}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Actualizado: {formattedDate}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <WavesIcon className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium text-gray-700">Nivel de Marea</span>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="flex items-baseline">
                  <span className="text-sm">
                    {weatherData.tide.current.toFixed(1)}
                  </span>
                  <span className="ml-1 text-gray-500">{weatherData.tide.unit}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>Mínimo requerido: {weatherData.tide.minimum} {weatherData.tide.unit}</span>
              <span className={weatherData.tide.current >= weatherData.tide.minimum ? 'text-tide-safe font-medium' : 'text-tide-danger font-medium'}>
                {weatherData.tide.current >= weatherData.tide.minimum ? 'Apto' : 'No apto'}
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <WindIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="font-medium text-gray-700">Velocidad del Viento</span>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="flex items-baseline">
                  <span className={`text-2xl font-bold ${weatherData.wind.speed <= weatherData.wind.maximum ? 'text-green-600' : 'text-red-600'}`}>
                    {weatherData.wind.speed.toFixed(1)}
                  </span>
                  <span className="ml-1 text-gray-500">{weatherData.wind.unit}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>Máximo permitido: {weatherData.wind.maximum} {weatherData.wind.unit}</span>
              <span className={weatherData.wind.speed <= weatherData.wind.maximum ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {weatherData.wind.speed <= weatherData.wind.maximum ? 'Apto' : 'No apto'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default WeatherStatusCard;