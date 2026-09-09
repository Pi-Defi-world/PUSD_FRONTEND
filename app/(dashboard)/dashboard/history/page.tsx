'use client';

import { TransactionHistory } from '@/components/TransactionHistory';
import { useWalletStore } from '@/lib/store/walletStore';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const { walletAddress } = useWalletStore();
  const router = useRouter();

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 shrink-0" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
          <p className="text-muted-foreground text-sm">View your recent transactions and history</p>
        </div>
      </div>

      <TransactionHistory walletAddress={walletAddress || undefined} />
    </div>
  );
}
