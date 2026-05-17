import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Calendar, Star, Image, User, Settings, ExternalLink, LogOut,
  CheckCircle, AlertCircle, Camera, X, Menu, ChevronDown,
  Bell, Shield, MapPin, Loader2, Plus, Globe, Upload, BookOpen,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const SPECIALTY_OPTIONS = [
  'History & Archaeology', 'Architecture', 'Food & Cuisine', 'Photography',
  'Nature & Hiking', 'Desert Safari', 'Art & Handicrafts', 'Religious Sites',
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const earningsData = MONTHS.map(m => ({ month: m, earnings: 0, future: 0 }));

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-accent' : 'bg-slate-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function SidebarContent({ activeSection, setActiveSection, profile, logout, navigate, onClose }) {
  const [settingsExpanded, setSettingsExpanded] = useState(activeSection.startsWith('settings'));
  const isApproved = profile?.is_verified === true || profile?.is_approved === true;

  function NavItem({ section, icon, label }) {
    const active = activeSection === section;
    return (
      <button
        onClick={() => { setActiveSection(section); onClose?.(); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-body rounded-lg transition-all ${
          active
            ? 'bg-accent/20 text-accent border-r-2 border-accent'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 text-gold" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-heading font-bold text-white leading-tight">Iran Tour Advisor</p>
            <p className="text-[10px] text-slate-400">
              {profile?.role === 'guide' ? 'Guide Dashboard' : 'Agency Dashboard'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <NavItem section="home" icon={<Home className="w-4 h-4" />} label="Dashboard" />
        <NavItem section="bookings" icon={<Calendar className="w-4 h-4" />} label="My Bookings" />
        <NavItem section="reviews" icon={<Star className="w-4 h-4" />} label="My Reviews" />
        <NavItem section="gallery" icon={<Image className="w-4 h-4" />} label="My Gallery" />

        <div className="my-2 border-t border-white/10" />

        <NavItem section="profile" icon={<User className="w-4 h-4" />} label="Profile" />

        {/* Settings expandable */}
        <button
          onClick={() => setSettingsExpanded(p => !p)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-body text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${settingsExpanded ? 'rotate-180' : ''}`} />
        </button>

        {settingsExpanded && (
          <div className="pl-3 space-y-0.5">
            <NavItem section="settings-general" icon={<Globe className="w-3.5 h-3.5" />} label="General" />
            <NavItem section="settings-notifications" icon={<Bell className="w-3.5 h-3.5" />} label="Notifications" />
            <NavItem section="settings-privacy" icon={<Shield className="w-3.5 h-3.5" />} label="Privacy" />
          </div>
        )}

        <div className="my-2 border-t border-white/10" />

        <button
          onClick={() => { navigate('/guides'); onClose?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-body text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View Public Profile</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-body text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0 overflow-hidden">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" className="w-9 h-9 object-cover" />
              : <User className="w-4 h-4 text-accent" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-body font-semibold text-white truncate">{profile?.full_name || 'User'}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-body ${
              isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {isApproved ? '● Active' : '● Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HOME SECTION ──────────────────────────────────────────────────────────────
function HomeSection({ profile, setActiveSection }) {
  const { user } = useAuth();
  const isApproved = profile?.is_verified === true || profile?.is_approved === true;
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const go = async () => {
      try {
        const { data: b } = await supabase.from('bookings').select('*').eq('guide_id', user.id).limit(10);
        setBookings(b || []);
      } catch {}
      try {
        const { data: r } = await supabase.from('reviews').select('*').eq('guide_id', user.id).limit(5);
        setReviews(r || []);
      } catch {}
      setLoading(false);
    };
    go();
  }, [user]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const pending = bookings.filter(b => b.status === 'pending');
  const completed = bookings.filter(b => b.status === 'completed');

  return (
    <div className="p-6 space-y-6">
      {/* Row 1 — 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Welcome */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <p className="font-heading text-lg font-bold text-foreground leading-snug">
            Welcome Back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
          </p>
          <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium ${
            isApproved
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}>
            {isApproved
              ? <><CheckCircle className="w-3.5 h-3.5" /> ✓ Profile Active</>
              : <><AlertCircle className="w-3.5 h-3.5" /> ⏳ Pending Approval</>
            }
          </div>
          <p className="mt-3 text-xs font-body text-muted-foreground leading-relaxed">
            {isApproved
              ? 'Your profile is visible on Iran Tour Advisor.'
              : "Your profile is under review. We'll notify you once approved."}
          </p>
        </div>

        {/* Upcoming Tours */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <p className="font-heading text-sm font-semibold text-foreground mb-3">Upcoming Tours</p>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : confirmed.length === 0 ? (
            <div className="flex flex-col items-center py-4 text-center gap-2">
              <Calendar className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-xs font-body text-muted-foreground">No Upcoming Tours</p>
            </div>
          ) : (
            <div className="space-y-2">
              {confirmed.slice(0, 2).map(b => (
                <div key={b.id} className="text-xs font-body bg-muted/40 rounded-lg p-2.5">
                  <p className="font-medium text-foreground">{b.tourist_name || 'Traveler'}</p>
                  <p className="text-muted-foreground mt-0.5">{b.tour_date || b.date || '—'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification Status */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <p className="font-heading text-sm font-semibold text-foreground mb-3">Verification Status</p>
          {isApproved ? (
            <div className="flex flex-col items-center py-2 text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-sm font-body font-medium text-emerald-600 dark:text-emerald-400">Verified Guide</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-body text-amber-700 dark:text-amber-400">
                  Upload your guide license to get verified faster
                </p>
              </div>
              <button
                onClick={() => setActiveSection('profile')}
                className="w-full py-2 rounded-xl bg-accent/10 text-accent text-xs font-body font-medium hover:bg-accent/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Upload License
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 2 — Requests + Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Tour Requests 60% */}
        <div className="md:col-span-3 bg-card rounded-2xl border border-border/50 p-5">
          <p className="font-heading text-sm font-semibold text-foreground mb-4">Tour Requests</p>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : pending.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center gap-2">
              <BookOpen className="w-10 h-10 text-muted-foreground/20" />
              <p className="text-sm font-body text-muted-foreground">No booking requests yet</p>
              <p className="text-xs font-body text-muted-foreground/60">Complete your profile to attract travelers</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.slice(0, 3).map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                  <div>
                    <p className="text-sm font-body font-medium text-foreground">{b.tourist_name || 'Traveler'}</p>
                    <p className="text-xs font-body text-muted-foreground">{b.tour_date || b.date || '—'}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-body font-medium bg-amber-500/10 text-amber-600">Pending</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setActiveSection('bookings')} className="mt-4 text-xs font-body text-accent hover:underline">
            See All Requests →
          </button>
        </div>

        {/* Recent Reviews 40% */}
        <div className="md:col-span-2 bg-card rounded-2xl border border-border/50 p-5">
          <p className="font-heading text-sm font-semibold text-foreground mb-4">Latest Reviews</p>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center gap-2">
              <Star className="w-10 h-10 text-muted-foreground/20" />
              <p className="text-sm font-body text-muted-foreground">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, 2).map(r => (
                <div key={r.id} className="p-3 rounded-xl bg-muted/40">
                  <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < (r.rating || 0) ? 'text-gold fill-gold' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                  <p className="text-xs font-body text-foreground line-clamp-2">{r.comment || '—'}</p>
                  <p className="text-xs font-body text-muted-foreground mt-1">{r.reviewer_name || 'Anonymous'}</p>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setActiveSection('reviews')} className="mt-4 text-xs font-body text-accent hover:underline">
            View All →
          </button>
        </div>
      </div>

      {/* Row 3 — Earnings Chart */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p className="font-heading text-sm font-semibold text-foreground">My Earnings This Year</p>
          <div className="flex items-center gap-6 text-xs font-body text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-accent inline-block" />
              <span><span className="text-foreground font-medium">$0</span> — Actual Earnings</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gold/40 inline-block" />
              <span><span className="text-foreground font-medium">$0</span> — Future Earnings</span>
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={earningsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(var(--foreground))',
              }}
            />
            <Bar dataKey="earnings" name="Actual" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="future" name="Future" fill="hsl(var(--gold))" radius={[4, 4, 0, 0]} opacity={0.4} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 4 — Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: '0%', label: 'of travelers booked', sub: 'your services' },
          { value: completed.length.toString(), label: 'Tours Completed' },
          { value: reviews.length.toString(), label: 'Reviews Received' },
          { value: avgRating || '—', label: 'Average Rating' },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border/50 p-5 text-center">
            <p className="font-heading text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs font-body text-muted-foreground mt-1">{stat.label}</p>
            {stat.sub && <p className="text-[10px] font-body text-muted-foreground/60">{stat.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BOOKINGS SECTION ──────────────────────────────────────────────────────────
function BookingsSection({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('bookings').select('*').eq('guide_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setBookings(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const statusStyle = {
    pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    confirmed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    cancelled: 'bg-red-500/10 text-red-500',
    completed: 'bg-blue-500/10 text-blue-500',
  };

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">My Bookings</h1>
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : bookings.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/50 p-16 flex flex-col items-center text-center">
          <Calendar className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="font-heading text-xl font-semibold text-foreground mb-2">No Bookings Yet</p>
          <p className="text-sm font-body text-muted-foreground">Booking requests from travelers will appear here.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  {['Tourist', 'Tour', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-body font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id} className={`border-b border-border/30 last:border-0 ${i % 2 === 0 ? 'bg-muted/10' : ''}`}>
                    <td className="px-5 py-3 text-sm font-body text-foreground whitespace-nowrap">{b.tourist_name || '—'}</td>
                    <td className="px-5 py-3 text-sm font-body text-muted-foreground whitespace-nowrap">{b.tour_name || '—'}</td>
                    <td className="px-5 py-3 text-sm font-body text-muted-foreground whitespace-nowrap">{b.tour_date || b.date || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-body font-medium ${statusStyle[b.status] || 'bg-muted text-muted-foreground'}`}>
                        {b.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button className="text-xs font-body text-accent hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── REVIEWS SECTION ───────────────────────────────────────────────────────────
function ReviewsSection({ user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('reviews').select('*').eq('guide_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setReviews(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
    : 0;

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">My Reviews</h1>
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6 flex items-center gap-8">
            <div className="text-center">
              <p className="font-heading text-5xl font-bold text-foreground">{avg > 0 ? avg.toFixed(1) : '—'}</p>
              <div className="flex items-center gap-1 justify-center mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(avg) ? 'text-gold fill-gold' : 'text-muted-foreground'}`} />
                ))}
              </div>
              <p className="text-xs font-body text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 p-16 flex flex-col items-center text-center">
              <Star className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <p className="font-heading text-xl font-semibold text-foreground mb-2">No Reviews Yet</p>
              <p className="text-sm font-body text-muted-foreground">Reviews from travelers will appear here after completed tours.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-card rounded-2xl border border-border/50 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm">{r.reviewer_name || 'Anonymous'}</p>
                      <p className="text-xs font-body text-muted-foreground mt-0.5">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < (r.rating || 0) ? 'text-gold fill-gold' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-body text-foreground/80 leading-relaxed">{r.comment || '—'}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── GALLERY SECTION ───────────────────────────────────────────────────────────
function GallerySection({ profile, user, refreshProfile }) {
  const [uploading, setUploading] = useState(false);
  const images = profile?.gallery_images || [];

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `gallery/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('profiles').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path);
      await supabase.from('profiles').update({ gallery_images: [...images, publicUrl] }).eq('id', user.id);
      refreshProfile?.(user.id);
    } catch (err) {
      console.error('Gallery upload error:', err);
    }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">My Gallery</h1>
        <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-body font-medium cursor-pointer hover:bg-accent/90 transition-colors">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Upload Photo
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="bg-card rounded-2xl border-2 border-dashed border-border/50 p-16 flex flex-col items-center text-center">
          <Camera className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="font-heading text-xl font-semibold text-foreground mb-2">No Photos Yet</p>
          <p className="text-sm font-body text-muted-foreground">Add photos to attract more travelers to your tours.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden bg-muted">
              <img src={url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PROFILE SECTION ───────────────────────────────────────────────────────────
function ProfileSection({ profile, user, refreshProfile }) {
  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-border bg-background font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 placeholder:text-muted-foreground/50';

  const [form, setForm] = useState({
    full_name: '', phone: '', bio: '', city: '',
    languages: [], specialties: [], accept_bookings: false,
  });
  const [langInput, setLangInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwForm, setPwForm] = useState({ newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        city: profile.city || '',
        languages: Array.isArray(profile.languages) ? profile.languages : [],
        specialties: Array.isArray(profile.specialties)
          ? profile.specialties
          : (profile.specialty ? [profile.specialty] : []),
        accept_bookings: profile.accept_bookings ?? false,
      });
    }
  }, [profile]);

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        full_name: form.full_name,
        phone: form.phone,
        bio: form.bio,
        city: form.city,
        languages: form.languages,
        specialties: form.specialties,
        accept_bookings: form.accept_bookings,
      }).eq('id', user.id);
      refreshProfile?.(user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const addLang = () => {
    const l = langInput.trim();
    if (l && !form.languages.includes(l)) {
      set('languages', [...form.languages, l]);
      setLangInput('');
    }
  };

  const toggleSpecialty = (s) => {
    set('specialties', form.specialties.includes(s)
      ? form.specialties.filter(x => x !== s)
      : [...form.specialties, s]);
  };

  const handlePwChange = async () => {
    setPwError('');
    if (pwForm.newPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
      if (error) throw error;
      setPwForm({ newPw: '', confirm: '' });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err) {
      setPwError(err.message);
    }
    setPwSaving(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Edit Profile</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-body font-medium hover:bg-accent/90 transition-colors disabled:opacity-60"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — form (3/5) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Avatar */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <p className="font-body text-sm font-semibold text-foreground mb-4">Profile Picture</p>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <User className="w-10 h-10 text-accent" />
                }
              </div>
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-body text-muted-foreground hover:text-foreground hover:border-accent/50 cursor-pointer transition-colors">
                <Camera className="w-4 h-4" />
                Change Photo
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <p className="font-body text-sm font-semibold text-foreground">Basic Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-xs text-muted-foreground mb-1.5">Full Name</label>
                <input className={inputClass} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your full name" />
              </div>
              <div>
                <label className="block font-body text-xs text-muted-foreground mb-1.5">Phone Number</label>
                <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+98..." />
              </div>
            </div>
            <div>
              <label className="block font-body text-xs text-muted-foreground mb-1.5">Email</label>
              <input className={`${inputClass} opacity-60 cursor-not-allowed`} value={profile?.email || ''} readOnly />
            </div>
            <div>
              <label className="block font-body text-xs text-muted-foreground mb-1.5">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input className={`${inputClass} pl-9`} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Tehran, Isfahan, Shiraz..." />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <label className="block font-body text-sm font-semibold text-foreground mb-3">Bio / About Me</label>
            <textarea
              rows={6}
              className={`${inputClass} resize-none`}
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              placeholder="Tell travelers about your experience, expertise, and what makes your tours special..."
            />
          </div>

          {/* Languages */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <p className="font-body text-sm font-semibold text-foreground mb-3">Languages</p>
            {form.languages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {form.languages.map(l => (
                  <span key={l} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-body">
                    {l}
                    <button onClick={() => set('languages', form.languages.filter(x => x !== l))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                className={`${inputClass} flex-1`}
                value={langInput}
                onChange={e => setLangInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLang(); } }}
                placeholder="e.g. English, Persian, German..."
              />
              <button onClick={addLang} className="px-4 py-2.5 rounded-xl bg-accent/10 text-accent text-sm font-body hover:bg-accent/20 transition-colors whitespace-nowrap">
                Add
              </button>
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <p className="font-body text-sm font-semibold text-foreground mb-3">Specialties</p>
            <div className="flex flex-wrap gap-2">
              {SPECIALTY_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSpecialty(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all border ${
                    form.specialties.includes(s)
                      ? 'bg-accent text-white border-accent'
                      : 'bg-card text-muted-foreground border-border hover:border-accent/50 hover:text-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <p className="font-body text-sm font-semibold text-foreground">Change Password</p>
            {pwError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-body">{pwError}</div>
            )}
            {pwSaved && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-body">✓ Password updated</div>
            )}
            <input type="password" className={inputClass} value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} placeholder="New password" />
            <input type="password" className={inputClass} value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Confirm new password" />
            <button
              onClick={handlePwChange}
              disabled={pwSaving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-body hover:bg-muted/80 transition-colors disabled:opacity-60"
            >
              {pwSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </button>
          </div>
        </div>

        {/* Right — preview & extras (2/5) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Preview card */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <p className="font-body text-sm font-semibold text-foreground mb-4">Profile Preview</p>
            <div className="rounded-2xl bg-muted/30 p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <User className="w-7 h-7 text-accent" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="font-heading font-bold text-foreground text-sm truncate">{form.full_name || '—'}</p>
                  <div className="flex items-center gap-1 text-xs font-body text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{form.city || 'City not set'}</span>
                  </div>
                </div>
              </div>
              {form.bio && <p className="text-xs font-body text-foreground/70 line-clamp-3 leading-relaxed">{form.bio}</p>}
              {form.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {form.specialties.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-body">{s}</span>
                  ))}
                  {form.specialties.length > 3 && (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-body">+{form.specialties.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Guide License */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <p className="font-body text-sm font-semibold text-foreground mb-1">Guide License</p>
            <p className="text-xs font-body text-muted-foreground mb-4">Upload your official guide license to speed up verification</p>
            <label className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-border hover:border-accent/50 cursor-pointer transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground/40" />
              <span className="text-xs font-body text-muted-foreground text-center">Click to upload license (image or PDF)</span>
              <input type="file" accept="image/*,.pdf" className="hidden" />
            </label>
          </div>

          {/* Accept bookings */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold text-foreground">Accept Bookings</p>
                <p className="text-xs font-body text-muted-foreground mt-0.5">Allow travelers to send you booking requests</p>
              </div>
              <Toggle checked={form.accept_bookings} onChange={v => set('accept_bookings', v)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS GENERAL ──────────────────────────────────────────────────────────
function SettingsGeneralSection({ profile, user }) {
  const [s, setS] = useState({ accept_bookings: false, currency: 'USD', timezone: 'Asia/Tehran' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setS({ accept_bookings: profile.accept_bookings ?? false, currency: profile.currency || 'USD', timezone: profile.timezone || 'Asia/Tehran' });
  }, [profile]);

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    try { await supabase.from('profiles').update(s).eq('id', user.id); setSaved(true); setTimeout(() => setSaved(false), 3000); } catch {}
    setSaving(false);
  };

  const selectClass = 'w-full px-4 py-2.5 rounded-xl border border-border bg-background font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40';

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Settings — General</h1>
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-0 divide-y divide-border/50">
        <div className="flex items-center justify-between py-5">
          <div>
            <p className="font-body text-sm font-semibold text-foreground">Accept Booking Enquiries</p>
            <p className="text-xs font-body text-muted-foreground mt-0.5">Allow travelers to contact you with booking requests</p>
          </div>
          <Toggle checked={s.accept_bookings} onChange={v => setS(p => ({ ...p, accept_bookings: v }))} />
        </div>
        <div className="py-5">
          <label className="block font-body text-sm font-semibold text-foreground mb-2">Default Currency</label>
          <select className={selectClass} value={s.currency} onChange={e => setS(p => ({ ...p, currency: e.target.value }))}>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="IRR">IRR — Iranian Rial</option>
          </select>
        </div>
        <div className="py-5">
          <label className="block font-body text-sm font-semibold text-foreground mb-2">Timezone</label>
          <select className={selectClass} value={s.timezone} onChange={e => setS(p => ({ ...p, timezone: e.target.value }))}>
            <option value="Asia/Tehran">Asia/Tehran (IRST +3:30)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="America/New_York">America/New_York (EST -5)</option>
            <option value="Europe/Berlin">Europe/Berlin (CET +1)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST +4)</option>
          </select>
        </div>
        <div className="pt-5">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-body font-medium hover:bg-accent/90 transition-colors disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS NOTIFICATIONS ────────────────────────────────────────────────────
function SettingsNotificationsSection({ profile, user }) {
  const [s, setS] = useState({ notify_requests: true, notify_area: false, notify_email: true, notify_whatsapp: false });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setS({
      notify_requests: profile.notify_requests ?? true,
      notify_area: profile.notify_area ?? false,
      notify_email: profile.notify_email ?? true,
      notify_whatsapp: profile.notify_whatsapp ?? false,
    });
  }, [profile]);

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    try { await supabase.from('profiles').update(s).eq('id', user.id); setSaved(true); setTimeout(() => setSaved(false), 3000); } catch {}
    setSaving(false);
  };

  const rows = [
    { key: 'notify_requests', label: 'Tour Request Notifications', desc: 'Get notified when you receive a new tour request' },
    { key: 'notify_area', label: 'Area Notifications', desc: 'Notify me about travelers looking for guides in my area' },
    { key: 'notify_email', label: 'Email Notifications', desc: 'Receive marketing and update emails from Iran Tour Advisor' },
    { key: 'notify_whatsapp', label: 'WhatsApp Notifications', desc: 'Receive booking notifications via WhatsApp' },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Settings — Notifications</h1>
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-0 divide-y divide-border/50">
        {rows.map(row => (
          <div key={row.key} className="flex items-center justify-between py-5">
            <div>
              <p className="font-body text-sm font-semibold text-foreground">{row.label}</p>
              <p className="text-xs font-body text-muted-foreground mt-0.5">{row.desc}</p>
            </div>
            <Toggle checked={s[row.key]} onChange={v => setS(p => ({ ...p, [row.key]: v }))} />
          </div>
        ))}
        <div className="pt-5">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-body font-medium hover:bg-accent/90 transition-colors disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS PRIVACY ──────────────────────────────────────────────────────────
function SettingsPrivacySection({ profile, user }) {
  const [s, setS] = useState({ is_public: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);

  useEffect(() => {
    if (profile) setS({ is_public: profile.is_public ?? true });
  }, [profile]);

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    try { await supabase.from('profiles').update(s).eq('id', user.id); setSaved(true); setTimeout(() => setSaved(false), 3000); } catch {}
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Settings — Privacy</h1>
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-0 divide-y divide-border/50">
        <div className="flex items-center justify-between py-5">
          <div>
            <p className="font-body text-sm font-semibold text-foreground">Publish My Profile</p>
            <p className="text-xs font-body text-muted-foreground mt-0.5">Turn this on to make your profile visible to travelers</p>
          </div>
          <Toggle checked={s.is_public} onChange={v => setS(p => ({ ...p, is_public: v }))} />
        </div>
        <div className="py-5">
          <p className="font-body text-sm font-semibold text-red-500 mb-1">Danger Zone</p>
          <p className="text-xs font-body text-muted-foreground mb-3">Deactivating your account will hide your profile from all travelers.</p>
          <button
            onClick={() => setShowDeactivate(true)}
            className="px-4 py-2 rounded-xl border border-red-500/30 text-red-500 text-sm font-body hover:bg-red-500/10 transition-colors"
          >
            Deactivate Account
          </button>
        </div>
        <div className="pt-5">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-body font-medium hover:bg-accent/90 transition-colors disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save All Changes'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDeactivate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeactivate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full"
            >
              <p className="font-heading text-lg font-bold text-foreground mb-2">Deactivate Account?</p>
              <p className="text-sm font-body text-muted-foreground mb-5 leading-relaxed">
                Your profile will be hidden from travelers. You can reactivate it anytime by signing back in.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeactivate(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-body text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-body font-medium hover:bg-red-600 transition-colors">Deactivate</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, profile, isAuthenticated, isLoadingAuth, logout, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate('/login');
    if (!isLoadingAuth && isAuthenticated && profile?.role === 'tourist') navigate('/');
  }, [isAuthenticated, isLoadingAuth, profile, navigate]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarProps = { activeSection, setActiveSection, profile, logout, navigate };

  const sectionLabel = {
    home: 'Dashboard', bookings: 'My Bookings', reviews: 'My Reviews',
    gallery: 'My Gallery', profile: 'Edit Profile',
    'settings-general': 'Settings', 'settings-notifications': 'Settings', 'settings-privacy': 'Settings',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[220px] shrink-0 h-screen flex-col bg-[#0f172a] overflow-y-auto">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile overlay + sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-30 w-[220px] h-screen flex flex-col bg-[#0f172a] lg:hidden overflow-y-auto"
            >
              <SidebarContent {...sidebarProps} onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <p className="font-heading text-sm font-semibold text-foreground">{sectionLabel[activeSection]}</p>
          <div className="w-9" />
        </div>

        {/* Section */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
            >
              {activeSection === 'home' && <HomeSection profile={profile} setActiveSection={setActiveSection} />}
              {activeSection === 'bookings' && <BookingsSection user={user} />}
              {activeSection === 'reviews' && <ReviewsSection user={user} />}
              {activeSection === 'gallery' && <GallerySection profile={profile} user={user} refreshProfile={fetchProfile} />}
              {activeSection === 'profile' && <ProfileSection profile={profile} user={user} refreshProfile={fetchProfile} />}
              {activeSection === 'settings-general' && <SettingsGeneralSection profile={profile} user={user} />}
              {activeSection === 'settings-notifications' && <SettingsNotificationsSection profile={profile} user={user} />}
              {activeSection === 'settings-privacy' && <SettingsPrivacySection profile={profile} user={user} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
