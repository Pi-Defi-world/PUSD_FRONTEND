'use client';

import React, { useState } from 'react';
import { usePi } from '@/components/providers/pi-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Use a simple styled textarea here to avoid extra UI dependencies

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: { amount: number; paymentId?: string }) => void;
}

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

export default function DonationModal({ isOpen, onClose, onSuccess }: DonationModalProps) {
  const { user, createPayment } = usePi();
  const [amount, setAmount] = useState<number>(10);
  const [memo, setMemo] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setAmount(10);
    setMemo('');
    setStatus('idle');
    setError(null);
    setIsProcessing(false);
  };

  const handleClose = () => {
    if (isProcessing) return;
    resetState();
    onClose();
  };

  const handleDonate = async () => {
    if (!amount || amount < 0.1) {
      setError('Please enter a valid amount (minimum 0.1 π).');
      return;
    }
    if (!user) {
      setError('Please connect with Pi before donating.');
      return;
    }

    setIsProcessing(true);
    setStatus('processing');
    setError(null);

    try {
      const donationMemo = memo || `Donation to PUSD - ${amount} π`;
      const metadata = {
        type: 'donation',
        userId: (user as any).uid,
        timestamp: new Date().toISOString(),
      };

      const result = await createPayment(amount, donationMemo, metadata, {
        userId: (user as any).uid,
        amount,
        memo: donationMemo,
        metadata,
      });

      if (result && result.success) {
        setStatus('success');
        setTimeout(() => {
          onSuccess?.({ amount, paymentId: result.paymentId });
          handleClose();
        }, 1200);
      } else {
        setStatus('error');
        setError(result?.message || result?.error || 'Donation failed. Please try again.');
      }
    } catch (e: any) {
      setStatus('error');
      setError(e?.message || 'Donation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Donate with Pi</h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
            disabled={isProcessing}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-xs rounded-md bg-muted px-3 py-2">
            Donating as:{' '}
            <span className="font-medium">
              {(user as any)?.username || (user as any)?.uid || 'Unknown user'}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (π)</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  size="sm"
                  variant={amount === preset ? 'default' : 'outline'}
                  onClick={() => setAmount(preset)}
                  disabled={isProcessing}
                >
                  {preset} π
                </Button>
              ))}
            </div>
            <Input
              type="number"
              min={0.1}
              step={0.1}
              value={Number.isNaN(amount) ? '' : amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              disabled={isProcessing}
              placeholder="Custom amount"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message (optional)</label>
            <textarea
              rows={3}
              value={memo}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMemo(e.target.value)}
              disabled={isProcessing}
              placeholder="Thank you for building PUSD!"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {status === 'processing' && (
            <p className="text-xs text-muted-foreground">Processing donation in Pi Browser…</p>
          )}

          {status === 'success' && (
            <p className="text-xs text-emerald-500">Donation successful. Thank you!</p>
          )}

          {status === 'error' && error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={handleDonate}
              disabled={isProcessing || amount < 0.1}
            >
              {isProcessing ? 'Processing…' : `Donate ${amount || 0} π`}
            </Button>
            <Button variant="outline" type="button" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

