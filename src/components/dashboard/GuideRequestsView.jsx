import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Calendar, Users, Globe, FileText,
  CheckCircle2, Clock, RefreshCw, AlertCircle,
  DollarSign, X as XIcon,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';
import { supabase } from '@/supabaseClient';
import {
  getAvailableTripRequests,
  fetchMyAcceptedRequests,
} from '@/api/tripRequests';
import SubmitProposalModal from '@/components/dashboard/SubmitProposalModal';

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function destDisplay(d) {
  if (Array.isArray(d)) return d.join(', ');
  return d || 'Iran';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Tag({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/[0.07] text-white/60 text-[10px] font-medium">
      {children}
    </span>
  );
}

function AvailableCard({ req, guideId, commissionRate, onAccepted, onSkip }) {
  const { t } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);
  const alreadyApplied = !!req.my_slot;
  const isFull = (req.accepted_count || 0) >= 5;

  const handleApplyClick = () => setModalOpen(true);
  const handleProposalSuccess = () => { onAccepted(); };

  const start = fmt(req.start_date);
  const end   = fmt(req.end_date);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.15] transition-colors"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm leading-snug">
              Trip to {destDisplay(req.destination)}
            </h3>
            <p className="text-white/40 text-[11px] mt-0.5">
              Submitted {fmt(req.created_at)}
            </p>
          </div>
          <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/70 whitespace-nowrap">
            {req.accepted_count || 0} {t('of')} 5 {t('proposals')}
          </span>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(start || end) && (
            <Tag>
              <Calendar className="w-3 h-3 mr-1 inline-block" />
              {start}{start && end ? ' → ' : ''}{end}
            </Tag>
          )}
          {(req.adults || req.adult_count) && (
            <Tag>
              <Users className="w-3 h-3 mr-1 inline-block" />
              {(req.adults || req.adult_count || 1)} adult{((req.adults || req.adult_count) > 1) ? 's' : ''}
              {(req.children || req.child_count) > 0 ? `, ${req.children || req.child_count} child` : ''}
            </Tag>
          )}
          {req.guide_languages?.length > 0 && (
            <Tag>
              <Globe className="w-3 h-3 mr-1 inline-block" />
              {req.guide_languages.join(', ')}
            </Tag>
          )}
          {req.tour_type && <Tag>{req.tour_type}</Tag>}
        </div>

        {/* Requirements */}
        {req.requirements && (
          <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-2">
            <FileText className="w-3 h-3 inline-block mr-1 text-white/30" />
            {req.requirements}
          </p>
        )}

        {/* Action area */}
        {alreadyApplied ? (
          <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.05] text-white/50 cursor-not-allowed">
            <CheckCircle2 className="w-4 h-4 text-[hsl(178,85%,45%)]" />
            {t('proposal_submitted')} ({req.my_slot.status})
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyClick}
              disabled={isFull}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isFull
                  ? 'bg-white/[0.05] text-white/30 cursor-not-allowed'
                  : 'bg-[hsl(178,85%,32%)] hover:bg-[hsl(178,85%,28%)] text-white shadow-lg shadow-[hsl(178,85%,32%)]/20'
              }`}
            >
              {isFull ? (
                <><AlertCircle className="w-4 h-4" /> {t('request_closed_5_5')}</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> {t('apply')}</>
              )}
            </button>
            <button
              type="button"
              onClick={() => onSkip(req.id)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-1.5"
            >
              <XIcon className="w-3.5 h-3.5" />
              {t('skip')}
            </button>
          </div>
        )}
      </motion.div>

      <SubmitProposalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        request={req}
        guideId={guideId}
        commissionRate={commissionRate}
        onSuccess={handleProposalSuccess}
      />
    </>
  );
}

const SLOT_STATUS_STYLE = {
  accepted:  'text-yellow-400',
  selected:  'text-emerald-400',
  rejected:  'text-white/40',
  chatting:  'text-blue-400',
  finalized: 'text-emerald-400',
  closed:    'text-white/40',
};

function MyProposalCard({ entry }) {
  const { t } = useI18n();
  const req = entry.request;
  const statusColor = SLOT_STATUS_STYLE[entry.status] || 'text-white/60';
  const start = fmt(req?.start_date);
  const end   = fmt(req?.end_date);

  const priceLine = useMemo(() => {
    if (entry.price == null) return null;
    const currency = entry.currency || 'USD';
    const symbol = currency === 'USD' ? '$' : '';
    const amt = `${symbol}${Number(entry.price).toLocaleString()}`;
    const pt = entry.price_type   === 'per_person'   ? t('per_person')   : t('entire_group');
    const pp = entry.price_period === 'per_day'      ? t('per_day')      : t('entire_trip');
    return `${amt} · ${pt} · ${pp}`;
  }, [entry, t]);

  const firstItineraryLine = useMemo(() => {
    if (!entry.itinerary) return null;
    const line = entry.itinerary.split('\n').map(s => s.trim()).find(Boolean);
    return line || null;
  }, [entry]);

  const statusLabel = entry.status === 'accepted'
    ? t('waiting_for_tourist')
    : entry.status;

  return (
    <div className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm">
            Trip to {destDisplay(req?.destination)}
          </h3>
          {priceLine && (
            <p className="text-[hsl(178,85%,55%)] text-xs mt-1 font-medium flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {priceLine}
            </p>
          )}
          {firstItineraryLine && (
            <p className="text-white/50 text-xs mt-1.5 line-clamp-1">
              {firstItineraryLine}
            </p>
          )}
        </div>
        <span className={`text-xs font-medium shrink-0 ${statusColor}`}>{statusLabel}</span>
      </div>
      <div className="flex items-center gap-3 mt-3 text-[11px] text-white/40">
        {(start || end) && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {start}{start && end ? ' → ' : ''}{end}
          </span>
        )}
        <span>{t('submitted_on', { date: fmt(entry.accepted_at) || '' })}</span>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl p-5 animate-pulse space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-40 bg-white/10 rounded-lg" />
            <div className="h-3 w-20 bg-white/10 rounded-lg" />
          </div>
          <div className="flex gap-2">
            <div className="h-5 w-28 bg-white/10 rounded-md" />
            <div className="h-5 w-20 bg-white/10 rounded-md" />
          </div>
          <div className="h-8 w-full bg-white/10 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function GuideRequestsView({ userId }) {
  const { t } = useI18n();
  const [tab, setTab]                 = useState('available');
  const [available, setAvailable]     = useState([]);
  const [accepted, setAccepted]       = useState([]);
  const [skippedIds, setSkippedIds]   = useState(new Set());
  const [commissionRate, setCommissionRate] = useState(0.15);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  // Fetch commission rate once on mount (falls back to 0.15)
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('commission_rate')
          .eq('id', userId)
          .maybeSingle();
        if (!cancelled && data?.commission_rate != null) {
          setCommissionRate(Number(data.commission_rate));
        }
      } catch {
        // silent — fallback rate already set
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [avail, acc] = await Promise.all([
        getAvailableTripRequests(userId),
        fetchMyAcceptedRequests(userId),
      ]);
      setAvailable(avail);
      setAccepted(acc);
    } catch (err) {
      setError(err.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleSkip = (id) => {
    setSkippedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const visibleAvailable = available.filter(r => !skippedIds.has(r.id));

  const tabItems = [
    { id: 'available', label: 'Available',         count: visibleAvailable.length },
    { id: 'accepted',  label: t('my_proposals'),   count: accepted.length },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Tour Requests</h2>
          <p className="text-white/40 text-xs mt-0.5">
            Be one of the first 5 guides to accept a request
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-xs transition disabled:opacity-40"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/[0.05] rounded-xl p-1 mb-6 w-fit gap-1">
        {tabItems.map(tabItem => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === tabItem.id
                ? 'bg-[hsl(178,85%,32%)] text-white shadow'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {tabItem.label}
            {tabItem.count > 0 && (
              <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                tab === tabItem.id ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
              }`}>
                {tabItem.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      ) : loading ? (
        <LoadingState />
      ) : tab === 'available' ? (
        visibleAvailable.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-white/20" />
            </div>
            <p className="text-white/50 font-medium text-sm mb-1">No open trip requests</p>
            <p className="text-white/30 text-xs max-w-xs">
              New requests from travelers will appear here. Check back soon!
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {visibleAvailable.map(req => (
                <AvailableCard
                  key={req.id}
                  req={req}
                  guideId={userId}
                  commissionRate={commissionRate}
                  onAccepted={load}
                  onSkip={handleSkip}
                />
              ))}
            </div>
          </AnimatePresence>
        )
      ) : (
        accepted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-white/20" />
            </div>
            <p className="text-white/50 font-medium text-sm mb-1">No proposals submitted yet</p>
            <p className="text-white/30 text-xs max-w-xs">
              Proposals you submit will show up here with their status.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {accepted.map(entry => (
              <MyProposalCard key={entry.id} entry={entry} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
