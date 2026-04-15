import { useState, useEffect, useMemo } from 'react';
import { X, Search } from 'lucide-react';

interface LogEntry {
  _id: string;
  action: string;
  details: string;
  timestamp: string;
}

// Temporary Mock Data for Demonstration removed

const ACTION_ICONS: Record<string, string> = {
  'Borrower Added': '➕',
  'Borrower Updated': '✏️',
  'Borrower Deleted': '🗑️',
  'Payment Added': '💰',
  'Payment Updated': '✏️',
  'Payment Deleted': '🗑️',
  'Payment Received': '💰',
  'System Log': '⚙️',
  'Data Cleared': '🧹',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SystemLogsModal({ isOpen, onClose }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch logs when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchLogs();
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Derived state: filter and group
  const filteredAndGroupedLogs = useMemo(() => {
    // 1. Filter
    const search = searchQuery.trim().toLowerCase();
    const filtered = logs.filter(l => 
      l.action.toLowerCase().includes(search) || 
      l.details.toLowerCase().includes(search)
    );

    // 2. Sort descending
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 3. Group by date string (YYYY-MM-DD)
    const grouped: Record<string, LogEntry[]> = {};
    filtered.forEach(l => {
      const d = new Date(l.timestamp);
      // Ensure local timezone grouping, padding month/date
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(l);
    });

    return grouped;
  }, [logs, searchQuery]);

  // Extract reverse-sorted date keys
  const dateKeys = Object.keys(filteredAndGroupedLogs).sort((a, b) => b.localeCompare(a));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg max-h-[85vh] bg-white border-[3px] border-black rounded-3xl shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="shrink-0 p-5 border-b-[3px] border-black flex items-center justify-between bg-[#A3E635]">
          <div>
            <h2 className="font-heading text-xl font-black uppercase tracking-tight text-black">System Activity</h2>
            <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-black/60">Change Logs & History</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center transition-all hover:bg-black hover:text-white active:scale-95 active:shadow-none shadow-[3px_3px_0px_#000]"
          >
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {/* Search */}
        <div className="shrink-0 p-4 border-b-2 border-black/10 bg-black/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" strokeWidth={3} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl py-3 pl-11 pr-4 font-heading text-sm font-bold placeholder:text-black/30 placeholder:font-bold focus:outline-none focus:ring-2 focus:ring-[#A3E635] focus:border-black transition-shadow"
            />
          </div>
        </div>

        {/* Logs List Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[var(--background-card)] min-h-[300px] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-[#A3E635] animate-spin" />
            </div>
          ) : dateKeys.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <span className="text-4xl mb-3">👻</span>
              <p className="font-heading font-bold text-sm tracking-widest uppercase">No logs found</p>
            </div>
          ) : (
            dateKeys.map((dateKey) => {
              const entries = filteredAndGroupedLogs[dateKey];
              // Format Date Header (e.g. "12 Apr 2026")
              const d = new Date(dateKey);
              const formattedDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

              return (
                <div key={dateKey} className="space-y-3">
                  <div className="sticky top-0 z-10 flex items-center gap-2 pb-1 bg-[var(--background-card)]">
                    <div className="w-2 h-2 rounded-full bg-black shrink-0" />
                    <h3 className="font-heading text-[11px] font-black uppercase tracking-widest text-black/50">
                      {formattedDate}
                    </h3>
                  </div>

                  <div className="space-y-3 pl-1 relative before:absolute before:left-2 before:top-0 before:bottom-0 before:w-0.5 before:bg-black/10">
                    {entries.map((log) => {
                      const logDate = new Date(log.timestamp);
                      const timeStr = `${String(logDate.getHours()).padStart(2, '0')}:${String(logDate.getMinutes()).padStart(2, '0')}`;
                      const icon = ACTION_ICONS[log.action] || '📝';

                      return (
                        <div key={log._id} className="relative pl-6 sm:pl-8 group">
                          {/* Indicator Node */}
                          <div className="absolute left-[3px] top-4 w-1.5 h-1.5 rounded-full bg-black group-hover:bg-[#A3E635] transition-colors" />
                          
                          {/* Log Card */}
                          <div className="bg-white border-2 border-black rounded-2xl p-3 sm:p-4 shadow-[3px_3px_0px_rgba(0,0,0,0.05)] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all flex items-start gap-3 sm:gap-4">
                            <div className="w-10 h-10 rounded-xl bg-black/5 border-2 border-black flex items-center justify-center text-lg shrink-0">
                              {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="font-heading text-xs font-black uppercase tracking-wide truncate">
                                  {log.action}
                                </p>
                                <span className="font-heading text-[9px] font-bold text-black/40 shrink-0 mt-0.5">
                                  {timeStr}
                                </span>
                              </div>
                              <p className="font-body text-xs text-black/70 leading-relaxed max-w-[95%]">
                                {log.details}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
