'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CollateralBreakdown } from '@/types';
import { DollarSign, Wallet } from 'lucide-react';

interface ReservePoolBreakdownProps {
  breakdown: CollateralBreakdown;
}

export function ReservePoolBreakdown({ breakdown }: ReservePoolBreakdownProps) {

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
      <CardHeader>
        <CardTitle>Reserve Breakdown (Legacy View)</CardTitle>
        <CardDescription>
          Historical reserve vs pool composition used in early prototypes. The current system uses a single off-chain USD reserve.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Reserve Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Reserve</h3>
            </div>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pi Amount:</span>
                <span className="text-sm font-medium">{breakdown.reserve.piAmount} Pi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pi Value:</span>
                <span className="text-sm font-medium">${breakdown.reserve.piValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Legacy USD Amount:</span>
                <span className="text-sm font-medium">{breakdown.reserve.usdTestAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Legacy USD Value:</span>
                <span className="text-sm font-medium">${breakdown.reserve.usdTestValue}</span>
              </div>
            </div>
          </div>

          {/* Pool Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Pool</h3>
            </div>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pi Amount:</span>
                <span className="text-sm font-medium">{breakdown.pool.piAmount} Pi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pi Value:</span>
                <span className="text-sm font-medium">${breakdown.pool.piValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Legacy USD Amount:</span>
                <span className="text-sm font-medium">{breakdown.pool.usdTestAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Legacy USD Value:</span>
                <span className="text-sm font-medium">${breakdown.pool.usdTestValue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Section */}
        <div className="border-t pt-4 space-y-2">
          <h3 className="text-sm font-semibold mb-3">Total Collateral</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Total Pi:</span>
                <span className="text-sm font-medium">{breakdown.total.piAmount} Pi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total legacy USD:</span>
                <span className="text-sm font-medium">{breakdown.total.usdTestAmount}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Total Value:</span>
                <span className="text-sm font-bold">${breakdown.total.totalValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ratio:</span>
                <span className="text-sm font-medium">
                  {(breakdown.total.usdcRatio * 100).toFixed(0)}% legacy USD / {(breakdown.total.piRatio * 100).toFixed(0)}% Pi
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

