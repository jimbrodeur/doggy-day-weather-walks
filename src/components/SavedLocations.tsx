
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Plus, Home, Edit2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SavedLocation {
  id: string;
  location: string;
  name: string | null;
  is_home: boolean;
}

interface SavedLocationsProps {
  onSelectLocation: (location: string) => void;
  currentLocation: string;
}

export const SavedLocations: React.FC<SavedLocationsProps> = ({ onSelectLocation, currentLocation }) => {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [makeHome, setMakeHome] = useState(false);
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
      // If making this home, first unset all other home locations
      if (makeHome) {
        await supabase
          .from('saved_locations')
          .update({ is_home: false })
          .eq('user_id', user.id);
      }

      const { error } = await supabase
        .from('saved_locations')
        .insert({
          user_id: user.id,
          location: newLocation.trim(),
          name: newLocationName.trim() || null,
          is_home: makeHome
        });

      if (error) throw error;
      
      // Auto-select the new location
      onSelectLocation(newLocation.trim());
      
      setNewLocation('');
      setNewLocationName('');
      setMakeHome(false);
      setShowAddForm(false);
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

  if (!user) return null;

  const homeLocation = savedLocations.find(loc => loc.is_home);

  return (
    <div className="mb-6">
      {/* Current Location Display */}
      {(currentLocation || homeLocation) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current: {currentLocation || homeLocation?.location}
            </span>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Location
          </Button>
        </div>
      )}

      {/* Saved Locations Quick Access */}
      {savedLocations.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {savedLocations.map((location) => (
            <Button
              key={location.id}
              onClick={() => onSelectLocation(location.location)}
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 ${
                location.is_home ? 'border-green-500 text-green-700 dark:text-green-400' : ''
              }`}
            >
              {location.is_home && <Home className="h-3 w-3" />}
              {location.name || location.location}
            </Button>
          ))}
        </div>
      )}

      {/* Add New Location Form */}
      {showAddForm && (
        <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Add New Location</h3>
            <Button
              onClick={() => {
                setShowAddForm(false);
                setNewLocation('');
                setNewLocationName('');
                setMakeHome(false);
              }}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <Input
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Enter zip code or city, state"
              onKeyPress={(e) => e.key === 'Enter' && saveLocation()}
            />
            <Input
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="Name this location (optional)"
              onKeyPress={(e) => e.key === 'Enter' && saveLocation()}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="makeHome"
                checked={makeHome}
                onChange={(e) => setMakeHome(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="makeHome" className="text-sm text-gray-600 dark:text-gray-400">
                Set as home location
              </label>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={saveLocation} 
                disabled={loading || !newLocation.trim()}
                className="flex-1"
              >
                {loading ? 'Saving...' : 'Save Location'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Show add button if no locations and form is not shown */}
      {savedLocations.length === 0 && !showAddForm && (
        <Button
          onClick={() => setShowAddForm(true)}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Your First Location
        </Button>
      )}
    </div>
  );
};
