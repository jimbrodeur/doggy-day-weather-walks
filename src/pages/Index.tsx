
import React, { useState } from 'react';
import { WeatherInput } from '@/components/WeatherInput';
import { WeatherDisplay } from '@/components/WeatherDisplay';
import { WalkingRecommendations } from '@/components/WalkingRecommendations';
import { useWeatherData } from '@/hooks/useWeatherData';

const Index = () => {
  const [zipCode, setZipCode] = useState('');
  const { weatherData, loading, error, fetchWeather } = useWeatherData();

  const handleZipCodeSubmit = (zip: string) => {
    setZipCode(zip);
    fetchWeather(zip);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🐕 Pup Walk Weather 🌤️
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your zip code to get personalized recommendations for the best times to walk your furry friend today!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <WeatherInput onSubmit={handleZipCodeSubmit} loading={loading} />
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
              {error}
            </div>
          )}

          {weatherData && (
            <div className="mt-8 space-y-6">
              <WeatherDisplay weatherData={weatherData} />
              <WalkingRecommendations weatherData={weatherData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
