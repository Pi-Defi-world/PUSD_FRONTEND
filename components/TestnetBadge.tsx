'use client';

import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestnetBadgeProps {
  className?: string;
}

export function TestnetBadge({ className }: TestnetBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn("bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800", className)}
    >
      <AlertTriangle className="mr-1 h-3 w-3" />
      Testnet Mode
    </Badge>
  );
}

