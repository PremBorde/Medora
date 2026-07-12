'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Stethoscope,
  User,
  FileText,
  Heart,
  LogOut,
  Activity,
  MapPin,
  Map,
  ChevronLeft,
  ChevronRight,
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
    label: 'Smart Care Map',
    href: '/care-map',
    icon: Map,
    badge: 'New',
  },
  {
    label: 'Health Timeline',
    href: '/timeline',
    icon: Activity,
  },
  {
    label: 'My Reports',
    href: '/reports',
    icon: FileText,
    badge: 'New',
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      id="sidebar-nav"
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="hidden lg:flex flex-col h-screen overflow-hidden bg-white/70 backdrop-blur-xl border-r border-border/60 shadow-[4px_0_24px_-10px_rgba(8,145,178,0.08)] z-30 relative"
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-5 -right-0 translate-x-[-12px] w-6 h-6 rounded-full border border-border bg-white flex items-center justify-center shadow-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 z-50 cursor-pointer"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/40 overflow-hidden">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-cyan-500 flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
          <Heart className="w-4 h-4 text-white fill-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col min-w-0"
            >
              <span className="font-extrabold text-foreground text-sm tracking-tight leading-none">Medora AI</span>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold uppercase tracking-wider">Health Copilot</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
        {!collapsed && (
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-3 mb-2">
            Navigation
          </p>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <div key={item.href}>
              {item.disabled ? (
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-not-allowed opacity-40",
                    collapsed ? "justify-center" : ""
                  )}
                  title={`${item.label} (${item.badge})`}
                >
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="text-muted-foreground text-xs font-medium flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-bold">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <Link href={item.href}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer group relative',
                      isActive
                        ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                      collapsed ? "justify-center" : ""
                    )}
                  >
                    {/* Active vertical bar on the left */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-primary"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-all duration-200 group-hover:scale-105',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />

                    {!collapsed && (
                      <>
                        <span className="flex-1 text-xs">{item.label}</span>
                        {item.badge && !isActive && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full px-1.5 py-0.5 font-extrabold uppercase tracking-wide">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* User / Profile section */}
      <div className="px-3 py-4 border-t border-border/40 bg-muted/20">
        <div className={cn("flex items-center gap-3 px-2 py-2 rounded-xl mb-2", collapsed ? "justify-center" : "")}>
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-primary">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            {/* Green active dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
        </div>
        
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-150 group cursor-pointer",
            collapsed ? "justify-center" : ""
          )}
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0 group-hover:text-red-500" />
          {!collapsed && <span className="flex-1 text-left">Sign out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
