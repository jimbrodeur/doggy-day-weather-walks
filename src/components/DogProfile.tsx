
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Plus, X, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface DogProfileProps {
  zipCode?: string;
  onDogsUpdate?: (dogs: DogEntry[]) => void;
}

interface DogEntry {
  id: string;
  dog_name: string;
  zip_code?: string;
}

export const DogProfile: React.FC<DogProfileProps> = ({ zipCode, onDogsUpdate }) => {
  const [dogEntries, setDogEntries] = useState<DogEntry[]>([]);
  const [newDogName, setNewDogName] = useState('');
  const [editingDog, setEditingDog] = useState<DogEntry | null>(null);
  const [editName, setEditName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDogEntries();
    }
  }, [user]);

  const fetchDogEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_table')
        .select('id, dog_name, zip_code')
        .eq('user_id', user.id);

      if (error) throw error;

      // Filter out entries with empty dog names
      const entries = data?.filter(entry => entry.dog_name && entry.dog_name.trim()) || [];
      setDogEntries(entries);
      
      // Notify parent component of the updated dogs
      if (onDogsUpdate) {
        onDogsUpdate(entries);
      }
    } catch (error) {
      console.error('Error fetching dog entries:', error);
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
      fetchDogEntries();
    } catch (error) {
      console.error('Error adding dog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDog || !editName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_table')
        .update({ dog_name: editName.trim() })
        .eq('id', editingDog.id);

      if (error) throw error;

      setEditingDog(null);
      setEditName('');
      fetchDogEntries();
    } catch (error) {
      console.error('Error updating dog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDog = async (dogEntry: DogEntry) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_table')
        .delete()
        .eq('id', dogEntry.id);

      if (error) throw error;
      fetchDogEntries();
    } catch (error) {
      console.error('Error removing dog:', error);
    }
  };

  const startEdit = (dogEntry: DogEntry) => {
    setEditingDog(dogEntry);
    setEditName(dogEntry.dog_name);
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">My Dogs</h3>
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

      {dogEntries.length === 0 && !isAdding && (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-2">
          Add your dog's name to personalize your experience!
        </p>
      )}

      <div className="space-y-2">
        {dogEntries.map((dogEntry) => (
          <div key={dogEntry.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="font-medium text-gray-800 dark:text-gray-200">🐕 {dogEntry.dog_name}</span>
            <div className="flex gap-1">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(dogEntry)}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-blue-500"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Dog Name</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditDog} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Dog's name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={loading || !editName.trim()}
                        className="flex-1"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingDog(null)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveDog(dogEntry)}
                className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
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
