'use client';

import { useState, useEffect } from 'react';
import { User, Users, Mail, Shield, Award, CalendarDays, Activity, Banknote } from 'lucide-react';


interface UserSession {
  username: string;
  name?: string;
  email?: string;
  picture?: string;
  provider?: 'credentials' | 'google';
}

interface DashboardStats {
  activeLoans: number;
  closedLoans: number;
  totalPrincipalLent: number;
  totalInterestEarned: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/session').then(res => res.json()),
      fetch('/api/dashboard').then(res => res.json()),
      fetch('/api/user/profile').then(res => res.json())
    ])
    .then(([sessionData, statsData, userData]) => {
      if (sessionData.authenticated) {
        setUser(sessionData.user);
      }
      setStats(statsData);
      setUpiId(userData.upiId || '');
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-black border-t-[#A3E635] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.name || user.username || 'Admin';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">
      
      {/* Header Profile Card */}
      <div className="bg-white border-[3px] border-black rounded-[2rem] p-6 md:p-10 shadow-[8px_8px_0px_#000] relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#A3E635] rounded-full blur-[80px] opacity-40 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
          {/* Large Avatar */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-black shadow-[4px_4px_0px_#000] bg-[#38BDF8] flex items-center justify-center overflow-hidden shrink-0">
            {user.picture ? (
              <img src={user.picture} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="font-heading font-black text-5xl md:text-6xl text-black">{initials}</span>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F1F1EE] border-2 border-black rounded-full font-heading text-xs font-bold uppercase tracking-widest text-black/60 mb-3">
                <Shield className="w-3.5 h-3.5" />
                {user.provider === 'google' ? 'Google Authenticated' : 'Standard Account'}
              </div>
              <h1 className="font-heading font-black text-4xl md:text-5xl text-black leading-none mb-2">
                {displayName}
              </h1>
              {user.email && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-black/60 font-body font-medium">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <div className="px-4 py-2 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-2">
                <User className="w-4 h-4 text-[#A3E635]" />
                <span className="font-heading font-bold text-xs uppercase tracking-widest">Active Member</span>
              </div>
              <div className="px-4 py-2 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#38BDF8]" />
                <span className="font-heading font-bold text-xs uppercase tracking-widest">Since 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settings Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-[3px] border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_#000] space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#A3E635] border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#000]">
              <Banknote className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-black">Payment Settings</h3>
              <p className="font-body text-xs font-medium text-black/50 uppercase tracking-widest">Setup payment reminders</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-heading text-[10px] font-black mb-2 uppercase tracking-[0.15em] text-black/40">
                Your UPI ID (For Reminders)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@bank"
                  className="w-full sm:flex-1 px-5 py-4 bg-[#F1F1EE] border-[3px] border-black rounded-2xl font-body font-bold text-black focus:outline-none focus:ring-0 focus:border-[#A3E635] transition-colors"
                />
                <button 
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await fetch('/api/user/profile', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ upiId })
                      });
                      alert('UPI ID updated successfully!');
                    } catch {
                      alert('Failed to update UPI ID');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-4 bg-[#A3E635] border-[3px] border-black rounded-2xl font-heading font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
                >
                  {saving ? '...' : 'Save'}
                </button>
              </div>
              <p className="font-body text-[10px] text-black/40 mt-3 italic">
                * This UPI ID will be included in the WhatsApp reminders sent to your borrowers.
              </p>
            </div>
          </div>
        </div>

        {/* Account Info Section */}
        <div className="bg-white border-[3px] border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_#000] space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#38BDF8] border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#000]">
              <Activity className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-black">Account Activity</h3>
              <p className="font-body text-xs font-medium text-black/50 uppercase tracking-widest">Platform usage summary</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#F1F1EE] border-2 border-black rounded-2xl">
              <span className="block font-heading text-[10px] font-black text-black/40 uppercase tracking-wider mb-1">Active Loans</span>
              <span className="font-heading font-black text-2xl">{stats?.activeLoans || 0}</span>
            </div>
            <div className="p-4 bg-[#F1F1EE] border-2 border-black rounded-2xl">
              <span className="block font-heading text-[10px] font-black text-black/40 uppercase tracking-wider mb-1">Completed</span>
              <span className="font-heading font-black text-2xl">{stats?.closedLoans || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-[#A3E635] border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-black/60">Total Borrowers</span>
            <Users className="w-5 h-5 opacity-60" />
          </div>
          <p className="font-heading font-black text-3xl">{(stats?.activeLoans || 0) + (stats?.closedLoans || 0)}</p>
        </div>

        <div className="bg-[#38BDF8] border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-black/60">Active Loans</span>
            <Activity className="w-5 h-5 opacity-60" />
          </div>
          <p className="font-heading font-black text-3xl">{stats?.activeLoans || 0}</p>
        </div>

        <div className="bg-[#F472B6] border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-black/60">Total Lent</span>
            <Banknote className="w-5 h-5 opacity-60" />
          </div>
          <p className="font-heading font-black text-3xl">₹{(stats?.totalPrincipalLent || 0).toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-[#FEBC2E] border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-black/60">Total Earned</span>
            <Award className="w-5 h-5 opacity-60" />
          </div>
          <p className="font-heading font-black text-3xl">₹{(stats?.totalInterestEarned || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>
      
    </div>
  );
}
