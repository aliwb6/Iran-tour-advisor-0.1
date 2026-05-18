import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import {
  Loader2, Shield, Users, Package, MessageSquare, LayoutDashboard,
  CheckCircle2, XCircle, Trash2, Edit2, X, Star, MapPin, Calendar,
  DollarSign, Clock, AlertTriangle, Eye, EyeOff, Send, RefreshCw,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending_review: { label: 'Pending Review', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  draft:          { label: 'Draft',          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  published:      { label: 'Published',      color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  rejected:       { label: 'Rejected',       color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const NAV = [
  { id: 'dashboard', label: 'Dashboard',        Icon: LayoutDashboard },
  { id: 'guides',    label: 'Guides Management', Icon: Users },
  { id: 'tours',     label: 'Tours Management',  Icon: Package },
  { id: 'comments',  label: 'Comments',          Icon: MessageSquare },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function SectionTitle({ children, count }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="text-white font-bold text-lg">{children}</h2>
      {count !== undefined && (
        <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/50 text-xs font-semibold border border-white/10">
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Dashboard Overview ───────────────────────────────────────────────────────

function DashboardView({ stats, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Guides',         value: stats.totalGuides,         Icon: Users,          color: 'text-teal-400',   bg: 'bg-teal-500/10 border-teal-500/20' },
    { label: 'Pending Tours',        value: stats.pendingTours,        Icon: Clock,          color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Unanswered Comments',  value: stats.unansweredComments,  Icon: MessageSquare,  color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Tours Under Review',   value: stats.totalTours,          Icon: Package,        color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  ];

  return (
    <div>
      <SectionTitle>Overview</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl border ${bg} flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-white/40 text-xs mb-1">{label}</p>
            <p className="text-white font-bold text-2xl">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Guides Management ────────────────────────────────────────────────────────

function GuidesView({ guides, loading, onToggleApproval }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <SectionTitle count={guides.length}>Guides Management</SectionTitle>
      {guides.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No guides found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {guides.map(guide => (
            <div key={guide.id} className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-teal-600/20 border border-teal-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {guide.avatar_url ? (
                    <img src={guide.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-teal-400 font-bold">
                      {guide.full_name?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{guide.full_name || 'Unnamed'}</p>
                  <p className="text-white/40 text-xs truncate">{guide.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${
                  guide.is_approved
                    ? 'bg-green-500/15 text-green-400 border-green-500/25'
                    : 'bg-gray-500/15 text-gray-400 border-gray-500/25'
                }`}>
                  {guide.is_approved ? 'Approved' : 'Pending'}
                </span>
              </div>

              <div className="space-y-1.5 mb-4 text-xs text-white/40">
                {guide.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    <span>{guide.city}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(guide.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => onToggleApproval(guide)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition border ${
                  guide.is_approved
                    ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                    : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                }`}
              >
                {guide.is_approved
                  ? <><EyeOff className="w-3.5 h-3.5" /> Suspend</>
                  : <><Eye className="w-3.5 h-3.5" /> Approve</>
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tours Management ─────────────────────────────────────────────────────────

function TourEditModal({ tour, onSave, onClose }) {
  const [form, setForm] = useState({ title: tour.title || '', description: tour.description || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const ic = 'w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition';

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('tours')
        .update({ title: form.title, description: form.description })
        .eq('id', tour.id)
        .select()
        .single();
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
      <div className="relative w-full max-w-lg bg-[hsl(222,45%,14%)] border border-white/[0.12] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">Edit Tour</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/50 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">{error}</p>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-white/50 text-xs mb-1.5 font-medium">Title</label>
            <input
              className={ic}
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs mb-1.5 font-medium">Description</label>
            <textarea
              rows={5}
              className={`${ic} resize-none`}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold disabled:opacity-60 transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-white/15 text-white/50 hover:text-white hover:border-white/30 text-sm transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ToursView({ tours, loading, onStatusChange, onEdit }) {
  const [filter, setFilter] = useState('all');
  const [editingTour, setEditingTour] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const filtered = filter === 'all' ? tours : tours.filter(t => t.status === filter);

  const act = async (id, fn) => {
    setBusyId(id);
    await fn();
    setBusyId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-bold text-lg">Tours Management</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/50 text-xs font-semibold border border-white/10">
            {tours.length}
          </span>
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-xs focus:outline-none focus:border-teal-500/60 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([v, c]) => (
            <option key={v} value={v}>{c.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No tours found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(tour => (
            <div key={tour.id} className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl p-4">
              <div className="flex items-start gap-4">
                {tour.image_url ? (
                  <img src={tour.image_url} alt={tour.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-white/20" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-semibold text-sm line-clamp-1">{tour.title}</h3>
                    <StatusBadge status={tour.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-white/40 text-xs mb-3">
                    {tour.profiles?.full_name && <span>👤 {tour.profiles.full_name}</span>}
                    {tour.price && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />${Number(tour.price).toLocaleString()}
                      </span>
                    )}
                    {tour.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{tour.duration} days
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tour.status !== 'published' && (
                      <button
                        disabled={busyId === tour.id}
                        onClick={() => act(tour.id, () => onStatusChange(tour.id, 'published'))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 text-xs font-medium transition disabled:opacity-50"
                      >
                        {busyId === tour.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <CheckCircle2 className="w-3.5 h-3.5" />
                        }
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => setEditingTour(tour)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-xs font-medium transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    {tour.status !== 'rejected' && (
                      <button
                        disabled={busyId === tour.id}
                        onClick={() => act(tour.id, () => onStatusChange(tour.id, 'rejected'))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-medium transition disabled:opacity-50"
                      >
                        {busyId === tour.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <XCircle className="w-3.5 h-3.5" />
                        }
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingTour && (
        <TourEditModal
          tour={editingTour}
          onSave={(updated) => { onEdit(updated); setEditingTour(null); }}
          onClose={() => setEditingTour(null)}
        />
      )}
    </div>
  );
}

// ─── Comments Management ──────────────────────────────────────────────────────

function CommentCard({ review, onReply, onDelete }) {
  const [reply, setReply] = useState(review.admin_reply || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleReply = async () => {
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

  return (
    <div className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
            <span className="text-white/60 font-semibold text-xs">
              {review.reviewer_name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{review.reviewer_name || 'Anonymous'}</p>
            <p className="text-white/30 text-xs">{new Date(review.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(review.id)}
          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {review.tours?.title && (
        <p className="text-teal-400/70 text-xs mb-2">Re: {review.tours.title}</p>
      )}

      {review.rating > 0 && (
        <div className="flex items-center gap-0.5 mb-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Star
              key={i}
              className={`w-3 h-3 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
            />
          ))}
        </div>
      )}

      <p className="text-white/60 text-sm leading-relaxed mb-4">{review.review_text}</p>

      {review.admin_reply && (
        <div className="mb-4 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
          <p className="text-teal-400/60 text-xs font-medium mb-1">Current Reply</p>
          <p className="text-teal-100/70 text-xs leading-relaxed">{review.admin_reply}</p>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">{error}</p>
      )}

      <div className="space-y-2">
        <label className="block text-white/40 text-xs font-medium">
          {review.admin_reply ? 'Update Reply' : 'Admin Reply'}
        </label>
        <textarea
          rows={3}
          value={reply}
          onChange={e => setReply(e.target.value)}
          placeholder="Write a reply..."
          className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition resize-none"
        />
        <button
          onClick={handleReply}
          disabled={saving || !reply.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold disabled:opacity-50 transition"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {review.admin_reply ? 'Update Reply' : 'Send Reply'}
        </button>
      </div>
    </div>
  );
}

function CommentsView({ reviews, loading, onReply, onDelete }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <SectionTitle count={reviews.length}>Comments Management</SectionTitle>
      {reviews.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No comments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <CommentCard key={review.id} review={review} onReply={onReply} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main AdminDashboard ──────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { profile, isLoadingAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [guides, setGuides] = useState([]);
  const [tours, setTours] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    if (profile && profile.role !== 'admin') { navigate('/'); return; }
  }, [isLoadingAuth, isAuthenticated, profile, navigate]);

  useEffect(() => {
    if (!profile || profile.role !== 'admin') return;
    fetchAll();
  }, [profile]);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [guidesRes, toursRes, reviewsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('role', 'guide')
          .order('created_at', { ascending: false }),
        supabase
          .from('tours')
          .select('*, profiles(full_name, email)')
          .in('status', ['pending_review', 'draft'])
          .order('created_at', { ascending: false }),
        supabase
          .from('reviews')
          .select('*, tours(title)')
          .order('created_at', { ascending: false }),
      ]);
      if (guidesRes.error) throw guidesRes.error;
      if (toursRes.error) throw toursRes.error;
      if (reviewsRes.error) throw reviewsRes.error;
      setGuides(guidesRes.data || []);
      setTours(toursRes.data || []);
      setReviews(reviewsRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const { error: err } = await supabase.from('tours').update({ status }).eq('id', id);
      if (err) throw err;
      setTours(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTourEdit = (updated) => {
    setTours(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
  };

  const handleToggleApproval = async (guide) => {
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ is_approved: !guide.is_approved })
        .eq('id', guide.id);
      if (err) throw err;
      setGuides(prev => prev.map(g => g.id === guide.id ? { ...g, is_approved: !g.is_approved } : g));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReply = (id, replyText) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, admin_reply: replyText } : r));
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      const { error: err } = await supabase.from('reviews').delete().eq('id', id);
      if (err) throw err;
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const stats = {
    totalGuides:        guides.length,
    pendingTours:       tours.filter(t => t.status === 'pending_review').length,
    unansweredComments: reviews.filter(r => !r.admin_reply).length,
    totalTours:         tours.length,
  };

  if (isLoadingAuth || (isAuthenticated && !profile)) {
    return (
      <div className="min-h-screen bg-[hsl(222,55%,8%)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[hsl(222,55%,8%)] text-white flex">

      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 border-r border-white/[0.07] bg-[hsl(222,47%,11%)] flex flex-col sticky top-0 h-screen">
        <div className="p-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Admin Panel</p>
              <p className="text-white/30 text-xs">Iran Tour Advisor</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, Icon }) => {
            const badge =
              id === 'tours'    ? stats.pendingTours :
              id === 'comments' ? stats.unansweredComments :
              id === 'guides'   ? stats.totalGuides : null;
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition border ${
                  active
                    ? 'bg-teal-600/20 text-teal-400 border-teal-500/20'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.05] border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {badge !== null && badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    active ? 'bg-teal-500/20 text-teal-300' : 'bg-white/10 text-white/40'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.07]">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white hover:bg-white/[0.05] transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeSection === 'dashboard' && (
            <DashboardView stats={stats} loading={loading} />
          )}
          {activeSection === 'guides' && (
            <GuidesView guides={guides} loading={loading} onToggleApproval={handleToggleApproval} />
          )}
          {activeSection === 'tours' && (
            <ToursView tours={tours} loading={loading} onStatusChange={handleStatusChange} onEdit={handleTourEdit} />
          )}
          {activeSection === 'comments' && (
            <CommentsView reviews={reviews} loading={loading} onReply={handleReply} onDelete={handleDeleteReview} />
          )}
        </div>
      </main>
    </div>
  );
}
