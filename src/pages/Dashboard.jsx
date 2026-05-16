import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, PlusCircle, Bell, MessageCircle,
  User, Image as ImageIcon, CalendarDays, CreditCard, Star, Settings,
  ChevronDown, ChevronRight, LogOut, Edit2, Trash2, ExternalLink,
  Loader2, Clock, MapPin, DollarSign, Upload, Shield, TrendingUp,
  MessageSquare, Package, CheckCircle2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CHART_DATA = MONTHS.map(name => ({ name, actual: 0, future: 0 }));

const NAV = [
  { id: 'home',       label: 'Dashboard',       Icon: LayoutDashboard },
  { id: 'my-tours',   label: 'My Tours',         Icon: Briefcase },
  { id: 'add-tour',   label: 'Add New Tour',     Icon: PlusCircle },
  { id: 'requests',   label: 'Requests',         Icon: Bell },
  { id: 'chat',       label: 'Chat',             Icon: MessageCircle },
  {
    id: 'profile', label: 'Profile', Icon: User,
    sub: [
      { id: 'profile', label: 'Edit Profile' },
      { id: 'gallery', label: 'My Gallery' },
    ],
  },
  { id: 'bookings',   label: 'My Bookings',      Icon: CalendarDays },
  { id: 'payment',    label: 'Payment History',  Icon: CreditCard },
  { id: 'my-reviews', label: 'My Reviews',       Icon: Star },
  { id: 'settings',   label: 'Settings',         Icon: Settings },
];

const PURPOSES = [
  { value: '', label: '— Select purpose —' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'history',      label: 'History' },
  { value: 'culture',      label: 'Culture' },
  { value: 'photography',  label: 'Photography' },
  { value: 'food',         label: 'Food & Cuisine' },
  { value: 'nature',       label: 'Nature' },
  { value: 'desert',       label: 'Desert Safari' },
  { value: 'luxury',       label: 'Luxury' },
  { value: 'research',     label: 'Research' },
];

const THEMES = [
  { value: '', label: '— Select theme —' },
  { value: 'cultural',   label: 'Cultural' },
  { value: 'adventure',  label: 'Adventure' },
  { value: 'luxury',     label: 'Luxury' },
  { value: 'budget',     label: 'Budget' },
  { value: 'family',     label: 'Family' },
  { value: 'solo',       label: 'Solo' },
];

const EMPTY_TOUR = {
  title: '', slug: '', description: '', duration: '', price: '',
  location: '', city: '', cities: '', purpose: '', theme: '',
  highlights: '', itinerary: '', included: '', excluded: '',
  image_url: '', gallery: '', status: 'draft',
};

const PROFILE_FIELDS = ['full_name', 'phone', 'city', 'bio', 'avatar_url', 'languages'];

// ─── Shared sub-components ───────────────────────────────────────────────────

function EmptyState({ Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-white/25" />
      </div>
      <p className="text-white/60 font-medium text-sm mb-1">{title}</p>
      {desc && <p className="text-white/35 text-xs max-w-xs">{desc}</p>}
    </div>
  );
}

function StarRating({ rating }) {
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

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ section, onNavigate, profileExpanded, setProfileExpanded, userName, userRole, onLogout }) {
  const activeId = section || 'home';

  const isActive = (id) => {
    if (id === 'home') return activeId === 'home';
    if (id === 'profile') return activeId === 'profile' || activeId === 'gallery';
    return activeId === id;
  };

  return (
    <aside className="w-[190px] flex-shrink-0 h-screen sticky top-0 bg-[hsl(222,55%,8%)] border-r border-white/[0.07] flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.07]">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-[hsl(178,85%,32%)] flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-semibold text-sm leading-tight">Iran Tour<br />
            <span className="text-[hsl(38,62%,58%)] font-normal text-[10px] tracking-wider uppercase">Dashboard</span>
          </span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/[0.07]">
        <div className="w-9 h-9 rounded-xl bg-[hsl(178,85%,32%)] flex items-center justify-center mb-2">
          <span className="text-white text-sm font-bold">
            {userName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
          </span>
        </div>
        <p className="text-white text-xs font-medium leading-tight truncate">{userName || 'Guide'}</p>
        <p className="text-white/40 text-[10px] capitalize mt-0.5">{userRole || 'guide'}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(item => (
          <div key={item.id}>
            <button
              onClick={() => {
                if (item.sub) setProfileExpanded(v => !v);
                else onNavigate(item.id);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition-all duration-150 group ${
                isActive(item.id)
                  ? 'bg-[hsl(178,85%,32%)]/20 text-[hsl(178,85%,50%)]'
                  : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <item.Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {item.label}
              </span>
              {item.sub && (
                profileExpanded
                  ? <ChevronDown className="w-3 h-3 text-white/30" />
                  : <ChevronRight className="w-3 h-3 text-white/30" />
              )}
            </button>

            {/* Sub-items */}
            <AnimatePresence>
              {item.sub && profileExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {item.sub.map(sub => (
                    <button
                      key={sub.id + sub.label}
                      onClick={() => onNavigate(sub.id)}
                      className={`w-full flex items-center gap-2 ps-9 pe-3 py-1.5 text-xs rounded-xl transition-all duration-150 ${
                        activeId === sub.id
                          ? 'text-[hsl(178,85%,50%)]'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-white/[0.07] pt-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── HomeView ─────────────────────────────────────────────────────────────────

function HomeView({ profile, tours, reviews, onNavigate }) {
  const [reqTab, setReqTab] = useState('new');

  const upcomingTour = tours.find(t => t.status === 'published');
  const totalTours = tours.length;
  const publishedCount = tours.filter(t => t.status === 'published').length;
  const draftCount = tours.filter(t => t.status === 'draft').length;
  const totalReviews = reviews.length;
  const avgRating = totalReviews
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : '—';

  const cardBase = 'bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl p-5';

  return (
    <div className="space-y-5">

      {/* ── Row 1: Welcome / Upcoming Tour / License ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Welcome */}
        <div className={`${cardBase} flex flex-col justify-between`}>
          <div>
            <p className="text-white/40 text-xs mb-1">Welcome back</p>
            <h2 className="text-white font-bold text-lg leading-tight">
              {profile?.full_name?.split(' ')[0] || 'Guide'} 👋
            </h2>
            <p className="text-white/50 text-xs mt-2 leading-relaxed">
              Manage your tours, track requests, and grow your guide business.
            </p>
          </div>
          <button
            onClick={() => onNavigate('add-tour')}
            className="mt-4 w-full py-2 rounded-xl bg-[hsl(178,85%,32%)] text-white text-xs font-semibold hover:bg-[hsl(178,85%,28%)] transition"
          >
            + Add New Tour
          </button>
        </div>

        {/* Upcoming Tour */}
        <div className={cardBase}>
          <p className="text-white/40 text-xs mb-3">Upcoming Tour</p>
          {upcomingTour ? (
            <div>
              {upcomingTour.image_url && (
                <div className="w-full aspect-[16/7] rounded-xl overflow-hidden mb-3">
                  <img src={upcomingTour.image_url} alt={upcomingTour.title} className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-white font-semibold text-sm leading-tight mb-1 line-clamp-2">
                {upcomingTour.title}
              </p>
              <div className="flex items-center gap-3 text-white/40 text-[11px]">
                {upcomingTour.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{upcomingTour.location}</span>
                )}
                {upcomingTour.duration && (
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{upcomingTour.duration}d</span>
                )}
              </div>
            </div>
          ) : (
            <EmptyState Icon={Briefcase} title="No published tours yet" desc="Add and publish a tour to see it here" />
          )}
        </div>

        {/* License */}
        <div className={`${cardBase} flex flex-col`}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-[hsl(38,62%,58%)]" />
            <p className="text-white/70 text-xs font-medium">My License</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border-2 border-dashed border-white/15 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5 text-white/25" />
            </div>
            <p className="text-white/40 text-xs text-center mb-4">
              Upload your guide license to build trust with travelers
            </p>
            <button className="px-4 py-2 rounded-xl border border-white/20 text-white/60 text-xs font-medium hover:border-[hsl(38,62%,58%)] hover:text-[hsl(38,62%,58%)] transition">
              Upload License
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 2: Tour Requests / Latest Chat ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        {/* Tour Requests */}
        <div className={`${cardBase} md:col-span-3`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/70 text-sm font-semibold">Tour Requests</p>
            <div className="flex bg-white/[0.06] rounded-lg p-0.5">
              {['new', 'invitations'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setReqTab(tab)}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all capitalize ${
                    reqTab === tab ? 'bg-[hsl(178,85%,32%)] text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {tab === 'new' ? 'New Requests' : 'Invitations'}
                </button>
              ))}
            </div>
          </div>
          <EmptyState
            Icon={Bell}
            title={reqTab === 'new' ? 'No new requests' : 'No invitations yet'}
            desc="When travelers request your tours they'll appear here"
          />
        </div>

        {/* Latest Chat */}
        <div className={`${cardBase} md:col-span-2`}>
          <p className="text-white/70 text-sm font-semibold mb-4">Latest Chat</p>
          <EmptyState
            Icon={MessageSquare}
            title="No messages yet"
            desc="Conversations with travelers will appear here"
          />
        </div>
      </div>

      {/* ── Row 3: Earnings Chart ── */}
      <div className={cardBase}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(178,85%,45%)]" />
            <p className="text-white/80 text-sm font-semibold">My Earnings This Year</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[hsl(178,85%,32%)]" />
              Actual Earnings: <span className="text-white font-medium">$0</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[hsl(38,62%,52%)]" />
              Future Earnings: <span className="text-white font-medium">$0</span>
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={CHART_DATA} barSize={10} barCategoryGap="40%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(222,55%,12%)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: 'white',
                fontSize: 12,
              }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="actual" name="Actual" fill="hsl(178,85%,32%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="future" name="Future" fill="hsl(38,62%,52%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Row 4: Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tours', value: totalTours, color: 'text-white', Icon: Briefcase },
          { label: 'Published', value: publishedCount, color: 'text-emerald-400', Icon: CheckCircle2 },
          { label: 'Drafts', value: draftCount, color: 'text-yellow-400', Icon: Package },
          { label: 'Total Reviews', value: totalReviews, extra: avgRating !== '—' ? `Avg ${avgRating}★` : null, color: 'text-[hsl(38,62%,58%)]', Icon: Star },
        ].map(stat => (
          <div key={stat.label} className={`${cardBase} flex items-center gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
              <stat.Icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-white/40 text-[11px]">{stat.label}</p>
              {stat.extra && <p className="text-white/30 text-[10px]">{stat.extra}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 5: Recent Reviews ── */}
      <div className={cardBase}>
        <p className="text-white/70 text-sm font-semibold mb-4">Recent Reviews</p>
        {reviews.length === 0 ? (
          <EmptyState
            Icon={Star}
            title="No reviews yet"
            desc="Reviews from your travelers will appear here after their trips"
          />
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, 5).map(review => (
              <div key={review.id} className="flex items-start gap-3 pb-4 border-b border-white/[0.07] last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-[hsl(178,85%,32%)]/30 flex items-center justify-center flex-shrink-0 text-[hsl(178,85%,50%)] text-xs font-bold">
                  {review.reviewer_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-white text-xs font-medium">{review.reviewer_name || 'Anonymous'}</p>
                    <StarRating rating={review.rating || 0} />
                  </div>
                  {review.review_text && (
                    <p className="text-white/45 text-[11px] leading-relaxed line-clamp-2">{review.review_text}</p>
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

// ─── MyToursView ──────────────────────────────────────────────────────────────

function MyToursView({ tours, onEdit, onDelete }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-bold text-lg">My Tours</h2>
        <span className="text-white/40 text-xs">{tours.length} tour{tours.length !== 1 ? 's' : ''}</span>
      </div>
      {tours.length === 0 ? (
        <div className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl">
          <EmptyState Icon={Briefcase} title="No tours yet" desc="Add your first tour to start accepting bookings" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tours.map(tour => (
            <div key={tour.id} className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl overflow-hidden group hover:border-white/20 transition-all duration-200">
              {/* Image */}
              <div className="aspect-[16/9] bg-white/5 relative overflow-hidden">
                {tour.image_url ? (
                  <img src={tour.image_url} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white/15" />
                  </div>
                )}
                {/* Status badge */}
                <div className={`absolute top-2.5 end-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm ${
                  tour.status === 'published'
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                    : 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${tour.status === 'published' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                  {tour.status === 'published' ? 'Published' : 'Draft'}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-white font-semibold text-sm mb-2 line-clamp-2">{tour.title}</p>
                <div className="flex items-center gap-3 text-white/40 text-[11px] mb-4">
                  {tour.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{tour.location}</span>}
                  {tour.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tour.duration}d</span>}
                  {tour.price && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{Number(tour.price).toLocaleString()}</span>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(tour)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-white text-xs font-medium transition"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  {tour.slug && (
                    <Link
                      to={`/tours/${tour.slug}`}
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-white transition"
                      title="View on site"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <button
                    onClick={() => onDelete(tour.id)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/[0.08] hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition"
                    title="Delete tour"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AddTourView ──────────────────────────────────────────────────────────────

function AddTourView({ editing, onDone, onCancel }) {
  const [form, setForm] = useState(() => {
    if (!editing) return EMPTY_TOUR;
    return {
      title:       editing.title || '',
      slug:        editing.slug || '',
      description: editing.description || '',
      duration:    editing.duration != null ? String(editing.duration) : '',
      price:       editing.price != null ? String(editing.price) : '',
      location:    editing.location || '',
      city:        editing.city || '',
      cities:      Array.isArray(editing.cities) ? editing.cities.join(', ') : (editing.cities || ''),
      purpose:     editing.purpose || '',
      theme:       editing.theme || '',
      highlights:  Array.isArray(editing.highlights) ? editing.highlights.join('\n') : (editing.highlights || ''),
      itinerary:   editing.itinerary || '',
      included:    Array.isArray(editing.included) ? editing.included.join('\n') : (editing.included || ''),
      excluded:    Array.isArray(editing.excluded) ? editing.excluded.join('\n') : (editing.excluded || ''),
      image_url:   editing.image_url || '',
      gallery:     Array.isArray(editing.gallery) ? editing.gallery.join(', ') : (editing.gallery || ''),
      status:      editing.status || 'draft',
    };
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'title') {
        updated.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title:       form.title,
        slug:        form.slug,
        description: form.description,
        duration:    form.duration ? Number(form.duration) : null,
        price:       form.price ? Number(form.price) : null,
        location:    form.location,
        city:        form.city,
        cities:      form.cities.split(',').map(s => s.trim()).filter(Boolean),
        purpose:     form.purpose,
        theme:       form.theme,
        highlights:  form.highlights.split('\n').filter(Boolean),
        itinerary:   form.itinerary,
        included:    form.included.split('\n').filter(Boolean),
        excluded:    form.excluded.split('\n').filter(Boolean),
        image_url:   form.image_url,
        gallery:     form.gallery.split(',').map(s => s.trim()).filter(Boolean),
        status:      form.status,
      };

      if (editing) {
        const { data: updated, error: err } = await supabase
          .from('tours').update(payload).eq('id', editing.id).select().single();
        if (err) throw err;
        onDone(updated, false);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: created, error: err } = await supabase
          .from('tours').insert({ ...payload, owner_id: user.id }).select().single();
        if (err) throw err;
        setSuccess(true);
        setTimeout(() => { setSuccess(false); setForm(EMPTY_TOUR); }, 2000);
        onDone(created, true);
      }
    } catch (err) {
      setError(err.message || 'Failed to save tour');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[hsl(178,85%,32%)] focus:ring-1 focus:ring-[hsl(178,85%,32%)]/50 transition';
  const labelClass = 'block text-white/50 text-xs mb-1.5 font-medium';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">{editing ? 'Edit Tour' : 'Add New Tour'}</h2>
          <p className="text-white/40 text-xs mt-0.5">Fill in the details below to {editing ? 'update' : 'create'} your tour</p>
        </div>
        {editing && (
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/15 text-white/50 text-xs hover:text-white hover:border-white/30 transition">
            ✕ Cancel Edit
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Tour created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl p-6 space-y-5">

        {/* Title + Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input name="title" required value={form.title} onChange={handleChange} className={inputClass} placeholder="Tour title" />
          </div>
          <div>
            <label className={labelClass}>Slug (auto-generated)</label>
            <input name="slug" value={form.slug} onChange={handleChange} className={`${inputClass} text-white/50`} placeholder="tour-slug" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="Describe the tour experience..." />
        </div>

        {/* Duration / Price / Location / City */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Duration (days)</label>
            <input name="duration" type="number" min="1" value={form.duration} onChange={handleChange} className={inputClass} placeholder="7" />
          </div>
          <div>
            <label className={labelClass}>Price (USD)</label>
            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} className={inputClass} placeholder="1200" />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input name="location" value={form.location} onChange={handleChange} className={inputClass} placeholder="Isfahan, Iran" />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input name="city" value={form.city} onChange={handleChange} className={inputClass} placeholder="Isfahan" />
          </div>
        </div>

        {/* Cities covered */}
        <div>
          <label className={labelClass}>Cities Covered (comma separated)</label>
          <input name="cities" value={form.cities} onChange={handleChange} className={inputClass} placeholder="Tehran, Isfahan, Shiraz" />
        </div>

        {/* Purpose + Theme */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Purpose</label>
            <select name="purpose" value={form.purpose} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
              {PURPOSES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Theme</label>
            <select name="theme" value={form.theme} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
              {THEMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Highlights */}
        <div>
          <label className={labelClass}>Highlights (one per line)</label>
          <textarea name="highlights" value={form.highlights} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder={"Visit the Great Mosque of Isfahan\nExplore Naghsh-e Jahan Square\nTraditional Persian cooking class"} />
        </div>

        {/* Itinerary */}
        <div>
          <label className={labelClass}>Day-by-Day Itinerary</label>
          <textarea name="itinerary" value={form.itinerary} onChange={handleChange} rows={5} className={`${inputClass} resize-none`} placeholder={"Day 1: Arrival in Tehran...\nDay 2: Flight to Isfahan..."} />
        </div>

        {/* Included / Excluded */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>What's Included (one per line)</label>
            <textarea name="included" value={form.included} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder={"Hotel accommodation\nBreakfast daily\nPrivate transport"} />
          </div>
          <div>
            <label className={labelClass}>What's Not Included (one per line)</label>
            <textarea name="excluded" value={form.excluded} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder={"International flights\nTravel insurance\nLunch and dinner"} />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className={labelClass}>Main Image URL</label>
          <input name="image_url" value={form.image_url} onChange={handleChange} className={inputClass} placeholder="https://..." />
        </div>
        <div>
          <label className={labelClass}>Gallery Images (comma separated URLs)</label>
          <input name="gallery" value={form.gallery} onChange={handleChange} className={inputClass} placeholder="https://..., https://..." />
        </div>

        {/* Status */}
        <div>
          <label className={labelClass}>Status</label>
          <select name="status" value={form.status} onChange={handleChange} className={`${inputClass} w-48 appearance-none cursor-pointer`}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[hsl(178,85%,32%)] text-white font-semibold text-sm hover:bg-[hsl(178,85%,28%)] disabled:opacity-60 transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Saving...' : editing ? 'Update Tour' : 'Create Tour'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── ProfileView ──────────────────────────────────────────────────────────────

function ProfileView({ profile, userId, onSave }) {
  const [form, setForm] = useState({
    full_name:  profile?.full_name || '',
    phone:      profile?.phone || '',
    city:       profile?.city || '',
    bio:        profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
    languages:  profile?.languages || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const completion = Math.round(
    PROFILE_FIELDS.filter(f => form[f]?.toString().trim()).length / PROFILE_FIELDS.length * 100
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ ...form })
        .eq('id', userId);
      if (err) throw err;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSave({ ...profile, ...form });
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[hsl(178,85%,32%)] focus:ring-1 focus:ring-[hsl(178,85%,32%)]/50 transition';
  const labelClass = 'block text-white/50 text-xs mb-1.5 font-medium';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">Edit Profile</h2>
          <p className="text-white/40 text-xs mt-0.5">Keep your profile up to date to attract more travelers</p>
        </div>
        {/* Completion */}
        <div className="text-right">
          <p className="text-white/40 text-xs mb-1.5">Profile {completion}% complete</p>
          <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[hsl(178,85%,32%)] rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl p-6 space-y-5">

        {/* Avatar */}
        <div className="flex items-center gap-4 pb-5 border-b border-white/[0.07]">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(178,85%,32%)]/20 border border-[hsl(178,85%,32%)]/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[hsl(178,85%,50%)] text-2xl font-bold">
                {form.full_name?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div className="flex-1">
            <label className={labelClass}>Avatar URL</label>
            <input name="avatar_url" value={form.avatar_url} onChange={handleChange} className={inputClass} placeholder="https://..." />
          </div>
        </div>

        {/* Name + Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} className={inputClass} placeholder="Your name" />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} className={inputClass} placeholder="+98 ..." dir="ltr" />
          </div>
        </div>

        {/* City + Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>City</label>
            <input name="city" value={form.city} onChange={handleChange} className={inputClass} placeholder="Isfahan" />
          </div>
          <div>
            <label className={labelClass}>Languages Spoken</label>
            <input name="languages" value={form.languages} onChange={handleChange} className={inputClass} placeholder="Persian, English, French" />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className={labelClass}>Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="Tell travelers about yourself, your expertise, and your passion for Iran..." />
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" /> Profile saved!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ms-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[hsl(178,85%,32%)] text-white font-semibold text-sm hover:bg-[hsl(178,85%,28%)] disabled:opacity-60 transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── EmptySection ─────────────────────────────────────────────────────────────

const SECTION_META = {
  requests:   { Icon: Bell,         title: 'Tour Requests',    desc: 'Booking requests from travelers will appear here' },
  chat:       { Icon: MessageCircle, title: 'Chat',            desc: 'Your conversations with travelers will appear here' },
  gallery:    { Icon: ImageIcon,    title: 'My Gallery',       desc: 'Upload photos to showcase your tours and destinations' },
  bookings:   { Icon: CalendarDays, title: 'My Bookings',      desc: 'Your confirmed bookings will be listed here' },
  payment:    { Icon: CreditCard,   title: 'Payment History',  desc: 'Your earnings and payment records will appear here' },
  'my-reviews': { Icon: Star,       title: 'My Reviews',       desc: 'Reviews left by your travelers will appear here' },
  settings:   { Icon: Settings,     title: 'Settings',         desc: 'Account and notification settings coming soon' },
};

function EmptySection({ section }) {
  const meta = SECTION_META[section] || { Icon: LayoutDashboard, title: 'Coming Soon', desc: 'This section is under construction' };
  const { Icon } = meta;
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-white/20" />
        </div>
        <h2 className="text-white font-bold text-xl mb-2">{meta.title}</h2>
        <p className="text-white/40 text-sm max-w-xs">{meta.desc}</p>
      </div>
    </div>
  );
}

// ─── Dashboard (main) ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const { section = 'home' } = useParams();

  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tours, setTours] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTour, setEditingTour] = useState(null);
  const [profileExpanded, setProfileExpanded] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const role = user.user_metadata?.role;
      if (role === 'traveler') { navigate('/'); return; }

      setAuthUser(user);

      const [profileRes, toursRes, reviewsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('tours').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').eq('guide_id', user.id).order('created_at', { ascending: false }),
      ]);

      setProfile(profileRes.data || {});
      setTours(toursRes.data || []);
      setReviews(reviewsRes.data || []);
      setLoading(false);
    }
    init();
  }, [navigate]);

  const nav = (sec) => {
    setEditingTour(null);
    navigate(sec === 'home' ? '/dashboard' : `/dashboard/${sec}`);
  };

  const handleDeleteTour = async (id) => {
    if (!window.confirm('Delete this tour? This cannot be undone.')) return;
    const { error } = await supabase.from('tours').delete().eq('id', id);
    if (!error) setTours(prev => prev.filter(t => t.id !== id));
  };

  const handleTourSaved = (savedTour, isNew) => {
    if (isNew) {
      setTours(prev => [savedTour, ...prev]);
    } else {
      setTours(prev => prev.map(t => t.id === savedTour.id ? savedTour : t));
      setEditingTour(null);
      nav('my-tours');
    }
  };

  const handleProfileSaved = (updated) => {
    setProfile(updated);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const renderContent = () => {
    if (editingTour || section === 'add-tour') {
      return (
        <AddTourView
          key={editingTour?.id || 'new'}
          editing={editingTour}
          onDone={handleTourSaved}
          onCancel={() => { setEditingTour(null); nav('my-tours'); }}
        />
      );
    }
    switch (section) {
      case 'home':
        return <HomeView profile={profile} tours={tours} reviews={reviews} onNavigate={nav} />;
      case 'my-tours':
        return <MyToursView tours={tours} onEdit={setEditingTour} onDelete={handleDeleteTour} />;
      case 'profile':
        return <ProfileView profile={profile} userId={authUser?.id} onSave={handleProfileSaved} />;
      default:
        return <EmptySection section={section} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(222,55%,8%)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[hsl(178,85%,45%)] animate-spin" />
          <p className="text-white/40 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(222,50%,10%)] flex" style={{ fontFamily: 'inherit' }}>
      <Sidebar
        section={section}
        onNavigate={nav}
        profileExpanded={profileExpanded}
        setProfileExpanded={setProfileExpanded}
        userName={profile?.full_name || authUser?.user_metadata?.full_name}
        userRole={profile?.role || authUser?.user_metadata?.role}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <motion.div
            key={section + (editingTour?.id || '')}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
