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
  
  return (
    <Card className={`border-marine-DEFAULT border-opacity-20 bg-gradient-to-r from-marine-DEFAULT/5 to-transparent ${className}`}>
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2 text-marine-DEFAULT text-sm">
          <CloudIcon className="h-4 w-4" />
          <span>Clima - {weatherData.location}</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {formattedDate}
        </p>
      </CardHeader>
      <CardContent className="space-y-2 py-2">
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-white rounded-lg p-2 shadow-sm border">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <WavesIcon className="h-4 w-4 text-blue-500 mr-1" />
                <span className="font-medium text-gray-700 text-xs">Marea</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-lg font-bold">
                  {weatherData.tide.current.toFixed(1)}
                </span>
                <span className="ml-1 text-gray-500 text-xs">{weatherData.tide.unit}</span>
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <div>
                <span>Mín:</span>
                <span className="ml-1">{weatherData.tide.minimum} {weatherData.tide.unit}</span>
              </div>
              <span className={weatherData.tide.current >= weatherData.tide.minimum ? 'text-tide-safe font-medium' : 'text-tide-danger font-medium'}>
                {weatherData.tide.current >= weatherData.tide.minimum ? 'Apto' : 'No apto'}
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-2 shadow-sm border">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <WindIcon className="h-4 w-4 text-red-500 mr-1" />
                <span className="font-medium text-gray-700 text-xs">Viento</span>
              </div>
              
              <div className="flex items-center">
                <span className={`text-lg font-bold ${weatherData.wind.speed <= weatherData.wind.maximum ? 'text-green-600' : 'text-red-600'}`}>
                  {weatherData.wind.speed.toFixed(1)}
                </span>
                <span className="ml-1 text-gray-500 text-xs">{weatherData.wind.unit}</span>
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <div>
                <span>Máx:</span>
                <span className="ml-1">{weatherData.wind.maximum} {weatherData.wind.unit}</span>
              </div>
              <span className={weatherData.wind.speed <= weatherData.wind.maximum ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
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
