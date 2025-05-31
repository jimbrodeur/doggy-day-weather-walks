
import React, { useState, useEffect } from 'react';
import { WeatherInput } from '@/components/WeatherInput';
import { WeatherDisplay } from '@/components/WeatherDisplay';
import { WalkingRecommendations } from '@/components/WalkingRecommendations';
import { CommentsSection } from '@/components/CommentsSection';
import { DogProfile } from '@/components/DogProfile';
import { SavedLocations } from '@/components/SavedLocations';
import { useWeatherData } from '@/hooks/useWeatherData';
import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [location, setLocation] = useState('');
  const { weatherData, loading, error, fetchWeather } = useWeatherData();
  const { user } = useAuth();

  // Load user's saved zip code when they log in
  useEffect(() => {
    const loadUserLocation = async () => {
      if (user) {
        try {
          // First try to get their home location
          const { data: homeLocation } = await supabase
            .from('saved_locations')
            .select('location')
            .eq('user_id', user.id)
            .eq('is_home', true)
            .single();

          if (homeLocation) {
            setLocation(homeLocation.location);
            fetchWeather(homeLocation.location);
            return;
          }

          // If no home location, try to get their last used zip code
          const { data: userData } = await supabase
            .from('user_table')
            .select('zip_code')
            .eq('user_id', user.id)
            .single();

          if (userData?.zip_code) {
            setLocation(userData.zip_code);
            fetchWeather(userData.zip_code);
          }
        } catch (error) {
          console.error('Error loading user location:', error);
        }
      }
    };

    loadUserLocation();
  }, [user]);

  const handleLocationSubmit = (loc: string) => {
    setLocation(loc);
    fetchWeather(loc);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-4">
          {user && <DogProfile zipCode={location} />}
          <div className="flex-1"></div>
          <AuthButton />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            🐕 Pup Walk Weather 🌤️
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Enter your zip code or city to get personalized recommendations for the best times to walk your furry friend today!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {user && (
            <SavedLocations 
              onSelectLocation={handleLocationSubmit}
              currentLocation={location}
            />
          )}
          
          <WeatherInput onSubmit={handleLocationSubmit} loading={loading} />
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-center">
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
