"use client";

import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginButtonProps {
  className?: string;
}

export function LoginButton({ className }: LoginButtonProps = {}) {
  const { user, signInWithGoogle, signOut } = useAuth();

  if (user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={signOut}
        className={cn("flex items-center gap-2", className)}
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
      className={cn("flex items-center gap-2", className)}
    >
      <LogIn className="h-4 w-4" />
      <span>Sign In with Google</span>
    </Button>
  );
} 