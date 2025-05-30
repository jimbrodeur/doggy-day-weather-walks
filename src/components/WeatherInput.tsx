
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface WeatherInputProps {
  onSubmit: (location: string) => void;
  loading: boolean;
}

export const WeatherInput: React.FC<WeatherInputProps> = ({ onSubmit, loading }) => {
  const [location, setLocation] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSubmit(location.trim());
      
      // Save location to user profile if logged in
      if (user) {
        try {
          const { data: existingUser } = await supabase
            .from('user_table')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

          if (existingUser) {
            await supabase
              .from('user_table')
              .update({ zip_code: location.trim() })
              .eq('user_id', user.id);
          } else {
            await supabase
              .from('user_table')
              .insert({ 
                user_id: user.id, 
                zip_code: location.trim() 
              });
          }
        } catch (error) {
          console.error('Error saving location:', error);
        }
      }
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding to get location from coordinates
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=31256404362c4ef5b51180059253005&q=${latitude},${longitude}`
          );
          
          if (response.ok) {
            const data = await response.json();
            // Use city, state format for better user experience
            const locationString = `${data.location.name}, ${data.location.region}`;
            setLocation(locationString);
            onSubmit(locationString);
          } else {
            throw new Error('Failed to get location data');
          }
        } catch (error) {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter your location manually.');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to access your location. Please enter your location manually.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Enter zip code or city, state"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1"
          disabled={loading}
        />
        <Button 
          type="submit" 
          disabled={loading || !location.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Get Weather'
          )}
        </Button>
      </form>
      
      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          onClick={handleUseLocation}
          disabled={locationLoading || loading}
          className="flex items-center gap-2"
        >
          {locationLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          {locationLoading ? 'Getting Location...' : 'Use My Location'}
        </Button>
      </div>
    </div>
  );
};
