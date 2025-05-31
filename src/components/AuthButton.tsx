
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const AuthButton = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <span className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user.email}</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={signOut}
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <ThemeToggle />
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate('/auth')}
      >
        Sign In
      </Button>
    </div>
  );
};

export default AuthButton;
