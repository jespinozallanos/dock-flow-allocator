
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
  const formattedDate = new Date(weatherData.timestamp).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <Card className={`border-marine-DEFAULT border-opacity-20 bg-gradient-to-r from-marine-DEFAULT/5 to-transparent ${className}`}>
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="flex items-start sm:items-center gap-2 text-marine-DEFAULT">
          <CloudIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-lg font-semibold break-words">
              Condiciones Climáticas
            </div>
            <div className="text-xs sm:text-sm font-normal text-muted-foreground">
              {weatherData.location}
            </div>
          </div>
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Actualizado: {formattedDate}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="flex items-center min-w-0 flex-1">
                <WavesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 flex-shrink-0" />
                <span className="font-medium text-gray-700 text-xs sm:text-sm truncate">
                  Nivel de Marea
                </span>
              </div>
              
              <div className="flex items-center ml-2">
                <span className="text-xl sm:text-2xl font-bold">
                  {weatherData.tide.current.toFixed(1)}
                </span>
                <span className="ml-1 text-gray-500 text-xs sm:text-sm">
                  {weatherData.tide.unit}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-gray-500">
              <div className="truncate">
                <span>Mínimo requerido:</span>
                <span className="ml-1">{weatherData.tide.minimum} {weatherData.tide.unit}</span>
              </div>
              <span className={`${weatherData.tide.current >= weatherData.tide.minimum ? 'text-tide-safe' : 'text-tide-danger'} font-medium`}>
                {weatherData.tide.current >= weatherData.tide.minimum ? 'Apto' : 'No apto'}
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="flex items-center min-w-0 flex-1">
                <WindIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-2 flex-shrink-0" />
                <span className="font-medium text-gray-700 text-xs sm:text-sm truncate">
                  Velocidad del Viento
                </span>
              </div>
              
              <div className="flex items-center ml-2">
                <span className={`text-xl sm:text-2xl font-bold ${weatherData.wind.speed <= weatherData.wind.maximum ? 'text-green-600' : 'text-red-600'}`}>
                  {weatherData.wind.speed.toFixed(1)}
                </span>
                <span className="ml-1 text-gray-500 text-xs sm:text-sm">
                  {weatherData.wind.unit}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-gray-500">
              <div className="truncate">
                <span>Máximo permitido:</span>
                <span className="ml-1">{weatherData.wind.maximum} {weatherData.wind.unit}</span>
              </div>
              <span className={`${weatherData.wind.speed <= weatherData.wind.maximum ? 'text-green-600' : 'text-red-600'} font-medium`}>
                {weatherData.wind.speed <= weatherData.wind.maximum ? 'Apto' : 'No apto'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherStatusCard;
