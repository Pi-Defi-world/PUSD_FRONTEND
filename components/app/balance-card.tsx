'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, Eye, EyeOff, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BalanceCardProps {
  pusdBalance: string;
  pusdValue: string;
  piBalance: string;
  piValue: string;
  piPrice: number | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export function BalanceCard({
  pusdBalance,
  pusdValue,
  piBalance,
  piValue,
  piPrice,
  onRefresh,
  isLoading,
}: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatCrypto = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    if (num >= 1000) {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  const totalUsdValue = (parseFloat(pusdValue) || 0) + (parseFloat(piValue) || 0);

  return (
    <div className="rounded-xl sm:rounded-2xl bg-foreground text-background p-5 sm:p-6 overflow-hidden relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/10 pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-background/60 font-medium">Total Balance</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 rounded-full text-background/60 hover:text-background hover:bg-background/10 transition-colors"
              aria-label={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={cn(
                'p-2 rounded-full text-background/60 hover:text-background hover:bg-background/10 transition-colors',
                isLoading && 'animate-spin'
              )}
              aria-label="Refresh balance"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Total Value */}
        <div className="mb-8">
          <p className="text-2xl md:text-3xl font-semibold tracking-tight font-mono tabular-nums">
            {showBalance ? `$${formatNumber(totalUsdValue.toString())}` : '••••••'}
          </p>
        </div>

        {/* Asset List */}
        <div className="space-y-2">
          {/* PUSD */}
          <Link
            href="/dashboard?tab=overview"
            className="flex items-center justify-between p-3 -mx-3 rounded-2xl hover:bg-background/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-sm font-bold text-accent">P</span>
              </div>
              <div>
                <p className="font-medium">PUSD</p>
                <p className="text-sm text-background/50">$1.00</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-medium tabular-nums font-mono">
                  {showBalance ? formatCrypto(pusdBalance) : '••••'}
                </p>
                <p className="text-sm text-background/50 tabular-nums font-mono">
                  ${showBalance ? formatNumber(pusdValue) : '••••'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-background/30 group-hover:text-background/60 transition-colors" />
            </div>
          </Link>

          {/* Divider */}
          <div className="h-px bg-background/10" />

          {/* Pi */}
          <Link
            href="/dashboard?tab=overview"
            className="flex items-center justify-between p-3 -mx-3 rounded-2xl hover:bg-background/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center">
                <span className="text-sm font-bold">Pi</span>
              </div>
              <div>
                <p className="font-medium">Pi Network</p>
                <p className="text-sm text-background/50">
                  ${piPrice?.toFixed(4) || '0.0000'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-medium tabular-nums font-mono">
                  {showBalance ? formatCrypto(piBalance) : '••••'}
                </p>
                <p className="text-sm text-background/50 tabular-nums font-mono">
                  ${showBalance ? formatNumber(piValue) : '••••'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-background/30 group-hover:text-background/60 transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
