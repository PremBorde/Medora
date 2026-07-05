'use client';

import { useState } from 'react';
import { Bell, Menu, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard',     href: '/dashboard' },
  { label: 'Symptom Check', href: '/symptom-check' },
  { label: 'My Profile',    href: '/profile' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const pageTitle = navItems.find((n) => n.href === pathname)?.label || 'Medora AI';

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Mobile: Logo + hamburger */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Heart className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="font-bold text-sm text-foreground">Medora AI</span>
          </div>
        </div>

        {/* Desktop: Page title */}
        <div className="hidden lg:block">
          <h1 className="text-sm font-semibold text-foreground">{pageTitle}</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center cursor-pointer">
            <span className="text-xs font-semibold text-primary">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-surface overflow-hidden"
          >
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block px-3 py-2 rounded-lg text-sm transition-colors',
                    pathname === item.href
                      ? 'bg-primary-50 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
