'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Info } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface ReserveSummary {
  totalUsdReserve: number;
  cashUsdReserve: number;
  tBillUsdReserve: number;
  piReserve: number;
  totalPUSDSupply: number;
  collateralizationRatio: number;
}

export default function ReserveTransparencyPage() {
  const [data, setData] = useState<ReserveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.getReserveStatus();
        if (!res?.success) {
          throw new Error(res?.error || 'Failed to load reserve status');
        }
        setData(res.data as ReserveSummary);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load reserve status';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reserves & Health</h1>
        <p className="text-sm text-muted-foreground">
          Off-chain USD reserves (cash + T-bills) backing the on-chain PUSD token, plus Pi exposure.
        </p>
      </div>

      {loading && (
        <Card>
          <CardContent className="py-8 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading reserve data…</span>
          </CardContent>
        </Card>
      )}

      {error && !loading && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {data && !loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total USD Reserve</CardTitle>
              <CardDescription>Cash + short-term Treasuries</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              ${data.totalUsdReserve.toFixed(2)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cash Reserve</CardTitle>
              <CardDescription>Bank deposits / MMF cash</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              ${data.cashUsdReserve.toFixed(2)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>T‑Bill Reserve</CardTitle>
              <CardDescription>Short-duration Treasuries</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              ${data.tBillUsdReserve.toFixed(2)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PUSD Supply</CardTitle>
              <CardDescription>Circulating on-chain PUSD</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {data.totalPUSDSupply.toFixed(7)} PUSD
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collateralization Ratio</CardTitle>
              <CardDescription>Total USD reserve / PUSD supply</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {(data.collateralizationRatio * 100).toFixed(2)}%
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pi Reserve / Exposure</CardTitle>
              <CardDescription>On-chain Pi held or referenced</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {data.piReserve.toFixed(7)} Pi
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">How the reserve works</CardTitle>
            <CardDescription>
              High-level overview of the USD reserve and Phase‑2 roadmap.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            PUSD is a Soroban-standard token on Pi. The peg to ≈1 USD is maintained off-chain by
            an issuer-managed USD reserve (cash + short-term Treasuries), tracked in the backend
            via <code>ReserveSnapshot</code> and <code>BankReserveEvent</code> records.
          </p>
          <p>
            In Phase 1, users only interact with Pi and PUSD on-chain. USD never leaves the issuer&apos;s
            banking perimeter. Future phases will introduce bank and treasury adapters that feed more
            granular data into this page and into public attestation reports.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

