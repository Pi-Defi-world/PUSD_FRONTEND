'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface NumericInputProps {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  secondaryValue?: string;
  secondaryCurrency?: string;
  maxValue?: number;
  onMax?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  size?: 'default' | 'lg';
}

export function NumericInput({
  value,
  onChange,
  currency = 'PUSD',
  secondaryValue,
  secondaryCurrency,
  maxValue,
  onMax,
  disabled = false,
  placeholder = '0',
  className,
  size = 'lg',
}: NumericInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const displayValue = value || placeholder;
  const isPlaceholder = !value;

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center py-8 cursor-text transition-all duration-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleContainerClick}
    >
      {/* Main amount display */}
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'font-mono font-semibold tracking-tight transition-all duration-200',
            size === 'lg' ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl',
            isPlaceholder ? 'text-muted-foreground/40' : 'text-foreground'
          )}
        >
          {displayValue}
        </span>
        <span
          className={cn(
            'font-medium text-muted-foreground',
            size === 'lg' ? 'text-xl' : 'text-lg'
          )}
        >
          {currency}
        </span>
      </div>

      {/* Secondary conversion value */}
      {secondaryValue && (
        <div className="mt-2 text-sm text-muted-foreground font-mono">
          {secondaryValue} {secondaryCurrency}
        </div>
      )}

      {/* Hidden input for actual value */}
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-text"
        aria-label={`Enter ${currency} amount`}
      />

      {/* Max button */}
      {onMax && maxValue !== undefined && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMax();
          }}
          disabled={disabled}
          className={cn(
            'mt-4 px-4 py-1.5 text-xs font-medium rounded-full',
            'bg-secondary text-secondary-foreground',
            'hover:bg-secondary/80 transition-colors duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          Max: {maxValue.toFixed(2)}
        </button>
      )}
    </div>
  );
}
