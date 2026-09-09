'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MintForm } from '@/components/MintForm';
import { RedeemForm } from '@/components/RedeemForm';
import { useWalletStore } from '@/lib/store/walletStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useTransactionStore } from '@/lib/store/transactionStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, PlusCircle, MinusCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function MintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { walletAddress, fetchBalance } = useWalletStore();
  const { fetchTransactionHistory } = useTransactionStore();
  const [activeTab, setActiveTab] = useState('mint');
  const [hasLocalWallet, setHasLocalWallet] = useState<boolean | null>(null);

  useEffect(() => {
    if (!searchParams) return;
    const tab = searchParams.get('tab');
    if (tab === 'redeem') {
      setActiveTab('redeem');
    }
  }, [searchParams]);

  useEffect(() => {
    const checkWallet = async () => {
    if (walletAddress) {
      console.log('MintContent: walletAddress from useWalletStore', walletAddress);
      const hasWallet = await useAuthStore.getState().hasWalletInIndexedDB(walletAddress);
      setHasLocalWallet(hasWallet);
    } else {
        setHasLocalWallet(false);
      }
    };
    checkWallet();
  }, [walletAddress]);

  const handleRefresh = () => {
    if (walletAddress) {
      setTimeout(() => {
        fetchBalance(walletAddress);
        fetchTransactionHistory();
      }, 3000);
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Mint & Burn</h1>
        <p className="text-muted-foreground text-sm">Convert Pi to PUSD and vice versa</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl h-11">
          <TabsTrigger value="mint" className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Mint
          </TabsTrigger>
          <TabsTrigger value="redeem" className="gap-2">
            <MinusCircle className="w-4 h-4" />
            Redeem
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mint" className="animate-fade-in min-h-[400px]">
          {walletAddress && hasLocalWallet ? (
            <MintForm 
              walletAddress={walletAddress} 
              onTransactionComplete={handleRefresh}
            />
          ) : (
            <Card className="p-8 text-center bg-card border-border">
              <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Wallet Setup Required</h3>
              <p className="text-muted-foreground mb-6">
                You need to create or import a wallet on this device to mint PUSD.
              </p>
              <Button onClick={() => router.push('/settings')}>
                Set Up Wallet
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="redeem" className="animate-fade-in min-h-[400px]">
          {walletAddress && hasLocalWallet ? (
            <RedeemForm 
              walletAddress={walletAddress} 
              onTransactionComplete={handleRefresh}
            />
          ) : (
            <Card className="p-8 text-center bg-card border-border">
              <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Wallet Setup Required</h3>
              <p className="text-muted-foreground mb-6">
                You need to create or import a wallet on this device to redeem PUSD.
              </p>
              <Button onClick={() => router.push('/settings')}>
                Set Up Wallet
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MintPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MintContent />
    </Suspense>
  );
}
