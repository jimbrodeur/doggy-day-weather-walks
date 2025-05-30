
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Plus, X } from 'lucide-react';

interface DogProfileProps {
  zipCode?: string;
}

export const DogProfile: React.FC<DogProfileProps> = ({ zipCode }) => {
  const [dogNames, setDogNames] = useState<string[]>([]);
  const [newDogName, setNewDogName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDogNames();
    }
  }, [user]);

  const fetchDogNames = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_table')
        .select('dog_name')
        .eq('user_id', user.id);

      if (error) throw error;

      // Extract dog names and filter out empty ones
      const names = data
        ?.map(row => row.dog_name)
        .filter(name => name && name.trim()) || [];
      
      setDogNames(names);
    } catch (error) {
      console.error('Error fetching dog names:', error);
    }
  };

  const handleAddDog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newDogName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_table')
        .insert({
          user_id: user.id,
          dog_name: newDogName.trim(),
          zip_code: zipCode || null
        });

      if (error) throw error;

      setNewDogName('');
      setIsAdding(false);
      fetchDogNames();
    } catch (error) {
      console.error('Error adding dog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDog = async (dogName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_table')
        .delete()
        .eq('user_id', user.id)
        .eq('dog_name', dogName);

      if (error) throw error;
      fetchDogNames();
    } catch (error) {
      console.error('Error removing dog:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-gray-800">My Dogs</h3>
        </div>
        {!isAdding && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Dog
          </Button>
        )}
      </div>

      {dogNames.length === 0 && !isAdding && (
        <p className="text-gray-500 text-sm text-center py-2">
          Add your dog's name to personalize your experience!
        </p>
      )}

      <div className="space-y-2">
        {dogNames.map((name, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-800">🐕 {name}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRemoveDog(name)}
              className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {isAdding && (
          <form onSubmit={handleAddDog} className="flex gap-2">
            <Input
              type="text"
              placeholder="Dog's name"
              value={newDogName}
              onChange={(e) => setNewDogName(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              disabled={loading || !newDogName.trim()}
            >
              {loading ? '...' : 'Add'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewDogName('');
              }}
            >
              Cancel
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
