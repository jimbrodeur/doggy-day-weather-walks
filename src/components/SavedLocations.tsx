
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Plus, Trash2, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SavedLocation {
  id: string;
  location: string;
  is_home: boolean;
}

interface SavedLocationsProps {
  onSelectLocation: (location: string) => void;
  currentLocation: string;
}

export const SavedLocations: React.FC<SavedLocationsProps> = ({ onSelectLocation, currentLocation }) => {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSavedLocations();
    }
  }, [user]);

  const fetchSavedLocations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_locations')
        .select('*')
        .eq('user_id', user.id)
        .order('is_home', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSavedLocations(data || []);
    } catch (error) {
      console.error('Error fetching saved locations:', error);
    }
  };

  const saveLocation = async () => {
    if (!user || !newLocation.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('saved_locations')
        .insert({
          user_id: user.id,
          location: newLocation.trim(),
          is_home: false
        });

      if (error) throw error;
      
      setNewLocation('');
      fetchSavedLocations();
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setLoading(false);
    }
  };

  const setAsHome = async (locationId: string) => {
    if (!user) return;

    try {
      // First, unset all other home locations
      await supabase
        .from('saved_locations')
        .update({ is_home: false })
        .eq('user_id', user.id);

      // Then set this one as home
      const { error } = await supabase
        .from('saved_locations')
        .update({ is_home: true })
        .eq('id', locationId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      fetchSavedLocations();
    } catch (error) {
      console.error('Error setting home location:', error);
    }
  };

  const deleteLocation = async (locationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_locations')
        .delete()
        .eq('id', locationId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      fetchSavedLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  const goToHomeLocation = () => {
    const homeLocation = savedLocations.find(loc => loc.is_home);
    if (homeLocation) {
      onSelectLocation(homeLocation.location);
    }
  };

  if (!user) return null;

  const homeLocation = savedLocations.find(loc => loc.is_home);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Saved Locations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Home Location Button */}
        {homeLocation && (
          <Button
            onClick={goToHomeLocation}
            variant="outline"
            className="w-full flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
          >
            <Home className="h-4 w-4" />
            Go to Home: {homeLocation.location}
          </Button>
        )}

        {/* Add New Location */}
        <div className="flex gap-2">
          <Input
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Add zip code or city, state"
            onKeyPress={(e) => e.key === 'Enter' && saveLocation()}
          />
          <Button onClick={saveLocation} disabled={loading || !newLocation.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Saved Locations List */}
        {savedLocations.length > 0 && (
          <div className="space-y-2">
            {savedLocations.map((location) => (
              <div key={location.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  {location.is_home && <Home className="h-4 w-4 text-green-600" />}
                  <span className={location.is_home ? 'font-semibold text-green-700' : ''}>
                    {location.location}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSelectLocation(location.location)}
                  >
                    Use
                  </Button>
                  {!location.is_home && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setAsHome(location.id)}
                      title="Set as home"
                    >
                      <Home className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteLocation(location.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
