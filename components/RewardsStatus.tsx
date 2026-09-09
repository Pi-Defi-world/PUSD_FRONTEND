'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api/client';
import { RewardStatus } from '@/types';
import { 
  Gift, 
  Shield, 
  Star,
  Percent,
  Clock,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RewardsStatusProps {
  walletAddress: string;
}

export function RewardsStatus({ walletAddress }: RewardsStatusProps) {
  const [rewardStatus, setRewardStatus] = useState<RewardStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRewards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getRewardStatus();

      if (response.success && response.data) {
        setRewardStatus(response.data as RewardStatus);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rewards';
      setError(errorMessage);
      console.error('Error fetching rewards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchRewards();
      // Refresh every 60 seconds
      const interval = setInterval(fetchRewards, 60000);
      return () => clearInterval(interval);
    }
  }, [walletAddress]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Rewards & Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Rewards & Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <button onClick={fetchRewards} className="mt-4 text-sm text-primary hover:underline">
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!rewardStatus || rewardStatus.rewards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              <CardTitle>Rewards & Benefits</CardTitle>
            </div>
            <button onClick={fetchRewards} className="text-sm text-muted-foreground hover:text-foreground">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <CardDescription>Earn rewards by maintaining healthy positions</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Gift className="h-4 w-4" />
            <AlertDescription>
              No active rewards. Maintain a position above 200% collateralization or keep 180%+ for 90+ days to earn rewards.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { rewards, totalFeeDiscount, hasLiquidationImmunity, isPlatinum } = rewardStatus;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            <CardTitle>Rewards & Benefits</CardTitle>
          </div>
          <button onClick={fetchRewards} className="text-sm text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <CardDescription>Your loyalty rewards and benefits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <div className="text-xs text-muted-foreground">Total Fee Discount</div>
            <div className="text-lg font-semibold flex items-center gap-1">
              <Percent className="h-4 w-4" />
              {(totalFeeDiscount * 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Active Rewards</div>
            <div className="text-lg font-semibold">{rewards.length}</div>
          </div>
        </div>

        {/* Special Status Badges */}
        <div className="flex flex-wrap gap-2">
          {hasLiquidationImmunity && (
            <Badge className="bg-green-100 text-green-800">
              <Shield className="mr-1 h-3 w-3" />
              Liquidation Immunity
            </Badge>
          )}
          {isPlatinum && (
            <Badge className="bg-purple-100 text-purple-800">
              <Star className="mr-1 h-3 w-3" />
              Platinum Status
            </Badge>
          )}
          {totalFeeDiscount > 0 && (
            <Badge className="bg-blue-100 text-blue-800">
              <Percent className="mr-1 h-3 w-3" />
              Fee Discount Active
            </Badge>
          )}
        </div>

        {/* Individual Rewards */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Active Rewards</div>
          {rewards.map((reward) => (
            <div key={reward.id} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {reward.type === 'PLATINUM' && <Star className="h-4 w-4 text-purple-600" />}
                  {reward.type === 'LOYALTY' && <Shield className="h-4 w-4 text-green-600" />}
                  {reward.type === 'QUICK_RESPONSE' && <Clock className="h-4 w-4 text-blue-600" />}
                  {reward.type === 'FEE_REBATE' && <Gift className="h-4 w-4 text-orange-600" />}
                  <span className="font-medium capitalize">
                    {reward.type.replace('_', ' ').toLowerCase()}
                  </span>
                </div>
                {reward.expiresAt && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    Expires {new Date(reward.expiresAt).toLocaleDateString()}
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Fee Discount: </span>
                  <span className="font-semibold">{(reward.feeDiscount * 100).toFixed(2)}%</span>
                </div>
                {reward.liquidationImmunity && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Shield className="h-3 w-3" />
                    <span className="text-xs">Liquidation Immunity</span>
                  </div>
                )}
                {reward.platinumStatus && (
                  <div className="flex items-center gap-1 text-purple-600">
                    <Star className="h-3 w-3" />
                    <span className="text-xs">Platinum Status</span>
                  </div>
                )}
              </div>

              {reward.metadata && (
                <div className="text-xs text-muted-foreground">
                  {typeof reward.metadata.daysMaintained === 'number' && (
                    <span>Maintained for {reward.metadata.daysMaintained} days</span>
                  )}
                  {typeof reward.metadata.responseTimeHours === 'number' && (
                    <span>Responded in {reward.metadata.responseTimeHours.toFixed(1)}h</span>
                  )}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Earned: {new Date(reward.earnedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Info */}
        <Alert>
          <Gift className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1 text-sm">
              <div><strong>How to earn rewards:</strong></div>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Maintain &gt;200% collateralization → 0.5% fee discount + liquidation immunity</li>
                <li>Maintain &gt;180% for 90+ days → 1% fee discount + platinum status</li>
                <li>Respond to warnings within 6 hours → Full fee rebate</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}


