export interface User {
  id: string;
  walletAddress: string;
  piUid: string;
  piUsername: string;
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
}

export interface StablecoinConfig {
  network: {
    serverUrl: string;
    networkPassphrase: string;
  };
  stablecoin: {
    asset: {
      code: string;
      name: string;
    };
    peg: {
      target: string;
      ratio: number;
      description: string;
    };
    model: string;
    features: {
      authRequired: boolean;
      authRevocable: boolean;
      clawbackEnabled: boolean;
    };
  };
  oracle: {
    apiUrl: string;
    endpoints: {
      price: string;
      piPrice: string;
      health: string;
    };
    updateInterval: number;
    maxPriceAge: number;
    priceTolerance: number;
  };
  accounts: {
    issuer: {
      name: string;
      publicKey: string;
      secret: string;
      description: string;
    };
    reserve: {
      name: string;
      publicKey: string;
      secret: string;
      description: string;
    };
    treasury: {
      name: string;
      publicKey: string;
      secret: string;
      description: string;
    };
    testUser: {
      name: string;
      publicKey: string;
      secret: string;
      description: string;
    };
  };
  limits: {
    minMint: string;
    maxMint: string;
    minRedeem: string;
    maxRedeem: string;
    minBackingRatio: number;
  };
  fees: {
    mintFee: string;
    redeemFee: string;
    apiFee: string;
    arbitrageFee: string;
  };
  business: {
    revenue: {
      mintBurnFees: {
        enabled: boolean;
        mintRate: number;
        redeemRate: number;
        description: string;
      };
      apiFees: {
        enabled: boolean;
        rate: number;
        description: string;
      };
      arbitrageFees: {
        enabled: boolean;
        rate: number;
        description: string;
      };
      yieldGeneration: {
        enabled: boolean;
        maxStakingRatio: number;
        description: string;
      };
    };
    overcollateralization: {
      enabled: boolean;
      minRatio: number;
      targetRatio: number;
      maxRatio: number;
      description: string;
    };
    treasury: {
      surplusManagement: {
        enabled: boolean;
        autoReinvest: boolean;
        stabilityFund: boolean;
        description: string;
      };
      fiatIntegration: {
        enabled: boolean;
        partners: string[];
        description: string;
      };
    };
  };
  safety: {
    maxPriceChange: number;
    emergencyPause: boolean;
    circuitBreaker: boolean;
    liquidationThreshold: number;
    stabilityBuffer: number;
  };
  analytics: {
    tracking: {
      enabled: boolean;
      metrics: string[];
      description: string;
    };
    reporting: {
      enabled: boolean;
      interval: string;
      description: string;
    };
  };
}

export interface Transaction {
  id: string;
  type: 'mint' | 'redeem';
  amount: number;
  usdValue: number;
  piAmount: number;
  piPrice: number;
  fees: {
    amount: number;
    rate: number;
  };
  status: 'pending' | 'success' | 'failed';
  transactionHash?: string;
  timestamp: Date;
  userAddress: string;
}

export interface TransactionHistoryItem {
  hash: string;
  ledger: number;
  createdAt: string;
  type: 'mint' | 'redeem' | 'transfer' | 'trustline' | 'other';
  pusdAmount: string | null;
  pusdFee?: string | null; // PUSD fee paid (optional)
  zyraAmount?: string | null;
  zyraFee?: string | null;
  piAmount: string | null;
  direction: 'in' | 'out' | null;
  fee: string; // Network fee in stroops
  feeInTestnetPi?: string; // Network fee in Testnet Pi (optional, for display)
  success: boolean;
  memo: string | null;
}

export interface Balance {
  pi: {
    amount: string;
    usdValue: string;
  };
  pusd: {
    amount: string;
    usdValue: string;
    hasTrustline: boolean;
    limit?: string;
  };
  // Legacy support for ZYRA field names
  zyra?: {
    amount: string;
    usdValue: string;
    hasTrustline: boolean;
    limit?: string;
  };
  piPrice: number;
  lastUpdate: Date;
  isTestnet?: boolean;
}

export interface Stats {
  totalPiReserve: string;
  totalUsdReserve: string;
  totalPUSDSupply: string;
  totalPUSDUsdValue: string;
  // Legacy support
  totalZyraSupply?: string;
  totalZyraUsdValue?: string;
  requiredUsd: string;
  backingRatio: string;
  reserveSurplus: string;
  totalFeesCollected: string;
  totalVolume: string;
  totalMints: number;
  totalRedeems: number;
  totalBurns: number;
  totalTransactions: number;
  totalHolders: number;
  piPrice: number;
  priceSource: string;
  lastPriceUpdate: string;
  overcollateralization: number;
  mintFeeRate: number;
  redeemFeeRate: number;
  isFullyBacked: boolean;
  businessModelActive: boolean;
  isTestnet?: boolean;
}

export interface Pool {
  id: string;
  assets: string[];
  reserves: string[];
  totalShares: string;
  fee: number;
  hasPUSD: boolean;
  // Legacy support
  hasZyra?: boolean;
}

export interface Keypair {
  publicKey: string;
  secret: string;
}

export interface PassphraseData {
  passphrase: string;
  walletAddress: string;
  secretKey: string;
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  salt: string;
}

export interface AuthSession {
  user: User;
  isAuthenticated: boolean;
  expiresAt: Date;
}

export interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
  timestamp?: string;
  publicKey?: string;
  secret?: string;
}

export interface MintRequest {
  userSecret: string;
  amount: number; // Pi amount for minting
}

export interface RedeemRequest {
  userSecret: string;
  amount: number; // PUSD amount for redeeming
}

export interface TrustlineRequest {
  userSecret: string;
}

export interface PoolCreateRequest {
  userSecret: string;
  pusdAmount: number;
  piAmount: number;
  // Legacy support
  zyraAmount?: number;
}

export interface PoolTradeRequest {
  userSecret: string;
  operation: 'buy' | 'sell';
  amount: number;
  assetToReceive: string;
}

// PasskeyCredential removed - no longer used with Pi Auth

export interface AuthResponseData {
  user?: User;
  token?: string; // JWT token for API authentication
  success?: boolean;
}

export interface VolatilityMetrics {
  priceVolatility24h: number;
  volumeSpike: number;
  liquidationsPerHour: number;
  redemptionRate: number;
}

export interface VolatilityData {
  level: 'CALM' | 'NORMAL' | 'ELEVATED' | 'HIGH' | 'SEVERE' | 'EXTREME';
  score: number;
  metrics: VolatilityMetrics;
  piPrice: number;
  timestamp: string;
}

export interface PositionData {
  id: string;
  piCollateral: number;
  pusdDebt: number;
  collateralRatio: number;
  currentTier: string;
}

export interface SuggestedAction {
  type: 'ADD_COLLATERAL' | 'REPAY_DEBT';
  description: string;
  piAmount?: number;
  pusdAmount?: number;
  targetRatio: number;
}

export interface PositionHealth {
  hasPosition: boolean;
  position?: PositionData;
  health: 'NO_POSITION' | 'SAFE' | 'CAUTION' | 'WARNING' | 'DANGER' | 'LIQUIDATION';
  urgency: 'INFO' | 'NOTICE' | 'WARNING' | 'URGENT' | 'CRITICAL';
  effectiveLiquidationThreshold: number;
  minCollateralRatio: number;
  suggestedActions: SuggestedAction[];
  piPrice: number;
}

export interface UserNotification {
  id: string;
  type: 'INFO' | 'NOTICE' | 'WARNING' | 'URGENT' | 'CRITICAL';
  title: string;
  message: string;
  suggestedActions: SuggestedAction[] | null;
  createdAt: string;
  isRead: boolean;
}

export interface UserReward {
  id: string;
  type: 'LOYALTY' | 'FEE_REBATE' | 'QUICK_RESPONSE' | 'PLATINUM';
  feeDiscount: number;
  liquidationImmunity: boolean;
  platinumStatus: boolean;
  earnedAt: string;
  expiresAt: string | null;
  metadata: Record<string, unknown> | null;
}

export interface RewardStatus {
  rewards: UserReward[];
  totalFeeDiscount: number;
  hasLiquidationImmunity: boolean;
  isPlatinum: boolean;
}

export interface SoftLiquidationOffer {
  id: string;
  positionId: string;
  currentRatio: number;
  liquidationThreshold: number;
  debtAmount: number;
  softCloseDebtAmount: number;
  penaltyRate: number;
  penaltyAmount: number;
  expiresAt: string;
  timeRemaining: number; // hours
}

export interface SoftLiquidationData {
  eligible: boolean;
  reason?: string;
  activeOffers: SoftLiquidationOffer[];
  offerDetails?: {
    currentRatio: number;
    liquidationThreshold: number;
    minCollateralRatio: number;
    debtAmount: number;
    softCloseDebtAmount: number;
    penaltyRate: number;
    penaltyAmount: number;
  };
}

// Testnet-specific types
export interface CollateralBreakdown {
  reserve: {
    piAmount: string;
    usdTestAmount: string;
    piValue: string;
    usdTestValue: string;
  };
  pool: {
    piAmount: string;
    usdTestAmount: string;
    piValue: string;
    usdTestValue: string;
  };
  total: {
    piAmount: string;
    usdTestAmount: string;
    totalValue: string;
    usdcRatio: number;
    piRatio: number;
  };
}

export interface PoolInfo {
  poolId: string;
  exists: boolean;
  totalShares: string;
  reserves: Array<{
    asset: string;
    amount: string;
  }>;
}

export interface ReserveStatus {
  reserve: {
    publicKey: string;
    piBalance: string;
    usdTestBalance: string;
    piValue: string;
    usdTestValue: string;
  };
  pool: {
    poolId: string | null;
    piAmount: string;
    usdTestAmount: string;
    piValue: string;
    usdTestValue: string;
    totalShares: string;
  };
  total: {
    piAmount: string;
    usdTestAmount: string;
    totalValue: string;
    usdcRatio: number;
    piRatio: number;
  };
  isTestnet: boolean;
}
