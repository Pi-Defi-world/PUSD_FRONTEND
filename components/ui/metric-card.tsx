'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  prefix?: string;
  suffix?: string;
  variant?: 'default' | 'accent' | 'muted';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  prefix,
  suffix,
  variant = 'default',
  size = 'default',
  className,
}: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const isNeutral = change === 0 || change === undefined;

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-border p-4 transition-all duration-200',
        variant === 'default' && 'bg-card',
        variant === 'accent' && 'bg-accent/10 border-accent/20',
        variant === 'muted' && 'bg-muted/50',
        className
      )}
    >
      <span
        className={cn(
          'text-muted-foreground font-medium',
          size === 'sm' && 'text-xs',
          size === 'default' && 'text-sm',
          size === 'lg' && 'text-sm'
        )}
      >
        {label}
      </span>
      
      <div className="flex items-baseline gap-1 mt-1">
        {prefix && (
          <span
            className={cn(
              'text-muted-foreground font-medium',
              size === 'sm' && 'text-sm',
              size === 'default' && 'text-base',
              size === 'lg' && 'text-lg'
            )}
          >
            {prefix}
          </span>
        )}
        <span
          className={cn(
            'font-mono font-semibold tracking-tight text-foreground',
            size === 'sm' && 'text-lg',
            size === 'default' && 'text-2xl',
            size === 'lg' && 'text-3xl'
          )}
        >
          {value}
        </span>
        {suffix && (
          <span
            className={cn(
              'text-muted-foreground font-medium',
              size === 'sm' && 'text-xs',
              size === 'default' && 'text-sm',
              size === 'lg' && 'text-base'
            )}
          >
            {suffix}
          </span>
        )}
      </div>

      {(change !== undefined || changeLabel) && (
        <div className="flex items-center gap-1 mt-2">
          {change !== undefined && (
            <>
              {isPositive && <TrendingUp className="h-3 w-3 text-success" />}
              {isNegative && <TrendingDown className="h-3 w-3 text-destructive" />}
              {isNeutral && <Minus className="h-3 w-3 text-muted-foreground" />}
              <span
                className={cn(
                  'text-xs font-medium',
                  isPositive && 'text-success',
                  isNegative && 'text-destructive',
                  isNeutral && 'text-muted-foreground'
                )}
              >
                {isPositive && '+'}
                {change.toFixed(2)}%
              </span>
            </>
          )}
          {changeLabel && (
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
