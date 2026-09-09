'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { TransactionHistoryItem } from '@/types';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TransactionRow, TransactionRowSkeleton } from '@/components/ui/transaction-row';

interface TransactionHistoryProps {
  walletAddress?: string;
}

export function TransactionHistory({ walletAddress }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isTestnet = apiClient.isTestnetMode();
  
  const explorerTxUrl = isTestnet
    ? (hash: string) => `https://blockexplorer.minepi.com/testnet/tx/${hash}`
    : (hash: string) => `https://blockexplorer.minepi.com/tx/${hash}`;

  const fetchHistory = async () => {
    if (!walletAddress) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getTransactionHistory(50);
      
      if (response.success && response.data) {
        const data = response.data as { transactions: TransactionHistoryItem[]; count: number };
        setTransactions(data.transactions || []);
      } else {
        setError(response.error || 'Failed to fetch transaction history');
      }
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!walletAddress) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">Connect to view activity</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {[...Array(3)].map((_, i) => (
          <TransactionRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <XCircle className="h-8 w-8 mx-auto text-destructive/50 mb-3" />
        <p className="text-sm text-destructive mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchHistory}>
          Try Again
        </Button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Your history will show here
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
        {transactions.map((tx) => {
          const type = tx.type as 'mint' | 'redeem' | 'send' | 'receive';
          const amount = tx.pusdAmount || tx.zyraAmount || tx.piAmount || '0';
          const currency = tx.pusdAmount || tx.zyraAmount ? 'PUSD' : 'Pi';
          const status = tx.success ? 'completed' : 'failed';

          return (
            <div
              key={tx.hash}
              className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => window.open(explorerTxUrl(tx.hash), '_blank')}
            >
              {/* Icon */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full shrink-0',
                  type === 'mint' && 'text-success bg-success/10',
                  type === 'redeem' && 'text-accent bg-accent/10',
                  type === 'send' && 'text-muted-foreground bg-muted',
                  type === 'receive' && 'text-success bg-success/10'
                )}
              >
                {(type === 'mint' || type === 'receive') ? (
                  <ArrowDownLeft className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground capitalize">
                    {type}
                  </span>
                  {tx.success ? (
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  ) : (
                    <XCircle className="h-3 w-3 text-destructive" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(tx.createdAt)}
                </span>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <div className={cn(
                  'font-mono font-medium text-sm',
                  (type === 'mint' || type === 'receive') ? 'text-success' : 'text-foreground'
                )}>
                  {(type === 'mint' || type === 'receive') ? '+' : '-'}
                  {parseFloat(amount).toFixed(4)} {currency}
                </div>
                {tx.piAmount && currency !== 'Pi' && (
                  <div className="text-xs text-muted-foreground font-mono">
                    {type === 'mint' ? '-' : '+'}{parseFloat(tx.piAmount).toFixed(4)} Pi
                  </div>
                )}
              </div>

              {/* External link indicator */}
              <ExternalLink className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            </div>
          );
        })}
      </div>
      
      {/* Refresh button */}
      <div className="p-3 border-t border-border bg-muted/30">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchHistory}
          disabled={isLoading}
          className="w-full text-xs text-muted-foreground"
        >
          <RefreshCw className={cn('h-3 w-3 mr-2', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
