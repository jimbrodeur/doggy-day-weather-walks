
import React from 'react';
import { WeatherData, WalkingRecommendation } from '@/types/weather';
import { generateWalkingRecommendations } from '@/utils/walkingLogic';
import { Umbrella, CloudSun, CloudRain, Sun, Cloudy, CloudSnow, Zap, Wind, Eye, Sunrise, Sunset, ExternalLink } from 'lucide-react';

interface WalkingRecommendationsProps {
  weatherData: WeatherData;
  selectedDate?: string;
}

export const WalkingRecommendations: React.FC<WalkingRecommendationsProps> = ({ weatherData, selectedDate }) => {
  const recommendations = generateWalkingRecommendations(weatherData);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800';
    return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getWeatherIcon = (condition: string, precipitation: number) => {
    // Prioritize precipitation over base condition
    if (precipitation > 70) {
      return <CloudRain className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
    if (precipitation > 40) {
      return <CloudRain className="h-5 w-5 text-blue-500 dark:text-blue-300" />;
    }
    if (precipitation > 15) {
      return <CloudSun className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
    
    // Base condition icons
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
      case 'partly-cloudy':
      case 'partly cloudy':
        return <CloudSun className="h-5 w-5 text-yellow-400 dark:text-yellow-300" />;
      case 'cloudy':
      case 'overcast':
        return <Cloudy className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
      case 'rainy':
      case 'rain':
        return <CloudRain className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'snow':
      case 'snowy':
        return <CloudSnow className="h-5 w-5 text-blue-300 dark:text-blue-200" />;
      case 'thunderstorm':
      case 'storm':
        return <Zap className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      default:
        return <Sun className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
    }
  };

  // Generate comprehensive weather summary
  const getWeatherSummary = () => {
    const avgTemp = Math.round(weatherData.hourlyForecast.reduce((sum, hour) => sum + hour.temperature, 0) / weatherData.hourlyForecast.length);
    const maxPrecipitation = Math.max(...weatherData.hourlyForecast.map(h => h.precipitation));
    const hotHours = weatherData.hourlyForecast.filter(h => h.temperature > 80);
    const coldHours = weatherData.hourlyForecast.filter(h => h.temperature < 35);
    
    const dateLabel = selectedDate ? (() => {
      const date = new Date(selectedDate);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      return `${dayName}'s`;
    })() : "Today's";
    
    let summary = `${dateLabel} forecast: ${avgTemp}°F average`;
    
    // Weather conditions
    if (maxPrecipitation > 70) {
      summary += " with heavy rain expected all day ☔ - Perfect for indoor playtime or bring that umbrella and waterproof gear!";
    } else if (maxPrecipitation > 40) {
      summary += " with rain showers throughout the day 🌧️ - Pack an umbrella and maybe plan shorter walks between downpours!";
    } else if (maxPrecipitation > 15) {
      summary += " with possible light showers ⛅ - Might want to grab an umbrella just in case for those outdoor adventures!";
    } else {
      summary += " with mostly dry conditions ☀️";
    }
    
    // Temperature-based walking advice
    if (hotHours.length > 4) {
      summary += " Hot day ahead - avoid midday walks and stick to early morning or evening adventures! 🐕‍🦺";
    } else if (coldHours.length > 2) {
      summary += " Chilly day - bundle up your pup with a cozy jacket for those walks! 🧥";
    } else if (maxPrecipitation <= 15) {
      summary += " Great day for long adventures with your furry friend! 🎾";
    }
    
    return summary;
  };

  const getWalkingTimesTitle = () => {
    if (!selectedDate) {
      return "🐕 Best Walking Times Today";
    }
    
    const date = new Date(selectedDate);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `🐕 Best Walking Times for ${dayName}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
        {getWalkingTimesTitle()}
      </h2>
      
      {/* Comprehensive Weather Summary */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-blue-800 dark:text-blue-300 font-medium text-center">
          {getWeatherSummary()}
        </p>
      </div>

      {/* Weather Disclaimer */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <p className="text-amber-800 dark:text-amber-300 text-sm text-center">
          ⚠️ <strong>Important:</strong> Weather data may not be completely accurate for your specific area. Some dogs can be more sensitive to weather conditions depending on their age, breed, size, and health. Please use your best judgment and consult with your veterinarian if you have concerns about your dog's ability to handle certain weather conditions.
        </p>
      </div>
      
      {/* Score Legend */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">📊 Walking Score Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300"><strong>80-100:</strong> Excellent - Perfect conditions!</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300"><strong>60-79:</strong> Good - Great for walking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300"><strong>0-59:</strong> Fair/Poor - Consider alternatives</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const hourData = rec.hourlyData || { 
            precipitation: 0, 
            condition: weatherData.condition,
            temperature: weatherData.temperature,
            uvIndex: weatherData.uvIndex,
            windSpeed: weatherData.windSpeed
          };
          
          return (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getScoreColor(rec.score)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(hourData.condition || weatherData.condition, hourData.precipitation)}
                  <div>
                    <span className="text-lg font-semibold">{rec.time}</span>
                    {rec.sunEvent && (
                      <div className="flex items-center gap-1 mt-1">
                        {rec.sunEvent.type === 'sunrise' ? (
                          <Sunrise className="h-4 w-4 text-orange-500" />
                        ) : (
                          <Sunset className="h-4 w-4 text-orange-600" />
                        )}
                        <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                          {rec.sunEvent.type === 'sunrise' ? 'Sunrise' : 'Sunset'} {rec.sunEvent.time}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{rec.score}</div>
                  <div className="text-xs font-medium">{getScoreLabel(rec.score)}</div>
                </div>
              </div>
              
              {/* Weather details grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-orange-500">🌡️</span>
                  <span className="font-medium">{hourData.temperature}°F</span>
                </div>
                <div className="flex items-center gap-1">
                  <Umbrella className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{hourData.precipitation}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">UV {hourData.uvIndex || weatherData.uvIndex}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{hourData.windSpeed || weatherData.windSpeed} mph</span>
                </div>
              </div>
              
              <p className="text-sm opacity-90">{rec.reason}</p>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Pro Tips for Dog walking:</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Bring water for both you and your pup on hot days</li>
          <li>• Check pavement temperature with your hand before walks</li>
          <li>• Consider shorter walks during extreme weather</li>
          <li>• Early morning and evening are usually best for dogs</li>
        </ul>
      </div>

      {/* Powered by Supabase */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Powered by</span>
          <a 
            href="https://supabase.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-600 dark:text-green-400">
              <path d="M21.362 9.354H12.52l-.76-1.52a.5.5 0 0 0-.9 0l-.76 1.52H1.638a.5.5 0 0 0-.447.724L7.447 20.17a.5.5 0 0 0 .894 0l6.256-10.092a.5.5 0 0 0-.447-.724ZM21.362 14.646H12.52l-.76 1.52a.5.5 0 0 1-.9 0l-.76-1.52H1.638a.5.5 0 0 1-.447-.724L7.447 3.83a.5.5 0 0 1 .894 0l6.256 10.092a.5.5 0 0 1-.447.724Z"/>
            </svg>
            <span className="font-medium">Supabase</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
