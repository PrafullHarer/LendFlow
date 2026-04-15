'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  IndianRupee,
  Percent,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  TrendingUp,
  Trash2,
  UserPlus
} from 'lucide-react';

interface BorrowerData {
  _id: string;
  name: string;
  phone: string;
  principal: number;
  interestRate: number;
  durationMonths: number;
  startDate: string;
  status: 'active' | 'closed';
}

interface PaymentData {
  _id: string;
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

export default function BorrowerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [borrower, setBorrower] = useState<BorrowerData | null>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/borrowers/${id}`);
      if (!res.ok) { router.push('/borrowers'); return; }
      const data = await res.json();
      if (data && data.borrower) {
        setBorrower(data.borrower);
        setPayments(data.payments || []);
      } else {
        router.push('/borrowers');
      }
    } catch (error) {
      console.error('Failed to fetch borrower:', error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMarkPaid = async (paymentId: string) => {
    setMarkingPaid(paymentId);
    try {
      await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_paid' }),
      });
      await fetchData();
    } catch (error) { console.error('Failed to mark as paid:', error); }
    finally { setMarkingPaid(null); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/borrowers/${id}`, { method: 'DELETE' });
      router.push('/borrowers');
    } catch (error) { console.error('Failed to delete:', error); setDeleting(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 animate-spin rounded-full border-4 border-[#1B4332]/20 border-t-[#1B4332]" />
          <p className="text-sm font-heading" style={{ color: 'var(--foreground-subtle)' }}>Loading details...</p>
        </div>
      </div>
    );
  }

  if (!borrower) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p style={{ color: 'var(--foreground-subtle)' }}>Borrower not found</p>
      </div>
    );
  }

  const totalDue = payments.reduce((s, p) => s + p.amountDue, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amountPaid, 0);
  const remaining = totalDue - totalPaid;
  const monthlyInterest = (borrower.principal * borrower.interestRate) / 100;

  return (
    <div className="max-w-none mx-auto px-2 pb-20 space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between pt-4">
        <Link href="/borrowers"
          className="inline-flex items-center gap-2 font-heading text-sm font-bold group transition-all"
          style={{ color: 'var(--foreground-muted)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 group-hover:bg-black group-hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back
        </Link>
        <button onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-black transition-all bg-[#EF4444] text-white shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none font-heading text-xs font-black uppercase tracking-wider"
        >
          <Trash2 className="w-4 h-4" /> 
          <span>Delete Profile</span>
        </button>
      </div>

      {/* Profile Header */}
      <div className="card-elevated p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_#000]"
              style={{ background: 'var(--primary)' }}>
              <span className="text-3xl font-heading font-black text-white">{borrower.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-3xl font-black" style={{ color: 'var(--foreground)' }}>{borrower.name}</h1>
                <span className={`px-2.5 py-1 rounded-lg border-2 border-black font-black text-[10px] uppercase tracking-widest
                  ${borrower.status === 'active' ? 'bg-[#10B981] text-white' : 'bg-black text-white'}`}>
                  {borrower.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 font-heading text-sm font-bold" style={{ color: 'var(--foreground-muted)' }}>
                {borrower.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{borrower.phone}</span>
                )}
                <span className="flex items-center gap-1 opacity-60"><Calendar className="w-4 h-4" />{formatDate(borrower.startDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Info Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          {[
            { label: 'Principal', value: formatCurrency(borrower.principal), icon: Wallet, color: '#2D6B5F' },
            { label: 'Rate/Month', value: `${borrower.interestRate}%`, icon: Percent, color: '#4F46E5' },
            { label: 'Duration', value: `${borrower.durationMonths} m`, icon: Clock, color: '#D97706' },
            { label: 'Interest/mo', value: formatCurrency(monthlyInterest), icon: TrendingUp, color: '#7C3AED' },
            { label: 'Recoverable', value: formatCurrency(totalDue), icon: IndianRupee, color: '#059669' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card-elevated px-4 py-4 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: color + '15' }}>
                <Icon className="w-5 h-5" style={{ color: color }} />
              </div>
              <p className="font-heading text-[10px] uppercase tracking-tighter font-bold" style={{ color: 'var(--foreground-subtle)' }}>{label}</p>
              <p className="font-heading text-lg font-bold mt-0.5" style={{ color: color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Due', value: totalDue, color: 'var(--foreground)', icon: Wallet },
          { label: 'Total Paid', value: totalPaid, color: '#10B981', icon: CheckCircle2 },
          { label: 'Remaining', value: remaining, color: '#F59E0B', icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card-elevated p-8 relative overflow-hidden group flex flex-col items-center justify-center min-h-[160px] text-center">
            <p className="font-heading text-[11px] uppercase tracking-[0.2em] font-black opacity-40 mb-3" style={{ color }}>{label}</p>
            <p className="font-heading text-3xl font-black" style={{ color }}>{formatCurrency(value)}</p>
            
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity"
              style={{ background: color + '15' }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: color }} />
          </div>
        ))}
      </div>

      {/* Payment Schedule (2-Line Row Layout) */}
      <div className="card-elevated overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1.5px solid var(--foreground)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#4F46E5]/10 border-2 border-[#4F46E5]/20">
              <Calendar className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--foreground)' }}>Repayment Timeline</h2>
          </div>
          <p className="font-heading text-xs font-bold opacity-50 uppercase tracking-widest hidden sm:block">Lending Lifecycle</p>
        </div>

        <div className="divide-y divide-black/5 bg-white/50">
          {payments.map((payment) => (
            <div key={payment._id} className="p-4 sm:p-6 hover:bg-black/5 transition-colors flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Line 1: Mobile Top / Desktop Left */}
              <div className="flex items-center justify-between lg:w-1/3">
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border-2 border-black font-heading text-xs font-black shadow-[2.5px_2.5px_0px_#000]
                    ${payment.status === 'paid' ? 'bg-[#10B981] text-white' : payment.status === 'overdue' ? 'bg-[#EF4444] text-white' : 'bg-[#A3E635] text-black'}`}>
                    {payment.monthNumber}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-heading text-sm font-black text-[var(--foreground)] uppercase tracking-tight">
                      {formatDate(payment.dueDate)}
                    </span>
                    <span className="font-heading text-[10px] font-bold opacity-40 uppercase tracking-tighter">Due Date</span>
                  </div>
                </div>
                
                {/* Status Badge (Mobile only, hidden on Desktop so it moves to right) */}
                <span className={`lg:hidden shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black border-2 border-black uppercase tracking-widest shadow-[2.5px_2.5px_0px_#000]
                  ${payment.status === 'paid' ? 'bg-[#10B981] text-white' : 
                    payment.status === 'overdue' ? 'bg-[#EF4444] text-white' : 'bg-white text-black'}`}>
                  {payment.status}
                </span>
              </div>

              {/* Line 2: Mobile Bottom / Desktop Right */}
              <div className="flex items-center justify-between lg:justify-end gap-4 lg:w-2/3 lg:gap-8">
                <div className="flex items-center gap-3">
                   <div className={`shrink-0 px-2 py-1 rounded-md text-[9px] font-black border-2 border-black uppercase tracking-tighter shadow-[2px_2px_0px_#000]
                    ${payment.type === 'final' ? 'bg-[#7C3AED] text-white' : 'bg-[#38BDF8] text-black'}`}>
                    {payment.type === 'final' ? 'LUMP SUM' : 'INTEREST'}
                  </div>
                  <div className="flex items-center gap-0.5 font-heading text-xl font-black text-[var(--foreground)]">
                    <span className="text-xs opacity-50">₹</span>
                    {payment.amountDue.toLocaleString('en-IN')}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 lg:gap-8">
                   {payment.paidOn && (
                     <div className="hidden sm:flex flex-col items-end lg:items-start lg:w-24">
                       <span className="font-heading text-[9px] font-bold opacity-30 uppercase tracking-tighter">Paid On</span>
                       <span className="font-heading text-[10px] font-black text-black uppercase">{formatDate(payment.paidOn)}</span>
                     </div>
                   )}
                   
                   {/* Status Badge (Desktop only, positioned right) */}
                   <span className={`hidden lg:inline-flex shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black border-2 border-black uppercase tracking-widest shadow-[2.5px_2.5px_0px_#000]
                    ${payment.status === 'paid' ? 'bg-[#10B981] text-white' : 
                      payment.status === 'overdue' ? 'bg-[#EF4444] text-white' : 'bg-white text-black'}`}>
                    {payment.status}
                   </span>

                   {payment.status !== 'paid' && (
                    <button onClick={() => handleMarkPaid(payment._id)}
                      disabled={markingPaid === payment._id}
                      className="shrink-0 bg-[#10B981] text-white text-[10px] font-black px-6 py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-widest hover:bg-[#059669]">
                      {markingPaid === payment._id ? '...' : 'Mark Paid'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative card-elevated p-8 max-w-sm w-full text-center border-2 border-black shadow-[6px_6px_0px_#000]">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center border-4 border-black"
              style={{ background: '#EF4444' }}>
              <Trash2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-heading text-xl font-bold" style={{ color: 'var(--foreground)' }}>Permanent Delete?</h3>
            <p className="font-heading text-sm font-medium mt-3 opacity-60 leading-relaxed">
              Are you sure you want to erase <strong className="text-black">{borrower.name}</strong>? This action will destroy all loan records and history.
            </p>
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={handleDelete} disabled={deleting}
                className="w-full py-4 bg-[#EF4444] text-white border-2 border-black rounded-xl font-heading font-black text-sm tracking-widest uppercase shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none transition-all">
                {deleting ? 'ERASING DATA...' : 'ERASE BORROWER'}
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} 
                className="w-full py-4 bg-white text-black border-2 border-transparent font-heading font-bold text-sm hover:underline">
                Keep Borrower
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
