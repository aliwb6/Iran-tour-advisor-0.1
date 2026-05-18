import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Clock, Briefcase, Users, MessageSquare, Shield,
  Loader2, LogOut, CheckCircle2, XCircle, Edit2, Trash2, X, MapPin,
  DollarSign, Star, AlertTriangle, Send, Image as ImageIcon, Package,
  Search,
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const NAV = [
  { id: 'overview', label: 'Overview',       Icon: LayoutDashboard },
  { id: 'pending',  label: 'Pending Tours',  Icon: Clock },
  { id: 'tours',    label: 'All Tours',      Icon: Briefcase },
  { id: 'guides',   label: 'All Guides',     Icon: Users },
  { id: 'comments', label: 'Comments',       Icon: MessageSquare },
];

const STATUS_CFG = {
  published:      { label: 'Published',      dot: 'bg-emerald-400', wrap: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' },
  pending_review: { label: 'Pending Review', dot: 'bg-yellow-400',  wrap: 'bg-yellow-500/20  border-yellow-500/30  text-yellow-300'  },
  draft:          { label: 'Draft',          dot: 'bg-gray-400',    wrap: 'bg-gray-500/20    border-gray-500/30    text-gray-300'    },
  rejected:       { label: 'Rejected',       dot: 'bg-red-400',     wrap: 'bg-red-500/20     border-red-500/30     text-red-300'     },
};

const CARD = 'bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl';

// ─── Shared atoms ────────────────────────────────────────────────────────────

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${cfg.wrap}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StarRating({ rating = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= rating ? 'text-[hsl(38,62%,58%)] fill-[hsl(38,62%,58%)]' : 'text-white/20'}`}
        />
      ))}
    </div>
  );
}

function ErrorBox({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-5">
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span className="flex-1 leading-relaxed">{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-red-300/60 hover:text-red-300">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 text-[hsl(178,85%,45%)] animate-spin" />
    </div>
  );
}

function EmptyState({ Icon, title, desc }) {
  return (
    <div className={`${CARD} py-16 px-4 flex flex-col items-center text-center`}>
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-white/25" />
      </div>
      <p className="text-white/60 font-medium text-sm mb-1">{title}</p>
      {desc && <p className="text-white/35 text-xs max-w-xs">{desc}</p>}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ section, onNavigate, counts, profile, onLogout }) {
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD';

  const badgeFor = (id) => {
    if (id === 'pending')  return counts.pending;
    if (id === 'tours')    return counts.tours;
    if (id === 'guides')   return counts.guides;
    if (id === 'comments') return counts.comments;
    return null;
  };

  return (
    <aside className="w-[210px] flex-shrink-0 h-screen sticky top-0 bg-[hsl(222,55%,8%)] border-r border-white/[0.07] flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.07]">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-[hsl(178,85%,32%)] flex items-center justify-center flex-shrink-0">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-semibold text-sm leading-tight">
            Iran Tour Advisor<br />
            <span className="text-[hsl(38,62%,58%)] font-normal text-[10px] tracking-wider uppercase">Admin Panel</span>
          </span>
        </Link>
      </div>

      {/* Admin info */}
      <div className="px-4 py-4 border-b border-white/[0.07]">
        <div className="w-9 h-9 rounded-xl bg-[hsl(178,85%,32%)] flex items-center justify-center mb-2">
          <span className="text-white text-sm font-bold">{initials}</span>
        </div>
        <p className="text-white text-xs font-medium leading-tight truncate">
          {profile?.full_name || 'Administrator'}
        </p>
        <p className="text-[hsl(38,62%,58%)] text-[10px] mt-0.5">Administrator</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(item => {
          const active = section === item.id;
          const badge = badgeFor(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition-all duration-150 ${
                active
                  ? 'bg-[hsl(178,85%,32%)]/20 text-[hsl(178,85%,50%)]'
                  : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <item.Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {item.label}
              </span>
              {badge !== null && badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  active ? 'bg-[hsl(178,85%,32%)]/30 text-[hsl(178,85%,60%)]' : 'bg-white/10 text-white/50'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-white/[0.07] pt-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────

function OverviewView({ tours, guides, reviews, loading }) {
  if (loading) return <SectionLoader />;

  const pendingCount = tours.filter(t => t.status === 'pending_review' || t.status === 'draft').length;

  const stats = [
    { label: 'Total Tours',     value: tours.length,    color: 'text-white',                Icon: Briefcase },
    { label: 'Pending Review',  value: pendingCount,    color: 'text-yellow-400',           Icon: Clock },
    { label: 'Total Guides',    value: guides.length,   color: 'text-[hsl(178,85%,50%)]',   Icon: Users },
    { label: 'Total Comments',  value: reviews.length,  color: 'text-[hsl(38,62%,58%)]',    Icon: MessageSquare },
  ];

  const recentTours    = tours.slice(0, 5);
  const recentComments = reviews.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Overview</h2>
        <span className="text-white/40 text-xs">Platform statistics</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className={`${CARD} p-5 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
              <stat.Icon className={`w-4.5 h-4.5 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-white/40 text-[11px]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent tours */}
      <div className={`${CARD} p-5`}>
        <p className="text-white/70 text-sm font-semibold mb-4">Recent Tours</p>
        {recentTours.length === 0 ? (
          <p className="text-white/30 text-xs text-center py-8">No tours yet</p>
        ) : (
          <div className="space-y-3">
            {recentTours.map(tour => (
              <div key={tour.id} className="flex items-center gap-3 pb-3 border-b border-white/[0.06] last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                  {tour.image_url ? (
                    <img src={tour.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{tour.title || 'Untitled'}</p>
                  <p className="text-white/35 text-[10px] mt-0.5">{tour.profiles?.full_name || 'Unknown guide'}</p>
                </div>
                <StatusPill status={tour.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent comments */}
      <div className={`${CARD} p-5`}>
        <p className="text-white/70 text-sm font-semibold mb-4">Recent Comments</p>
        {recentComments.length === 0 ? (
          <p className="text-white/30 text-xs text-center py-8">No comments yet</p>
        ) : (
          <div className="space-y-4">
            {recentComments.map(r => (
              <div key={r.id} className="flex items-start gap-3 pb-3 border-b border-white/[0.06] last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-[hsl(178,85%,32%)]/30 flex items-center justify-center flex-shrink-0 text-[hsl(178,85%,50%)] text-xs font-bold">
                  {r.reviewer_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-white text-xs font-medium">{r.reviewer_name || 'Anonymous'}</p>
                    <StarRating rating={r.rating || 0} />
                  </div>
                  {r.review_text && (
                    <p className="text-white/45 text-[11px] leading-relaxed line-clamp-2">{r.review_text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tour Edit Modal ─────────────────────────────────────────────────────────

function TourEditModal({ tour, onSave, onClose }) {
  const [form, setForm] = useState({
    title:       tour.title || '',
    description: tour.description || '',
    price:       tour.price != null ? String(tour.price) : '',
    duration:    tour.duration != null ? String(tour.duration) : '',
    status:      tour.status || 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const ic = 'w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[hsl(178,85%,32%)]/60 focus:ring-1 focus:ring-[hsl(178,85%,32%)]/30 transition';
  const lc = 'block text-white/50 text-xs mb-1.5 font-medium';

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        title:       form.title,
        description: form.description,
        price:       form.price ? Number(form.price) : null,
        duration:    form.duration ? Number(form.duration) : null,
        status:      form.status,
      };
      const { data, error: err } = await supabase
        .from('tours').update(payload).eq('id', tour.id).select().single();
      if (err) throw err;
      onSave(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-lg ${CARD} p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">Edit Tour</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/50 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <ErrorBox message={error} onClose={() => setError('')} />

        <div className="space-y-4">
          <div>
            <label className={lc}>Title</label>
            <input className={ic} value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className={lc}>Description</label>
            <textarea rows={4} className={`${ic} resize-none`} value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lc}>Price (USD)</label>
              <input type="number" className={ic} value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
            </div>
            <div>
              <label className={lc}>Duration (days)</label>
              <input type="number" className={ic} value={form.duration}
                onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className={lc}>Status</label>
            <select className={`${ic} cursor-pointer`} value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {Object.entries(STATUS_CFG).map(([v, c]) => (
                <option key={v} value={v}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[hsl(178,85%,32%)] hover:bg-[hsl(178,85%,38%)] text-white text-sm font-semibold disabled:opacity-60 transition">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Save Changes
          </button>
          <button onClick={onClose}
            className="px-5 py-2 rounded-xl border border-white/15 text-white/50 hover:text-white hover:border-white/30 text-sm transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tour Card (reused for pending + all tours) ──────────────────────────────

function TourRow({ tour, busyId, onApprove, onReject, onEdit }) {
  const busy = busyId === tour.id;
  return (
    <div className={`${CARD} p-4`}>
      <div className="flex items-start gap-4">
        {tour.image_url ? (
          <img src={tour.image_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-5 h-5 text-white/20" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-white font-semibold text-sm line-clamp-1">{tour.title || 'Untitled'}</h3>
            <StatusPill status={tour.status} />
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-white/40 text-[11px] mb-3">
            {tour.profiles?.full_name && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />{tour.profiles.full_name}
              </span>
            )}
            {tour.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />{tour.location}
              </span>
            )}
            {tour.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />{tour.duration}d
              </span>
            )}
            {tour.price && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />{Number(tour.price).toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {tour.status !== 'published' && (
              <button
                disabled={busy}
                onClick={() => onApprove(tour.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-medium transition disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Approve
              </button>
            )}
            {tour.status !== 'rejected' && (
              <button
                disabled={busy}
                onClick={() => onReject(tour.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-medium transition disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Reject
              </button>
            )}
            <button
              onClick={() => onEdit(tour)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(178,85%,32%)]/15 hover:bg-[hsl(178,85%,32%)]/25 text-[hsl(178,85%,55%)] text-xs font-medium transition"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pending Tours View ──────────────────────────────────────────────────────

function PendingToursView({ tours, loading, onApprove, onReject, onEdit, busyId }) {
  if (loading) return <SectionLoader />;

  const pending = tours.filter(t => t.status === 'pending_review' || t.status === 'draft');

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-bold text-lg">Pending Tours</h2>
        <span className="text-white/40 text-xs">
          {pending.length} awaiting review
        </span>
      </div>

      {pending.length === 0 ? (
        <EmptyState
          Icon={CheckCircle2}
          title="All caught up"
          desc="No tours waiting for review right now."
        />
      ) : (
        <div className="space-y-3">
          {pending.map(tour => (
            <TourRow
              key={tour.id}
              tour={tour}
              busyId={busyId}
              onApprove={onApprove}
              onReject={onReject}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── All Tours View ──────────────────────────────────────────────────────────

function AllToursView({ tours, loading, onApprove, onReject, onEdit, busyId }) {
  const [filter, setFilter] = useState('all');

  if (loading) return <SectionLoader />;

  const filtered = filter === 'all' ? tours : tours.filter(t => t.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-bold text-lg">All Tours</h2>
          <span className="text-white/40 text-xs">{tours.length} total</span>
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-xs focus:outline-none focus:border-[hsl(178,85%,32%)]/60 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CFG).map(([v, c]) => (
            <option key={v} value={v}>{c.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState Icon={Briefcase} title="No tours found" desc="Try adjusting the filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map(tour => (
            <TourRow
              key={tour.id}
              tour={tour}
              busyId={busyId}
              onApprove={onApprove}
              onReject={onReject}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Guides View ─────────────────────────────────────────────────────────────

function GuidesView({ guides, loading, onToggleApproval, busyId }) {
  const [query, setQuery] = useState('');

  if (loading) return <SectionLoader />;

  const filtered = query
    ? guides.filter(g =>
        (g.full_name || '').toLowerCase().includes(query.toLowerCase()) ||
        (g.email || '').toLowerCase().includes(query.toLowerCase()) ||
        (g.city || '').toLowerCase().includes(query.toLowerCase())
      )
    : guides;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-bold text-lg">All Guides</h2>
          <span className="text-white/40 text-xs">{guides.length} total</span>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search guides..."
            className="pl-9 pr-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[hsl(178,85%,32%)]/60 w-56"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState Icon={Users} title="No guides found" desc="No guides match your search." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(guide => {
            const busy = busyId === guide.id;
            return (
              <div key={guide.id} className={`${CARD} p-4`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[hsl(178,85%,32%)]/20 border border-[hsl(178,85%,32%)]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {guide.avatar_url ? (
                      <img src={guide.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[hsl(178,85%,55%)] font-bold text-sm">
                        {guide.full_name?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{guide.full_name || 'Unnamed'}</p>
                    <p className="text-white/40 text-[11px] truncate">{guide.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0 ${
                    guide.is_approved
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                      : 'bg-gray-500/15 text-gray-400 border-gray-500/25'
                  }`}>
                    {guide.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px]">
                  <span className={`px-2 py-0.5 rounded-full font-medium border capitalize ${
                    guide.role === 'agency'
                      ? 'bg-[hsl(38,62%,58%)]/15 text-[hsl(38,62%,58%)] border-[hsl(38,62%,58%)]/25'
                      : 'bg-[hsl(178,85%,32%)]/15 text-[hsl(178,85%,55%)] border-[hsl(178,85%,32%)]/25'
                  }`}>
                    {guide.role || 'guide'}
                  </span>
                  {guide.city && (
                    <span className="flex items-center gap-1 text-white/40">
                      <MapPin className="w-3 h-3" />{guide.city}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onToggleApproval(guide)}
                  disabled={busy}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition border disabled:opacity-50 ${
                    guide.is_approved
                      ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {busy
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : guide.is_approved
                      ? <XCircle className="w-3.5 h-3.5" />
                      : <CheckCircle2 className="w-3.5 h-3.5" />
                  }
                  {guide.is_approved ? 'Suspend' : 'Approve Guide'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Comment Card ────────────────────────────────────────────────────────────

function CommentCard({ review, onReply, onDelete, busy }) {
  const [reply, setReply] = useState(review.admin_reply || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSaveReply = async () => {
    setSaving(true);
    setError('');
    try {
      const { error: err } = await supabase
        .from('reviews')
        .update({ admin_reply: reply })
        .eq('id', review.id);
      if (err) throw err;
      onReply(review.id, reply);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const date = review.created_at
    ? new Date(review.created_at).toLocaleDateString()
    : '';

  return (
    <div className={`${CARD} p-4`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[hsl(178,85%,32%)]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[hsl(178,85%,55%)] font-bold text-xs">
              {review.reviewer_name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-semibold text-sm">{review.reviewer_name || 'Anonymous'}</p>
              <StarRating rating={review.rating || 0} />
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/35">
              {review.tours?.title && (
                <span className="text-[hsl(38,62%,58%)]/80">Re: {review.tours.title}</span>
              )}
              {date && <span>· {date}</span>}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(review.id)}
          disabled={busy}
          className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition flex-shrink-0 disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {review.review_text && (
        <p className="text-white/65 text-sm leading-relaxed mb-4 pl-12">{review.review_text}</p>
      )}

      {review.admin_reply && (
        <div className="mb-4 pl-12">
          <div className="p-3 rounded-xl bg-[hsl(178,85%,32%)]/10 border border-[hsl(178,85%,32%)]/20">
            <p className="text-[hsl(178,85%,55%)] text-[10px] font-semibold mb-1 uppercase tracking-wider">
              Current Admin Reply
            </p>
            <p className="text-white/70 text-xs leading-relaxed">{review.admin_reply}</p>
          </div>
        </div>
      )}

      <ErrorBox message={error} onClose={() => setError('')} />

      <div className="pl-12 space-y-2">
        <textarea
          rows={2}
          value={reply}
          onChange={e => setReply(e.target.value)}
          placeholder="Write a reply as admin..."
          className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[hsl(178,85%,32%)]/60 focus:ring-1 focus:ring-[hsl(178,85%,32%)]/30 transition resize-none"
        />
        <button
          onClick={handleSaveReply}
          disabled={saving || !reply.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(178,85%,32%)] hover:bg-[hsl(178,85%,38%)] text-white text-xs font-semibold disabled:opacity-50 transition"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {review.admin_reply ? 'Update Reply' : 'Save Reply'}
        </button>
      </div>
    </div>
  );
}

function CommentsView({ reviews, loading, onReply, onDelete, busyId }) {
  if (loading) return <SectionLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-bold text-lg">Comments</h2>
        <span className="text-white/40 text-xs">{reviews.length} total</span>
      </div>

      {reviews.length === 0 ? (
        <EmptyState Icon={MessageSquare} title="No comments yet" desc="Reviews from travelers will appear here." />
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <CommentCard
              key={review.id}
              review={review}
              busy={busyId === review.id}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main AdminDashboard ─────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [section, setSection] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [tours, setTours]     = useState([]);
  const [guides, setGuides]   = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loadingTours,    setLoadingTours]    = useState(true);
  const [loadingGuides,   setLoadingGuides]   = useState(true);
  const [loadingReviews,  setLoadingReviews]  = useState(true);

  const [error, setError]   = useState('');
  const [busyId, setBusyId] = useState(null);
  const [editingTour, setEditingTour] = useState(null);

  // ── Auth guard ──
  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user) { navigate('/login'); return; }

        const { data: prof, error: err } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (cancelled) return;
        if (err) throw err;
        if (!prof || prof.role !== 'admin') { navigate('/'); return; }

        setProfile(prof);
        setAuthChecked(true);
      } catch (err) {
        setError(err.message);
        setAuthChecked(true);
      }
    }
    check();
    return () => { cancelled = true; };
  }, [navigate]);

  // ── Fetchers ──
  const fetchTours = async () => {
    setLoadingTours(true);
    try {
      const { data, error: err } = await supabase
        .from('tours')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setTours(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTours(false);
    }
  };

  const fetchGuides = async () => {
    setLoadingGuides(true);
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['guide', 'agency'])
        .order('created_at', { ascending: false });
      if (err) throw err;
      setGuides(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingGuides(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const { data, error: err } = await supabase
        .from('reviews')
        .select('*, tours(title)')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setReviews(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (!authChecked || !profile) return;
    fetchTours();
    fetchGuides();
    fetchReviews();
  }, [authChecked, profile]);

  // ── Actions ──
  const changeTourStatus = async (id, status) => {
    setBusyId(id);
    setError('');
    try {
      const { error: err } = await supabase.from('tours').update({ status }).eq('id', id);
      if (err) throw err;
      await fetchTours();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleTourEdit = (updated) => {
    setTours(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated, profiles: t.profiles } : t));
    setEditingTour(null);
  };

  const toggleGuideApproval = async (guide) => {
    setBusyId(guide.id);
    setError('');
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ is_approved: !guide.is_approved })
        .eq('id', guide.id);
      if (err) throw err;
      await fetchGuides();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleReplyUpdate = (id, replyText) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, admin_reply: replyText } : r));
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    setBusyId(id);
    setError('');
    try {
      const { error: err } = await supabase.from('reviews').delete().eq('id', id);
      if (err) throw err;
      await fetchReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const counts = {
    pending:  tours.filter(t => t.status === 'pending_review' || t.status === 'draft').length,
    tours:    tours.length,
    guides:   guides.length,
    comments: reviews.length,
  };

  // ── Loading splash while auth verifies ──
  if (!authChecked || !profile) {
    return (
      <div className="min-h-screen bg-[hsl(222,55%,8%)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[hsl(178,85%,45%)] animate-spin" />
          <p className="text-white/40 text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // ── Render ──
  const renderSection = () => {
    switch (section) {
      case 'overview':
        return (
          <OverviewView
            tours={tours}
            guides={guides}
            reviews={reviews}
            loading={loadingTours || loadingGuides || loadingReviews}
          />
        );
      case 'pending':
        return (
          <PendingToursView
            tours={tours}
            loading={loadingTours}
            busyId={busyId}
            onApprove={(id) => changeTourStatus(id, 'published')}
            onReject={(id) => changeTourStatus(id, 'rejected')}
            onEdit={setEditingTour}
          />
        );
      case 'tours':
        return (
          <AllToursView
            tours={tours}
            loading={loadingTours}
            busyId={busyId}
            onApprove={(id) => changeTourStatus(id, 'published')}
            onReject={(id) => changeTourStatus(id, 'rejected')}
            onEdit={setEditingTour}
          />
        );
      case 'guides':
        return (
          <GuidesView
            guides={guides}
            loading={loadingGuides}
            busyId={busyId}
            onToggleApproval={toggleGuideApproval}
          />
        );
      case 'comments':
        return (
          <CommentsView
            reviews={reviews}
            loading={loadingReviews}
            busyId={busyId}
            onReply={handleReplyUpdate}
            onDelete={handleDeleteReview}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(222,55%,8%)] flex">
      <Sidebar
        section={section}
        onNavigate={setSection}
        counts={counts}
        profile={profile}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <ErrorBox message={error} onClose={() => setError('')} />
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderSection()}
          </motion.div>
        </div>
      </main>

      {editingTour && (
        <TourEditModal
          tour={editingTour}
          onSave={handleTourEdit}
          onClose={() => setEditingTour(null)}
        />
      )}
    </div>
  );
}
