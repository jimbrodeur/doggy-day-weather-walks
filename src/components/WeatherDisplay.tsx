
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
        Current Weather in {weatherData.location}
      </h2>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="text-center">
          {getWeatherIcon(weatherData.condition)}
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-2">
            {getConditionText(weatherData.condition)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-800 dark:text-gray-200">
            {weatherData.temperature}°F
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="font-semibold text-blue-800 dark:text-blue-300">Humidity</div>
            <div className="text-blue-600 dark:text-blue-400">{weatherData.humidity}%</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="font-semibold text-green-800 dark:text-green-300">Wind</div>
            <div className="text-green-600 dark:text-green-400">{weatherData.windSpeed} mph</div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="font-semibold text-orange-800 dark:text-orange-300">UV Index</div>
            <div className="text-orange-600 dark:text-orange-400">{weatherData.uvIndex}</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="font-semibold text-purple-800 dark:text-purple-300">Rain</div>
            <div className="text-purple-600 dark:text-purple-400">{weatherData.precipitation}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
