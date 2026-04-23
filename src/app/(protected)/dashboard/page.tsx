'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  IndianRupee,
  RefreshCw,
  Terminal,
  MessageSquare,
} from 'lucide-react';
import SystemLogsModal from '@/components/SystemLogsModal';

interface DashboardData {
  totalPrincipalLent: number;
  totalInterestEarned: number;
  totalAmountRecovered: number;
  totalAmountToReceive: number;
  totalInterestToReceive: number;
  activeLoans: number;
  closedLoans: number;
  upcomingPayments: UpcomingPayment[];
  upiId?: string;
}

interface UpcomingPayment {
  _id: string;
  borrowerId: { 
    _id: string; 
    name: string; 
    phone: string;
    principal: number;
    interestRate: number;
    durationMonths: number;
  } | null;
  dueDate: string;
  monthNumber: number;
  amountDue: number;
  type: string;
  status: string;
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [tempUpi, setTempUpi] = useState('');
  const [activePaymentForUpi, setActivePaymentForUpi] = useState<UpcomingPayment | null>(null);
  const [savingUpi, setSavingUpi] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (res.ok) {
        setData({
          ...json,
          upcomingPayments: json.upcomingPayments || [],
        });
      } else {
        setData({
          totalPrincipalLent: 0,
          totalInterestEarned: 0,
          totalAmountRecovered: 0,
          totalAmountToReceive: 0,
          totalInterestToReceive: 0,
          activeLoans: 0,
          closedLoans: 0,
          upcomingPayments: [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleMarkPaid = async (paymentId: string) => {
    setMarkingPaid(paymentId);
    try {
      await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_paid' }),
      });
      await fetchDashboard();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    } finally {
      setMarkingPaid(null);
    }
  };

  const handleWhatsAppReminder = (payment: UpcomingPayment) => {
    if (!payment.borrowerId) return;
    
    const { name, phone, principal, interestRate, durationMonths } = payment.borrowerId;
    const { amountDue, monthNumber, dueDate } = payment;
    const upiId = data?.upiId || 'Not set';

    const message = `*Payment Reminder from LendFlow*%0A%0AHello *${name}*,%0AThis is a reminder for your upcoming payment of *₹${amountDue.toLocaleString('en-IN')}* due on *${formatDate(dueDate)}*.%0A%0A*Loan Details:*%0A- Principal: ₹${principal.toLocaleString('en-IN')}%0A- Interest Rate: ${interestRate}%/mo%0A- Installment: ${monthNumber} of ${durationMonths}%0A%0A*Payment Method:*%0A- UPI ID: *${upiId}*%0A%0APlease make the payment at your earliest convenience. Thank you!`;

    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleWhatsAppClick = (payment: UpcomingPayment) => {
    if (!data?.upiId || data.upiId === '') {
      setActivePaymentForUpi(payment);
      setTempUpi('');
      setShowUpiModal(true);
    } else {
      handleWhatsAppReminder(payment);
    }
  };

  const saveUpiAndRemind = async () => {
    if (!tempUpi.trim()) return;
    setSavingUpi(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId: tempUpi.trim() }),
      });
      
      if (res.ok) {
        // Update local state so we don't ask again
        setData(prev => prev ? { ...prev, upiId: tempUpi.trim() } : null);
        setShowUpiModal(false);
        if (activePaymentForUpi) {
          // Send reminder after state update
          const updatedPayment = { ...activePaymentForUpi };
          // We manually pass the upiId here because the state update might be async
          const { name, phone, principal, interestRate, durationMonths } = updatedPayment.borrowerId!;
          const { amountDue, monthNumber, dueDate } = updatedPayment;
          const message = `*Payment Reminder from LendFlow*%0A%0AHello *${name}*,%0AThis is a reminder for your upcoming payment of *₹${amountDue.toLocaleString('en-IN')}* due on *${formatDate(dueDate)}*.%0A%0A*Loan Details:*%0A- Principal: ₹${principal.toLocaleString('en-IN')}%0A- Interest Rate: ${interestRate}%/mo%0A- Installment: ${monthNumber} of ${durationMonths}%0A%0A*Payment Method:*%0A- UPI ID: *${tempUpi.trim()}*%0A%0APlease make the payment at your earliest convenience. Thank you!`;
          const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`;
          window.open(whatsappUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Failed to save UPI:', error);
    } finally {
      setSavingUpi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 spinner" style={{ color: 'var(--primary)' }} />
          <p className="text-sm font-heading" style={{ color: 'var(--foreground-subtle)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p style={{ color: 'var(--foreground-subtle)' }}>Failed to load dashboard data</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Principal Lent', value: formatCurrency(data.totalPrincipalLent), icon: Wallet, color: '#2D6B5F' },
    { title: 'Interest Earned', value: formatCurrency(data.totalInterestEarned), icon: TrendingUp, color: '#4F46E5' },
    { title: 'Amount Recovered', value: formatCurrency(data.totalAmountRecovered), icon: ArrowDownCircle, color: '#D97706' },
    { title: 'Amount To Receive', value: formatCurrency(data.totalAmountToReceive), icon: IndianRupee, color: '#059669' },
    { title: 'Interest To Receive', value: formatCurrency(data.totalInterestToReceive), icon: TrendingUp, color: '#38BDF8' },
    { title: 'Active / Closed', value: `${data.activeLoans} / ${data.closedLoans}`, icon: Users, color: '#7C3AED' },
  ];

  return (
    <div className="max-w-none px-2 mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Dashboard</h1>
          <p className="font-body text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
            Overview of your lending portfolio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLogsOpen(true)}
            className="btn-ghost group flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-black/5"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <Terminal className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline font-heading text-xs font-black uppercase tracking-widest opacity-80 group-hover:opacity-100">Logs</span>
          </button>
          <button
            onClick={() => { setLoading(true); fetchDashboard(); }}
            className="btn-ghost group flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-blue-50/10"
            style={{ color: '#2563EB' }}
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden sm:inline font-heading text-xs font-black uppercase tracking-widest text-[#2563EB]">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card-elevated relative overflow-hidden p-6 group">
              <div className="stat-accent" />
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_var(--foreground)]"
                  style={{ background: card.color }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="font-heading text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: 'var(--foreground-subtle)' }}>
                {card.title}
              </p>
              <p className="font-heading text-lg md:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Upcoming Payments */}
      <div className="card-elevated overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--primary-light)' }}>
              <Calendar className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                Upcoming Payments
              </h2>
              <p className="font-heading text-xs" style={{ color: 'var(--foreground-subtle)' }}>
                Due within the next 7 days
              </p>
            </div>
          </div>
          {data.upcomingPayments.length > 0 && (
            <span className="badge badge-pending">
              {data.upcomingPayments.length} due
            </span>
          )}
        </div>

        {data.upcomingPayments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-40" style={{ color: 'var(--badge-paid-text)' }} />
            <p className="font-heading font-semibold" style={{ color: 'var(--foreground-muted)' }}>
              No upcoming payments
            </p>
            <p className="font-body text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>
              All payments are up to date
            </p>
          </div>
        ) : (
          <div>
            {data.upcomingPayments.map((payment, i) => (
              <div
                key={payment._id}
                className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 table-row-hover"
                style={{ borderBottom: i < data.upcomingPayments.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-black shadow-[3px_3px_0px_var(--foreground)]"
                    style={{ background: payment.status === 'overdue' ? '#F59E0B' : '#0EA5E9' }}>
                    {payment.status === 'overdue'
                      ? <AlertTriangle className="w-5 h-5 text-white" />
                      : <Clock className="w-5 h-5 text-white" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading font-bold text-base truncate" style={{ color: 'var(--foreground)' }}>
                      {payment.borrowerId?.name || 'Unknown'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-heading text-xs mt-0.5" style={{ color: 'var(--foreground-subtle)' }}>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(payment.dueDate)}</span>
                      <span>·</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold">Month {payment.monthNumber}</span>
                      {payment.type === 'final' && (
                        <>
                          <span>·</span>
                          <span className="bg-purple-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold border-2 border-black">FINAL</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 flex-shrink-0">
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                    <p className="font-heading font-black text-xl flex items-center gap-0.5 sm:justify-end text-[#059669]">
                      <IndianRupee className="w-4 h-4" />
                      {payment.amountDue.toLocaleString('en-IN')}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border-2 border-black uppercase tracking-widest block w-fit
                      ${payment.status === 'overdue' ? 'bg-[#FF4D4D] text-white shadow-[2px_2px_0px_#000]' : 'bg-[#38BDF8] text-black shadow-[2px_2px_0px_#000]'}`}>
                      {payment.status === 'overdue' ? 'Overdue' : 'Pending'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleWhatsAppClick(payment)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-black font-heading font-black text-[10px] uppercase tracking-widest transition-all
                        bg-[#25D366] text-white shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] 
                        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Remind</span>
                    </button>
                    <button
                      onClick={() => handleMarkPaid(payment._id)}
                      disabled={markingPaid === payment._id}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-black font-heading font-black text-[10px] uppercase tracking-widest transition-all
                        bg-[#10B981] text-white shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] 
                        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {markingPaid === payment._id ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Paid</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Action Logs Modal Overlay */}
      <SystemLogsModal 
        isOpen={isLogsOpen} 
        onClose={() => setIsLogsOpen(false)} 
      />

      {/* UPI Setup Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowUpiModal(false)} />
          <div className="relative w-full max-w-sm card-elevated p-8 bg-white border-[3px] border-black shadow-[8px_8px_0px_#000] animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-[#A3E635] border-[3px] border-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_#000]">
              <IndianRupee className="w-8 h-8 text-black" />
            </div>
            
            <h3 className="font-heading text-xl font-black mb-2 text-black text-center uppercase tracking-tight">Add Your UPI ID</h3>
            <p className="font-body text-xs text-black/50 mb-8 text-center leading-relaxed">
              Please add your UPI ID to include it in the payment reminder message.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block font-heading text-[10px] font-black mb-2 uppercase tracking-[0.15em] text-black/40">
                  Your UPI ID
                </label>
                <input 
                  type="text" 
                  autoFocus
                  value={tempUpi}
                  onChange={(e) => setTempUpi(e.target.value)}
                  placeholder="username@bank"
                  className="w-full px-5 py-4 bg-[#F1F1EE] border-[3px] border-black rounded-2xl font-body font-bold text-black focus:outline-none focus:ring-0 focus:border-[#A3E635] transition-colors"
                />
              </div>
              
              <button
                onClick={saveUpiAndRemind}
                disabled={savingUpi || !tempUpi.trim()}
                className="w-full py-4 bg-[#A3E635] border-[3px] border-black rounded-xl font-heading font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
              >
                {savingUpi ? 'Saving...' : 'Save & Send Reminder'}
              </button>
              <button
                onClick={() => setShowUpiModal(false)}
                className="w-full py-4 bg-white border-[3px] border-black rounded-xl font-heading font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
