
import { useState } from 'react';
import { WeatherData } from '@/types/weather';
import { weatherService } from '@/services/weatherService';

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (location: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await weatherService.getWeatherByLocation(location);
      setWeatherData(data);
    } catch (err) {
      setError('Unable to fetch weather data. Please check your location and try again.');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    weatherData,
    loading,
    error,
    fetchWeather
  };
};
