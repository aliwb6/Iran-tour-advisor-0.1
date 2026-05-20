import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Compass, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n.jsx';
import { supabase } from '@/supabaseClient';
import BookingCard from '@/components/profile/BookingCard';

// Stylised Persian-tile motif used in the empty state. Pure inline SVG so it
// scales perfectly and inherits text colour for theming.
function PersianPatternIllustration() {
  return (
    <svg viewBox="0 0 240 240" className="w-44 h-44 sm:w-52 sm:h-52 text-gold/70" aria-hidden="true">
      <defs>
        <radialGradient id="iri-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="120" r="110" fill="url(#iri-grad)" />
      {/* 8-point star (Rub el Hizb-inspired) */}
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        <polygon points="120,30 145,80 200,80 165,120 200,160 145,160 120,210 95,160 40,160 75,120 40,80 95,80" opacity="0.55" />
        <polygon points="120,55 138,90 178,90 152,120 178,150 138,150 120,185 102,150 62,150 88,120 62,90 102,90" opacity="0.75" />
        <circle cx="120" cy="120" r="22" />
        <circle cx="120" cy="120" r="8" opacity="0.7" />
        {/* Surrounding floral arcs */}
        <path d="M120 18 C150 30 160 45 158 60" opacity="0.3" />
        <path d="M120 18 C90 30 80 45 82 60" opacity="0.3" />
        <path d="M120 222 C150 210 160 195 158 180" opacity="0.3" />
        <path d="M120 222 C90 210 80 195 82 180" opacity="0.3" />
      </g>
    </svg>
  );
}

export default function BookingsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { lang, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate('/login');
  }, [isLoadingAuth, isAuthenticated, navigate]);

  // Best-effort: try to fetch from a `bookings` table tied to this user. If
  // it doesn't exist yet (current schema doesn't have one), we silently fall
  // back to the empty-state UI.
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!cancelled) setBookings(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setBookings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const tx = {
    title:        lang === 'fa' ? 'رزروهای من' : lang === 'ar' ? 'حجوزاتي' : 'My Bookings',
    subtitle:     lang === 'fa' ? 'رزروهای خود را مدیریت کن' : lang === 'ar' ? 'إدارة حجوزاتك' : 'Manage your bookings',
    emptyTitle:   lang === 'fa' ? 'هنوز رزروی نداری — ماجراجویی ایران در انتظار توست' : lang === 'ar' ? 'لا توجد حجوزات بعد — مغامرتك الإيرانية بانتظارك' : 'No bookings yet — your Iran adventure awaits',
    emptyDesc:    lang === 'fa' ? 'زیبایی پنهان ایران اصیل را در سفرهای فرهنگی پرمعنا کشف کن.' : lang === 'ar' ? 'اكتشف الجمال الخفي لإيران الأصيلة عبر رحلات ثقافية ذات معنى.' : 'Discover the hidden beauty of authentic Iran through meaningful cultural journeys.',
    browse:       lang === 'fa' ? 'مشاهده پکیج‌ها' : lang === 'ar' ? 'تصفح الباقات' : 'Browse Packages',
    plan:         lang === 'fa' ? 'برنامه‌ریزی سفر' : lang === 'ar' ? 'خطط رحلتي' : 'Plan My Trip',
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <header className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground">{tx.title}</h1>
          <p className="font-body text-sm text-muted-foreground mt-2">{tx.subtitle}</p>
        </header>

        {loading ? (
          <div className="bg-card/60 border border-border/40 rounded-3xl p-16 text-center">
            <div className="w-3 h-3 rounded-full bg-accent animate-pulse mx-auto" />
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 carpet-texture opacity-20 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center">
              <PersianPatternIllustration />
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mt-6">{tx.emptyTitle}</h2>
              <p className="font-body text-sm sm:text-base text-muted-foreground mt-3 max-w-md leading-relaxed">
                {tx.emptyDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link
                  to="/tours"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition shadow-lg shadow-accent/20"
                >
                  <Compass className="w-4 h-4" />
                  {tx.browse}
                  <Arrow className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/ai-assistant"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gold/40 text-foreground hover:bg-gold/10 text-sm font-semibold transition"
                >
                  <Sparkles className="w-4 h-4 text-gold" />
                  {tx.plan}
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={{
                  title: b.title || b.tour_title || 'Booking',
                  destination: b.destination || b.city,
                  startDate: b.start_date,
                  endDate: b.end_date,
                  status: b.status,
                  price: b.total_price,
                  image: b.image_url,
                  detailsUrl: b.slug ? `/tours/${b.slug}` : '#',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
