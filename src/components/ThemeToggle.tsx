
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
    >
      {isDark ? '☀️' : '🌙'}
      {isDark ? 'Light' : 'Dark'}
    </Button>
  );
};

export default ThemeToggle;
