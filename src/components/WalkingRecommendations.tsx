
import React from 'react';
import { WeatherData, WalkingRecommendation } from '@/types/weather';
import { generateWalkingRecommendations } from '@/utils/walkingLogic';
import { Umbrella, CloudSun, CloudRain, Sun, Cloudy, CloudSnow, Zap } from 'lucide-react';

interface WalkingRecommendationsProps {
  weatherData: WeatherData;
}

export const WalkingRecommendations: React.FC<WalkingRecommendationsProps> = ({ weatherData }) => {
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
    if (precipitation > 50) {
      return <CloudRain className="h-5 w-5 text-blue-500" />;
    }
    
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'partly-cloudy':
        return <CloudSun className="h-5 w-5 text-yellow-400" />;
      case 'cloudy':
        return <Cloudy className="h-5 w-5 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      case 'snow':
        return <CloudSnow className="h-5 w-5 text-blue-300" />;
      case 'thunderstorm':
        return <Zap className="h-5 w-5 text-purple-500" />;
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />;
    }
  };

  // Generate weather summary
  const getWeatherSummary = () => {
    const avgTemp = Math.round(weatherData.hourlyForecast.reduce((sum, hour) => sum + hour.temperature, 0) / weatherData.hourlyForecast.length);
    const maxPrecipitation = Math.max(...weatherData.hourlyForecast.map(h => h.precipitation));
    const hotHours = weatherData.hourlyForecast.filter(h => h.temperature > 80);
    
    let summary = `Today's forecast: ${avgTemp}°F average with `;
    
    if (maxPrecipitation > 60) {
      summary += "heavy rain expected ☔";
    } else if (maxPrecipitation > 30) {
      summary += "possible showers 🌧️";
    } else if (maxPrecipitation > 10) {
      summary += "light rain possible ⛅";
    } else {
      summary += "mostly dry conditions ☀️";
    }
    
    // Add walking advice
    if (hotHours.length > 4) {
      summary += ". Avoid midday walks due to heat - early morning and evening are best! 🐕";
    } else if (weatherData.temperature < 32) {
      summary += ". Bundle up your pup for chilly walks! 🧥";
    } else {
      summary += ". Great day for adventures with your furry friend! 🎾";
    }
    
    return summary;
  };

  // Check for rain warnings
  const hasRainWarnings = recommendations.some(rec => 
    rec.reason.toLowerCase().includes('rain') || 
    weatherData.hourlyForecast.some(hour => hour.precipitation > 30)
  );

  const getRainMessage = () => {
    const maxPrecipitation = Math.max(...weatherData.hourlyForecast.map(h => h.precipitation));
    if (maxPrecipitation > 60) {
      return "☔ Looks like heavy rain is expected! Your pup might prefer indoor playtime today. If you must go out, bring that umbrella and maybe some paw protection!";
    } else if (maxPrecipitation > 30) {
      return "🌧️ There's a good chance of rain today! Pack an umbrella and maybe keep walks shorter. Your furry friend will thank you for staying dry!";
    } else if (maxPrecipitation > 10) {
      return "⛅ Light rain possible - might want to grab an umbrella just in case. Perfect weather for a quick adventure with your pup!";
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
        🐕 Best Walking Times Today
      </h2>
      
      {/* Weather Summary */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-blue-800 dark:text-blue-300 font-medium text-center">
          {getWeatherSummary()}
        </p>
      </div>
      
      {/* Rain Warning */}
      {hasRainWarnings && getRainMessage() && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Umbrella className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-blue-800 dark:text-blue-300 font-medium">
              {getRainMessage()}
            </p>
          </div>
        </div>
      )}
      
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
          const hourData = weatherData.hourlyForecast[index] || { precipitation: 0, condition: weatherData.condition };
          return (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getScoreColor(rec.score)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(hourData.condition || weatherData.condition, hourData.precipitation)}
                  <span className="text-lg font-semibold">{rec.time}</span>
                  {hourData.precipitation > 20 && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                      {hourData.precipitation}% rain
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{rec.score}</div>
                  <div className="text-xs font-medium">{getScoreLabel(rec.score)}</div>
                </div>
              </div>
              <p className="text-sm opacity-90">{rec.reason}</p>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Pro Tips for Dog Walking:</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Bring water for both you and your pup on hot days</li>
          <li>• Check pavement temperature with your hand before walks</li>
          <li>• Consider shorter walks during extreme weather</li>
          <li>• Early morning and evening are usually best for dogs</li>
        </ul>
      </div>
    </div>
  );
};
