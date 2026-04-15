'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Users,
  Search,
  ChevronRight,
  IndianRupee,
  Calendar,
  Percent,
  Clock,
  CheckCircle2,
  X,
  UserPlus,
  Phone,
  TrendingUp,
} from 'lucide-react';

interface Borrower {
  _id: string;
  name: string;
  phone: string;
  principal: number;
  interestRate: number;
  durationMonths: number;
  startDate: string;
  status: 'active' | 'closed';
  createdAt: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function BorrowersPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    principal: '',
    interestRate: '',
    durationMonths: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const fetchBorrowers = useCallback(async () => {
    try {
      const res = await fetch('/api/borrowers');
      const data = await res.json();
      setBorrowers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch borrowers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBorrowers();
  }, [fetchBorrowers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/borrowers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({
          name: '', phone: '', principal: '', interestRate: '', durationMonths: '',
          startDate: new Date().toISOString().split('T')[0],
        });
        await fetchBorrowers();
      }
    } catch (error) {
      console.error('Failed to create borrower:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBorrowers = borrowers.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const preview = formData.principal && formData.interestRate && formData.durationMonths
    ? {
        monthlyInterest: (Number(formData.principal) * Number(formData.interestRate)) / 100,
        totalRepayment: ((Number(formData.principal) * Number(formData.interestRate)) / 100) * Number(formData.durationMonths) + Number(formData.principal),
      }
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 spinner" style={{ color: 'var(--primary)' }} />
          <p className="text-sm font-heading" style={{ color: 'var(--foreground-subtle)' }}>Loading borrowers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-none px-2 mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Borrowers</h1>
          <p className="font-body text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
            {borrowers.length} total · {borrowers.filter(b => b.status === 'active').length} active
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border-2 border-black font-heading font-bold text-sm tracking-tight transition-all
            bg-[#4F46E5] text-white shadow-[4px_4px_0px_var(--foreground)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--foreground)]
            active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <UserPlus className="w-5 h-5" />
          Add New Borrower
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors group-focus-within:text-[#4F46E5]" 
            style={{ color: 'var(--foreground-muted)' }} />
          <input
            type="text"
            placeholder="Find a borrower by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-black rounded-2xl py-4 pl-12 pr-4 font-heading text-sm font-medium transition-all
              placeholder:text-[var(--foreground-subtle)] focus:outline-none focus:shadow-[4px_4px_0px_#4F46E5]"
          />
        </div>
        <div className="flex gap-2 p-1 bg-black/5 rounded-[1.25rem] border-2 border-black/10">
          {(['all', 'active', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`font-heading text-xs font-bold px-5 py-2.5 rounded-xl capitalize transition-all cursor-pointer border-2
                ${statusFilter === status 
                  ? 'bg-black text-white border-black shadow-[2px_2px_0px_var(--foreground)]' 
                  : 'bg-transparent text-[var(--foreground-muted)] border-transparent hover:bg-black/5'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Borrowers Grid */}
      {filteredBorrowers.length === 0 ? (
        <div className="card-elevated px-6 py-16 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: 'var(--foreground-subtle)' }} />
          <p className="font-heading font-semibold" style={{ color: 'var(--foreground-muted)' }}>
            {searchQuery || statusFilter !== 'all' ? 'No borrowers match your filters' : 'No borrowers yet'}
          </p>
          <p className="font-body text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>
            {!searchQuery && statusFilter === 'all' && 'Click "Add Borrower" to create your first loan'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredBorrowers.map((borrower) => {
            const monthlyInterest = (borrower.principal * borrower.interestRate) / 100;
            return (
              <Link
                key={borrower._id}
                href={`/borrowers/${borrower._id}`}
                className="card-elevated p-6 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--primary-light)' }}>
                      <span className="font-heading text-lg font-bold" style={{ color: 'var(--primary)' }}>
                        {borrower.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-semibold truncate transition-colors group-hover:text-[var(--primary)]"
                        style={{ color: 'var(--foreground)' }}>
                        {borrower.name}
                      </h3>
                      {borrower.phone && (
                        <p className="font-heading text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--foreground-subtle)' }}>
                          <Phone className="w-3 h-3" /> {borrower.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${borrower.status === 'active' ? 'badge-active' : 'badge-closed'}`}>
                      {borrower.status === 'active' ? (
                        <><Clock className="w-3 h-3" /> Active</>
                      ) : (
                        <><CheckCircle2 className="w-3 h-3" /> Closed</>
                      )}
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                      style={{ color: 'var(--foreground-subtle)' }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Principal', value: formatCurrency(borrower.principal), icon: IndianRupee },
                    { label: 'Rate/mo', value: `${borrower.interestRate}%`, icon: Percent },
                    { label: 'Duration', value: `${borrower.durationMonths} months`, icon: Calendar },
                    { label: 'Interest/mo', value: formatCurrency(monthlyInterest), icon: TrendingUp, highlight: true },
                  ].map(({ label, value, icon: Icon, highlight }) => (
                    <div key={label} className="card-flat px-3 py-2.5">
                      <p className="font-heading text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1"
                        style={{ color: 'var(--foreground-subtle)' }}>
                        <Icon className="w-3 h-3" /> {label}
                      </p>
                      <p className="font-heading text-sm font-bold mt-0.5"
                        style={{ color: highlight ? 'var(--primary)' : 'var(--foreground)' }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between font-heading text-xs"
                  style={{ borderTop: '1px solid var(--border)', color: 'var(--foreground-subtle)' }}>
                  <span>Started {formatDate(borrower.startDate)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Add Borrower Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg card-elevated max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 px-6 py-5 flex items-center justify-between rounded-t-[1.25rem]"
              style={{ background: 'var(--background-elevated)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'var(--primary)', boxShadow: '0 4px 16px var(--shadow-primary)' }}>
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <h2 className="font-heading text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  New Borrower
                </h2>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 rounded-xl transition-colors cursor-pointer"
                style={{ color: 'var(--foreground-subtle)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block font-heading text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-muted)' }}>
                  Borrower Name <span style={{ color: 'var(--primary)' }}>*</span>
                </label>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name" className="input-field" />
              </div>

              <div>
                <label className="block font-heading text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-muted)' }}>
                  Phone (Optional)
                </label>
                <input type="text" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number" className="input-field" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-heading text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-muted)' }}>
                    Principal (₹) <span style={{ color: 'var(--primary)' }}>*</span>
                  </label>
                  <input type="number" required min="1" value={formData.principal}
                    onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                    placeholder="100000" className="input-field" />
                </div>
                <div>
                  <label className="block font-heading text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-muted)' }}>
                    Rate (%/mo) <span style={{ color: 'var(--primary)' }}>*</span>
                  </label>
                  <input type="number" required min="0.1" step="0.1" value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    placeholder="2" className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-heading text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-muted)' }}>
                    Duration (months) <span style={{ color: 'var(--primary)' }}>*</span>
                  </label>
                  <input type="number" required min="1" value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                    placeholder="12" className="input-field" />
                </div>
                <div>
                  <label className="block font-heading text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-muted)' }}>
                    Start Date <span style={{ color: 'var(--primary)' }}>*</span>
                  </label>
                  <input type="date" required value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field" />
                </div>
              </div>

              {/* Preview */}
              {preview && (
                <div className="card-flat p-4 space-y-2" style={{ borderLeft: '4px solid var(--primary)' }}>
                  <p className="font-heading text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                    Loan Preview
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="font-heading text-xs" style={{ color: 'var(--foreground-subtle)' }}>Monthly Interest</span>
                      <p className="font-heading font-bold" style={{ color: 'var(--foreground)' }}>{formatCurrency(preview.monthlyInterest)}</p>
                    </div>
                    <div>
                      <span className="font-heading text-xs" style={{ color: 'var(--foreground-subtle)' }}>Total Repayment</span>
                      <p className="font-heading font-bold" style={{ color: 'var(--foreground)' }}>{formatCurrency(preview.totalRepayment)}</p>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3">
                {submitting ? (
                  <div className="w-5 h-5 spinner border-white/30 border-t-white" />
                ) : (
                  <><Plus className="w-4 h-4" /> Create Borrower & Generate Schedule</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
