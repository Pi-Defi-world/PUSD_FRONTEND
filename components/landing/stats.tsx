'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';
import { useStatsStore } from '@/lib/store/priceStore';
import { apiClient } from '@/lib/api/client';

export function LandingStats() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  const { stats, fetchStats } = useStatsStore();
  const [collateral, setCollateral] = useState({ piRatio: 100, backingRatio: 120 });

  useEffect(() => {
    if (!stats) fetchStats();

    const loadReserve = async () => {
      try {
        const res = await apiClient.getReserveStatus();
        if (res.success && res.data) {
          const status = res.data as any;
          const backingRatio = status.backingRatio || status.collateralizationRatio || 120;
          const piRatio = 100;
          setCollateral({ piRatio, backingRatio });
        }
      } catch (e) {
        // Fallback to defaults
      }
    };
    
    loadReserve();
  }, [stats, fetchStats]);

  const circulation = stats ? parseFloat(stats.totalPUSDSupply) : 0;
  const backingRatio = stats ? parseFloat(stats.backingRatio) : 100;
  const feeRate = stats?.mintFeeRate !== undefined ? stats.mintFeeRate * 100 : 0.3;

  const statsList = [
    { label: 'PUSD Value', value: 1, prefix: '$', decimals: 2, subtext: 'Always' },
    { label: 'In circulation', value: circulation, suffix: '', decimals: 0, subtext: 'PUSD' },
    { label: 'Backed', value: backingRatio, suffix: '%', decimals: 0, subtext: 'Reserve ratio' },
    { label: 'Fee', value: feeRate, suffix: '%', decimals: 1, subtext: 'Per transaction' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="stats" className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-accent mb-4 uppercase tracking-wider">Numbers</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
            See everything in real time
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-4xl mx-auto">
          {statsList.map((stat, index) => (
            <div 
              key={stat.label}
              className={cn(
                "text-center space-y-2 transition-all duration-700",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <p className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {isVisible ? (
                  <AnimatedCounter 
                    value={stat.value} 
                    prefix={stat.prefix || ''} 
                    suffix={stat.suffix || ''} 
                    decimals={stat.decimals}
                    duration={1500}
                  />
                ) : (
                  '-'
                )}
              </p>
              <p className="text-sm font-medium text-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.subtext}</p>
            </div>
          ))}
        </div>

        {/* Stability image strip */}
        <div
          className={cn(
            "mt-16 max-w-3xl mx-auto rounded-2xl overflow-hidden border border-border transition-all duration-700 delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="relative h-36">
            <Image
              src="/images/stability-visual.jpg"
              alt="PUSD price stability at $1.00"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price history</p>
                <p className="text-2xl font-bold font-mono">$1.0000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reserve breakdown */}
        <div 
          className={cn(
            "mt-8 max-w-lg mx-auto transition-all duration-700 delay-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium">What backs PUSD</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Live
              </span>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pi Reserve</span>
                  <span className="font-mono font-medium">100%</span>
                </div>
                <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-accent transition-all duration-1000 ease-out"
                    style={{ width: isVisible ? '100%' : '0%', transitionDelay: '600ms' }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Collateralization</span>
                  <span className="font-mono font-medium">{collateral.backingRatio.toFixed(0)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-success/60 transition-all duration-1000 ease-out"
                    style={{ width: isVisible ? `${Math.min(collateral.backingRatio, 200)}%` : '0%', transitionDelay: '800ms' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
