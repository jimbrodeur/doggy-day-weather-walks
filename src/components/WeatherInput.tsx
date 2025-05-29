
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface WeatherInputProps {
  onSubmit: (zipCode: string) => void;
  loading: boolean;
}

export const WeatherInput: React.FC<WeatherInputProps> = ({ onSubmit, loading }) => {
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState('');

  const validateZipCode = (zip: string) => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!zipCode.trim()) {
      setError('Please enter a zip code');
      return;
    }

    if (!validateZipCode(zipCode.trim())) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }

    onSubmit(zipCode.trim());
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Enter your zip code (e.g., 90210)"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="pl-10 h-12 text-lg"
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {loading ? 'Getting Weather...' : 'Get Walking Times'}
          </Button>
        </div>
      </form>
    </div>
  );
};
