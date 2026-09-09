'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, PiggyBank, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function SavePage() {
  const [balance, setBalance] = useState<string>('0');
  const [accruedInterest, setAccruedInterest] = useState<string>('0');
  const [apy, setApy] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; type: string; amount: string; balanceAfter: string | null; createdAt: string }>>([]);

  const loadBalance = async () => {
    try {
      const res = await apiClient.getSavingsBalance();
      if (res?.success && res?.data) {
        const data = res.data as { balance?: string; accruedInterest?: string; apyRate?: string };
        setBalance(data.balance ?? '0');
        setAccruedInterest(data.accruedInterest ?? '0');
        setApy(parseFloat(data.apyRate ?? '0'));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load balance');
    }
  };

  const loadRate = async () => {
    try {
      const res = await apiClient.getSavingsRate();
      if (res?.success && res?.data) {
        const rate = res.data as { apy?: number };
        setApy(rate.apy ?? 0);
      }
    } catch {
      // ignore
    }
  };

  const loadHistory = async () => {
    try {
      const res = await apiClient.getSavingsHistory(20);
      const hist = res?.success && res?.data ? (res.data as { transactions?: Array<{ id: string; type: string; amount: string; balanceAfter: string | null; createdAt: string }> }) : null;
      if (hist?.transactions) {
        setHistory(
          hist.transactions.map((t) => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            balanceAfter: t.balanceAfter,
            createdAt: t.createdAt,
          }))
        );
      }
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([loadBalance(), loadRate(), loadHistory()]);
      setLoading(false);
    };
    load();
  }, []);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Enter a valid positive amount');
      return;
    }
    setDepositLoading(true);
    setError(null);
    try {
      const res = await apiClient.savingsDeposit(amount);
      if (res?.success) {
        setDepositAmount('');
        await loadBalance();
        await loadHistory();
      } else {
        setError(res?.error || 'Deposit failed');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Enter a valid positive amount');
      return;
    }
    setWithdrawLoading(true);
    setError(null);
    try {
      const res = await apiClient.savingsWithdraw(amount);
      if (res?.success) {
        setWithdrawAmount('');
        await loadBalance();
        await loadHistory();
      } else {
        setError(res?.error || 'Withdrawal failed');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <PiggyBank className="h-6 w-6" />
          Save
        </h1>
        <p className="text-sm text-muted-foreground">
          Earn yield on your PUSD. Deposit to start saving; withdraw anytime.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-8 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading…</span>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Savings balance</CardTitle>
              <CardDescription>Balance and accrued interest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-semibold">{Number(balance).toFixed(7)} PUSD</p>
              <p className="text-sm text-muted-foreground">
                Accrued interest: {Number(accruedInterest).toFixed(7)} PUSD
              </p>
              <p className="text-sm text-muted-foreground">
                Current APY: {(apy * 100).toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownToLine className="h-4 w-4" />
                  Deposit
                </CardTitle>
                <CardDescription>Add PUSD to your savings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deposit-amount">Amount (PUSD)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                <Button onClick={handleDeposit} disabled={depositLoading} className="w-full">
                  {depositLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Deposit'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpFromLine className="h-4 w-4" />
                  Withdraw
                </CardTitle>
                <CardDescription>Withdraw PUSD from savings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="withdraw-amount">Amount (PUSD)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <Button onClick={handleWithdraw} disabled={withdrawLoading} variant="secondary" className="w-full">
                  {withdrawLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Withdraw'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>Recent savings activity</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No transactions yet.</p>
              ) : (
                <ul className="space-y-2">
                  {history.map((t) => (
                    <li key={t.id} className="flex justify-between text-sm">
                      <span className={t.type === 'DEPOSIT' ? 'text-green-600' : 'text-orange-600'}>
                        {t.type} {t.amount} PUSD
                      </span>
                      <span className="text-muted-foreground">
                        {t.balanceAfter != null ? `Balance: ${t.balanceAfter}` : ''} · {new Date(t.createdAt).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
