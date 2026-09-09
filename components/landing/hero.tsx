'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStatsStore } from '@/lib/store/priceStore';
import { cn } from '@/lib/utils';

export function LandingHero() {
  const [mounted, setMounted] = useState(false);
  const { stats, fetchStats } = useStatsStore();

  useEffect(() => {
    setMounted(true);
    if (!stats) {
      fetchStats();
    }
  }, [stats, fetchStats]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />

      <div className="relative container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 text-sm mb-8 transition-all duration-700",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-muted-foreground">Now live on Pi Network</span>
              </div>

              {/* Headline */}
              <h1
                className={cn(
                  "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-6 transition-all duration-700 delay-100",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                <span className="text-foreground">The stablecoin</span>
                <br />
                <span className="text-muted-foreground/70">for Pi Network</span>
              </h1>

              {/* Subheadline */}
              <p
                className={cn(
                  "text-lg text-muted-foreground leading-relaxed mb-10 transition-all duration-700 delay-200 max-w-md mx-auto lg:mx-0",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                PUSD is fully backed, pegged to the US dollar.
                Mint, redeem, and transact with confidence.
              </p>

              {/* CTA Buttons */}
              <div
                className={cn(
                  "flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 transition-all duration-700 delay-300",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                <Button size="lg" asChild className="w-full sm:w-auto text-base px-8 h-11 rounded-lg">
                  <Link href="/dashboard">
                    Launch App
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-base px-8 h-11 rounded-lg">
                  <Link href="/stats">
                    See How It Works
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div
                className={cn(
                  "mt-12 flex items-center justify-center lg:justify-start gap-6 sm:gap-10 text-sm transition-all duration-700 delay-500",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono text-xl font-semibold text-foreground">$1</span>
                  <span className="text-muted-foreground text-xs">Always</span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono text-xl font-semibold text-foreground">
                    {stats?.backingRatio || '100%'}
                  </span>
                  <span className="text-muted-foreground text-xs">Backed</span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono text-xl font-semibold text-foreground">
                    {stats?.mintFeeRate !== undefined ? `${(stats.mintFeeRate * 100).toFixed(1)}%` : '0.3%'}
                  </span>
                  <span className="text-muted-foreground text-xs">Flat fee</span>
                </div>
              </div>
            </div>

            {/* Right: App preview image */}
            <div
              className={cn(
                "relative transition-all duration-1000 delay-500",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
            >
              <div className="relative">
                {/* Glow */}
                <div className="absolute -inset-6 bg-accent/8 rounded-3xl blur-3xl" />
                {/* Image */}
                <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-black/20">
                  <Image
                    src="/images/hero-app-preview.jpg"
                    alt="PUSD app dashboard preview"
                    width={560}
                    height={420}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
                {/* Floating stat badge */}
                <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl">
                  <p className="text-xs text-muted-foreground mb-0.5">PUSD Price</p>
                  <p className="text-lg font-bold font-mono">$1.0000</p>
                </div>
                <div className="absolute -top-4 -right-4 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <p className="text-xs font-medium text-accent">{stats?.backingRatio || '100%'} Backed</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
