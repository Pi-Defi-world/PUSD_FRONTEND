import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private baseUrl: string;
  private sessionId: string | null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.sessionId = null;
  }

  private getSessionId(): string {
    const storageKey = 'pi_session_id';

    if (typeof window === 'undefined') {
      if (!this.sessionId) {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      }
      return this.sessionId;
    }

    const storedSessionId = localStorage.getItem(storageKey);
    if (storedSessionId) {
      this.sessionId = storedSessionId;
      return storedSessionId;
    }

    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    try {
      localStorage.setItem(storageKey, newSessionId);
    } catch (error) {
      console.warn('Unable to persist session identifier to localStorage', error);
    }
    this.sessionId = newSessionId;
    return newSessionId;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse> {
    const url = `${this.baseUrl.replace(/\/$/, '')}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-session-id': this.getSessionId(),
    };
     
    if (typeof window !== 'undefined') {
      defaultHeaders['Origin'] = window.location.origin;
      
      // Try JWT token first (from backend signin)
      let token = localStorage.getItem('auth_token');
      
      // Fallback to Pi access token if JWT not available
      // This allows API calls to work even if backend signin hasn't completed yet
      if (!token) {
        token = localStorage.getItem('pi_access_token');
      }
      
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      let data: any = null;
      // Some endpoints might not return JSON, or might be empty
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.warn(`Failed to parse JSON response from ${endpoint}`, e);
          data = { error: text };
        }
      }

      if (!response.ok) {
        // For 404 errors, include the status code in the error message for easier detection
        const errorMessage = data?.error || `HTTP ${response.status} ${response.statusText}`;
        const error = new Error(errorMessage) as Error & { status?: number };
        // Add status code to error for easier checking
        error.status = response.status;
        throw error;
      }

      return data || { success: true };
    } catch (error) {
      // Only log non-404 errors to avoid cluttering console
      const errorWithStatus = error as Error & { status?: number };
      if (!(error instanceof Error && errorWithStatus.status === 404)) {
        console.error(`API request failed: ${endpoint}`, error);
      }
      throw error;
    }
  }

  // Authentication methods
  async initPiAuth(piAuthData: {
    piAccessToken: string;
    piUid: string;
    piUsername: string;
  }) {
    return this.request('/auth/pi-init', {
      method: 'POST',
      body: JSON.stringify(piAuthData),
    });
  }

  async findUserByWallet(walletAddress: string) {
    return this.request('/auth/find-user-by-wallet', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }

  async findUserByUsername(username: string) {
    return this.request('/auth/find-user', {
      method: 'POST',
      body: JSON.stringify({ piUsername: username }),
    });
  }

  // Pi Authentication
  async signIn(authResult: {
    accessToken: string;
    user: { uid: string; username: string };
  }) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(authResult),
    });
  }

  // Account Management
  async importAccount(data: { mnemonic?: string; secret?: string }) {
    return this.request('/account/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPassphrase(username: string, passphrase: string) {
    return this.request('/auth/verify-passphrase', {
      method: 'POST',
      body: JSON.stringify({ username, passphrase }),
    });
  }


  // Balance Check Methods 
  async checkBalance(address: string) {
    return this.request(`/balance/check/${address}`);
  }

  async bulkCheckBalance(addresses: string[]) {
    return this.request('/balance/bulk-check', {
      method: 'POST',
      body: JSON.stringify({ addresses }),
    });
  }

  async enhancedBalanceCheck(address: string) {
    return this.request(`/balance/enhanced/${address}`);
  }

  // Health & Monitoring Methods  
  async healthCheck() {
    return this.request('/health');
  }

  async detailedHealthCheck() {
    return this.request('/health/detailed');
  }

  async getStats() {
    return this.request('/health/stats');
  }

  async getPiPrice() {
    return this.request('/health/price');
  }

  async getReserveStatus() {
    return this.request('/health/reserve');
  }

  async getReserveSummary() {
    return this.request('/health/reserve-summary');
  }

 
  async getPoolInfo() {
    return Promise.resolve({ success: false, data: null });
  }

  // Check if running on testnet
  isTestnetMode(): boolean {
    if (typeof window === 'undefined') {
      // Server-side: check environment variable
      return process.env.NEXT_PUBLIC_NETWORK === 'testnet';
    }
    // Client-side: check environment variable or hostname
    return (
      process.env.NEXT_PUBLIC_NETWORK === 'testnet' ||
      window.location.hostname.includes('testnet')
    );
  }

  async mint(data: {
    amount: number;
    walletAddress: string;
    secretSeed: string;
  }) {
    return this.request('/stablecoin/mint', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async redeem(data: {
    amount: number;
    walletAddress: string;
    secretSeed: string;
  }) {
    return this.request('/stablecoin/redeem', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBalanceLegacy() {
    return this.request('/stablecoin/balance');
  }

  // Wallet methods
  async getWalletInfo() {
    return this.request('/wallet/info');
  }

  async createWallet() {
    return this.request('/wallet/create', { method: 'POST' });
  }

  async getTransactionHistory(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/stablecoin/history${params}`);
  }

  // Volatility & Position Health Methods
  async getCurrentVolatility() {
    return this.request('/stablecoin/volatility/current');
  }

  async getVolatilityHistory(hours?: number) {
    const params = hours ? `?hours=${hours}` : '';
    return this.request(`/stablecoin/volatility/history${params}`);
  }

  async getPositionHealth(address: string) {
    return this.request(`/stablecoin/positions/${address}`);
  }

  async getPositionHealthDetailed(address: string) {
    return this.request(`/stablecoin/positions/${address}/health`);
  }

  async getNotifications(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/stablecoin/notifications${params}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/stablecoin/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  // Rewards & Incentives Methods
  async getRewardStatus() {
    return this.request('/stablecoin/rewards/status');
  }

  // Soft Liquidation Methods
  async getSoftLiquidationOffers(address: string) {
    return this.request(`/stablecoin/positions/${address}/soft-liquidation`);
  }

  async offerSoftLiquidation(address: string) {
    return this.request(`/stablecoin/positions/${address}/soft-liquidation/offer`, {
      method: 'POST',
    });
  }

  async acceptSoftLiquidation(address: string, offerId: string) {
    return this.request(`/stablecoin/positions/${address}/soft-liquidation/accept`, {
      method: 'POST',
      body: JSON.stringify({ offerId }),
    });
  }

  // Risk Signals (admin/internal)
  async getRiskSignals() {
    return this.request('/stablecoin/risk-signals');
  }

  // Savings
  async getSavingsBalance() {
    return this.request('/savings/balance');
  }

  async getSavingsRate() {
    return this.request('/savings/rate');
  }

  async savingsDeposit(amount: number, txHash?: string) {
    return this.request('/savings/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, txHash }),
    });
  }

  async savingsWithdraw(amount: number, txHash?: string) {
    return this.request('/savings/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, txHash }),
    });
  }

  async getSavingsHistory(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/savings/history${params}`);
  }

  // Lending & Borrowing
  async getLendingPosition(address: string) {
    return this.request(`/lending/position/${address}`);
  }

  async submitLendingRequest(data: {
    from: string;
    spender?: string;
    to?: string;
    requests: Array<{ request_type: number; address: string; amount: string | number }>;
    secretSeed: string;
  }) {
    return this.request('/lending/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transfer
  async transfer(data: {
    from: string;
    to: string;
    amount: number;
    secretSeed: string;
  }) {
    return this.request('/stablecoin/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
export { ApiClient };
