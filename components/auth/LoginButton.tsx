"use client";

import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';

export function LoginButton() {
  const { user, signInWithGoogle, signOut } = useAuth();

  if (user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={signOut}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign Out</span>
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={signInWithGoogle}
      className="flex items-center gap-2"
    >
      <LogIn className="h-4 w-4" />
      <span>Sign In with Google</span>
    </Button>
  );
} 