'use client';

import { useState } from 'react';
import Head from 'next/head';
import { usePi } from '@/components/providers/pi-provider';
import { Button } from '@/components/ui/button';
import DonationModal from '@/components/donation-modal';

export default function DonatePage() {
  const { isAuthenticated, authenticate } = usePi();
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [recentDonations, setRecentDonations] = useState<{ amount: number; paymentId?: string }[]>([]);

  const handleDonationSuccess = (donationData: { amount: number; paymentId?: string }) => {
    setRecentDonations((prev) => [donationData, ...prev.slice(0, 4)]);
  };

  const handleDonateClick = async () => {
    if (!isAuthenticated) {
      try {
        await authenticate();
      } catch {
        return;
      }
    }
    setShowDonationModal(true);
  };

  return (
    <>
      <Head>
        <title>Support PUSD - Donate with Pi</title>
        <meta
          name="description"
          content="Support PUSD development and ecosystem with Pi donations."
        />
      </Head>

      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Support the PUSD Protocol
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Your Pi donations help us maintain the protocol, improve stability, and build new
              features for the PUSD ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="rounded-2xl border bg-card shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Make a Donation</h2>
                <p className="text-sm text-muted-foreground">
                  Donate any amount in Pi to support protocol development, audits, and infrastructure.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Why donate?
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Help fund development of new PUSD features.</li>
                    <li>Support ongoing security, monitoring, and audits.</li>
                    <li>Contribute to the broader Pi and PUSD ecosystem.</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Button className="w-full" size="lg" onClick={handleDonateClick}>
                    Donate with Pi
                  </Button>
                  {!isAuthenticated && (
                    <p className="mt-2 text-xs text-muted-foreground text-center">
                      You&apos;ll be asked to connect your Pi account before donating.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border bg-card shadow-sm p-6 sm:p-8 space-y-4">
                <h3 className="text-base font-semibold">How it works</h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li>1. Connect with Pi in the Pi Browser.</li>
                  <li>2. Choose your donation amount in Pi.</li>
                  <li>3. Approve the payment in your Pi wallet.</li>
                  <li>4. Your donation is recorded on our backend.</li>
                </ol>
              </div>

              {recentDonations.length > 0 && (
                <div className="rounded-2xl border bg-card shadow-sm p-6 sm:p-8 space-y-3">
                  <h3 className="text-base font-semibold">Recent donations (this session)</h3>
                  <div className="space-y-2 text-sm">
                    {recentDonations.map((d, idx) => (
                      <div
                        key={`${d.paymentId ?? 'local'}-${idx}`}
                        className="flex items-center justify-between border-b last:border-b-0 py-1.5"
                      >
                        <span className="font-medium">{d.amount} π</span>
                        <span className="text-xs text-muted-foreground">Just now</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border bg-card shadow-sm p-6 sm:p-8 space-y-4">
                <h3 className="text-base font-semibold">FAQ</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground mb-1">Is my donation secure?</p>
                    <p>Donations are processed via the official Pi Network payment flow.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Can I donate any amount?</p>
                    <p>You can donate any amount above the minimum of 0.1 π.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">
                      How are donations used?
                    </p>
                    <p>
                      Donations help cover infrastructure, development, audits, and stability
                      improvements for PUSD.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DonationModal
          isOpen={showDonationModal}
          onClose={() => setShowDonationModal(false)}
          onSuccess={handleDonationSuccess}
        />
      </div>
    </>
  );
}

