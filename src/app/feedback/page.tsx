'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import '../home.css';

export default function FeedbackPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setFormData(prev => ({
            ...prev,
            name: data.user.name || '',
            email: data.user.email || ''
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to submit feedback');
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="home-page">
      {/* NAV */}
      <nav className="home-nav">
        <div className="home-nav-logo">
          <div className="home-nav-logo-icon">💸</div>
          <span className="home-nav-logo-text">LendFlow</span>
        </div>
        <Link href="/" className="home-btn-primary">
          <ArrowLeft className="w-4 h-4 mr-1" strokeWidth={3} /> Back to Home
        </Link>
      </nav>

      {/* BG DECORATIONS */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="home-bg-blob" style={{ width: 600, height: 600, background: '#A3E635', top: -200, right: -200 }} />
        <div className="home-bg-blob" style={{ width: 400, height: 400, background: '#38BDF8', bottom: -150, left: -150, opacity: 0.10 }} />
        <div className="home-dot-grid" />
      </div>

      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center p-5 relative z-10">
        <div className="w-full max-w-lg bg-white border-[2px] border-black rounded-[20px] shadow-[10px_10px_0px_#000] relative overflow-hidden flex flex-col">
          {/* Window Bar */}
          <div className="bg-[#F1F1EE] border-b-[2px] border-black px-4 py-3 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-black bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-black bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-black bg-[#28C840]" />
            <span className="ml-2 font-heading text-xs font-bold text-black/40 tracking-wider uppercase">LendFlow — Feedback</span>
          </div>
          
          <div className="p-8 md:p-10 relative">
            {/* Background glow for card */}
            <div className="absolute -top-20 -right-20 w-[250px] h-[250px] bg-[#A3E635] rounded-full blur-[80px] opacity-20 pointer-events-none" />

          <div className="relative z-10 text-center mb-8">
            <div className="w-14 h-14 mx-auto bg-[#38BDF8] border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000] mb-4">
              <MessageSquare className="w-7 h-7 text-black" strokeWidth={2.5} />
            </div>
            <h1 className="font-heading text-3xl font-black text-black tracking-tight mb-2">Feedback</h1>
            <p className="font-body text-sm text-black/60">We'd love to hear your thoughts on LendFlow.</p>
          </div>

          {isSuccess ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-[#A3E635] mx-auto mb-4" strokeWidth={2} />
              <h2 className="font-heading text-2xl font-black text-black mb-2">Thank You!</h2>
              <p className="font-body text-black/60 mb-6">Your feedback has been submitted successfully.</p>
              <p className="text-xs font-bold uppercase tracking-widest text-black/40">Redirecting to home...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-100 border-2 border-red-500 rounded-xl text-red-700 text-sm font-bold text-center">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block font-heading text-xs font-bold uppercase tracking-widest text-black/60 mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black bg-[var(--background-card)] font-body text-black placeholder:text-black/30 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] transition-all"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block font-heading text-xs font-bold uppercase tracking-widest text-black/60 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black bg-[var(--background-card)] font-body text-black placeholder:text-black/30 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block font-heading text-xs font-bold uppercase tracking-widest text-black/60 mb-1.5">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black bg-[var(--background-card)] font-body text-black placeholder:text-black/30 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] transition-all resize-none"
                  placeholder="What do you think of LendFlow?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 mt-2 rounded-xl border-[2.5px] border-black bg-[#A3E635] font-heading font-black text-sm uppercase tracking-widest text-black shadow-[4px_4px_0px_#000] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
                {!isSubmitting && <Send className="w-4 h-4" strokeWidth={3} />}
              </button>
            </form>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
