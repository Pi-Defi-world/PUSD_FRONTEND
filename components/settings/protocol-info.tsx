'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useStatsStore } from '@/lib/store/priceStore';
import { Shield, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ProtocolInfo() {
  const { stats } = useStatsStore();

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-base">Protocol Info</CardTitle>
            <CardDescription className="text-xs">Dynamic parameters and documentation</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Info className="w-3 h-3" /> Reserve Ratio
            </span>
            <span className="font-medium bg-success/10 text-success px-2 py-0.5 rounded-full">
              {stats?.backingRatio || '100%'}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Info className="w-3 h-3" /> Stability Fee
            </span>
            <span className="font-medium">
              {stats?.mintFeeRate !== undefined ? `${(stats.mintFeeRate * 100).toFixed(1)}%` : '0.5%'}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-border/50 pt-3">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono text-[10px]">1.0.0-alpha</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button variant="outline" size="sm" asChild className="h-8 text-[10px] gap-1.5">
            <Link href="/developers">
              <ExternalLink className="w-3 h-3" /> Docs
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-8 text-[10px] gap-1.5">
            <Link href="/help/testnet">
              <Info className="w-3 h-3" /> Guide
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
