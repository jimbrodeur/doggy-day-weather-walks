
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SavedLocationButton } from './SavedLocations/SavedLocationButton';
import { AddLocationForm } from './SavedLocations/AddLocationForm';

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

  const handleLocationAdded = (location: string) => {
    onSelectLocation(location);
    setShowAddForm(false);
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
            <SavedLocationButton
              key={location.id}
              location={location}
              onSelect={onSelectLocation}
            />
          ))}
        </div>
      )}

      {/* Add New Location Form */}
      {showAddForm && (
        <AddLocationForm
          onClose={() => setShowAddForm(false)}
          onLocationAdded={handleLocationAdded}
          onRefresh={fetchSavedLocations}
        />
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
