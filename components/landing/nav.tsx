'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50' 
          : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">PUSD</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="#features" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link 
            href="#stats" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Protocol
          </Link>
          <Link 
            href="/developers" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Developers
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/stats">Stats</Link>
          </Button>
          <Button size="sm" asChild className="btn-accent">
            <Link href="/dashboard">Open App</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
