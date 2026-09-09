'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface SuccessAnimationProps {
  title: string;
  subtitle?: string;
  amount?: string;
  currency?: string;
  onComplete?: () => void;
  className?: string;
}

export function SuccessAnimation({
  title,
  subtitle,
  amount,
  currency,
  onComplete,
  className,
}: SuccessAnimationProps) {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 animate-fade-in',
        className
      )}
    >
      {/* Success icon with animation */}
      <div className="relative mb-6">
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-success/10 scale-150" />
        
        {/* Icon */}
        <div className="relative w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-success animate-scale-in" />
        </div>
      </div>

      {/* Amount display */}
      {amount && (
        <div className="mb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <span className="text-4xl font-mono font-bold text-foreground">
            {amount}
          </span>
          {currency && (
            <span className="text-xl font-medium text-muted-foreground ml-2">
              {currency}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h3
        className="text-xl font-semibold text-foreground mb-1 animate-slide-up"
        style={{ animationDelay: '150ms' }}
      >
        {title}
      </h3>

      {/* Subtitle */}
      {subtitle && (
        <p
          className="text-sm text-muted-foreground text-center animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
