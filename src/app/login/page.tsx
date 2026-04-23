'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        google_auth_failed: 'Google authentication was cancelled or failed.',
        token_exchange_failed: 'Failed to verify with Google. Please try again.',
        user_info_failed: 'Could not retrieve your Google profile.',
        server_error: 'Server error during authentication.',
      };
      setError(errorMessages[errorParam] || 'Authentication failed. Please try again.');
    }
  }, [searchParams]);

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

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError('');
    window.location.href = '/api/auth/google';
  };

  return (
    <>
      <div className="flex items-center gap-2.5 mb-7">
        <Shield className="w-6 h-6 text-black" strokeWidth={2.5} />
        <h2 className="font-heading text-xl font-black text-black uppercase tracking-tight">
          Sign In
        </h2>
      </div>

      {/* Google Sign-In Button */}
      <button
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 py-4 mb-6 rounded-xl border-2 border-black font-heading font-black text-sm uppercase tracking-widest transition-all bg-white text-black shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {googleLoading ? (
          <div className="w-5 h-5 rounded-full border-4 border-black/10 border-t-black animate-spin" />
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-[2px] bg-black/10 rounded-full" />
        <span className="font-heading text-[10px] font-black uppercase tracking-[0.2em] text-black/30">
          or admin login
        </span>
        <div className="flex-1 h-[2px] bg-black/10 rounded-full" />
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
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--background)' }}>

      {/* Background pattern + glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30"
          style={{ background: 'var(--primary)' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
          style={{ background: 'var(--primary)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">

        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl border-2 border-black bg-white font-heading text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={3} />
          Back Home
        </Link>

        {/* Card */}
        <div className="bg-white border-[3px] border-black rounded-3xl p-8 shadow-[8px_8px_0px_#000]">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-black animate-spin" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-[10px] font-heading mt-7 text-black/40 font-bold uppercase tracking-[0.15em]">
          Created by Prafull Harer <br/> Secured with JWT Authentication
        </p>
      </div>
    </div>
  );
}
