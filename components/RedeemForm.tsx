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

interface RedeemFormProps {
  walletAddress: string;
  onTransactionComplete?: () => void;
}

export function RedeemForm({ walletAddress, onTransactionComplete }: RedeemFormProps) {
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
  const redeemFeeRate = stats?.redeemFeeRate || 0.003;
  const pusdAmount = parseFloat(amount) || 0;
  const usdValue = pusdAmount; // 1 PUSD = 1 USD
  const redeemFee = usdValue * redeemFeeRate;
  const netUsdValue = usdValue - redeemFee;
  const currentPiPrice = piPrice || 0;
  const piOutput = currentPiPrice > 0 ? netUsdValue / currentPiPrice : 0;
  const pusdBalance = parseFloat(balance?.pusd?.amount || '0');
  const hasSufficientBalance = pusdBalance >= pusdAmount;

  const handleRedeem = () => {
    if (!amount || pusdAmount <= 0) {
      setError('Enter an amount');
      return;
    }
    if (!hasSufficientBalance) {
      setError('Insufficient balance');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmRedeem = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const keypair = await retrieveKeypairForTransaction(walletAddress);
      const result = await apiClient.redeem({
        amount: pusdAmount,
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
    setAmount(pusdBalance.toFixed(2));
  };

  // Success state
  if (showSuccess) {
    return (
      <div className="flex flex-col h-full">
        <SuccessAnimation
          title="Done"
          subtitle={txResult?.txHash ? `ID: ${txResult.txHash.slice(0, 8)}...` : 'Your Pi is ready'}
          amount={piOutput.toFixed(4)}
          currency="Pi"
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
          currency="PUSD"
          secondaryValue={piOutput > 0 ? `${piOutput.toFixed(4)}` : undefined}
          secondaryCurrency={piOutput > 0 ? 'Pi' : undefined}
          maxValue={pusdBalance}
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
      {pusdAmount > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/50 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Fee ({(redeemFeeRate * 100).toFixed(1)}%)</span>
            </div>
            <span className="font-mono text-foreground">{redeemFee.toFixed(4)} PUSD</span>
          </div>
        </div>
      )}

      {/* Action button */}
      <div className="px-4 pb-4 safe-area-bottom">
        <Button
          onClick={handleRedeem}
          disabled={!amount || pusdAmount <= 0}
          className="w-full"
          size="lg"
        >
          {!hasSufficientBalance && pusdAmount > 0 ? 'Insufficient Balance' : 'Continue'}
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
                <span className="text-muted-foreground">You convert</span>
                <span className="font-mono font-medium">{pusdAmount.toFixed(4)} PUSD</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Value</span>
                <span className="font-mono text-sm">${usdValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-mono text-sm">{redeemFee.toFixed(4)} PUSD</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-medium">You receive</span>
                <span className="font-mono font-semibold text-success">
                  {piOutput.toFixed(4)} Pi
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
                onClick={confirmRedeem}
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
