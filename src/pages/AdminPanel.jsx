import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import {
  Loader2, CheckCircle2, X, Edit2, Trash2, ChevronDown, ChevronUp,
  Shield, Package, Clock, MapPin, DollarSign, Eye, EyeOff,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending_review: { label: 'Pending Review', fa: 'در انتظار تایید',  color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  published:      { label: 'Published',      fa: 'منتشر شده',         color: 'bg-green-500/20  text-green-400  border-green-500/30'  },
  draft:          { label: 'Draft',          fa: 'پیش‌نویس',          color: 'bg-gray-500/20   text-gray-400   border-gray-500/30'   },
  rejected:       { label: 'Rejected',       fa: 'رد شده',             color: 'bg-red-500/20    text-red-400    border-red-500/30'    },
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ─── Inline edit form (admin) ─────────────────────────────────────────────────

function TourEditForm({ tour, onSave, onCancel }) {
  const [form, setForm] = useState({
    title:       tour.title || '',
    description: tour.description || '',
    location:    tour.location || '',
    city:        tour.city || '',
    duration:    tour.duration != null ? String(tour.duration) : '',
    price:       tour.price != null ? String(tour.price) : '',
    status:      tour.status || 'draft',
    highlights:  Array.isArray(tour.highlights) ? tour.highlights.join('\n') : (tour.highlights || ''),
    included:    Array.isArray(tour.included) ? tour.included.join('\n') : (tour.included || ''),
    excluded:    Array.isArray(tour.excluded) ? tour.excluded.join('\n') : (tour.excluded || ''),
    image_url:   tour.image_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const ic = 'w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition';
  const lc = 'block text-white/50 text-xs mb-1.5 font-medium';

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        title:       form.title,
        description: form.description,
        location:    form.location,
        city:        form.city,
        duration:    form.duration ? Number(form.duration) : null,
        price:       form.price ? Number(form.price) : null,
        status:      form.status,
        highlights:  form.highlights.split('\n').filter(Boolean),
        included:    form.included.split('\n').filter(Boolean),
        excluded:    form.excluded.split('\n').filter(Boolean),
        image_url:   form.image_url,
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
    <div className="mt-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
      {error && <p className="text-red-400 text-sm p-3 rounded-xl bg-red-500/10 border border-red-500/20">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={lc}>Title</label><input className={ic} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
        <div><label className={lc}>Status</label>
          <select className={`${ic} cursor-pointer`} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
            {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div><label className={lc}>Description</label><textarea rows={3} className={`${ic} resize-none`} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className={lc}>Location</label><input className={ic} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
        <div><label className={lc}>City</label><input className={ic} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
        <div><label className={lc}>Duration (days)</label><input type="number" className={ic} value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} /></div>
        <div><label className={lc}>Price (USD)</label><input type="number" className={ic} value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} /></div>
      </div>

      <div><label className={lc}>Main Image URL</label><input className={ic} value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." /></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={lc}>Highlights (one per line)</label><textarea rows={4} className={`${ic} resize-none`} value={form.highlights} onChange={e => setForm(p => ({ ...p, highlights: e.target.value }))} /></div>
        <div className="grid grid-rows-2 gap-4">
          <div><label className={lc}>Included (one per line)</label><textarea rows={1} className={`${ic} resize-none h-[88px]`} value={form.included} onChange={e => setForm(p => ({ ...p, included: e.target.value }))} /></div>
          <div><label className={lc}>Not Included (one per line)</label><textarea rows={1} className={`${ic} resize-none h-[88px]`} value={form.excluded} onChange={e => setForm(p => ({ ...p, excluded: e.target.value }))} /></div>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold disabled:opacity-60 transition">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Save Changes
        </button>
        <button onClick={onCancel} className="px-5 py-2 rounded-xl border border-white/15 text-white/50 hover:text-white hover:border-white/30 text-sm transition">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Tour card (used in both Pending + All Tours tabs) ────────────────────────

function TourCard({ tour, onStatusChange, onDelete, onEdit }) {
  const [expanded,   setExpanded]   = useState(false);
  const [editOpen,   setEditOpen]   = useState(false);
  const [rejecting,  setRejecting]  = useState(false);
  const [reason,     setReason]     = useState('');
  const [busy,       setBusy]       = useState(false);

  const guide = tour.profiles;

  const act = async (fn) => { setBusy(true); await fn(); setBusy(false); };

  const approve = () => act(() => onStatusChange(tour.id, 'published'));
  const reject  = async () => {
    if (!rejecting) { setRejecting(true); return; }
    await act(() => onStatusChange(tour.id, 'rejected', reason));
    setRejecting(false);
    setReason('');
  };

  const ic = 'w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-teal-500/60 transition';

  return (
    <div className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-start gap-4 p-4">
        {tour.image_url ? (
          <img src={tour.image_url} alt={tour.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-white/20" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-white font-semibold text-sm line-clamp-1">{tour.title}</h3>
            <StatusBadge status={tour.status} />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-white/40 text-xs mb-2">
            {guide?.full_name && <span>👤 {guide.full_name}</span>}
            {tour.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{tour.location}</span>}
            {tour.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tour.duration}d</span>}
            {tour.price && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${Number(tour.price).toLocaleString()}</span>}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setExpanded(p => !p)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-white text-xs transition">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {expanded ? 'Collapse' : 'View Details'}
            </button>

            {tour.status !== 'published' && (
              <button onClick={approve} disabled={busy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 text-xs font-medium transition disabled:opacity-50">
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Approve
              </button>
            )}

            <button onClick={() => { setEditOpen(p => !p); setExpanded(false); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-xs font-medium transition">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>

            {tour.status !== 'rejected' && (
              <button onClick={reject} disabled={busy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-medium transition disabled:opacity-50">
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                {rejecting ? 'Confirm Reject' : 'Reject'}
              </button>
            )}

            <button onClick={() => onDelete(tour.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 text-xs transition">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>

          {/* Reject reason input */}
          {rejecting && (
            <div className="mt-3 flex gap-2">
              <input value={reason} onChange={e => setReason(e.target.value)}
                className={ic} placeholder="Rejection reason (optional)..." />
              <button onClick={() => { setRejecting(false); setReason(''); }}
                className="px-3 py-2 rounded-xl border border-white/15 text-white/40 hover:text-white text-xs transition">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/[0.06] pt-4 space-y-3 text-sm">
          {tour.description && <p className="text-white/60 text-xs leading-relaxed">{tour.description}</p>}
          {tour.highlights?.length > 0 && (
            <div>
              <p className="text-white/40 text-xs font-medium mb-1.5">Highlights</p>
              <ul className="space-y-1">
                {tour.highlights.map((h, i) => <li key={i} className="text-white/60 text-xs flex gap-2"><span className="text-teal-400">•</span>{h}</li>)}
              </ul>
            </div>
          )}
          {Array.isArray(tour.theme) && tour.theme.length > 0 && (
            <p className="text-white/40 text-xs">Theme: <span className="text-white/70">{tour.theme.join(', ')}</span></p>
          )}
          {Array.isArray(tour.purpose) && tour.purpose.length > 0 && (
            <p className="text-white/40 text-xs">Purpose: <span className="text-white/70">{tour.purpose.join(', ')}</span></p>
          )}
          {tour.rejection_reason && (
            <p className="text-red-400 text-xs">Rejection reason: {tour.rejection_reason}</p>
          )}
        </div>
      )}

      {/* Edit form */}
      {editOpen && (
        <div className="px-4 pb-4">
          <TourEditForm
            tour={tour}
            onSave={(updated) => { onEdit(updated); setEditOpen(false); }}
            onCancel={() => setEditOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function PendingToursTab({ tours, onStatusChange, onDelete, onEdit }) {
  const pending = tours.filter(t => t.status === 'pending_review');
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-white font-semibold">Pending Review</h3>
        <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold border border-yellow-500/30">{pending.length}</span>
      </div>
      {pending.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">All clear — no tours pending review</p>
        </div>
      ) : (
        pending.map(t => (
          <TourCard key={t.id} tour={t} onStatusChange={onStatusChange} onDelete={onDelete} onEdit={onEdit} />
        ))
      )}
    </div>
  );
}

function AllToursTab({ tours, onStatusChange, onDelete, onEdit }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? tours : tours.filter(t => t.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <h3 className="text-white font-semibold">All Tours</h3>
        <span className="text-white/40 text-xs">{tours.length} total</span>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="ms-auto px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-xs focus:outline-none focus:border-teal-500/60 cursor-pointer">
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">No tours found</div>
      ) : (
        filtered.map(t => (
          <TourCard key={t.id} tour={t} onStatusChange={onStatusChange} onDelete={onDelete} onEdit={onEdit} />
        ))
      )}
    </div>
  );
}

function AllGuidesTab({ guides, onToggleApproval }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-white font-semibold">All Guides & Agencies</h3>
        <span className="text-white/40 text-xs">{guides.length} total</span>
      </div>
      {guides.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">No guides found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {guides.map(guide => (
            <div key={guide.id} className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-600/20 border border-teal-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {guide.avatar_url ? (
                    <img src={guide.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-teal-400 font-bold text-sm">{guide.full_name?.[0]?.toUpperCase() || '?'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{guide.full_name || 'Unnamed'}</p>
                  <p className="text-white/40 text-xs truncate">{guide.email}</p>
                  {guide.city && <p className="text-white/30 text-xs">{guide.city}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                  guide.is_approved
                    ? 'bg-green-500/15 text-green-400 border-green-500/25'
                    : 'bg-gray-500/15 text-gray-400 border-gray-500/25'
                }`}>
                  {guide.is_approved ? 'Approved' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-white/40 mb-4">
                <span className="capitalize">{guide.role}</span>
                {guide.languages && <span>{guide.languages}</span>}
              </div>

              <button
                onClick={() => onToggleApproval(guide)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition border ${
                  guide.is_approved
                    ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                    : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                }`}
              >
                {guide.is_approved ? <><EyeOff className="w-3.5 h-3.5" /> Revoke Approval</> : <><Eye className="w-3.5 h-3.5" /> Approve Guide</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { profile, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pending');
  const [tours,  setTours]  = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoadingAuth && profile && !profile.is_admin) navigate('/');
  }, [isLoadingAuth, profile, navigate]);

  useEffect(() => {
    if (!profile?.is_admin) return;
    const load = async () => {
      setLoading(true);
      const [toursRes, guidesRes] = await Promise.all([
        supabase.from('tours').select('*, profiles(full_name, email, avatar_url)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').in('role', ['guide', 'agency']).order('created_at', { ascending: false }),
      ]);
      if (!toursRes.error)  setTours(toursRes.data  || []);
      if (!guidesRes.error) setGuides(guidesRes.data || []);
      setLoading(false);
    };
    load();
  }, [profile]);

  const handleStatusChange = async (id, status, reason = '') => {
    const update = { status, ...(reason ? { rejection_reason: reason } : {}) };
    const { error } = await supabase.from('tours').update(update).eq('id', id);
    if (!error) setTours(prev => prev.map(t => t.id === id ? { ...t, ...update } : t));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tour permanently?')) return;
    const { error } = await supabase.from('tours').delete().eq('id', id);
    if (!error) setTours(prev => prev.filter(t => t.id !== id));
  };

  const handleEdit = (updated) => {
    setTours(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
  };

  const handleToggleApproval = async (guide) => {
    const { error } = await supabase.from('profiles').update({ is_approved: !guide.is_approved }).eq('id', guide.id);
    if (!error) setGuides(prev => prev.map(g => g.id === guide.id ? { ...g, is_approved: !g.is_approved } : g));
  };

  if (isLoadingAuth || !profile) {
    return (
      <div className="min-h-screen bg-[hsl(222,47%,11%)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (!profile.is_admin) return null;

  const tabs = [
    { id: 'pending', label: 'Pending Tours', count: tours.filter(t => t.status === 'pending_review').length },
    { id: 'all',     label: 'All Tours',     count: tours.length },
    { id: 'guides',  label: 'All Guides',    count: guides.length },
  ];

  return (
    <div className="min-h-screen bg-[hsl(222,47%,11%)] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.07] bg-[hsl(222,47%,11%)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base">Admin Panel</h1>
            <p className="text-white/40 text-xs">Iran Tour Advisor</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-1.5">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
              }`}>
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'pending' && (
              <PendingToursTab tours={tours} onStatusChange={handleStatusChange} onDelete={handleDelete} onEdit={handleEdit} />
            )}
            {activeTab === 'all' && (
              <AllToursTab tours={tours} onStatusChange={handleStatusChange} onDelete={handleDelete} onEdit={handleEdit} />
            )}
            {activeTab === 'guides' && (
              <AllGuidesTab guides={guides} onToggleApproval={handleToggleApproval} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
