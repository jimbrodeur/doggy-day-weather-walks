
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AuthButton = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Welcome, {user.email}</span>
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
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => navigate('/auth')}
    >
      Sign In
    </Button>
  );
};

export default AuthButton;
