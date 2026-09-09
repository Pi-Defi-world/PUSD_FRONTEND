import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { usePi } from '@/components/providers/pi-provider';
import { useWalletStore } from '@/lib/store/walletStore';
import { User, Copy, Wallet, ShieldCheck, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function AccountInfo() {
  const { user, isAuthenticated } = usePi();
  const { walletAddress, balance, fetchBalance, isLoading } = useWalletStore();
  const { toast } = useToast();

  const walletDisplay = walletAddress || user?.wallet_address || null;
  const truncatedWallet = useMemo(() => {
    if (!walletDisplay) return null;
    if (walletDisplay.length <= 16) return walletDisplay;
    return `${walletDisplay.slice(0, 8)}...${walletDisplay.slice(-8)}`;
  }, [walletDisplay]);

  const handleCopy = () => {
    if (walletDisplay) {
      navigator.clipboard.writeText(walletDisplay);
      toast({ title: 'Copied!', description: 'Address copied to clipboard' });
    }
  };

  const handleRefresh = async () => {
    if (walletDisplay && walletDisplay.startsWith('G')) {
      await fetchBalance(walletDisplay);
      toast({ title: 'Updated', description: 'Balances refreshed' });
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Card className="border-border/40 shadow-sm overflow-hidden bg-card">
      <CardHeader className="pb-4 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success border-2 border-background flex items-center justify-center">
                <ShieldCheck className="w-2.5 h-2.5 text-success-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-base font-bold">{user?.username || 'Verified User'}</CardTitle>
              <CardDescription className="text-[11px] flex items-center gap-1">
                Connected via Pi Network
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-5">
        {/* Wallet Display */}
        <div className="space-y-2">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold ml-1">Connected Wallet</Label>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60 hover:border-primary/30 transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border/40 shadow-sm">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-mono font-medium truncate">{truncatedWallet || 'No wallet linked'}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">π</span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Pi Balance</p>
            </div>
            <p className="text-lg font-bold tracking-tight">{parseFloat(balance?.pi?.amount ?? '0').toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground">Native Asset</p>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent border border-accent/10 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-accent">$</span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">PUSD Balance</p>
            </div>
            <p className="text-lg font-bold tracking-tight">
              {parseFloat(balance?.pusd?.amount ?? balance?.zyra?.amount ?? '0').toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground">Stablecoin</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

