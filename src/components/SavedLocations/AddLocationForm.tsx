
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AddLocationFormProps {
  onClose: () => void;
  onLocationAdded: (location: string) => void;
  onRefresh: () => void;
}

export const AddLocationForm: React.FC<AddLocationFormProps> = ({ 
  onClose, 
  onLocationAdded, 
  onRefresh 
}) => {
  const [newLocation, setNewLocation] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [makeHome, setMakeHome] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
      
      onLocationAdded(newLocation.trim());
      onClose();
      onRefresh();
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Add New Location</h3>
        <Button onClick={onClose} variant="ghost" size="sm">
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
  );
};
