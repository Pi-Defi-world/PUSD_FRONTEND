'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePi } from '@/components/providers/pi-provider';
import { useWalletStore } from '@/lib/store/walletStore';
import { usePriceStore, useStatsStore } from '@/lib/store/priceStore';
import { useAuthStore } from '@/lib/store/authStore';
import { MintForm } from '@/components/MintForm';
import { RedeemForm } from '@/components/RedeemForm';
import { TransactionHistory } from '@/components/TransactionHistory';
import { apiClient } from '@/lib/api/client';
import { TrendingUp, Shield, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConnectWalletCard } from '@/components/app/connect-wallet-card';
import { BalanceCard } from '@/components/app/balance-card';
import { QuickActions } from '@/components/app/quick-actions';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { isAuthenticated, user, authenticate } = usePi();
  const router = useRouter();
  const { walletAddress, balance, fetchBalance, isLoading: walletLoading } = useWalletStore();
  const { piPrice, fetchPiPrice, isLoading: priceLoading } = usePriceStore();
  const { stats, fetchStats } = useStatsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Pull to refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const [hasLocalWallet, setHasLocalWallet] = useState<boolean | null>(null);

  const loadData = useCallback(async () => {
    try {
      await fetchPiPrice();
      fetchStats();
      
      if (walletAddress && walletAddress.startsWith('G')) {
        await fetchBalance(walletAddress);
        
        // Check if wallet is accessible locally
        const hasWallet = await useAuthStore.getState().hasWalletInIndexedDB(walletAddress);
        setHasLocalWallet(hasWallet);
      } else {
        setHasLocalWallet(false);
      }
    } catch (error) {
      // For 404 errors during loadData, we just silently ignore them instead of failing the whole dashboard
      const isNotFoundError = error instanceof Error && (error as any).status === 404;
      if (!isNotFoundError) {
        console.error('Failed to load dashboard data:', error);
      }
    }
  }, [walletAddress, fetchPiPrice, fetchBalance, fetchStats]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const initialLoad = async () => {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
    };

    initialLoad();
  }, [isAuthenticated, loadData]);

  // Pull to refresh handlers
  useEffect(() => {
    if (!isAuthenticated) return;

    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || window.scrollY > 0) return;
      currentY = e.touches[0].clientY;
      const distance = Math.max(0, Math.min((currentY - startY) * 0.5, 80));
      setPullDistance(distance);
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 60) {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
      }
      setPullDistance(0);
      setIsPulling(false);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isAuthenticated, isPulling, pullDistance, loadData]);

  const handleRefresh = async () => {
    if (!walletAddress) return;
    
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // Not authenticated
  if (!isAuthenticated) {
    return <ConnectWalletCard />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      <div 
        className={cn(
          'absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-200',
          pullDistance > 0 ? 'opacity-100' : 'opacity-0'
        )}
        style={{ top: pullDistance - 40 }}
      >
        <div className={cn(
          'w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shadow-lg',
          isRefreshing && 'animate-spin'
        )}>
          <ArrowDown className={cn(
            'w-4 h-4 text-muted-foreground transition-transform',
            pullDistance > 60 && 'rotate-180'
          )} />
        </div>
      </div>

      <div 
        className="space-y-6 pb-8 animate-fade-in"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {/* Balance Section */}
        <BalanceCard 
          pusdBalance={balance?.pusd?.amount || '0'}
          pusdValue={balance?.pusd?.usdValue || '0'}
          piBalance={balance?.pi?.amount || '0'}
          piValue={balance?.pi?.usdValue || '0'}
          piPrice={piPrice}
          onRefresh={handleRefresh}
          isLoading={isRefreshing}
        />

        {/* Quick Actions */}
        <QuickActions 
          onMint={() => router.push('/dashboard/mint')} 
          onRedeem={() => router.push('/dashboard/mint?tab=redeem')} 
        />

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Pi Price"
            value={piPrice?.toFixed(4) || '0.0000'}
            prefix="$"
            size="sm"
          />
          <MetricCard
            label="Backing"
            value={stats?.backingRatio.replace('%', '') || '100'}
            suffix="%"
            size="sm"
            variant="accent"
          />
        </div>

        {/* Wallet Info */}
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Wallet</p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-mono text-foreground/90 truncate flex-1">
              {walletAddress || 'Not connected'}
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs px-2"
              onClick={() => router.push('/settings')}
            >
              Manage
            </Button>
          </div>
        </Card>

        {/* Transaction History */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Activity
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs px-2"
              onClick={() => router.push('/dashboard/history')}
            >
              View All
            </Button>
          </div>
          <TransactionHistory walletAddress={walletAddress || undefined} />
        </div>
      </div>
    </div>
  );
}
