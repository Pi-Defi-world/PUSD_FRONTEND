'use client';

import Image from 'next/image';
import { Shield, Zap, Lock, BarChart3 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Shield,
    title: 'Always backed',
    description: 'Every PUSD is fully backed, one to one. Your money stays safe.',
    image: '/images/reserve-visual.jpg',
    imageAlt: 'Reserve backing illustration',
  },
  {
    icon: Zap,
    title: 'Instant',
    description: 'Get PUSD in seconds. Cash out anytime. No waiting, no approvals.',
    image: null,
    imageAlt: '',
  },
  {
    icon: Lock,
    title: 'Built for Pi',
    description: 'Designed from the ground up for Pi Network. Works right in your Pi Browser.',
    image: '/images/pi-network-visual.jpg',
    imageAlt: 'Pi Network illustration',
  },
  {
    icon: BarChart3,
    title: 'Fair pricing',
    description: 'Live Pi prices mean you always get the right rate. No surprises.',
    image: '/images/stability-visual.jpg',
    imageAlt: 'Price stability chart',
  },
];

export function LandingFeatures() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-accent mb-4 uppercase tracking-wider">Why PUSD</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance mb-6">
            Stable money.
            <br />
            <span className="text-muted-foreground">Simple to use.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Hold dollars on Pi Network. Send, save, or spend without the volatility.
          </p>
        </div>

        {/* Features grid - alternating layout for image features */}
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Top row: 2 equal cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 - with image */}
            {(() => {
              const f = features[0];
              const Icon = f.icon;
              return (
                <div
                  className={cn(
                    "group relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-500",
                    "hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}
                  style={{ transitionDelay: '0ms' }}
                >
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={f.image!}
                      alt={f.imageAlt}
                      fill
                      className="object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card" />
                  </div>
                  <div className="p-6 flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-foreground mb-1">{f.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Card 2 - no image, accent */}
            {(() => {
              const f = features[1];
              const Icon = f.icon;
              return (
                <div
                  className={cn(
                    "group relative rounded-2xl border border-accent/20 bg-accent/5 p-6 transition-all duration-500",
                    "hover:border-accent/40",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}
                  style={{ transitionDelay: '100ms' }}
                >
                  <div className="flex items-start gap-4 h-full">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-foreground mb-2">{f.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                      <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl bg-background/50 border border-border px-3 py-2 font-mono text-center">
                          <span className="text-accent font-semibold">~5s</span>
                          <p className="text-muted-foreground mt-0.5">to mint</p>
                        </div>
                        <div className="rounded-xl bg-background/50 border border-border px-3 py-2 font-mono text-center">
                          <span className="text-accent font-semibold">~5s</span>
                          <p className="text-muted-foreground mt-0.5">to redeem</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Bottom row: 2 image cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[features[2], features[3]].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={cn(
                    "group relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-500",
                    "hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}
                  style={{ transitionDelay: `${(i + 2) * 100}ms` }}
                >
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={feature.image!}
                      alt={feature.imageAlt}
                      fill
                      className="object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card" />
                  </div>
                  <div className="p-6 flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-foreground mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
