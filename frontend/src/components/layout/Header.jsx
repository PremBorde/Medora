'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, X, Heart, User, LogOut, ChevronDown, CheckCircle, Info } from 'lucide-react';
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Close dropdowns on outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageTitle = navItems.find((n) => n.href === pathname)?.label || 'Medora AI';

  const mockNotifications = [
    { id: 1, title: 'Analysis Complete', desc: 'Your symptom report is ready to download.', time: '2 mins ago', type: 'success' },
    { id: 2, title: 'Profile Updated', desc: 'Patient vitals successfully synced.', time: '1 hour ago', type: 'info' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-border/40 h-14 flex items-center justify-between px-4 sm:px-6">
      {/* Mobile navigation toggle */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-primary to-cyan-500 flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="font-extrabold text-sm text-foreground tracking-tight">Medora</span>
        </div>
      </div>

      {/* Desktop: Page title */}
      <div className="hidden lg:block">
        <h1 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{pageTitle}</h1>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Notification center */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-150 relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 bg-white border border-border/60 rounded-xl shadow-lg shadow-black/5 overflow-hidden z-50 p-2"
              >
                <div className="px-3 py-2 border-b border-border/40">
                  <p className="text-xs font-bold text-foreground">Notifications</p>
                </div>
                <div className="divide-y divide-border/30 max-h-60 overflow-y-auto">
                  {mockNotifications.map((notif) => (
                    <div key={notif.id} className="p-3 hover:bg-muted/40 transition-colors flex gap-2.5">
                      {notif.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground">{notif.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{notif.desc}</p>
                        <span className="text-[9px] text-muted-foreground/60 mt-1 block font-medium">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar + dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-muted/50 transition-all duration-150 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary/10 to-primary/5 border border-primary/25 flex items-center justify-center font-bold text-primary text-xs shadow-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          <AnimatePresence>
            {userDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-white border border-border/60 rounded-xl shadow-lg shadow-black/5 overflow-hidden z-50 p-1"
              >
                <div className="px-3 py-2 border-b border-border/30">
                  <p className="text-xs font-bold text-foreground truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-muted-foreground truncate leading-normal">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/profile" onClick={() => setUserDropdownOpen(false)}>
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-lg transition-colors cursor-pointer">
                      <User className="w-3.5 h-3.5" />
                      My Profile
                    </div>
                  </Link>
                  <button
                    onClick={() => { logout(); setUserDropdownOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-14 left-0 right-0 border-b border-border/50 bg-white shadow-md overflow-hidden z-50"
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
