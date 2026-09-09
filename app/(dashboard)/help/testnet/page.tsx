'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestnetBadge } from '@/components/TestnetBadge';
import { AlertTriangle, Info, HelpCircle, CheckCircle } from 'lucide-react';

export default function TestnetHelpPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Testnet Help</h1>
          <TestnetBadge />
        </div>
        <p className="text-muted-foreground">
          Learn about testnet operations and how to safely experiment with PUSD without real funds.
        </p>
      </div>

      <div className="space-y-6">
        {/* What is Testnet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              What is Testnet?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The testnet is a testing environment that simulates the mainnet PUSD stablecoin system.
              It allows developers and users to test functionality without using real assets.
            </p>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Testnet tokens have no real value. Do not use testnet for production purposes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Testnet vs mainnet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Testnet vs Mainnet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Testnet</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Runs on Pi Testnet with play‑money Pi and PUSD.</li>
                  <li>Used to test wallet flows, mint/redeem UX, and account management.</li>
                  <li>No real USD, no bank connections.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Mainnet (Future)</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Will connect PUSD to an off‑chain USD reserve (cash + T‑bills).</li>
                  <li>Same Soroban contracts, but with real banking/treasury integrations.</li>
                  <li>Subject to stricter operational and compliance controls.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>Common issues and solutions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Backend not reachable</h3>
                <p className="text-sm text-muted-foreground">
                  If you see errors loading balances or reserve data, check that the backend is running and{' '}
                  <code className="bg-muted px-1 rounded">NEXT_PUBLIC_SERVER_URL</code> is correctly set.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Wrong network</h3>
                <p className="text-sm text-muted-foreground">
                  Ensure that <code className="bg-muted px-1 rounded">NEXT_PUBLIC_NETWORK=testnet</code> is set
                  when using testnet, or &quot;mainnet&quot; when connecting to production.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Required configuration for testnet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                <div>NEXT_PUBLIC_NETWORK=testnet</div>
                <div className="text-muted-foreground mt-1"># Set to &apos;testnet&apos; or &apos;mainnet&apos;</div>
              </div>
              <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                <div>NEXT_PUBLIC_SERVER_URL=http://localhost:8001</div>
                <div className="text-muted-foreground mt-1"># Backend API URL</div>
              </div>
              <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                <div>NEXT_PUBLIC_USD_TEST_ASSET_CODE=USDTEST</div>
                <div className="text-muted-foreground mt-1"># USD-TEST asset code (optional)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

