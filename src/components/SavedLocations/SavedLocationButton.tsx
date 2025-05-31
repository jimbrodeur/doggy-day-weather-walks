
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

interface SavedLocation {
  id: string;
  location: string;
  name: string | null;
  is_home: boolean;
}

interface SavedLocationButtonProps {
  location: SavedLocation;
  onSelect: (location: string) => void;
}

export const SavedLocationButton: React.FC<SavedLocationButtonProps> = ({ location, onSelect }) => {
  return (
    <Button
      onClick={() => onSelect(location.location)}
      variant="outline"
      size="sm"
      className={`flex items-center gap-1 ${
        location.is_home ? 'border-green-500 text-green-700 dark:text-green-400' : ''
      }`}
    >
      {location.is_home && <Home className="h-3 w-3" />}
      {location.name || location.location}
    </Button>
  );
};
