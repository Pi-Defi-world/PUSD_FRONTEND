'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NumericInput } from '@/components/ui/numeric-input';
import { SuccessAnimation } from '@/components/ui/success-animation';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetBody,
  BottomSheetFooter,
} from '@/components/ui/bottom-sheet';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { usePriceStore, useStatsStore } from '@/lib/store/priceStore';
import { useWalletStore } from '@/lib/store/walletStore';
import { apiClient } from '@/lib/api/client';
import { Loader2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MintFormProps {
  walletAddress: string;
  onTransactionComplete?: () => void;
}

export function MintForm({ walletAddress, onTransactionComplete }: MintFormProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txResult, setTxResult] = useState<{ txHash?: string } | null>(null);

  const { toast } = useToast();
  const { retrieveKeypairForTransaction, setError: clearAuthError } = useAuthStore();
  const { piPrice } = usePriceStore();
  const { stats } = useStatsStore();
  const { balance } = useWalletStore();

  // Calculations
  const OVERCOLLATERALIZATION_RATIO = stats?.overcollateralization || 1.15;
  const mintFeeRate = stats?.mintFeeRate || 0.003;
  
  const piAmount = parseFloat(amount) || 0;
  const usdValue = piAmount * (piPrice || 0);
  const mintFee = usdValue * mintFeeRate;
  const pusdOutput = usdValue - mintFee;
  const piRequired = piAmount * OVERCOLLATERALIZATION_RATIO;
  const piBalance = parseFloat(balance?.pi?.amount || '0');
  const hasSufficientBalance = piBalance >= piRequired;

  const handleMint = () => {
    if (!amount || piAmount <= 0) {
      setError('Enter an amount');
      return;
    }
    if (!hasSufficientBalance) {
      setError('Insufficient balance');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmMint = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const keypair = await retrieveKeypairForTransaction(walletAddress);
      const result = await apiClient.mint({
        amount: piAmount,
        walletAddress: keypair.walletAddress,
        secretSeed: keypair.secretSeed,
      });

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      const transactionData = result.data as { success: boolean; txHash?: string } | null;
      setTxResult(transactionData || { txHash: undefined });
      setShowConfirmation(false);
      setShowSuccess(true);

      if (onTransactionComplete) {
        onTransactionComplete();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      toast({
        title: 'Something went wrong',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    setAmount('');
    setTxResult(null);
  };

  const handleMax = () => {
    const maxPi = piBalance / OVERCOLLATERALIZATION_RATIO;
    setAmount(maxPi.toFixed(2));
  };

  // Success state
  if (showSuccess) {
    return (
      <div className="flex flex-col h-full">
        <SuccessAnimation
          title="Done"
          subtitle={txResult?.txHash ? `ID: ${txResult.txHash.slice(0, 8)}...` : 'Your PUSD is ready'}
          amount={pusdOutput.toFixed(2)}
          currency="PUSD"
        />
        <div className="mt-auto px-4 pb-4">
          <Button onClick={handleSuccessComplete} className="w-full" size="lg">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Amount Input */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <NumericInput
          value={amount}
          onChange={(val) => {
            setAmount(val);
            setError(null);
          }}
          currency="Pi"
          secondaryValue={pusdOutput > 0 ? `${pusdOutput.toFixed(2)}` : undefined}
          secondaryCurrency={pusdOutput > 0 ? 'PUSD' : undefined}
          maxValue={piBalance / OVERCOLLATERALIZATION_RATIO}
          onMax={handleMax}
        />

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm mt-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Info row */}
      {piAmount > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/50 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Fee ({(mintFeeRate * 100).toFixed(1)}%)</span>
            </div>
            <span className="font-mono text-foreground">${mintFee.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* Action button */}
      <div className="px-4 pb-4 safe-area-bottom">
        <Button
          onClick={handleMint}
          disabled={!amount || piAmount <= 0}
          className="w-full"
          size="lg"
        >
          {!hasSufficientBalance && piAmount > 0 ? 'Insufficient Balance' : 'Continue'}
        </Button>
      </div>

      {/* Confirmation Bottom Sheet */}
      <BottomSheet open={showConfirmation} onOpenChange={setShowConfirmation}>
        <BottomSheetContent>
          <BottomSheetHeader>
            <BottomSheetTitle>Review</BottomSheetTitle>
            <BottomSheetDescription>
              Make sure everything looks right
            </BottomSheetDescription>
          </BottomSheetHeader>

          <BottomSheetBody>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">You pay</span>
                <span className="font-mono font-medium">{piAmount.toFixed(4)} Pi</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Reserve held</span>
                <span className="font-mono text-sm">{piRequired.toFixed(4)} Pi</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-mono text-sm">${mintFee.toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-medium">You receive</span>
                <span className="font-mono font-semibold text-success">
                  {pusdOutput.toFixed(4)} PUSD
                </span>
              </div>
            </div>
          </BottomSheetBody>

          <BottomSheetFooter>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmation(false);
                  setError(null);
                  clearAuthError(null);
                }}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmMint}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  'Confirm'
                )}
              </Button>
            </div>
          </BottomSheetFooter>
        </BottomSheetContent>
      </BottomSheet>
    </div>
  );
}
