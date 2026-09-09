'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client';
import { ReserveStatus, CollateralBreakdown } from '@/types';
import { TrendingUp, DollarSign, Users, Activity, Shield, Zap, ArrowLeft } from 'lucide-react';
import { AppShell } from '@/components/app/app-shell';
import Link from 'next/link';

export default function StatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isTestnet, setIsTestnet] = useState(false);
  const [collateralBreakdown, setCollateralBreakdown] = useState<CollateralBreakdown | null>(null);
  const [stats, setStats] = useState({
    totalPiReserve: '0.0000000',
    totalUsdReserve: '0.00',
    totalPUSDSupply: '0.0000000',
    totalPUSDUsdValue: '0.00',
    backingRatio: '0.00%',
    reserveSurplus: '0.00',
    totalFeesCollected: '0.0000000',
    totalVolume: '0.00',
    totalMints: 0,
    totalRedeems: 0,
    totalTransactions: 0,
    totalHolders: 0,
    piPrice: 0,
    isFullyBacked: false,
    mintFeeRate: 0.003,
    redeemFeeRate: 0.003,
  });

  useEffect(() => {
    const testnetMode = apiClient.isTestnetMode();
    setIsTestnet(testnetMode);

    const loadStats = async () => {
      try {
        setIsLoading(true);

        const statsResponse = await apiClient.getStats();
        let fetchedPiPrice = 0;
        if (statsResponse.success && statsResponse.data) {
          const d = statsResponse.data as {
            totalPiReserve?: string; totalUsdReserve?: string; totalPUSDSupply?: string;
            totalPUSDUsdValue?: string; backingRatio?: string; reserveSurplus?: string;
            totalFeesCollected?: string; totalVolume?: string;
            totalMints?: number; totalRedeems?: number; totalTransactions?: number; totalHolders?: number;
            piPrice?: number; isFullyBacked?: boolean; mintFeeRate?: number; redeemFeeRate?: number;
          };
          fetchedPiPrice = d.piPrice ?? 0;
          setStats({
            totalPiReserve: d.totalPiReserve || '0.0000000',
            totalUsdReserve: d.totalUsdReserve || '0.00',
            totalPUSDSupply: d.totalPUSDSupply || '0.0000000',
            totalPUSDUsdValue: d.totalPUSDUsdValue || '0.00',
            backingRatio: d.backingRatio || '0.00%',
            reserveSurplus: d.reserveSurplus || '0.00',
            totalFeesCollected: d.totalFeesCollected || '0.0000000',
            totalVolume: d.totalVolume || '0.00',
            totalMints: d.totalMints ?? 0,
            totalRedeems: d.totalRedeems ?? 0,
            totalTransactions: d.totalTransactions ?? 0,
            totalHolders: d.totalHolders ?? 0,
            piPrice: d.piPrice ?? 0,
            isFullyBacked: d.isFullyBacked ?? false,
            mintFeeRate: d.mintFeeRate ?? 0.003,
            redeemFeeRate: d.redeemFeeRate ?? 0.003,
          });
        }

        if (testnetMode) {
          try {
            const reserveResponse = await apiClient.getReserveStatus();
            if (reserveResponse.success && reserveResponse.data) {
              const status = reserveResponse.data as any; // Updated structure
              
              const totalUsd = status.totalUsdReserve || 0;
              const piValue = (status.piReserve || 0) * fetchedPiPrice;
              const cashUsd = status.cashUsdReserve || 0;
              const tBillUsd = status.tBillUsdReserve || 0;
              
              setCollateralBreakdown({
                totalUsdReserve: totalUsd,
                piReserve: status.piReserve || 0,
                cashUsdReserve: cashUsd,
                tBillUsdReserve: tBillUsd,
                piRatio: totalUsd > 0 ? (piValue / totalUsd) * 100 : 0,
                usdRatio: totalUsd > 0 ? ((cashUsd + tBillUsd) / totalUsd) * 100 : 100
              } as any);
            }
          } catch (error) {
            console.error('Failed to fetch reserve status:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <AppShell title="Protocol Stats" showBack backHref="/dashboard">
      <div className="container mx-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Testnet Badge */}
            {isTestnet && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 text-accent text-sm">
                <Zap className="w-4 h-4" />
                <span>Preview mode</span>
              </div>
            )}

            {/* Primary Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Backed</span>
                </div>
                <p className="text-xl font-bold tabular-nums">{stats.backingRatio}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.isFullyBacked ? 'Healthy' : 'Low reserves'}
                </p>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">PUSD out there</span>
                </div>
                <p className="text-xl font-bold tabular-nums">{parseFloat(stats.totalPUSDSupply).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">${stats.totalPUSDUsdValue}</p>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Pi Price</span>
                </div>
                <p className="text-xl font-bold tabular-nums">${stats.piPrice.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground mt-1">Right now</p>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Volume</span>
                </div>
                <p className="text-xl font-bold tabular-nums">${stats.totalVolume}</p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </Card>
            </div>

            {/* Reserve Composition */}
            <Card className="p-4 bg-card border-border">
              <h3 className="font-medium mb-4">What backs PUSD</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Pi Reserve</span>
                    <span className="tabular-nums font-medium">
                      {((collateralBreakdown as any)?.piReserve || stats.totalPiReserve).toLocaleString()} Pi
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-accent transition-all duration-500" 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Collateralization Ratio</span>
                    <span className="tabular-nums font-medium">
                      {((collateralBreakdown as any)?.backingRatio || stats.backingRatio)?.toFixed(0) || '120'}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-success/60 transition-all duration-500" 
                      style={{ width: `${Math.min((collateralBreakdown as any)?.backingRatio || stats.backingRatio || 120, 200)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Activity Stats */}
            <Card className="p-4 bg-card border-border">
              <h3 className="font-medium mb-4">Activity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold tabular-nums">{stats.totalMints}</p>
                  <p className="text-xs text-muted-foreground">Mints</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{stats.totalRedeems}</p>
                  <p className="text-xs text-muted-foreground">Redeems</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{stats.totalTransactions}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{stats.totalHolders}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
              </div>
            </Card>

            {/* Platform Fees */}
            <Card className="p-4 bg-card border-border">
              <h3 className="font-medium mb-4">Fees earned</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold tabular-nums">{stats.totalFeesCollected}</p>
                <span className="text-sm text-muted-foreground">PUSD</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.mintFeeRate !== undefined ? `${(stats.mintFeeRate * 100).toFixed(1)}% on mint / ${(stats.redeemFeeRate * 100).toFixed(1)}% on redeem` : 'Dynamic fees'}
              </p>
            </Card>

            {/* Status */}
            <Card className="p-4 bg-card border-border">
              <h3 className="font-medium mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Network</span>
                  <Badge variant="secondary" className="font-normal">
                    {isTestnet ? 'Preview' : 'Live'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reserves</span>
                  <Badge 
                    variant={stats.isFullyBacked ? 'default' : 'destructive'}
                    className="font-normal"
                  >
                    {stats.isFullyBacked ? 'Healthy' : 'Low'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Extra reserves</span>
                  <span className="text-sm font-medium text-accent tabular-nums">
                    +${stats.reserveSurplus}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
