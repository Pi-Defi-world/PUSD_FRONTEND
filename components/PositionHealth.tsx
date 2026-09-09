'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api/client';
import { PositionHealth as PositionHealthType, VolatilityData, SuggestedAction, SoftLiquidationData } from '@/types';
import { 
  Shield, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Plus,
  Minus,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PositionHealthProps {
  walletAddress: string;
  onActionClick?: (action: SuggestedAction) => void;
}

export function PositionHealth({ walletAddress, onActionClick }: PositionHealthProps) {
  const [positionHealth, setPositionHealth] = useState<PositionHealthType | null>(null);
  const [volatility, setVolatility] = useState<VolatilityData | null>(null);
  const [softLiquidation, setSoftLiquidation] = useState<SoftLiquidationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const isTestnet = apiClient.isTestnetMode();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [healthResponse, volatilityResponse, softLiquidationResponse] = await Promise.all([
        apiClient.getPositionHealth(walletAddress),
        apiClient.getCurrentVolatility(),
        apiClient.getSoftLiquidationOffers(walletAddress).catch(() => ({ success: false, data: null })),
      ]);

      if (healthResponse.success && healthResponse.data) {
        setPositionHealth(healthResponse.data as PositionHealthType);
      }

      if (volatilityResponse.success && volatilityResponse.data) {
        setVolatility(volatilityResponse.data as VolatilityData);
      }

      if (softLiquidationResponse.success && softLiquidationResponse.data) {
        setSoftLiquidation(softLiquidationResponse.data as SoftLiquidationData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch position health';
      setError(errorMessage);
      console.error('Error fetching position health:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchData();
      // Refresh every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [walletAddress]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Position Health
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
            <Shield className="h-5 w-5" />
            Position Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchData} variant="outline" className="mt-4 w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!positionHealth || !positionHealth.hasPosition) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Position Health
          </CardTitle>
          <CardDescription>No active position found</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don&apos;t have an active collateral position. Mint PUSD to create a position.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { position, health, urgency, effectiveLiquidationThreshold, minCollateralRatio, suggestedActions, piPrice } = positionHealth;
  const collateralRatio = position?.collateralRatio || 0;
  const ratioPercent = (collateralRatio * 100).toFixed(1);
  const minRatioPercent = (minCollateralRatio * 100).toFixed(0);
  const thresholdPercent = (effectiveLiquidationThreshold * 100).toFixed(0);

  // Calculate progress bar value (0-100)
  const safeZone = minCollateralRatio * 1.5;
  const progressValue = Math.min(100, (collateralRatio / safeZone) * 100);

  // Health status colors and icons
  const healthConfig = {
    SAFE: { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle, label: 'Safe Zone' },
    CAUTION: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertTriangle, label: 'Caution Zone' },
    WARNING: { color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertTriangle, label: 'Warning Zone' },
    DANGER: { color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle, label: 'Danger Zone' },
    LIQUIDATION: { color: 'text-red-700', bg: 'bg-red-100', icon: AlertCircle, label: 'Liquidation Risk' },
  };

  const healthInfo =
    health in healthConfig ? healthConfig[health as keyof typeof healthConfig] : healthConfig.SAFE;
  const HealthIcon = healthInfo.icon;

  // Volatility tier badge
  const volatilityTier = volatility?.level || 'NORMAL';
  const tierColors: Record<string, string> = {
    CALM: 'bg-green-100 text-green-800',
    NORMAL: 'bg-blue-100 text-blue-800',
    ELEVATED: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    SEVERE: 'bg-red-100 text-red-800',
    EXTREME: 'bg-red-200 text-red-900',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Position Health</CardTitle>
          </div>
          <Button onClick={fetchData} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Real-time monitoring of your collateral position
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HealthIcon className={`h-5 w-5 ${healthInfo.color}`} />
              <span className="font-semibold">{healthInfo.label}</span>
            </div>
            <Badge className={tierColors[volatilityTier] || tierColors.NORMAL}>
              {volatilityTier}
            </Badge>
          </div>

          {/* Collateral Ratio Display */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Ratio</span>
              <span className={`font-bold ${healthInfo.color}`}>{ratioPercent}%</span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Liquidation: {thresholdPercent}%</span>
              <span>Minimum: {minRatioPercent}%</span>
            </div>
          </div>

          {/* Position Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Collateral</div>
              <div className="text-sm font-semibold">
                {position?.piCollateral.toFixed(4)} Pi
              </div>
              <div className="text-xs text-muted-foreground">
                ${((position?.piCollateral || 0) * piPrice).toFixed(2)} USD
              </div>
              {isTestnet && (
                <div className="text-xs text-muted-foreground mt-1 italic">
                  Includes reserve + pool balances
                </div>
              )}
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Debt</div>
              <div className="text-sm font-semibold">
                {position?.pusdDebt.toFixed(2)} PUSD
              </div>
              <div className="text-xs text-muted-foreground">
                ${position?.pusdDebt.toFixed(2)} USD
              </div>
            </div>
          </div>

          {/* Zones Visualization */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground mb-2">Risk Zones</div>
            <div className="space-y-1">
              <div className={`flex items-center justify-between p-2 rounded text-xs ${
                collateralRatio > minCollateralRatio * 1.5 ? 'bg-green-50 text-green-700' : 'text-muted-foreground'
              }`}>
                <span>Safe Zone: &gt;{(minCollateralRatio * 1.5 * 100).toFixed(0)}%</span>
                {collateralRatio > minCollateralRatio * 1.5 && <CheckCircle className="h-3 w-3" />}
              </div>
              <div className={`flex items-center justify-between p-2 rounded text-xs ${
                collateralRatio > minCollateralRatio && collateralRatio <= minCollateralRatio * 1.5 
                  ? 'bg-yellow-50 text-yellow-700' : 'text-muted-foreground'
              }`}>
                <span>Warning Zone: {minRatioPercent}% - {(minCollateralRatio * 1.5 * 100).toFixed(0)}%</span>
                {collateralRatio > minCollateralRatio && collateralRatio <= minCollateralRatio * 1.5 && (
                  <AlertTriangle className="h-3 w-3" />
                )}
              </div>
              <div className={`flex items-center justify-between p-2 rounded text-xs ${
                collateralRatio <= minCollateralRatio && collateralRatio > effectiveLiquidationThreshold
                  ? 'bg-orange-50 text-orange-700' : 'text-muted-foreground'
              }`}>
                <span>Danger Zone: {thresholdPercent}% - {minRatioPercent}%</span>
                {collateralRatio <= minCollateralRatio && collateralRatio > effectiveLiquidationThreshold && (
                  <AlertCircle className="h-3 w-3" />
                )}
              </div>
              <div className={`flex items-center justify-between p-2 rounded text-xs ${
                collateralRatio <= effectiveLiquidationThreshold ? 'bg-red-50 text-red-700' : 'text-muted-foreground'
              }`}>
                <span>Liquidation Zone: &lt;{thresholdPercent}%</span>
                {collateralRatio <= effectiveLiquidationThreshold && <AlertCircle className="h-3 w-3" />}
              </div>
            </div>
          </div>

          {/* Market Status */}
          {volatility && (
            <Alert className={healthInfo.bg}>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Current Market: <strong>{volatilityTier}</strong></span>
                  <span className="text-xs">Volatility Score: {volatility.score.toFixed(0)}</span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Suggested Actions */}
          {suggestedActions && suggestedActions.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Suggested Actions</div>
              {suggestedActions.map((action, index) => (
                <Button
                  key={index}
                  variant={urgency === 'CRITICAL' || urgency === 'URGENT' ? 'destructive' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => {
                    if (onActionClick) {
                      onActionClick(action);
                    } else {
                      toast({
                        title: action.type === 'ADD_COLLATERAL' ? 'Add Collateral' : 'Repay Debt',
                        description: action.description,
                      });
                    }
                  }}
                >
                  {action.type === 'ADD_COLLATERAL' ? (
                    <Plus className="mr-2 h-4 w-4" />
                  ) : (
                    <Minus className="mr-2 h-4 w-4" />
                  )}
                  {action.description}
                </Button>
              ))}
            </div>
          )}

          {/* Soft Liquidation Option */}
          {softLiquidation?.eligible && (
            <Alert className="bg-orange-50 border-orange-200">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <div>
                    <strong>Soft Liquidation Available</strong>
                  </div>
                  <div className="text-sm">
                    Your position is at risk but eligible for soft liquidation. You can repay 50% of your debt with only a 3% penalty (vs 8% for full liquidation).
                  </div>
                  {softLiquidation.offerDetails && (
                    <div className="text-xs space-y-1 mt-2">
                      <div>Debt to repay: {softLiquidation.offerDetails.softCloseDebtAmount.toFixed(2)} PUSD</div>
                      <div>Penalty: {softLiquidation.offerDetails.penaltyAmount.toFixed(2)} PUSD (3%)</div>
                      <div>Total: {(softLiquidation.offerDetails.softCloseDebtAmount + softLiquidation.offerDetails.penaltyAmount).toFixed(2)} PUSD</div>
                    </div>
                  )}
                  {softLiquidation.activeOffers && softLiquidation.activeOffers.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {softLiquidation.activeOffers.map((offer) => (
                        <Button
                          key={offer.id}
                          variant="outline"
                          className="w-full"
                          onClick={async () => {
                            try {
                              const response = await apiClient.acceptSoftLiquidation(walletAddress, offer.id);
                              if (response.success) {
                                const payload = response.data as { debtToRepay: number; penaltyAmount: number };
                                toast({
                                  title: 'Soft Liquidation Accepted',
                                  description: `You will repay ${payload.debtToRepay.toFixed(2)} PUSD with a ${payload.penaltyAmount.toFixed(2)} PUSD penalty.`,
                                });
                                fetchData();
                              }
                            } catch (err) {
                              toast({
                                title: 'Error',
                                description: err instanceof Error ? err.message : 'Failed to accept soft liquidation',
                                variant: 'destructive',
                              });
                            }
                          }}
                        >
                          Accept Soft Liquidation Offer
                          {offer.timeRemaining > 0 && (
                            <span className="ml-2 text-xs">
                              (Expires in {Math.floor(offer.timeRemaining)}h)
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Urgency Alert */}
          {(urgency === 'URGENT' || urgency === 'CRITICAL') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{urgency === 'CRITICAL' ? 'CRITICAL: ' : 'URGENT: '}</strong>
                {urgency === 'CRITICAL' 
                  ? 'Immediate action required to avoid liquidation.'
                  : 'Action required soon to maintain position safety.'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

