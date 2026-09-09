'use client';

import Link from 'next/link';

const footerLinks = {
  product: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Stats', href: '/stats' },
  ],
  resources: [
    { label: 'Documentation', href: '/developers' },
    { label: 'Help', href: '/help/testnet' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-xl tracking-tight">PUSD</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The stablecoin protocol for Pi Network. Transparent, secure, and instant.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            {/* Product links */}
            <div>
              <p className="font-medium mb-4 text-sm uppercase tracking-wider text-muted-foreground">Product</p>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-foreground/80 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="font-medium mb-4 text-sm uppercase tracking-wider text-muted-foreground">Resources</p>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-foreground/80 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Built on Pi Network Testnet
          </p>
          <p className="text-xs text-muted-foreground">
            Demonstration platform for educational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
