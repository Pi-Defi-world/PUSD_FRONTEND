'use client';

import { useCallback, useEffect, useState } from 'react';
import { Gift, Loader2, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { usePi } from '@/components/providers/pi-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { A2UGift } from '@/types';

function getGifts(response: unknown): A2UGift[] {
  if (!response || typeof response !== 'object') {
    return [];
  }
  const payload = response as { data?: unknown; gifts?: unknown };
  const data = payload.data;
  if (data && typeof data === 'object' && 'gifts' in data && Array.isArray((data as { gifts?: unknown }).gifts)) {
    return (data as { gifts: A2UGift[] }).gifts;
  }
  return Array.isArray(payload.gifts) ? payload.gifts as A2UGift[] : [];
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function formatAmount(amount: number): string {
  return amount.toFixed(7).replace(/0+$/, '').replace(/\.$/, '');
}

export default function ClaimPage() {
  const { isAuthenticated, authenticate, signInWithPi, isOAuthConfigured, isHydrated, isLoading: authLoading } = usePi();
  const [gifts, setGifts] = useState<A2UGift[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadGifts = useCallback(async () => {
  if (!isHydrated || authLoading) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Card>
          <CardContent className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
      setGifts([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getClaimableGifts();
      setGifts(getGifts(response));
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, 'Unable to load gifts.'));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadGifts();
  }, [loadGifts]);

  const handleAuthenticate = async () => {
    setError(null);
    try {
      await authenticate();
    } catch (authError: unknown) {
      setError(getErrorMessage(authError, 'Pi authentication failed.'));
    }
  };

  const handleClaim = async (gift: A2UGift) => {
    setProcessingId(gift.id);
    setMessage(null);
    setError(null);
    try {
      await apiClient.claimGift(gift.id);
      setGifts((current) => current.filter((item) => item.id !== gift.id));
      setMessage(`${gift.title} was sent to your Pi account.`);
    } catch (claimError: unknown) {
      setError(getErrorMessage(claimError, 'The gift could not be claimed.'));
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Card>
          <CardHeader className="text-center">
            <Gift className="mx-auto mb-2 h-10 w-10 text-accent" />
            <CardTitle>Claim a PUSD gift</CardTitle>
            <CardDescription>Sign in with Pi to view gifts available for your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={handleAuthenticate} disabled={authLoading}>
              {authLoading ? 'Connecting…' : 'Connect with Pi'}
            </Button>
            {isOAuthConfigured && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => signInWithPi('/claim')}
              >
                Sign in with Pi account
              </Button>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Works in any browser. Pi Browser is only required for payments.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15">
          <Sparkles className="h-6 w-6 text-accent" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Claim a gift</h1>
        <p className="text-sm text-muted-foreground">PUSD gifts are sent directly to your verified Pi account.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && gifts.length === 0 && !error && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            There are no gifts available for your account right now.
          </CardContent>
        </Card>
      )}

      {!isLoading && gifts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {gifts.map((gift) => (
            <Card key={gift.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gift className="h-5 w-5 text-accent" />
                  {gift.title}
                </CardTitle>
                <CardDescription>{gift.description || 'A gift from PUSD.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-2xl font-semibold">{formatAmount(gift.amount)} π</p>
                <Button
                  className="w-full"
                  onClick={() => handleClaim(gift)}
                  disabled={processingId !== null || gift.claimable === false}
                >
                  {processingId === gift.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </>
                  ) : gift.claimable === false ? (
                    'Processing…'
                  ) : (
                    'Claim Gift'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {message && <p className="text-center text-sm text-emerald-500">{message}</p>}
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
