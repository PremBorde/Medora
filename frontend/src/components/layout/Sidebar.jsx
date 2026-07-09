'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Stethoscope,
  User,
  FileText,
  Heart,
  LogOut,
  Activity,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/authStore';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Symptom Check',
    href: '/symptom-check',
    icon: Stethoscope,
  },
  {
    label: 'Symptom Checker',
    href: '/symptom-checker',
    icon: MapPin,
    badge: 'New',
  },
  {
    label: 'Health Timeline',
    href: '/timeline',
    icon: Activity,
    disabled: true,
    badge: 'Phase 2',
  },
  {
    label: 'My Reports',
    href: '/reports',
    icon: FileText,
    disabled: true,
    badge: 'Phase 2',
  },
  {
    label: 'My Profile',
    href: '/profile',
    icon: User,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside id="sidebar-nav" className="hidden lg:flex flex-col w-64 min-h-screen bg-surface/75 backdrop-blur-md border-r border-border/80 shadow-[3px_0_6px_rgba(0,0,0,0.05)] z-20">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <Heart className="w-4 h-4 text-white fill-white" />
        </div>
        <div>
          <span className="font-bold text-foreground text-sm tracking-tight">Medora AI</span>
          <p className="text-xs text-muted-foreground">Health Copilot</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <div key={item.href}>
              {item.disabled ? (
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-not-allowed opacity-50"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-primary-50 text-primary-600 border border-primary-200 rounded-full px-1.5 py-0.5 font-medium">
                      {item.badge}
                    </span>
                  )}
                </div>
              ) : (
                <Link href={item.href}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer group',
                      isActive
                        ? 'bg-primary-50 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && !isActive && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full px-1.5 py-0.5 font-bold">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    )}
                  </motion.div>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-150 group cursor-pointer"
        >
          <LogOut className="w-4 h-4 group-hover:text-red-500" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
