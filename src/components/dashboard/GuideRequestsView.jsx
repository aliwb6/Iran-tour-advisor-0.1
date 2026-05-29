import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, MapPin, Calendar, Users, Globe, FileText,
  CheckCircle2, Clock, Loader2, RefreshCw, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchAvailableRequests,
  fetchMyAcceptedRequests,
  guideAcceptRequest,
} from '@/api/tourRequestFlow';

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// destination is a text[] column; tolerate legacy string values too
const cityList = (d) => (Array.isArray(d) ? d : d ? [d] : []);

const SLOT_LABEL = {
  accepted:  { text: 'Waiting for tourist',  color: 'text-yellow-400' },
  selected:  { text: 'You were chosen! 🎉',  color: 'text-emerald-400' },
  rejected:  { text: 'Not selected',         color: 'text-white/40'   },
  chatting:  { text: 'In discussion',        color: 'text-blue-400'   },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Tag({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/[0.07] text-white/60 text-[10px] font-medium">
      {children}
    </span>
  );
}

function SlotDots({ count, max = 3 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-colors ${
            i < count ? 'bg-[hsl(178,85%,45%)]' : 'bg-white/15'
          }`}
        />
      ))}
      <span className="text-[10px] text-white/40 ml-1">{count}/{max} accepted</span>
    </div>
  );
}

function AvailableCard({ req, guideId, onAccepted }) {
  const [accepting, setAccepting] = useState(false);
  const isFull = req.accepted_count >= 3;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await guideAcceptRequest(guideId, req.id);
      toast.success('Request accepted! You\'ll be notified when the tourist makes their choice.');
      onAccepted();
    } catch (err) {
      toast.error(err.message || 'Failed to accept request.');
    } finally {
      setAccepting(false);
    }
  };

  const start = fmt(req.start_date);
  const end   = fmt(req.end_date);

  return (
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
            Trip to {cityList(req.destination).join(', ') || 'Iran'}
          </h3>
          <p className="text-white/40 text-[11px] mt-0.5">
            Submitted {fmt(req.created_at)}
          </p>
        </div>
        <SlotDots count={req.accepted_count} />
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

      <button
        onClick={handleAccept}
        disabled={accepting || isFull}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          isFull
            ? 'bg-white/[0.05] text-white/30 cursor-not-allowed'
            : 'bg-[hsl(178,85%,32%)] hover:bg-[hsl(178,85%,28%)] text-white shadow-lg shadow-[hsl(178,85%,32%)]/20 disabled:opacity-60'
        }`}
      >
        {accepting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Accepting…</>
        ) : isFull ? (
          <><AlertCircle className="w-4 h-4" /> Request Full</>
        ) : (
          <><CheckCircle2 className="w-4 h-4" /> Accept Request</>
        )}
      </button>
    </motion.div>
  );
}

function AcceptedCard({ entry }) {
  const req = entry.request;
  const slotInfo = SLOT_LABEL[entry.status] || { text: entry.status, color: 'text-white/40' };
  const start = fmt(req?.start_date);
  const end   = fmt(req?.end_date);

  return (
    <div className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-white font-semibold text-sm">
            Trip to {req?.destination || 'Iran'}
          </h3>
          <p className="text-white/40 text-[11px] mt-0.5">
            Accepted {fmt(entry.accepted_at)}
          </p>
        </div>
        <span className={`text-xs font-medium ${slotInfo.color}`}>{slotInfo.text}</span>
      </div>
      {(start || end) && (
        <p className="text-white/40 text-xs flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {start}{start && end ? ' → ' : ''}{end}
        </p>
      )}
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
  const [tab, setTab]                 = useState('available');
  const [available, setAvailable]     = useState([]);
  const [accepted, setAccepted]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [avail, acc] = await Promise.all([
        fetchAvailableRequests(userId),
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

  const tabItems = [
    { id: 'available', label: 'Available', count: available.length },
    { id: 'accepted',  label: 'My Acceptances', count: accepted.length },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Tour Requests</h2>
          <p className="text-white/40 text-xs mt-0.5">
            Be one of the first 3 guides to accept a request
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
        {tabItems.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t.id
                ? 'bg-[hsl(178,85%,32%)] text-white shadow'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                tab === t.id ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
              }`}>
                {t.count}
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
        available.length === 0 ? (
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
              {available.map(req => (
                <AvailableCard
                  key={req.id}
                  req={req}
                  guideId={userId}
                  onAccepted={load}
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
            <p className="text-white/50 font-medium text-sm mb-1">No accepted requests yet</p>
            <p className="text-white/30 text-xs max-w-xs">
              Requests you accept will show up here with their status.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {accepted.map(entry => (
              <AcceptedCard key={entry.id} entry={entry} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
