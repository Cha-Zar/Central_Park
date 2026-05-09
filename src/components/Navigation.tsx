'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, BarChart3, AlertCircle, Settings, Leaf } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/plant-profile', label: 'Plant Profile', icon: Leaf },
    { href: '/history', label: 'History', icon: BarChart3 },
    { href: '/alerts', label: 'Alerts', icon: AlertCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-700/70 bg-zinc-950/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-zinc-950">
              <Building2 className="w-5 h-5" />
            </span>
            <span>Central Park</span>
          </Link>

          <div className="flex gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-400 text-zinc-950'
                      : 'text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
