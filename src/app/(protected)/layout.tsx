'use client';

import { ThemeProvider } from '@/components/ThemeProvider';
import Sidebar from '@/components/Sidebar';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
        <Sidebar />
        <main className="pt-24 md:pt-32 min-h-screen">
          <div className="px-2 md:px-6 pb-36">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
