'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  X,
} from 'lucide-react';

interface PaymentHistory {
  _id: string;
  borrowerId: { _id: string; name: string; phone: string } | null;
  dueDate: string;
  monthNumber: number;
  amountDue: number;
  amountPaid: number;
  paidOn: string | null;
  type: 'interest' | 'final';
  status: 'pending' | 'paid' | 'overdue';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HistoryPage() {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<'dueDate' | 'amountDue'>('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const res = await fetch(`/api/payments?${params.toString()}`);
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, startDate, endDate]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const filteredPayments = payments
    .filter((p) => {
      if (!searchQuery) return true;
      return (p.borrowerId?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'dueDate') cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      else if (sortField === 'amountDue') cmp = a.amountDue - b.amountDue;
      return sortDir === 'desc' ? -cmp : cmp;
    });

  const handleSort = (field: 'dueDate' | 'amountDue') => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const clearFilters = () => { setStatusFilter('all'); setSearchQuery(''); setStartDate(''); setEndDate(''); };
  const hasActiveFilters = statusFilter !== 'all' || searchQuery || startDate || endDate;

  return (
    <div className="max-w-none px-2 mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Payment History</h1>
          <p className="font-body text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
            {filteredPayments.length} payments found
          </p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center sm:justify-start gap-2 px-5 py-2.5 rounded-xl border-2 border-black font-heading font-black text-xs uppercase tracking-widest transition-all shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none min-w-[120px]
            ${showFilters || hasActiveFilters ? 'bg-[#2563EB] text-white' : 'bg-white text-black hover:bg-[#FFF4B8]'}`}>
          <Filter className="w-4 h-4" strokeWidth={3} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="ml-1 w-5 h-5 rounded-md border-2 border-black bg-[#A3E635] text-black text-[10px] font-black flex items-center justify-center">!</span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card-elevated p-6 md:p-8 bg-white space-y-6">
          <div className="flex items-center justify-between pb-4 border-b-2 border-black">
            <h2 className="font-heading text-lg font-black uppercase tracking-widest text-[#1B4332]">Filter Records</h2>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-2 font-heading text-xs font-black uppercase text-[#EF4444] hover:scale-105 transition-transform active:scale-95">
                <X className="w-4 h-4" strokeWidth={3} /> Clear Filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block font-heading text-xs font-black uppercase tracking-widest text-black/60">Borrower Name</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" strokeWidth={3} />
                <input type="text" placeholder="Search..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black bg-[#FFF4B8]/30 font-heading text-sm font-bold placeholder:text-black/30 focus:outline-none focus:bg-[#FFF4B8] shadow-[3px_3px_0px_var(--border-strong)] transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-heading text-xs font-black uppercase tracking-widest text-black/60">Payment Status</label>
              <div className="relative">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black bg-[#FFF4B8]/30 font-heading text-sm font-bold appearance-none focus:outline-none focus:bg-[#FFF4B8] shadow-[3px_3px_0px_var(--border-strong)] transition-all">
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-black" strokeWidth={3} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-heading text-xs font-black uppercase tracking-widest text-black/60">From Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border-2 border-black bg-[#FFF4B8]/30 font-heading text-sm font-bold focus:outline-none focus:bg-[#FFF4B8] shadow-[3px_3px_0px_var(--border-strong)] transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block font-heading text-xs font-black uppercase tracking-widest text-black/60">To Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border-2 border-black bg-[#FFF4B8]/30 font-heading text-sm font-bold focus:outline-none focus:bg-[#FFF4B8] shadow-[3px_3px_0px_var(--border-strong)] transition-all" />
            </div>
          </div>
        </div>
      )}

      {/* Status Tabs (Segmented Pill) */}
      <div className="flex flex-wrap gap-1 p-1 bg-[#FFF4B8]/30 rounded-[1.25rem] border-2 border-black/10 self-start max-w-fit">
        {[
          { value: 'all', label: 'All', icon: HistoryIcon },
          { value: 'paid', label: 'Paid', icon: CheckCircle2 },
          { value: 'pending', label: 'Pending', icon: Clock },
          { value: 'overdue', label: 'Overdue', icon: AlertTriangle },
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`flex items-center gap-1.5 font-heading text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer border-2
              ${statusFilter === value 
                ? 'bg-black text-white border-black shadow-[2.5px_2.5px_0px_#4F46E5]' 
                : 'bg-transparent text-[var(--foreground-muted)] border-transparent hover:bg-black/5'}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 spinner" style={{ color: 'var(--primary)' }} />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <HistoryIcon className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--foreground-subtle)' }} />
            <p className="font-heading font-semibold" style={{ color: 'var(--foreground-muted)' }}>No payments found</p>
            <p className="font-body text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5 bg-white/50">
            {filteredPayments.map((payment) => (
              <div key={payment._id} className="p-4 sm:p-6 hover:bg-black/5 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Line 1: Mobile Top / Desktop Left */}
                <div className="flex items-center justify-between lg:w-1/3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border-2 border-black font-heading text-xs font-black shadow-[2.5px_2.5px_0px_#000]
                      ${payment.status === 'paid' ? 'bg-[#10B981] text-white' : payment.status === 'overdue' ? 'bg-[#EF4444] text-white' : 'bg-[#A3E635] text-black'}`}>
                      {payment.monthNumber}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-heading text-sm font-black text-[var(--foreground)] uppercase tracking-tight truncate">
                        {payment.borrowerId?.name || 'Unknown'}
                      </span>
                      <span className="font-heading text-[10px] font-bold opacity-40 uppercase tracking-tighter truncate">
                        Due: {formatDate(payment.dueDate)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Badge (Mobile only, hidden on Desktop so it moves to the end) */}
                  <span className={`lg:hidden shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black border-2 border-black uppercase tracking-widest shadow-[2.5px_2.5px_0px_#000]
                    ${payment.status === 'paid' ? 'bg-[#10B981] text-white' : 
                      payment.status === 'overdue' ? 'bg-[#EF4444] text-white' : 'bg-white text-black'}`}>
                    {payment.status}
                  </span>
                </div>

                {/* Line 2: Mobile Bottom / Desktop Right */}
                <div className="flex items-center justify-between lg:justify-end gap-4 lg:w-2/3 lg:gap-8">
                  <div className="flex items-center gap-3">
                     <div className={`px-2 py-1 rounded-md text-[9px] font-black border-2 border-black uppercase tracking-tighter shadow-[2px_2px_0px_#000]
                      ${payment.type === 'final' ? 'bg-[#7C3AED] text-white' : 'bg-[#38BDF8] text-black'}`}>
                      {payment.type === 'final' ? 'LUMP SUM' : 'INTEREST'}
                    </div>
                    <div className="flex items-center gap-0.5 font-heading text-xl font-black text-[var(--foreground)]">
                      <span className="text-xs opacity-50">₹</span>
                      {payment.amountDue.toLocaleString('en-IN')}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 lg:gap-8">
                     {payment.paidOn ? (
                       <div className="flex flex-col items-end lg:items-start lg:w-24">
                         <span className="font-heading text-[9px] font-bold opacity-30 uppercase tracking-tighter">Paid On</span>
                         <span className="font-heading text-[10px] font-black text-black uppercase">{formatDate(payment.paidOn)}</span>
                       </div>
                     ) : (
                       <div className="flex flex-col items-end lg:items-start lg:w-24">
                         <span className="font-heading text-[9px] font-bold opacity-30 uppercase tracking-tighter">Pending</span>
                         <span className="font-heading text-[10px] font-bold opacity-60 uppercase border-b-2 border-black border-dashed pb-0.5 mt-0.5">Not Paid</span>
                       </div>
                     )}

                     {/* Status Badge (Desktop only, positioned at far right) */}
                     <span className={`hidden lg:inline-flex shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black border-2 border-black uppercase tracking-widest shadow-[2.5px_2.5px_0px_#000]
                      ${payment.status === 'paid' ? 'bg-[#10B981] text-white' : 
                        payment.status === 'overdue' ? 'bg-[#EF4444] text-white' : 'bg-white text-black'}`}>
                      {payment.status}
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
