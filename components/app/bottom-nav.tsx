'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Home, BarChart3, Settings, Wallet, PlusCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/mint', icon: PlusCircle, label: 'Mint' },
  { href: '/dashboard/earn', icon: Wallet, label: 'Earn' },
  { href: '/stats', icon: BarChart3, label: 'Stats' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="bottom-nav lg:hidden">
      <div className="px-4 pb-2">
        <nav className="bg-card/80 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-lg shadow-black/5">
          <div className="flex items-center justify-around px-2 py-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (pathname?.startsWith(item.href) && item.href !== '/dashboard') ||
                (item.href === '/dashboard' && pathname === '/dashboard');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center min-w-[64px] py-2.5 px-3 rounded-xl transition-all duration-200 active:scale-95',
                    isActive 
                      ? 'text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div className={cn(
                    'relative flex items-center justify-center w-6 h-6 mb-1',
                  )}>
                    {isActive && (
                      <div className="absolute inset-0 bg-accent/20 rounded-full scale-150" />
                    )}
                    <item.icon className={cn(
                      'w-5 h-5 relative z-10 transition-transform duration-200',
                      isActive && 'text-accent'
                    )} />
                  </div>
                  <span className={cn(
                    'text-[11px] font-medium transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
