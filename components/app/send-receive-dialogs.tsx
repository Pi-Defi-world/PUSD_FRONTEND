'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWalletStore } from '@/lib/store/walletStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Copy, Loader2, QrCode, Send } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface SendReceiveDialogsProps {
  sendOpen: boolean;
  onSendOpenChange: (open: boolean) => void;
  receiveOpen: boolean;
  onReceiveOpenChange: (open: boolean) => void;
}

export function SendReceiveDialogs({
  sendOpen,
  onSendOpenChange,
  receiveOpen,
  onReceiveOpenChange,
}: SendReceiveDialogsProps) {
  const { walletAddress, balance, fetchBalance } = useWalletStore();
  const { toast } = useToast();
  
  // Send state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({ title: 'Copied!', description: 'Address copied to clipboard' });
    }
  };

  const handleSend = async () => {
    if (!recipient || !amount || parseFloat(amount) <= 0) {
      toast({ title: 'Invalid input', description: 'Please provide a valid recipient and amount.', variant: 'destructive' });
      return;
    }

    if (!walletAddress) return;

    setIsSending(true);
    try {
      const { secretSeed } = await useAuthStore.getState().retrieveKeypairForTransaction(walletAddress);
      
      const response = await apiClient.transfer({
        from: walletAddress,
        to: recipient,
        amount: parseFloat(amount),
        secretSeed,
      });

      if (response.success) {
        toast({ title: 'Success', description: `Sent ${amount} PUSD to ${recipient.slice(0, 6)}...` });
        onSendOpenChange(false);
        fetchBalance(walletAddress);
        setRecipient('');
        setAmount('');
      } else {
        throw new Error(response.error || 'Transfer failed');
      }
    } catch (error) {
      toast({ title: 'Transfer failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Receive Dialog */}
      <Dialog open={receiveOpen} onOpenChange={onReceiveOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receive PUSD</DialogTitle>
            <DialogDescription>
              Share your wallet address to receive PUSD or Pi.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-6 py-6">
            <div className="bg-white p-4 rounded-2xl shadow-inner">
              <QrCode className="w-48 h-48 text-black" />
              {/* In a real app, use a QR component: <QRCode value={walletAddress || ''} size={192} /> */}
            </div>
            <div className="w-full space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Your Wallet Address</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted p-3 rounded-xl font-mono text-xs break-all border border-border">
                  {walletAddress}
                </div>
                <Button variant="outline" size="icon" className="shrink-0" onClick={handleCopyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" className="w-full" onClick={() => onReceiveOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={sendOpen} onOpenChange={onSendOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send PUSD</DialogTitle>
            <DialogDescription>
              Transfer PUSD to another wallet address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="G..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="amount">Amount (PUSD)</Label>
                <span className="text-xs text-muted-foreground">
                  Balance: {parseFloat(balance?.pusd?.amount || '0').toFixed(2)} PUSD
                </span>
              </div>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="ghost" onClick={() => onSendOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending} className="flex-1 gap-2">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send PUSD
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
