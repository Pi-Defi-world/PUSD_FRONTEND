'use client';

import { Button } from '@/components/ui/button';
import { usePi } from '@/components/providers/pi-provider';
import { useStatsStore } from '@/lib/store/priceStore';
import { ArrowRight, Shield, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export function ConnectWalletCard() {
  const { authenticate } = usePi();
  const { stats, fetchStats } = useStatsStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stats) fetchStats();
  }, [stats, fetchStats]);

  const handleConnect = async () => {
    if (typeof window === 'undefined' || !window.Pi) {
      alert('Please open this app in Pi Browser');
      return;
    }

    setIsLoading(true);
    try {
      await authenticate();
    } catch (error) {
      console.error('Authentication failed:', error);
      alert(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <div className="w-full max-w-sm text-center">
        {/* Hero image */}
        <div className="relative w-full h-40 mb-8 rounded-2xl overflow-hidden border border-border">
          <Image
            src="/images/reserve-visual.jpg"
            alt="PUSD secure reserves"
            fill
            className="object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium">{stats?.backingRatio || '100%'} Backed</span>
          </div>
        </div>
        
        {/* Copy */}
        <h1 className="text-2xl font-bold tracking-tight mb-3">
          Welcome to PUSD
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Connect your wallet to start holding stable value on Pi Network.
        </p>

        {/* Connect Button */}
        <Button 
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full h-13 text-base rounded-xl mb-8"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
              Connecting...
            </div>
          ) : (
            <>
              Connect Pi Wallet
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-4 rounded-2xl bg-muted/50">
            <Shield className="w-5 h-5 text-accent mb-2" />
            <p className="text-sm font-medium mb-0.5">Secure</p>
            <p className="text-xs text-muted-foreground">{stats?.backingRatio || '100%'} reserve backing</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/50">
            <Zap className="w-5 h-5 text-accent mb-2" />
            <p className="text-sm font-medium mb-0.5">Instant</p>
            <p className="text-xs text-muted-foreground">Get PUSD in seconds</p>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-xs text-muted-foreground/70">
          Requires Pi Browser
        </p>
      </div>
    </div>
  );
}
