'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { usePi } from '@/components/providers/pi-provider';
import { useWalletStore } from '@/lib/store/walletStore';
import { useStatsStore } from '@/lib/store/priceStore';
import { LogOut, Settings2 } from 'lucide-react';
import { AccountInfo } from '@/components/settings/account-info';
import { WalletManager } from '@/components/settings/wallet-manager';
import { ProtocolInfo } from '@/components/settings/protocol-info';
import { Card, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  const { signOut, isAuthenticated } = usePi();
  const { walletAddress, fetchBalance } = useWalletStore();
  const { stats, fetchStats } = useStatsStore();

  useEffect(() => {
    if (walletAddress) {
      fetchBalance(walletAddress);
    }
    if (!stats) {
      fetchStats();
    }
  }, [walletAddress, fetchBalance, stats, fetchStats]);

  const handleSignOut = () => {
    signOut();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-lg mx-auto px-4 pt-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Settings2 className="w-4 h-4 text-primary" />
        </div>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Profile & Account */}
      <AccountInfo />

      {/* Wallet Management (Modular) */}
      <WalletManager />

      {/* Protocol Information */}
      <ProtocolInfo />

      {/* Bottom Actions - Sign Out at the end */}
      <div className="pt-4">
        <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
          <CardContent className="p-0">
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="w-full h-12 justify-center gap-2 text-destructive hover:bg-destructive/10 rounded-none transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-semibold">Sign Out</span>
            </Button>
          </CardContent>
        </Card>
        <p className="text-center text-[10px] text-muted-foreground mt-6 uppercase tracking-widest opacity-50">
          PUSD Protocol • Mainnet v1.0.0
        </p>
      </div>
    </div>
  );
}
