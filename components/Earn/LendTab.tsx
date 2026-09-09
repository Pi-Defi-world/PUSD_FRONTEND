'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowDownToLine, ArrowUpFromLine, Wallet } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useWalletStore } from '@/lib/store/walletStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useToast } from '@/hooks/use-toast';

export function LendTab() {
  const { walletAddress, fetchBalance } = useWalletStore();
  const { toast } = useToast();
  
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplyAmount, setSupplyAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [supplyLoading, setSupplyLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const loadPosition = async () => {
    if (!walletAddress) return;
    try {
      const res = await apiClient.getLendingPosition(walletAddress);
      setPosition(res);
    } catch (e) {
      console.error('Failed to load lending position:', e);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      await loadPosition();
      setLoading(false);
    };
    if (walletAddress) load();
  }, [walletAddress]);

  const handleAction = async (type: 'supply' | 'withdraw') => {
    const amount = type === 'supply' ? supplyAmount : withdrawAmount;
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }

    if (!walletAddress) return;

    const setLoadingState = type === 'supply' ? setSupplyLoading : setWithdrawLoading;
    setLoadingState(true);
    
    try {
      const { secretSeed } = await useAuthStore.getState().retrieveKeypairForTransaction(walletAddress);
      
      const requestType = type === 'supply' ? 0 : 1; // 0=Supply, 1=Withdraw
      
      const res = await apiClient.submitLendingRequest({
        from: walletAddress,
        requests: [{
          request_type: requestType,
          address: 'PUSD',
          amount: Math.floor(amountNum * 1e7),
        }],
        secretSeed
      });

      if (res.success) {
        toast({ title: 'Success', description: `${type === 'supply' ? 'Supplied' : 'Withdrawn'} ${amount} PUSD` });
        if (type === 'supply') setSupplyAmount('');
        else setWithdrawAmount('');
        await loadPosition();
        fetchBalance(walletAddress);
      } else {
        throw new Error(res.error || 'Action failed');
      }
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Action failed', variant: 'destructive' });
    } finally {
      setLoadingState(false);
    }
  };

  if (!walletAddress) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium">Connect Wallet</h3>
          <p className="text-sm text-muted-foreground">Please connect your wallet to start lending.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-8 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading position…</span>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Lending Balance</CardTitle>
              <CardDescription>Your active lending positions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-semibold">
                {position ? (parseFloat(position.pusdDebtAmount || '0') / 1e7).toFixed(2) : '0.00'} PUSD
              </p>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Health Factor</span>
                <span className={position?.healthFactor > 1.5 ? 'text-green-500' : 'text-yellow-500'}>
                  {position?.healthFactor ? position.healthFactor.toFixed(2) : '∞'}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownToLine className="h-4 w-4" />
                  Supply PUSD
                </CardTitle>
                <CardDescription>Earn interest on your PUSD</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supply-amount">Amount (PUSD)</Label>
                  <Input
                    id="supply-amount"
                    type="number"
                    placeholder="0.00"
                    value={supplyAmount}
                    onChange={(e) => setSupplyAmount(e.target.value)}
                  />
                </div>
                <Button onClick={() => handleAction('supply')} disabled={supplyLoading} className="w-full">
                  {supplyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Supply'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpFromLine className="h-4 w-4" />
                  Withdraw PUSD
                </CardTitle>
                <CardDescription>Move assets back to your wallet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount (PUSD)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <Button onClick={() => handleAction('withdraw')} disabled={withdrawLoading} variant="secondary" className="w-full">
                  {withdrawLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Withdraw'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
