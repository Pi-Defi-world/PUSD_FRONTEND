'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Code, Key } from 'lucide-react';

export default function DevelopersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">For Developers</h1>
        <p className="text-sm text-muted-foreground">
          Integrate PUSD into your app with the Business API: accept payments, check balances, and build on Pi.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Business API (v1)
          </CardTitle>
          <CardDescription>
            REST API for merchants and platforms. Create payment requests, get payment status, and read balance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Authenticate with an API key (X-API-Key or Authorization: Bearer). Create keys using the backend script
            and scope them to <code className="rounded bg-muted px-1">payments:read</code>,{' '}
            <code className="rounded bg-muted px-1">payments:write</code>,{' '}
            <code className="rounded bg-muted px-1">balance:read</code>.
          </p>
          <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground">
            <li>
              <strong>POST /api/v1/business/payments</strong> — Create a payment (amount, reference, optional callback URL)
            </li>
            <li>
              <strong>GET /api/v1/business/payments/:id</strong> — Get payment status (id or reference)
            </li>
            <li>
              <strong>GET /api/v1/business/balance</strong> — Get merchant PUSD balance
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Use the <code className="rounded bg-muted px-1">payUrl</code> from create payment to send payers to a checkout flow.
            Webhooks are supported for <code className="rounded bg-muted px-1">payment.completed</code> and{' '}
            <code className="rounded bg-muted px-1">payment.failed</code>.
          </p>
          <p className="text-sm text-muted-foreground">
            Full API reference: see <code className="rounded bg-muted px-1">pusd-backend/docs/BUSINESS-API.md</code> in the repo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            SDK & Sandbox
          </CardTitle>
          <CardDescription>
            Use the JS/TS client and test on testnet before going live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            A lightweight <code className="rounded bg-muted px-1">BusinessApiClient</code> is available in this app at{' '}
            <code className="rounded bg-muted px-1">@/lib/api/businessClient</code>. Import and use with your API key:
          </p>
          <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto">
{`import { createBusinessClient } from '@/lib/api/businessClient';

const client = createBusinessClient(process.env.PUSD_API_KEY!, process.env.PUSD_API_BASE);
const { data } = await client.createPayment({ amount: 10, reference: 'order-1' });
// data.payUrl -> send customer here`}
          </pre>
          <p>
            For testnet, point <code className="rounded bg-muted px-1">baseUrl</code> to your testnet backend and use a{' '}
            <code className="rounded bg-muted px-1">pusd_test_</code> key. Test PUSD and Pi are available on Pi Testnet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
