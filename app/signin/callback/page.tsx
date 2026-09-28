'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import {
  PI_AUTH_METHOD_KEY,
  PI_OAUTH_AUTH_METHOD,
  PI_OAUTH_RETURN_KEY,
  PI_OAUTH_STATE_KEY,
  fetchPiUser,
  parseCallbackFragment,
  safeReturnPath,
} from '@/lib/pi-signin';

type Status = 'processing' | 'success' | 'error';

interface SignInResponse {
  success?: boolean;
  data?: {
    user?: { id?: string; piUid?: string; piUsername?: string };
    token?: string;
  };
  error?: string;
}

export default function SignInCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('processing');
  const [message, setMessage] = useState('Completing Pi sign-in...');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return
    started.current = true

    const completeSignIn = async () => {
      const returnTo = safeReturnPath(sessionStorage.getItem(PI_OAUTH_RETURN_KEY));
      const storedState = sessionStorage.getItem(PI_OAUTH_STATE_KEY);
      const { accessToken, state, error } = parseCallbackFragment(window.location.hash);
      // Drop the fragment so the token never lingers in the address bar or history.
      window.history.replaceState(null, '', window.location.pathname);

      const fail = (text: string) => {
        setStatus('error');
        setMessage(text);
        sessionStorage.removeItem(PI_OAUTH_STATE_KEY);
        sessionStorage.removeItem(PI_OAUTH_RETURN_KEY);
        setTimeout(() => router.replace('/'), 2500);
      };

      try {
        if (error) {
          fail(error === 'access_denied' ? 'Sign-in was cancelled' : `Sign-in failed: ${error}`);
          return;
        }

        if (!accessToken) {
          fail('No access token received from Pi');
          return;
        }

        if (!storedState || !state || state !== storedState) {
          fail('Invalid sign-in state. Please try again.');
          return;
        }

        sessionStorage.removeItem(PI_OAUTH_STATE_KEY);
        sessionStorage.removeItem(PI_OAUTH_RETURN_KEY);

        const piUser = await fetchPiUser(accessToken);

        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        });
        const payload = (await response.json()) as SignInResponse;
        const backendToken = payload?.data?.token;

        if (!response.ok || !payload?.success || !backendToken) {
          throw new Error(payload?.error || 'Unable to complete sign-in');
        }

        const user = {
          uid: piUser.uid,
          username: payload.data?.user?.piUsername || piUser.username,
          wallet_address: piUser.wallet_address,
        };

        localStorage.setItem('auth_token', backendToken);
        localStorage.setItem('pi_access_token', accessToken);
        localStorage.setItem('pi_user', JSON.stringify(user));
        localStorage.setItem(PI_AUTH_METHOD_KEY, PI_OAUTH_AUTH_METHOD);

        setStatus('success');
        setMessage(`Welcome, ${user.username}!`);
        setTimeout(() => router.replace(returnTo), 1200);
      } catch (caught) {
        fail(caught instanceof Error ? caught.message : 'Sign-in failed');
      }
    };

    void completeSignIn();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        {status === 'processing' && (
          <>
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-accent" />
            <p className="text-base font-medium text-foreground">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-green-500" />
            <p className="text-base font-medium text-foreground">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
            <p className="text-base font-medium text-foreground">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
