import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useI18n } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, PlusCircle, Bell, MessageCircle,
  User, Image as ImageIcon, CalendarDays, CreditCard, Star, Settings,
  ChevronDown, ChevronRight, LogOut, Edit2, Trash2, ExternalLink,
  Loader2, Clock, MapPin, DollarSign, Upload, Shield, TrendingUp,
  MessageSquare, Package, CheckCircle2, X, Plus, Globe, AlertTriangle,
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

const THEMES = [
  { value: 'nature',    en: 'Nature & Wildlife 🌿',        fa: 'طبیعت‌گردی و حیات وحش 🌿', ar: 'الطبيعة والحياة البرية 🌿' },
  { value: 'cultural',  en: 'Cultural & Historical 🏛️',    fa: 'فرهنگی و تاریخی 🏛️',       ar: 'ثقافي وتاريخي 🏛️' },
  { value: 'coastal',   en: 'Coastal & Marine 🏖️',         fa: 'ساحلی و دریایی 🏖️',        ar: 'ساحلي وبحري 🏖️' },
  { value: 'urban',     en: 'Urban & Modern 🏙️',           fa: 'شهری و مدرن 🏙️',           ar: 'حضري وعصري 🏙️' },
  { value: 'rural',     en: 'Rural & Eco 🏡',              fa: 'روستایی و بوم‌گردی 🏡',     ar: 'ريفي وبيئي 🏡' },
  { value: 'luxury',    en: 'Luxury & VIP 👑',             fa: 'لاکچری و VIP 👑',           ar: 'فاخر و VIP 👑' },
  { value: 'budget',    en: 'Budget & Backpacking 🎒',     fa: 'اقتصادی و کوله‌گردی 🎒',   ar: 'اقتصادي وحقيبة ظهر 🎒' },
];

const PURPOSES = [
  { value: 'leisure',      en: 'Leisure & Relaxation 🌅',    fa: 'تفریحی و استراحت 🌅',      ar: 'ترفيه واسترخاء 🌅' },
  { value: 'adventure',    en: 'Adventure & Thrill 🧗',       fa: 'ماجراجویی و هیجان 🧗',     ar: 'مغامرة وإثارة 🧗' },
  { value: 'religious',    en: 'Religious & Pilgrimage 🕌',   fa: 'زیارتی و مذهبی 🕌',        ar: 'ديني وزيارات 🕌' },
  { value: 'educational',  en: 'Educational & Research 📚',   fa: 'آموزشی و پژوهشی 📚',       ar: 'تعليمي وبحثي 📚' },
  { value: 'medical',      en: 'Medical Tourism 🏥',          fa: 'سلامت و درمانی 🏥',         ar: 'سياحة علاجية 🏥' },
  { value: 'business',     en: 'Business & Exhibition 💼',    fa: 'تجاری و نمایشگاهی 💼',     ar: 'تجاري ومعارض 💼' },
  { value: 'honeymoon',    en: 'Honeymoon 💑',                fa: 'ماه عسل 💑',                ar: 'شهر عسل 💑' },
  { value: 'sports',       en: 'Sports ⚽',                   fa: 'ورزشی ⚽',                  ar: 'رياضي ⚽' },
  { value: 'photography',  en: 'Photography 📸',              fa: 'عکاسی 📸',                  ar: 'تصوير 📸' },
  { value: 'architecture', en: 'Architecture 🏰',             fa: 'معماری 🏰',                 ar: 'عمارة 🏰' },
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
  const { t } = useI18n();
  const activeId = section || 'home';

  const NAV_LABELS = {
    home:        t('dashboard_nav_home'),
    'my-tours':  t('dashboard_nav_tours'),
    'add-tour':  t('dashboard_nav_add_tour'),
    requests:    t('dashboard_nav_requests'),
    chat:        t('dashboard_nav_chat'),
    profile:     t('dashboard_nav_profile'),
    gallery:     t('dashboard_nav_gallery'),
    bookings:    t('dashboard_nav_bookings'),
    payment:     t('dashboard_nav_payment'),
    'my-reviews':t('dashboard_nav_reviews'),
    settings:    t('dashboard_nav_settings'),
  };

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
                {NAV_LABELS[item.id] || item.label}
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
                      {NAV_LABELS[sub.id] || sub.label}
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
          {t('dashboard_sign_out')}
        </button>
      </div>
    </aside>
  );
}

// ─── HomeView ─────────────────────────────────────────────────────────────────

function HomeView({ profile, tours, reviews, onNavigate }) {
  const { t } = useI18n();
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
            <p className="text-white/40 text-xs mb-1">{t('dashboard_welcome')}</p>
            <h2 className="text-white font-bold text-lg leading-tight">
              {profile?.full_name?.split(' ')[0] || 'Guide'} 👋
            </h2>
            <p className="text-white/50 text-xs mt-2 leading-relaxed">
              {t('dashboard_nav_tours')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('add-tour')}
            className="mt-4 w-full py-2 rounded-xl bg-[hsl(178,85%,32%)] text-white text-xs font-semibold hover:bg-[hsl(178,85%,28%)] transition"
          >
            + {t('dashboard_add_tour')}
          </button>
        </div>

        {/* Upcoming Tour */}
        <div className={cardBase}>
          <p className="text-white/40 text-xs mb-3">{t('dashboard_upcoming_tour')}</p>
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
            <EmptyState Icon={Briefcase} title={t('dashboard_no_upcoming')} desc={t('dashboard_add_tour')} />
          )}
        </div>

        {/* License */}
        <div className={`${cardBase} flex flex-col`}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-[hsl(38,62%,58%)]" />
            <p className="text-white/70 text-xs font-medium">{t('dashboard_my_license')}</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border-2 border-dashed border-white/15 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5 text-white/25" />
            </div>
            <p className="text-white/40 text-xs text-center mb-4">
              {t('dashboard_license_missing')}
            </p>
            <button className="px-4 py-2 rounded-xl border border-white/20 text-white/60 text-xs font-medium hover:border-[hsl(38,62%,58%)] hover:text-[hsl(38,62%,58%)] transition">
              {t('dashboard_upload_license')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 2: Tour Requests / Latest Chat ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        {/* Tour Requests */}
        <div className={`${cardBase} md:col-span-3`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/70 text-sm font-semibold">{t('dashboard_tour_requests')}</p>
            <div className="flex bg-white/[0.06] rounded-lg p-0.5">
              {['new', 'invitations'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setReqTab(tab)}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all capitalize ${
                    reqTab === tab ? 'bg-[hsl(178,85%,32%)] text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {tab === 'new' ? t('dashboard_new_requests') : t('dashboard_invitations')}
                </button>
              ))}
            </div>
          </div>
          <EmptyState
            Icon={Bell}
            title={reqTab === 'new' ? t('dashboard_empty_requests') : t('dashboard_empty_chat')}
            desc={t('dashboard_no_requests')}
          />
        </div>

        {/* Latest Chat */}
        <div className={`${cardBase} md:col-span-2`}>
          <p className="text-white/70 text-sm font-semibold mb-4">{t('dashboard_latest_chat')}</p>
          <EmptyState
            Icon={MessageSquare}
            title={t('dashboard_no_messages')}
            desc={t('dashboard_empty_chat')}
          />
        </div>
      </div>

      {/* ── Row 3: Earnings Chart ── */}
      <div className={cardBase}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(178,85%,45%)]" />
            <p className="text-white/80 text-sm font-semibold">{t('dashboard_earnings_title')}</p>
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
          { label: t('dashboard_stat_tours'), value: totalTours, color: 'text-white', Icon: Briefcase },
          { label: t('dashboard_published'), value: publishedCount, color: 'text-emerald-400', Icon: CheckCircle2 },
          { label: t('dashboard_draft'), value: draftCount, color: 'text-yellow-400', Icon: Package },
          { label: t('dashboard_recent_reviews'), value: totalReviews, extra: avgRating !== '—' ? `Avg ${avgRating}★` : null, color: 'text-[hsl(38,62%,58%)]', Icon: Star },
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
        <p className="text-white/70 text-sm font-semibold mb-4">{t('dashboard_recent_reviews')}</p>
        {reviews.length === 0 ? (
          <EmptyState
            Icon={Star}
            title={t('dashboard_no_reviews')}
            desc={t('dashboard_empty_reviews')}
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
  const { t, lang } = useI18n();
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-bold text-lg">{t('dashboard_my_tours')}</h2>
        <span className="text-white/40 text-xs">{tours.length} tour{tours.length !== 1 ? 's' : ''}</span>
      </div>
      {tours.length === 0 ? (
        <div className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl">
          <EmptyState Icon={Briefcase} title={t('dashboard_no_tours')} desc={t('dashboard_no_tours_desc')} />
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
                {(() => {
                  const STATUS_CFG = {
                    published:      { label: t('dashboard_published'), dot: 'bg-emerald-400', wrap: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' },
                    pending_review: { label: lang === 'fa' ? 'در انتظار تایید' : 'Pending Review', dot: 'bg-yellow-400', wrap: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300' },
                    draft:          { label: t('dashboard_draft'), dot: 'bg-gray-400',    wrap: 'bg-gray-500/20   border-gray-500/30   text-gray-300'   },
                    rejected:       { label: lang === 'fa' ? 'رد شده' : 'Rejected',        dot: 'bg-red-400',     wrap: 'bg-red-500/20    border-red-500/30    text-red-300'    },
                  };
                  const cfg = STATUS_CFG[tour.status] || STATUS_CFG.draft;
                  return (
                    <div className={`absolute top-2.5 end-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm border ${cfg.wrap}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </div>
                  );
                })()}
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
                    <Edit2 className="w-3 h-3" /> {t('dashboard_edit')}
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
  const { t, lang } = useI18n();
  const fileRef    = useRef(null);
  const galleryRef = useRef(null);

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
      highlights:  Array.isArray(editing.highlights) ? editing.highlights.join('\n') : (editing.highlights || ''),
      itinerary:   editing.itinerary || '',
      included:    Array.isArray(editing.included) ? editing.included.join('\n') : (editing.included || ''),
      excluded:    Array.isArray(editing.excluded) ? editing.excluded.join('\n') : (editing.excluded || ''),
      status:      editing.status || 'draft',
    };
  });

  const [selectedThemes, setSelectedThemes] = useState(() => {
    if (!editing) return [];
    if (Array.isArray(editing.theme)) return editing.theme;
    return editing.theme ? [editing.theme] : [];
  });
  const [selectedPurposes, setSelectedPurposes] = useState(() => {
    if (!editing) return [];
    if (Array.isArray(editing.purpose)) return editing.purpose;
    return editing.purpose ? [editing.purpose] : [];
  });

  const [imageUrl,     setImageUrl]     = useState(editing?.image_url || '');
  const [galleryUrls,  setGalleryUrls]  = useState(() => {
    if (!editing) return [];
    if (Array.isArray(editing.gallery)) return editing.gallery;
    return editing.gallery ? editing.gallery.split(',').map(s => s.trim()).filter(Boolean) : [];
  });
  const [uploadingMain,    setUploadingMain]    = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');
  const [customTheme,   setCustomTheme]   = useState('');
  const [customPurpose, setCustomPurpose] = useState('');

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

  const toggleTheme   = (v) => setSelectedThemes(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  const togglePurpose = (v) => setSelectedPurposes(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);

  const addCustomTheme = () => {
    const v = customTheme.trim();
    if (v) { setSelectedThemes(p => p.includes(v) ? p : [...p, v]); setCustomTheme(''); }
  };
  const addCustomPurpose = () => {
    const v = customPurpose.trim();
    if (v) { setSelectedPurposes(p => p.includes(v) ? p : [...p, v]); setCustomPurpose(''); }
  };

  const uploadFile = async (file) => {
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const { error: uploadErr } = await supabase.storage.from('tour-images').upload(fileName, file);
    if (uploadErr) throw uploadErr;
    const { data } = supabase.storage.from('tour-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingMain(true);
    try { setImageUrl(await uploadFile(file)); }
    catch (err) { setError(err.message); }
    finally { setUploadingMain(false); }
  };

  const handleGalleryUpload = async (files) => {
    const arr = Array.from(files).slice(0, 10 - galleryUrls.length);
    if (!arr.length) return;
    setUploadingGallery(true);
    try {
      const urls = await Promise.all(arr.map(uploadFile));
      setGalleryUrls(prev => [...prev, ...urls.filter(Boolean)]);
    } catch (err) { setError(err.message); }
    finally { setUploadingGallery(false); }
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
        theme:       selectedThemes,
        purpose:     selectedPurposes,
        highlights:  form.highlights.split('\n').filter(Boolean),
        itinerary:   form.itinerary,
        included:    form.included.split('\n').filter(Boolean),
        excluded:    form.excluded.split('\n').filter(Boolean),
        image_url:   imageUrl,
        gallery:     galleryUrls,
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
          .from('tours').insert({ ...payload, status: 'draft', owner_id: user.id }).select().single();
        if (err) throw err;
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setForm(EMPTY_TOUR);
          setSelectedThemes([]);
          setSelectedPurposes([]);
          setImageUrl('');
          setGalleryUrls([]);
        }, 2000);
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
  const tagBase    = 'rounded-full px-3 py-1.5 text-sm cursor-pointer flex items-center gap-1.5 border transition';
  const tagOn      = `${tagBase} border-teal-400 bg-teal-400/20 text-white`;
  const tagOff     = `${tagBase} border-white/20 text-white/70 hover:border-teal-400`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">{editing ? t('dashboard_update_tour') : t('dashboard_add_tour')}</h2>
          <p className="text-white/40 text-xs mt-0.5">{editing ? t('dashboard_update_tour') : t('dashboard_add_tour')}</p>
        </div>
        {editing && (
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/15 text-white/50 text-xs hover:text-white hover:border-white/30 transition">
            ✕ {t('dashboard_cancel')}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">{error}</div>
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

        {/* Theme tag chips */}
        <div>
          <label className={labelClass}>Theme (select multiple)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {THEMES.map(th => (
              <button type="button" key={th.value} onClick={() => toggleTheme(th.value)}
                className={selectedThemes.includes(th.value) ? tagOn : tagOff}>
                {th[lang] || th.en}
              </button>
            ))}
            {selectedThemes.filter(v => !THEMES.find(th => th.value === v)).map(v => (
              <button type="button" key={v} onClick={() => toggleTheme(v)} className={tagOn}>✏️ {v}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={customTheme} onChange={e => setCustomTheme(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTheme())}
              className={inputClass} placeholder="+ Add custom theme..." />
            <button type="button" onClick={addCustomTheme}
              className="px-4 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:border-teal-400 hover:text-white transition whitespace-nowrap">
              Add
            </button>
          </div>
        </div>

        {/* Purpose tag chips */}
        <div>
          <label className={labelClass}>Purpose (select multiple)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PURPOSES.map(pu => (
              <button type="button" key={pu.value} onClick={() => togglePurpose(pu.value)}
                className={selectedPurposes.includes(pu.value) ? tagOn : tagOff}>
                {pu[lang] || pu.en}
              </button>
            ))}
            {selectedPurposes.filter(v => !PURPOSES.find(pu => pu.value === v)).map(v => (
              <button type="button" key={v} onClick={() => togglePurpose(v)} className={tagOn}>✏️ {v}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={customPurpose} onChange={e => setCustomPurpose(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomPurpose())}
              className={inputClass} placeholder="+ Add custom purpose..." />
            <button type="button" onClick={addCustomPurpose}
              className="px-4 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:border-teal-400 hover:text-white transition whitespace-nowrap">
              Add
            </button>
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
            <label className={labelClass}>What&#39;s Included (one per line)</label>
            <textarea name="included" value={form.included} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder={"Hotel accommodation\nBreakfast daily\nPrivate transport"} />
          </div>
          <div>
            <label className={labelClass}>What&#39;s Not Included (one per line)</label>
            <textarea name="excluded" value={form.excluded} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder={"International flights\nTravel insurance\nLunch and dinner"} />
          </div>
        </div>

        {/* Main Image drag-and-drop upload */}
        <div>
          <label className={labelClass}>Main Image</label>
          <div
            onDrop={e => { e.preventDefault(); handleImageUpload(e.dataTransfer.files[0]); }}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-teal-400 transition-all"
          >
            {uploadingMain ? (
              <div className="flex flex-col items-center gap-2 text-white/50">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-sm">Uploading...</p>
              </div>
            ) : imageUrl ? (
              <div className="relative" onClick={e => e.stopPropagation()}>
                <img src={imageUrl} className="w-full h-48 object-cover rounded-lg" alt="main" />
                <button type="button" onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/40">
                <Upload className="w-8 h-8" />
                <p className="text-sm">📷 Drop image here or click to browse</p>
                <p className="text-xs">JPG, PNG, WEBP</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleImageUpload(e.target.files[0])} />
          </div>
        </div>

        {/* Gallery multi-image upload */}
        <div>
          <label className={labelClass}>Gallery Images ({galleryUrls.length}/10)</label>
          {galleryUrls.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
              {galleryUrls.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                  <img src={url} alt={`g${i}`} className="w-full h-full object-cover" />
                  <button type="button"
                    onClick={() => setGalleryUrls(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-500/80">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {galleryUrls.length < 10 && (
            <div
              onDrop={e => { e.preventDefault(); handleGalleryUpload(e.dataTransfer.files); }}
              onDragOver={e => e.preventDefault()}
              onClick={() => galleryRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 transition-all"
            >
              {uploadingGallery ? (
                <div className="flex flex-col items-center gap-2 text-white/50">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <p className="text-sm">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/40">
                  <Upload className="w-6 h-6" />
                  <p className="text-sm">Add up to {10 - galleryUrls.length} more images</p>
                </div>
              )}
              <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => handleGalleryUpload(e.target.files)} />
            </div>
          )}
        </div>

        {/* Status */}
        <div>
          <label className={labelClass}>Status</label>
          <select name="status" value={form.status} onChange={handleChange} className={`${inputClass} w-48 appearance-none cursor-pointer`}>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[hsl(178,85%,32%)] text-white font-semibold text-sm hover:bg-[hsl(178,85%,28%)] disabled:opacity-60 transition">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? t('dashboard_saving') : editing ? t('dashboard_update_tour') : t('dashboard_save_tour')}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── ProfileView ──────────────────────────────────────────────────────────────

function ProfileView({ profile, userId, onSave }) {
  const { t } = useI18n();
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
          <h2 className="text-white font-bold text-lg">{t('dashboard_my_profile')}</h2>
          <p className="text-white/40 text-xs mt-0.5">{t('dashboard_save_profile')}</p>
        </div>
        {/* Completion */}
        <div className="text-right">
          <p className="text-white/40 text-xs mb-1.5">{t('dashboard_profile_completion')} {completion}%</p>
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
              <CheckCircle2 className="w-4 h-4" /> {t('dashboard_saved')}
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ms-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[hsl(178,85%,32%)] text-white font-semibold text-sm hover:bg-[hsl(178,85%,28%)] disabled:opacity-60 transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? t('dashboard_saving') : t('dashboard_save_profile')}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── GalleryView ─────────────────────────────────────────────────────────────

function GalleryView({ profile, userId, onSave }) {
  const { t } = useI18n();
  const [gallery, setGallery] = useState(profile?.gallery_images || []);
  const [showModal, setShowModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAddPhoto = async () => {
    if (!newUrl.trim() || gallery.length >= 20) return;
    setAdding(true);
    setError('');
    try {
      const { data, error: fetchErr } = await supabase
        .from('profiles').select('gallery_images').eq('id', userId).single();
      if (fetchErr) throw fetchErr;
      const newGallery = [...(data.gallery_images || []), newUrl.trim()];
      const { error: updateErr } = await supabase
        .from('profiles').update({ gallery_images: newGallery }).eq('id', userId);
      if (updateErr) throw updateErr;
      setGallery(newGallery);
      onSave({ ...profile, gallery_images: newGallery });
      setNewUrl('');
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeletePhoto = async (imageUrl) => {
    if (!window.confirm(t('gallery_delete_confirm'))) return;
    const filtered = gallery.filter(img => img !== imageUrl);
    try {
      const { error: err } = await supabase
        .from('profiles').update({ gallery_images: filtered }).eq('id', userId);
      if (err) throw err;
      setGallery(filtered);
      onSave({ ...profile, gallery_images: filtered });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">{t('gallery_title')}</h2>
          <p className="text-white/40 text-xs mt-0.5">
            {gallery.length}/20 {t('gallery_max')}
          </p>
        </div>
        {gallery.length < 20 && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(178,85%,32%)] text-white text-xs font-semibold hover:bg-[hsl(178,85%,28%)] transition"
          >
            <Plus className="w-4 h-4" />
            {t('gallery_add')}
          </button>
        )}
      </div>

      {gallery.length === 0 ? (
        <div className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl">
          <EmptyState Icon={ImageIcon} title={t('gallery_empty')} desc={t('gallery_max')} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {gallery.map((img, i) => (
            <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden bg-white/[0.05] border border-white/[0.08]">
              <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={() => handleDeletePhoto(img)}
                  className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center text-white transition-all hover:bg-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Photo Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[hsl(222,55%,10%)] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold text-base">{t('gallery_add')}</h3>
                <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/50 hover:text-white transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">{error}</div>
              )}

              <input
                type="url"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder={t('gallery_add_url')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[hsl(178,85%,32%)] focus:ring-1 focus:ring-[hsl(178,85%,32%)]/50 transition mb-4"
                onKeyDown={e => e.key === 'Enter' && handleAddPhoto()}
                autoFocus
              />

              {newUrl && (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-white/5 mb-4">
                  <img src={newUrl} alt="Preview" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/50 text-sm hover:text-white hover:border-white/30 transition"
                >
                  {t('dashboard_cancel')}
                </button>
                <button
                  onClick={handleAddPhoto}
                  disabled={!newUrl.trim() || adding}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[hsl(178,85%,32%)] text-white text-sm font-semibold hover:bg-[hsl(178,85%,28%)] disabled:opacity-50 transition"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {t('gallery_add')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SettingsView ─────────────────────────────────────────────────────────────

const TIMEZONES = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00',
  'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00',
  'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00',
  'UTC+03:00', 'UTC+03:30', 'UTC+04:00', 'UTC+04:30', 'UTC+05:00',
  'UTC+05:30', 'UTC+05:45', 'UTC+06:00', 'UTC+06:30', 'UTC+07:00',
  'UTC+08:00', 'UTC+09:00', 'UTC+09:30', 'UTC+10:00', 'UTC+11:00',
  'UTC+12:00',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'IRR'];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? 'bg-[hsl(178,85%,32%)]' : 'bg-white/15'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function SettingsView({ profile, userId, onSave }) {
  const { t } = useI18n();
  const [tab, setTab] = useState('general');

  const [acceptBookings, setAcceptBookings] = useState(profile?.accept_bookings ?? true);
  const [currency, setCurrency] = useState(profile?.currency || 'USD');
  const [timezone, setTimezone] = useState(profile?.timezone || 'UTC+03:30');

  const [notifyRequests, setNotifyRequests] = useState(profile?.notify_requests ?? true);
  const [notifyArea, setNotifyArea] = useState(profile?.notify_area || 'nearby');
  const [notifyEmail, setNotifyEmail] = useState(profile?.notify_email ?? true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(profile?.notify_whatsapp ?? false);

  const [isPublic, setIsPublic] = useState(profile?.is_public ?? true);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      let payload = {};
      if (tab === 'general') {
        payload = { accept_bookings: acceptBookings, currency, timezone };
      } else if (tab === 'notifications') {
        payload = { notify_requests: notifyRequests, notify_area: notifyArea, notify_email: notifyEmail, notify_whatsapp: notifyWhatsapp };
      } else {
        payload = { is_public: isPublic };
      }
      const { error: err } = await supabase.from('profiles').update(payload).eq('id', userId);
      if (err) throw err;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSave({ ...profile, ...payload });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const selectClass = 'w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.05] text-white text-sm focus:outline-none focus:border-[hsl(178,85%,32%)] transition appearance-none cursor-pointer';
  const labelClass = 'block text-white/50 text-xs mb-1.5 font-medium';
  const tabs = ['general', 'notifications', 'privacy'];

  return (
    <div>
      <h2 className="text-white font-bold text-lg mb-6">{t('dashboard_nav_settings')}</h2>

      {/* Tabs */}
      <div className="flex bg-white/[0.05] rounded-xl p-1 mb-6 w-fit gap-1">
        {tabs.map(tabId => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
              tab === tabId
                ? 'bg-[hsl(178,85%,32%)] text-white shadow'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {t(`settings_${tabId}`)}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">{error}</div>
      )}

      <div className="bg-[hsl(222,45%,14%)] border border-white/[0.08] rounded-2xl p-6 space-y-6">

        {/* ── General Tab ── */}
        {tab === 'general' && (
          <>
            {/* Accept bookings toggle */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-white text-sm font-medium">{t('settings_accept_bookings')}</p>
              </div>
              <Toggle checked={acceptBookings} onChange={setAcceptBookings} />
            </div>

            {/* Currency */}
            <div>
              <label className={labelClass}>{t('settings_currency')}</label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className={`${selectClass} pr-8`}
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className={labelClass}>{t('settings_timezone')}</label>
              <div className="relative">
                <select
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className={`${selectClass} pr-8`}
                >
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </div>
          </>
        )}

        {/* ── Notifications Tab ── */}
        {tab === 'notifications' && (
          <>
            <div className="flex items-center justify-between gap-4">
              <p className="text-white text-sm font-medium">{t('settings_notify_requests')}</p>
              <Toggle checked={notifyRequests} onChange={setNotifyRequests} />
            </div>

            <div>
              <p className="text-white/50 text-xs font-medium mb-3">{t('settings_notify_area')}</p>
              <div className="space-y-3">
                {[
                  { value: 'nearby', label: t('settings_notify_nearby') },
                  { value: 'mine', label: t('settings_notify_only_mine') },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                      notifyArea === opt.value
                        ? 'border-[hsl(178,85%,45%)] bg-[hsl(178,85%,32%)]'
                        : 'border-white/20 group-hover:border-white/40'
                    }`}>
                      {notifyArea === opt.value && (
                        <div className="w-full h-full rounded-full bg-white/80 scale-[0.4]" />
                      )}
                    </div>
                    <span className="text-white/70 text-sm group-hover:text-white transition">{opt.label}</span>
                    <input
                      type="radio"
                      name="notifyArea"
                      value={opt.value}
                      checked={notifyArea === opt.value}
                      onChange={() => setNotifyArea(opt.value)}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-5 pt-2 border-t border-white/[0.07]">
              <div className="flex items-center justify-between gap-4">
                <p className="text-white text-sm">{t('settings_notify_email')}</p>
                <Toggle checked={notifyEmail} onChange={setNotifyEmail} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-white text-sm">{t('settings_notify_whatsapp')}</p>
                <Toggle checked={notifyWhatsapp} onChange={setNotifyWhatsapp} />
              </div>
            </div>
          </>
        )}

        {/* ── Privacy Tab ── */}
        {tab === 'privacy' && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-white text-sm font-medium">{t('settings_publish_profile')}</p>
                <p className="text-white/40 text-xs mt-0.5">{t('settings_publish_desc')}</p>
              </div>
              <Toggle checked={isPublic} onChange={setIsPublic} />
            </div>

            <div className="pt-4 border-t border-white/[0.07]">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition"
              >
                <AlertTriangle className="w-4 h-4" />
                {t('settings_deactivate')}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Save button */}
      <div className="flex items-center justify-end gap-3 mt-5">
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4" /> {t('dashboard_saved')}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[hsl(178,85%,32%)] text-white font-semibold text-sm hover:bg-[hsl(178,85%,28%)] disabled:opacity-60 transition"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {saving ? t('dashboard_saving') : t('settings_save_all')}
        </button>
      </div>

      {/* Deactivate Confirmation Modal */}
      <AnimatePresence>
        {showDeactivateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={e => e.target === e.currentTarget && setShowDeactivateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[hsl(222,55%,10%)] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{t('settings_deactivate')}</h3>
                  <p className="text-white/40 text-xs mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/50 text-sm hover:text-white hover:border-white/30 transition"
                >
                  {t('dashboard_cancel')}
                </button>
                <button
                  className="flex-1 py-2.5 rounded-xl bg-red-500/80 text-white text-sm font-semibold hover:bg-red-500 transition"
                >
                  {t('settings_deactivate')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── EmptySection ─────────────────────────────────────────────────────────────

const SECTION_ICONS = {
  requests:    Bell,
  chat:        MessageCircle,
  gallery:     ImageIcon,
  bookings:    CalendarDays,
  payment:     CreditCard,
  'my-reviews':Star,
  settings:    Settings,
};

function EmptySection({ section }) {
  const { t } = useI18n();
  const Icon = SECTION_ICONS[section] || LayoutDashboard;

  const titleKey = `dashboard_nav_${section === 'my-reviews' ? 'reviews' : section}`;
  const descKey = `dashboard_empty_${section === 'my-reviews' ? 'reviews' : section}`;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-white/20" />
        </div>
        <h2 className="text-white font-bold text-xl mb-2">{t(titleKey)}</h2>
        <p className="text-white/40 text-sm max-w-xs">{t(descKey)}</p>
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
      case 'gallery':
        return <GalleryView profile={profile} userId={authUser?.id} onSave={handleProfileSaved} />;
      case 'settings':
        return <SettingsView profile={profile} userId={authUser?.id} onSave={handleProfileSaved} />;
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
