
import React, { useState } from 'react';
import { WeatherInput } from '@/components/WeatherInput';
import { WeatherDisplay } from '@/components/WeatherDisplay';
import { WalkingRecommendations } from '@/components/WalkingRecommendations';
import { CommentsSection } from '@/components/CommentsSection';
import { DogProfile } from '@/components/DogProfile';
import { useWeatherData } from '@/hooks/useWeatherData';
import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [location, setLocation] = useState('');
  const { weatherData, loading, error, fetchWeather } = useWeatherData();
  const { user } = useAuth();

  const handleLocationSubmit = (loc: string) => {
    setLocation(loc);
    fetchWeather(loc);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-4">
          {user && <DogProfile zipCode={location} />}
          <div className="flex-1"></div>
          <AuthButton />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🐕 Pup Walk Weather 🌤️
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your zip code or city to get personalized recommendations for the best times to walk your furry friend today!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <WeatherInput onSubmit={handleLocationSubmit} loading={loading} />
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
              {error}
            </div>
          )}

          {weatherData && (
            <div className="mt-8 space-y-6">
              <WeatherDisplay weatherData={weatherData} />
              <WalkingRecommendations weatherData={weatherData} />
              <CommentsSection zipCode={location} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
