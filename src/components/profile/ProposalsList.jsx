import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, Loader2, MessageCircle, Inbox, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n.jsx';
import {
  fetchProposalsForRequest,
  touristRejectProposal,
  touristAcceptProposal,
} from '@/api/tripRequests';
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ── Helpers ────────────────────────────────────────────────────────────────

function initialsOf(name) {
  if (!name) return '?';
  return name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function formatPrice(value, currency = 'USD') {
  const n = Number(value) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function describePricing(slot) {
  const segs = [];
  if (slot.price_type === 'per_person')        segs.push('Per person');
  else if (slot.price_type === 'entire_group') segs.push('Entire group');
  if (slot.price_period === 'per_day')         segs.push('per day');
  else if (slot.price_period === 'entire_trip') segs.push('entire trip');
  return segs.join(', ');
}

function computeTotalPrice(slot, request) {
  let total = Number(slot.price) || 0;
  if (slot.price_type === 'per_person') {
    const people = (request?.adults ?? 0) + (request?.children ?? 0);
    total = total * Math.max(people, 1);
  }
  if (slot.price_period === 'per_day') {
    const days = request?.duration ?? daysBetween(request?.start_date, request?.end_date) ?? 1;
    total = total * days;
  }
  return total;
}

function daysBetween(a, b) {
  if (!a || !b) return null;
  const d1 = new Date(a), d2 = new Date(b);
  return Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
}

// ── StatusPill ─────────────────────────────────────────────────────────────

function StatusPill({ status, t }) {
  const cfg = {
    accepted:  { label: t('pending_review'),    cls: 'bg-teal-50 text-teal-700 border-teal-200' },
    selected:  { label: t('you_chose_this'),     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected:  { label: t('you_rejected_this'),  cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    closed:    { label: t('closed_status'),      cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    chatting:  { label: t('pending_review'),    cls: 'bg-teal-50 text-teal-700 border-teal-200' },
    finalized: { label: t('you_chose_this'),     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };
  const c = cfg[status] || cfg.accepted;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${c.cls}`}>
      {c.label}
    </span>
  );
}

// ── ProposalCard ───────────────────────────────────────────────────────────

function ProposalCard({ slot, request, onReject, onAccept, busy }) {
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const guide = slot.guide || {};
  const isPending  = slot.status === 'accepted' || slot.status === 'chatting';
  const isSelected = slot.status === 'selected' || slot.status === 'finalized';
  const isRejected = slot.status === 'rejected';
  const isClosed   = slot.status === 'closed';

  const totalPrice = computeTotalPrice(slot, request);
  const showComputedTotal =
    slot.price_type === 'per_person' &&
    (request?.adults || request?.children);
  const totalPeople = (request?.adults ?? 0) + (request?.children ?? 0);

  const itinerary = slot.itinerary || '';
  const longItinerary = itinerary.length > 200;
  const itineraryDisplay = expanded || !longItinerary
    ? itinerary
    : itinerary.slice(0, 200) + '…';

  const included = Array.isArray(slot.included) ? slot.included.filter(Boolean) : [];
  const excluded = Array.isArray(slot.excluded) ? slot.excluded.filter(Boolean) : [];

  const cardCls = [
    'rounded-2xl bg-white border border-gray-200 p-6 mb-4 transition',
    isPending ? 'hover:border-teal-400/50' : '',
    isRejected || isClosed ? 'opacity-50' : '',
    isSelected ? 'ring-2 ring-teal-500 border-teal-300' : '',
  ].filter(Boolean).join(' ');

  const initials = initialsOf(guide.full_name);
  const subtitle = [guide.city, guide.role === 'agency' ? 'Agency' : 'Guide']
    .filter(Boolean).join(' · ');

  return (
    <article className={cardCls}>
      {/* Top row: identity + status */}
      <header className="flex items-start gap-4 mb-5">
        {guide.id ? (
          <Link
            to={`/guides/${guide.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-start gap-3 group cursor-pointer flex-1 min-w-0"
          >
            {guide.avatar_url ? (
              <img
                src={guide.avatar_url}
                alt={guide.full_name || 'Guide'}
                className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 leading-tight truncate inline-flex items-center gap-1.5 group-hover:text-teal-600 transition-colors">
                {guide.full_name || 'Guide'}
                <ExternalLink className="w-3.5 h-3.5 text-teal-500 opacity-0 group-hover:opacity-100 transition shrink-0" />
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{subtitle || ' '}</p>
              <span className="text-sm text-teal-600 hover:text-teal-700 hover:underline mt-1 inline-flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" />
                {t('view_full_profile')}
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">
                {guide.full_name || 'Guide'}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{subtitle || ' '}</p>
            </div>
          </div>
        )}
        <StatusPill status={slot.status} t={t} />
      </header>

      {/* Pricing */}
      <div className="mb-6">
        <p className="text-3xl font-bold text-gray-900" dir="ltr">
          {formatPrice(slot.price, slot.currency)}
        </p>
        <p className="text-sm text-gray-500 mt-1">{describePricing(slot)}</p>
        {showComputedTotal && (
          <p className="text-sm text-gray-500 mt-1">
            {t('total_for_n_travelers', {
              n: Math.max(totalPeople, 1),
              total: formatPrice(totalPrice, slot.currency).replace(/^\$/, ''),
            })}
          </p>
        )}
      </div>

      {/* Itinerary */}
      {itinerary && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('itinerary')}</h4>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {itineraryDisplay}
          </p>
          {longItinerary && (
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              className="mt-2 text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              {expanded ? t('read_less') : t('read_more')}
            </button>
          )}
        </div>
      )}

      {/* Included / Not included */}
      {(included.length > 0 || excluded.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          {included.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('included')}</h4>
              <ul className="space-y-1.5">
                {included.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {excluded.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('not_included')}</h4>
              <ul className="space-y-1.5">
                {excluded.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Message */}
      {slot.message && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {t('message_from_guide')}
          </h4>
          <blockquote className={`${dir === 'rtl' ? 'border-r-4 pr-4' : 'border-l-4 pl-4'} border-teal-400 italic text-gray-700 text-sm leading-relaxed`}>
            {slot.message}
          </blockquote>
        </div>
      )}

      {/* Actions */}
      <footer className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
        {isPending && (
          <>
            <button
              onClick={() => navigate(`/chat/${guide.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              <MessageCircle className="w-4 h-4" />
              {t('chat')}
            </button>
            <button
              onClick={() => onReject(slot)}
              disabled={busy}
              className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
            >
              {t('reject')}
            </button>
            <button
              onClick={() => onAccept(slot)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition shadow-sm disabled:opacity-50"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('accept_this_proposal')}
            </button>
          </>
        )}
        {isSelected && (
          <button
            onClick={() => navigate('/profile/bookings')}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            {t('back_to_my_bookings')}
          </button>
        )}
        {isClosed && (
          <p className="text-sm text-gray-500 italic">{t('closed_other_chosen')}</p>
        )}
      </footer>
    </article>
  );
}

// ── Confirm-accept dialog (Section D) ──────────────────────────────────────

function ConfirmAcceptDialog({ open, slot, request, onCancel, onConfirm, busy }) {
  const { t } = useI18n();
  if (!slot) return null;

  const total    = computeTotalPrice(slot, request);
  const deposit  = total * 0.20;
  const balance  = total - deposit;
  const currency = slot.currency || 'USD';
  const guideName = slot.guide?.full_name || 'this guide';
  const destination = Array.isArray(request?.destination)
    ? request.destination.join(', ')
    : (request?.destination || 'Iran');

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) onCancel(); }}>
      <DialogContent className="max-w-md bg-white text-gray-900 border-gray-200">
        <DialogTitle className="text-xl font-bold text-gray-900">
          {t('confirm_proposal_acceptance')}
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-600 mt-2">
          {t('confirm_accept_body', { name: guideName, dest: destination })}
        </DialogDescription>

        {/* Price breakdown */}
        <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm">
          <div className="flex justify-between py-1 text-gray-700">
            <span>{t('tour_price')}</span>
            <span className="font-semibold text-gray-900" dir="ltr">{formatPrice(total, currency)}</span>
          </div>
          <div className="flex justify-between py-1 text-gray-700">
            <span>{t('deposit_20')}<span className="text-xs text-gray-500"> · {t('due_now')}</span></span>
            <span className="font-semibold text-teal-700" dir="ltr">{formatPrice(deposit, currency)}</span>
          </div>
          <div className="flex justify-between py-1 text-gray-700">
            <span>{t('balance')}<span className="text-xs text-gray-500"> · {t('cash_to_guide')}</span></span>
            <span className="font-semibold text-gray-900" dir="ltr">{formatPrice(balance, currency)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          {t('confirm_acceptance_note')}
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition shadow-sm disabled:opacity-50"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('confirm_continue_payment')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── ProposalsList (default export) ─────────────────────────────────────────

export default function ProposalsList({ requestId, touristId, request }) {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busyId, setBusyId]       = useState(null);

  const [confirmSlot, setConfirmSlot] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [rejectSlot, setRejectSlot]   = useState(null);

  const load = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      const rows = await fetchProposalsForRequest(requestId);
      setProposals(rows);
    } catch (err) {
      toast.error(err.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => { load(); }, [load]);

  const confirmReject = async () => {
    if (!rejectSlot || !touristId) return;
    const slot = rejectSlot;
    setBusyId(slot.id);
    setRejectSlot(null);
    try {
      await touristRejectProposal(slot.id, touristId);
      setProposals(prev => prev.map(p => p.id === slot.id ? { ...p, status: 'rejected' } : p));
      toast.success(t('you_rejected_this'));
    } catch (err) {
      toast.error(err.message || 'Failed to reject proposal');
    } finally {
      setBusyId(null);
    }
  };

  const handleAcceptClick = (slot) => setConfirmSlot(slot);

  const handleConfirmAccept = async () => {
    if (!confirmSlot || !touristId) return;
    setConfirmBusy(true);
    try {
      const { booking } = await touristAcceptProposal(confirmSlot.id, touristId);
      toast.success(t('proposal_accepted'));
      setConfirmSlot(null);
      navigate(`/profile/bookings/${booking.id}/pay`);
    } catch (err) {
      toast.error(err.message || 'Failed to accept proposal');
    } finally {
      setConfirmBusy(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 p-10 text-center">
        <Loader2 className="w-6 h-6 text-teal-500 animate-spin mx-auto" />
      </div>
    );
  }

  if (proposals.length === 0) {
    const expires = request?.expires_at ? new Date(request.expires_at) : null;
    const daysLeft = expires
      ? Math.max(0, Math.ceil((expires - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;
    return (
      <div className="rounded-2xl bg-white border border-gray-200 p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{t('no_proposals_yet')}</h3>
        <p className="text-sm text-gray-500 mt-2">{t('no_proposals_desc')}</p>
        {daysLeft != null && (
          <p className="text-xs text-gray-400 mt-2">
            {t('days_remaining', { days: daysLeft })}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {proposals.map(slot => (
          <ProposalCard
            key={slot.id}
            slot={slot}
            request={request}
            busy={busyId === slot.id}
            onReject={(s) => setRejectSlot(s)}
            onAccept={handleAcceptClick}
          />
        ))}
      </motion.div>

      <ConfirmAcceptDialog
        open={!!confirmSlot}
        slot={confirmSlot}
        request={request}
        busy={confirmBusy}
        onCancel={() => setConfirmSlot(null)}
        onConfirm={handleConfirmAccept}
      />

      <AlertDialog open={!!rejectSlot} onOpenChange={(v) => { if (!v) setRejectSlot(null); }}>
        <AlertDialogContent className="bg-white text-gray-900 border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">
              {t('reject')}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {rejectSlot?.guide?.full_name
                ? `${rejectSlot.guide.full_name}'s proposal will be marked as rejected.`
                : 'This proposal will be marked as rejected.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white text-gray-700 border-gray-200">
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {t('reject')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
