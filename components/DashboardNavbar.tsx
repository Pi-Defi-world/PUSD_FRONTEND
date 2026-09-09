'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePi } from '@/components/providers/pi-provider';
import { TestnetBadge } from '@/components/TestnetBadge';
import { apiClient } from '@/lib/api/client';
import { Home, Settings, LogOut, Wallet, TrendingUp, PiggyBank, Shield, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardNavbar() {
  const [pathname, setPathname] = useState<string | null>(null);
  const { signOut, isAuthenticated } = usePi();
  const isTestnet = apiClient.isTestnetMode();

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const handleLogout = () => {
    signOut();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/earn', label: 'Earn', icon: PiggyBank },
    { href: '/dashboard/reserve', label: 'Reserves', icon: Shield },
    { href: '/stats', label: 'Stats', icon: TrendingUp },
    { href: '/developers', label: 'Developers', icon: Code },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl">PUSD</span>
              {isTestnet && <TestnetBadge className="ml-2" />}
            </Link>
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'flex items-center space-x-2',
                        isActive && 'bg-accent'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}

