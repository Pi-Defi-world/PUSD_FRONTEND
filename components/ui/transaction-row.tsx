'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, ChevronRight, CheckCircle2, Clock, XCircle } from 'lucide-react';

type TransactionType = 'mint' | 'redeem' | 'send' | 'receive';
type TransactionStatus = 'pending' | 'completed' | 'failed';

interface TransactionRowProps {
  type: TransactionType;
  amount: string;
  currency: string;
  secondaryAmount?: string;
  secondaryCurrency?: string;
  status: TransactionStatus;
  timestamp: string | Date;
  txHash?: string;
  onClick?: () => void;
  className?: string;
}

const typeConfig: Record<TransactionType, { icon: React.ElementType; label: string; color: string }> = {
  mint: { icon: ArrowDownLeft, label: 'Mint', color: 'text-success bg-success/10' },
  redeem: { icon: ArrowUpRight, label: 'Redeem', color: 'text-accent bg-accent/10' },
  send: { icon: ArrowUpRight, label: 'Sent', color: 'text-muted-foreground bg-muted' },
  receive: { icon: ArrowDownLeft, label: 'Received', color: 'text-success bg-success/10' },
};

const statusConfig: Record<TransactionStatus, { icon: React.ElementType; color: string }> = {
  pending: { icon: Clock, color: 'text-warning' },
  completed: { icon: CheckCircle2, color: 'text-success' },
  failed: { icon: XCircle, color: 'text-destructive' },
};

export function TransactionRow({
  type,
  amount,
  currency,
  secondaryAmount,
  secondaryCurrency,
  status,
  timestamp,
  onClick,
  className,
}: TransactionRowProps) {
  const TypeIcon = typeConfig[type].icon;
  const StatusIcon = statusConfig[status].icon;
  
  const formattedTime = React.useMemo(() => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
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
  }, [timestamp]);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl',
        'bg-transparent hover:bg-muted/50',
        'transition-all duration-200 active:scale-[0.99]',
        'text-left',
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full',
          typeConfig[type].color
        )}
      >
        <TypeIcon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">
            {typeConfig[type].label}
          </span>
          <StatusIcon className={cn('h-3 w-3', statusConfig[status].color)} />
        </div>
        <span className="text-xs text-muted-foreground">{formattedTime}</span>
      </div>

      {/* Amount */}
      <div className="text-right">
        <div className="font-mono font-medium text-foreground">
          {type === 'send' || type === 'redeem' ? '-' : '+'}
          {amount} {currency}
        </div>
        {secondaryAmount && (
          <div className="text-xs text-muted-foreground font-mono">
            {secondaryAmount} {secondaryCurrency}
          </div>
        )}
      </div>

      {/* Chevron */}
      {onClick && (
        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
      )}
    </button>
  );
}

// Loading skeleton
export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-3 w-14 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-2 text-right">
        <div className="h-4 w-16 bg-muted rounded animate-pulse ml-auto" />
        <div className="h-3 w-12 bg-muted rounded animate-pulse ml-auto" />
      </div>
    </div>
  );
}
