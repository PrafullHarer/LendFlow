'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--background)' }}>

      {/* Background pattern + glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30"
          style={{ background: 'var(--primary)' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
          style={{ background: 'var(--primary)' }} />
        {/* Grid dots */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>



      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Brand */}
        <div className="flex flex-col items-center mb-12">
          {/* Logo Match from Dashboard */}
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center border-[3px] border-black bg-[#A3E635] shadow-[6px_6px_0px_#000] mb-6">
            <Banknote className="w-10 h-10 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="font-heading text-5xl font-black text-black tracking-tight">
            LendFlow
          </h1>
          <p className="font-heading tracking-[0.2em] uppercase text-[11px] font-black mt-3 text-black/40">
            Pro Manager
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border-[3px] border-black rounded-3xl p-8 shadow-[8px_8px_0px_#000]">
          <div className="flex items-center gap-2.5 mb-7">
            <Shield className="w-6 h-6 text-black" strokeWidth={2.5} />
            <h2 className="font-heading text-xl font-black text-black uppercase tracking-tight">
              Admin Login
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block font-heading text-xs font-black mb-2 uppercase tracking-widest text-black/60">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full bg-white border-2 border-black rounded-xl py-3.5 px-4 font-heading text-sm font-bold placeholder:text-black/30 placeholder:font-bold focus:outline-none focus:ring-2 focus:ring-[#A3E635] focus:border-black transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-heading text-xs font-black mb-2 uppercase tracking-widest text-black/60">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full bg-white border-2 border-black rounded-xl py-3.5 px-4 pr-12 font-heading text-sm font-bold placeholder:text-black/30 placeholder:font-bold focus:outline-none focus:ring-2 focus:ring-[#A3E635] focus:border-black transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-black/40 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={2.5} /> : <Eye className="w-5 h-5" strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm font-heading font-black border-2 border-black bg-[#EF4444] text-white shadow-[3px_3px_0px_#000]">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full flex items-center justify-center gap-2 py-4 mt-2 rounded-xl border-2 border-black font-heading font-black text-sm uppercase tracking-widest transition-all bg-[#A3E635] text-black shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-4 border-black/10 border-t-black animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" strokeWidth={3} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs font-heading mt-7" style={{ color: 'var(--foreground-subtle)' }}>
          Secured with JWT Authentication · HTTP-Only Cookies
        </p>
      </div>
    </div>
  );
}
