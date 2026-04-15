'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import {
  LayoutDashboard,
  Users,
  History,
  LogOut,
  Banknote,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#2D6B5F', mobileColor: '#FFD1BF' },
  { href: '/borrowers', label: 'Borrowers', icon: Users, color: '#4F46E5', mobileColor: '#BFDBFE' },
  { href: '/history', label: 'History', icon: History, color: '#D97706', mobileColor: '#FDE047' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Universal Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 flex items-center justify-between px-5 md:px-8 bg-[var(--background)] border-b-2 border-black">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center border-2 border-black bg-[#A3E635] shadow-[2.5px_2.5px_0px_var(--foreground)] md:shadow-[3px_3px_0px_var(--foreground)]">
            <Banknote className="w-5 h-5 md:w-7 md:h-7 text-black" />
          </div>
          <div>
            <h1 className="font-heading font-black text-lg md:text-2xl leading-none text-[var(--foreground)] tracking-tight">LendFlow</h1>
            <p className="hidden md:block font-heading text-[10px] font-black tracking-[0.2em] uppercase mt-1 opacity-40 text-[var(--foreground)] truncate">
              By Prafull Harer
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 md:px-5 w-9 h-9 md:w-auto md:h-auto rounded-xl flex items-center justify-center border-2 border-black bg-[#EF4444] md:py-2.5 text-white shadow-[2px_2px_0px_var(--foreground)] md:shadow-[3px_3px_0px_var(--foreground)] active:translate-y-0.5 active:shadow-none transition-all"
        >
          <LogOut className="w-4 h-4" strokeWidth={3} />
          <span className="hidden md:inline font-heading text-sm font-black tracking-widest uppercase">Exit System</span>
        </button>
      </div>

      {/* Universal Bottom Navigation Dock */}
      <div className="fixed bottom-4 md:bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <nav className="pointer-events-auto w-full max-w-sm md:max-w-md h-[72px] md:h-[80px] flex items-center justify-around rounded-[2rem] border-[2.5px] border-black bg-white shadow-[4px_4px_0px_#000] md:shadow-[6px_6px_0px_#000] px-2 md:px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-16 md:w-20 h-[56px] md:h-[64px] transition-all duration-200 relative group
                  ${active ? 'text-black' : 'text-black/40 hover:text-black/70'}`}
              >
                {/* Icon */}
                <Icon className={`w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-1.5 transition-transform group-hover:-translate-y-0.5`} 
                  style={{ color: active ? item.mobileColor : undefined }} strokeWidth={active ? 3 : 2.5} />
                {/* Label */}
                <span className={`font-heading text-[10px] md:text-[11px] uppercase tracking-widest ${active ? 'font-black underline decoration-[2.5px] underline-offset-4' : 'font-bold'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
