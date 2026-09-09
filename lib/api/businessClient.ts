/**
 * Lightweight client for the PUSD Business API (v1).
 * Use with an API key from the backend (create-api-key script).
 */

const DEFAULT_BASE = typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_SERVER_URL || '';

export interface BusinessApiConfig {
  baseUrl?: string;
  apiKey: string;
}

export interface PaymentCreateParams {
  amount: number;
  reference: string;
  callbackUrl?: string;
  recipientAddress?: string;
}

export interface PaymentResponse {
  id: string;
  reference: string;
  amount: string;
  status: string;
  payUrl?: string;
  transactionHash?: string;
  completedAt?: string;
  createdAt: string;
}

export interface BalanceResponse {
  walletAddress: string;
  pusdBalance?: string;
  piBalance?: string;
}

export class BusinessApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: BusinessApiConfig) {
    this.baseUrl = (config.baseUrl || DEFAULT_BASE).replace(/\/$/, '') + '/api/v1/business';
    this.apiKey = config.apiKey;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: string }> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || `HTTP ${res.status}` };
    }
    return json;
  }

  async getBalance(): Promise<{ success: boolean; data?: BalanceResponse; error?: string }> {
    return this.request<BalanceResponse>('/balance');
  }

  async createPayment(params: PaymentCreateParams): Promise<{ success: boolean; data?: PaymentResponse; error?: string }> {
    return this.request<PaymentResponse>('/payments', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getPayment(idOrReference: string): Promise<{ success: boolean; data?: PaymentResponse; error?: string }> {
    return this.request<PaymentResponse>(`/payments/${encodeURIComponent(idOrReference)}`);
  }
}

export function createBusinessClient(apiKey: string, baseUrl?: string): BusinessApiClient {
  return new BusinessApiClient({ apiKey, baseUrl });
}
