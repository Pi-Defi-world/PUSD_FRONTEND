'use client';

import Link from 'next/link';
import { usePi } from '@/components/providers/pi-provider';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { ChevronLeft, Settings, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface AppNavbarProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export function AppNavbar({ title, showBack = false, backHref = '/dashboard' }: AppNavbarProps) {
  const { user, isAuthenticated } = usePi();
  const [scrolled, setScrolled] = useState(false);
  const [pathname, setPathname] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    handleLocationChange();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const pageTitle = title || getPageTitle(pathname);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-border' 
          : 'bg-background'
      )}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-3 min-w-0">
          {showBack ? (
            <Link 
              href={backHref}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors -ml-2 p-2 rounded-lg hover:bg-secondary/50"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="sr-only">Back</span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-sm">P</span>
              </div>
            </Link>
          )}
          <h1 className="font-semibold text-base truncate">{pageTitle}</h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {isAuthenticated && (
            <>
              <Link 
                href="/settings"
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  pathname === '/settings' 
                    ? 'bg-secondary text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <Settings className="w-5 h-5" />
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function getPageTitle(pathname: string | null): string {
  if (!pathname) return 'PUSD';
  
  const routes: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/mint': 'Mint & Burn',
    '/dashboard/earn': 'Earn',
    '/dashboard/reserve': 'Reserves',
    '/settings': 'Settings',
    '/stats': 'Protocol Stats',
    '/developers': 'Developers',
    '/help/testnet': 'Help',
  };
  
  return routes[pathname] || 'PUSD';
}
