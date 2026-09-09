export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import { LandingHero } from '@/components/landing/hero';
import { LandingFeatures } from '@/components/landing/features';
import { LandingStats } from '@/components/landing/stats';
import { LandingCTA } from '@/components/landing/cta';
import { LandingFooter } from '@/components/landing/footer';
import { LandingNav } from '@/components/landing/nav';

export default function HomePage() {

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingStats />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
