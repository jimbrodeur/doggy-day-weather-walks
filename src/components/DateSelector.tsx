
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface DateSelectorProps {
  onDateChange: (date: string | undefined) => void;
  selectedDate?: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ onDateChange, selectedDate }) => {
  const generateDateOptions = () => {
    const options = [];
    const today = new Date();
    
    // Add "Today" option with 'today' as value instead of empty string
    options.push({
      value: 'today',
      label: 'Today',
      date: today.toDateString()
    });
    
    // Add next 6 days
    for (let i = 1; i <= 6; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      options.push({
        value: date.toISOString().split('T')[0], // YYYY-MM-DD format
        label: `${dayName}, ${monthDay}`,
        date: date.toDateString()
      });
    }
    
    return options;
  };

  const dateOptions = generateDateOptions();

  const handleValueChange = (value: string) => {
    // Convert 'today' back to undefined for the parent component
    if (value === 'today') {
      onDateChange(undefined);
    } else {
      onDateChange(value);
    }
  };

  // Convert selectedDate for display - if undefined, show 'today'
  const displayValue = selectedDate === undefined ? 'today' : selectedDate;

  return (
    <div className="w-full max-w-xs mx-auto mb-4">
      <Select 
        value={displayValue} 
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <SelectValue placeholder="Select date" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {dateOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
