'use client';

import { AppShell } from '@/components/app/app-shell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <div className="container mx-auto px-4">
        {children}
      </div>
    </AppShell>
  );
}
