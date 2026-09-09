'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

interface PassphraseVerificationProps {
  username: string;
  walletAddress?: string;
  // Note: Function props in client components are safe when passed from parent client components
  // This warning can be safely ignored for client-to-client component communication
  onVerified: (walletAddress: string) => void;
  onCancel?: () => void;
  error?: string | null;
  isLoading?: boolean;
}

export function PassphraseVerification({
  username,
  walletAddress,
  onVerified,
  onCancel,
  error: externalError,
  isLoading: externalLoading,
}: PassphraseVerificationProps) {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passphrase.trim()) {
      setError('Please enter your 24-word passphrase');
      return;
    }

    // Normalize passphrase to lowercase (like in registration)
    const normalizedPassphrase = passphrase.trim().toLowerCase();
    
    // Validate 24-word format
    const words = normalizedPassphrase.split(/\s+/);
    if (words.length !== 24) {
      setError('Passphrase must contain exactly 24 words');
      return;
    }

    setIsLoading(true);

    try {
      const { apiClient } = await import('@/lib/api/client');
      const result = await apiClient.verifyPassphrase(username, normalizedPassphrase);

      if (result.success && result.data) {
        const resultData = result.data as { walletAddress: string };
        const verifiedWalletAddress = resultData.walletAddress;
        
        // If walletAddress was provided, verify it matches
        if (walletAddress && verifiedWalletAddress !== walletAddress) {
          setError('Wallet address mismatch. Please check your passphrase.');
          setIsLoading(false);
          return;
        }

        const { reImportWallet } = useAuthStore.getState();
        const importResult = await reImportWallet(verifiedWalletAddress, normalizedPassphrase);
        if (!importResult.success) {
          setError(importResult.error || 'Failed to import wallet to this device');
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
        onVerified(verifiedWalletAddress);
      } else {
        setError(result.error || 'Passphrase verification failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify passphrase');
      setIsLoading(false);
    }
  };

  const displayError = externalError || error;
  const displayLoading = externalLoading || isLoading;

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {walletAddress
            ? 'Please verify your passphrase to continue.'
            : 'Please enter your 24-word passphrase to verify your identity.'}
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="passphrase">24-Word Passphrase</Label>
          <textarea
            id="passphrase"
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter your 24-word passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value.trim().toLowerCase())}
            disabled={displayLoading}
            required
          />
          <p className="text-xs text-muted-foreground">
            Enter the 24-word passphrase you used when creating this wallet
          </p>
        </div>

        {displayError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={displayLoading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={displayLoading}>
            {displayLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Passphrase'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

