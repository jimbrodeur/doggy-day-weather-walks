
import React from 'react';
import { WeatherData } from '@/types/weather';
import { CloudSun, CloudRain, Sun, Cloudy } from 'lucide-react';

interface WeatherDisplayProps {
  weatherData: WeatherData;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData }) => {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="h-12 w-12 text-yellow-500" />;
      case 'partly-cloudy':
        return <CloudSun className="h-12 w-12 text-yellow-400" />;
      case 'cloudy':
        return <Cloudy className="h-12 w-12 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="h-12 w-12 text-blue-500" />;
      default:
        return <Sun className="h-12 w-12 text-yellow-500" />;
    }
  };

  const getConditionText = (condition: string) => {
    return condition.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Current Weather in {weatherData.location}
      </h2>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="text-center">
          {getWeatherIcon(weatherData.condition)}
          <p className="text-lg font-semibold text-gray-700 mt-2">
            {getConditionText(weatherData.condition)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-800">
            {weatherData.temperature}°F
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="font-semibold text-blue-800">Humidity</div>
            <div className="text-blue-600">{weatherData.humidity}%</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="font-semibold text-green-800">Wind</div>
            <div className="text-green-600">{weatherData.windSpeed} mph</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="font-semibold text-orange-800">UV Index</div>
            <div className="text-orange-600">{weatherData.uvIndex}</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="font-semibold text-purple-800">Rain</div>
            <div className="text-purple-600">{weatherData.precipitation}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
