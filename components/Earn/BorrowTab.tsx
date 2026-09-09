'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowDownToLine, ArrowUpFromLine, Wallet, Landmark } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useWalletStore } from '@/lib/store/walletStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useToast } from '@/hooks/use-toast';

export function BorrowTab() {
  const { walletAddress, fetchBalance } = useWalletStore();
  const { toast } = useToast();
  
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Borrow state
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleBorrow = async () => {
    const colNum = parseFloat(collateralAmount);
    const borNum = parseFloat(borrowAmount);
    
    if (isNaN(colNum) || isNaN(borNum) || (colNum <= 0 && borNum <= 0)) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }

    if (!walletAddress) return;

    setIsSubmitting(true);
    try {
      const { secretSeed } = await useAuthStore.getState().retrieveKeypairForTransaction(walletAddress);
      
      const requests = [];
      if (colNum > 0) {
        requests.push({ request_type: 2, address: 'Pi', amount: Math.floor(colNum * 1e7) }); // SupplyCollateral
      }
      if (borNum > 0) {
        requests.push({ request_type: 4, address: 'PUSD', amount: Math.floor(borNum * 1e7) }); // Borrow
      }
      
      const res = await apiClient.submitLendingRequest({
        from: walletAddress,
        requests,
        secretSeed
      });

      if (res.success) {
        toast({ title: 'Success', description: 'Borrow request submitted' });
        setCollateralAmount('');
        setBorrowAmount('');
        await loadPosition();
        fetchBalance(walletAddress);
      } else {
        throw new Error(res.error || 'Borrow failed');
      }
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Borrow failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRepay = async () => {
    const repNum = parseFloat(repayAmount);
    if (isNaN(repNum) || repNum <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }

    if (!walletAddress) return;

    setIsSubmitting(true);
    try {
      const { secretSeed } = await useAuthStore.getState().retrieveKeypairForTransaction(walletAddress);
      
      const res = await apiClient.submitLendingRequest({
        from: walletAddress,
        requests: [{ request_type: 5, address: 'PUSD', amount: Math.floor(repNum * 1e7) }], // Repay
        secretSeed
      });

      if (res.success) {
        toast({ title: 'Success', description: `Repaid ${repayAmount} PUSD` });
        setRepayAmount('');
        await loadPosition();
        fetchBalance(walletAddress);
      } else {
        throw new Error(res.error || 'Repay failed');
      }
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Repay failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!walletAddress) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium">Connect Wallet</h3>
          <p className="text-sm text-muted-foreground">Please connect your wallet to start borrowing.</p>
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
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Collateral</CardTitle>
                <CardDescription>Pi locked as collateral</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {position ? (parseFloat(position.piCollateralAmount || '0') / 1e7).toFixed(2) : '0.00'} Pi
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Value: ${position?.collateralValueUsd?.toFixed(2) || '0.00'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debt</CardTitle>
                <CardDescription>Your borrowed PUSD</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {position ? (parseFloat(position.pusdDebtAmount || '0') / 1e7).toFixed(2) : '0.00'} PUSD
                </p>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Health Factor</span>
                  <span className={position?.healthFactor > 1.5 ? 'text-green-500' : 'text-yellow-500'}>
                    {position?.healthFactor ? position.healthFactor.toFixed(2) : '∞'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                Borrow PUSD
              </CardTitle>
              <CardDescription>Supply Pi collateral and borrow PUSD</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="collateral-amount">Pi Collateral</Label>
                  <Input
                    id="collateral-amount"
                    type="number"
                    placeholder="0.00"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="borrow-amount">PUSD to Borrow</Label>
                  <Input
                    id="borrow-amount"
                    type="number"
                    placeholder="0.00"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleBorrow} disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Supply & Borrow'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Repay Debt</CardTitle>
              <CardDescription>Repay PUSD to improve your health factor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repay-amount">Amount to Repay (PUSD)</Label>
                <Input
                  id="repay-amount"
                  type="number"
                  placeholder="0.00"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                />
              </div>
              <Button onClick={handleRepay} disabled={isSubmitting} variant="outline" className="w-full">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Repay'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
