// Pi SDK TypeScript declarations
declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: Array<'username' | 'payments' | 'wallet_address'>,
        onIncompletePaymentFound?: (payment: PiPaymentDTO) => void
      ) => Promise<PiAuthResult>;
      createPayment: (paymentData: PiPaymentData, callbacks: PiPaymentCallbacks) => void;
      Ads?: {
        showAd: (adType: 'interstitial' | 'rewarded') => Promise<PiShowAdResponse>;
        isAdReady: (adType: 'interstitial' | 'rewarded') => Promise<PiIsAdReadyResponse>;
        requestAd: (adType: 'interstitial' | 'rewarded') => Promise<PiRequestAdResponse>;
      };
      openShareDialog?: (title: string, message: string) => void;
      openUrlInSystemBrowser?: (url: string) => Promise<void>;
      nativeFeaturesList?: () => Promise<Array<'inline_media' | 'request_permission' | 'ad_network'>>;
    };
  }
}

export interface PiAuthResult {
  accessToken: string;
  user: {
    uid: string;
    username?: string;
    wallet_address?: string;
  };
}

export interface PiPaymentDTO {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  from_address: string;
  to_address: string;
  direction: 'user_to_app' | 'app_to_user';
  created_at: string;
  network: 'Pi Network' | 'Pi Testnet';
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: null | {
    txid: string;
    verified: boolean;
    _link: string;
  };
}

export interface PiPaymentData {
  amount: number;
  memo: string;
  metadata?: Record<string, any>;
}

export interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PiPaymentDTO) => void;
}

export interface PiShowAdResponse {
  type: 'interstitial' | 'rewarded';
  result: 'AD_CLOSED' | 'AD_DISPLAY_ERROR' | 'AD_NETWORK_ERROR' | 'AD_NOT_AVAILABLE' | 'AD_REWARDED' | 'ADS_NOT_SUPPORTED' | 'USER_UNAUTHENTICATED';
  adId?: string;
}

export interface PiIsAdReadyResponse {
  type: 'interstitial' | 'rewarded';
  ready: boolean;
}

export interface PiRequestAdResponse {
  type: 'interstitial' | 'rewarded';
  result: 'AD_LOADED' | 'AD_FAILED_TO_LOAD' | 'AD_NOT_AVAILABLE';
}

export {};
