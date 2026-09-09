'use client';

import { AppNavbar } from './app-navbar';
import { BottomNav } from './bottom-nav';
import { usePi } from '@/components/providers/pi-provider';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  backHref?: string;
  hideNav?: boolean;
}

export function AppShell({ 
  children, 
  title, 
  showBack = false, 
  backHref,
  hideNav = false 
}: AppShellProps) {
  const { isAuthenticated } = usePi();

  return (
    <div className="app-container bg-background">
      <AppNavbar title={title} showBack={showBack} backHref={backHref} />
      <main className="flex-1 pt-14 pb-24 lg:pb-8">
        {children}
      </main>
      {!hideNav && isAuthenticated && <BottomNav />}
    </div>
  );
}
