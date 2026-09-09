'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2000,
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const elementRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateValue(0, value, duration);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  const animateValue = (start: number, end: number, duration: number) => {
    const startTime = performance.now();
    
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      
      const current = start + (end - start) * easedProgress;
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const formatValue = (val: number) => {
    if (val >= 1000000000) {
      return (val / 1000000000).toFixed(decimals) + 'B';
    }
    if (val >= 1000000) {
      return (val / 1000000).toFixed(decimals) + 'M';
    }
    if (val >= 1000) {
      return (val / 1000).toFixed(decimals) + 'K';
    }
    return val.toFixed(decimals);
  };

  return (
    <span ref={elementRef} className={cn('font-mono tabular-nums', className)}>
      {prefix}
      {formatValue(displayValue)}
      {suffix}
    </span>
  );
}
