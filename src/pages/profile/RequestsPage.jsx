import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Compass, ArrowRight, ArrowLeft, Inbox } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n.jsx';
import { supabase } from '@/supabaseClient';
import RequestCard from '@/components/profile/RequestCard';

export default function RequestsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { lang, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('active'); // active | past
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate('/login');
  }, [isLoadingAuth, isAuthenticated, navigate]);

  // Try to fetch from a `tour_requests` (or `trip_requests`) table — if neither
  // exists in this schema yet, fall through to an empty list with a tidy
  // empty state.
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        let { data, error } = await supabase
          .from('trip_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) {
          const fallback = await supabase
            .from('tour_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          data = fallback.data;
        }
        if (!cancelled) setRequests(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setRequests([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const isActive = (r) => r.status === 'waiting' || r.status === 'received' || r.status == null;
  const filtered = useMemo(() => requests.filter((r) => filter === 'active' ? isActive(r) : !isActive(r)), [requests, filter]);

  const mapToCard = (r) => ({
    id: r.id,
    title: r.title || (r.destination && r.travel_month
      ? `${lang === 'fa' ? 'سفر من به' : lang === 'ar' ? 'رحلتي إلى' : 'My Trip to'} ${r.destination} ${lang === 'fa' ? 'در' : lang === 'ar' ? 'في' : 'in'} ${r.travel_month}`
      : lang === 'fa' ? 'درخواست سفر' : lang === 'ar' ? 'طلب رحلة' : 'Trip Request'),
    destination: r.destination,
    adults: r.adults ?? 1,
    children: r.children ?? 0,
    startDate: r.start_date,
    startTime: r.start_time,
    endDate: r.end_date,
    endTime: r.end_time,
    transportation: r.transportation,
    accommodation: r.accommodation,
    tourType: r.tour_type,
    requirements: r.requirements || r.notes,
    status: r.status || 'waiting',
  });

  const tx = {
    title:    lang === 'fa' ? 'درخواست‌های سفر من' : lang === 'ar' ? 'طلبات سفري' : 'My Travel Requests',
    subtitle: lang === 'fa' ? 'پیشنهادهای راهنماها را اینجا ببین و مدیریت کن' : lang === 'ar' ? 'تابع وأدر العروض من المرشدين هنا' : 'Track proposals from local guides and manage your trip plans',
    active:   lang === 'fa' ? 'فعال' : lang === 'ar' ? 'نشط' : 'Active',
    past:     lang === 'fa' ? 'گذشته' : lang === 'ar' ? 'سابق' : 'Past',
    emptyTitle: filter === 'active'
      ? (lang === 'fa' ? 'هنوز درخواست فعالی نداری' : lang === 'ar' ? 'لا توجد طلبات نشطة بعد' : 'No active trip requests yet')
      : (lang === 'fa' ? 'هنوز درخواست گذشته‌ای نداری' : lang === 'ar' ? 'لا توجد طلبات سابقة' : 'No past trip requests'),
    emptyDesc: lang === 'fa'
      ? 'با هوش مصنوعی یا تور سفارشی شروع کن تا راهنماهای محلی برایت پیشنهاد بفرستند.'
      : lang === 'ar'
      ? 'ابدأ بمساعد الذكاء الاصطناعي أو رحلة مخصصة لتلقي عروض من المرشدين المحليين.'
      : 'Start with the AI planner or a custom trip and local guides will send you tailored proposals.',
    planAi:   lang === 'fa' ? 'برنامه‌ریزی با هوش مصنوعی' : lang === 'ar' ? 'خطط مع الذكاء الاصطناعي' : 'Plan with AI',
    browse:   lang === 'fa' ? 'مشاهده تورها' : lang === 'ar' ? 'تصفح الجولات' : 'Browse Tours',
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Header + filter */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-foreground">{tx.title}</h1>
            <p className="font-body text-sm text-muted-foreground mt-2 max-w-xl">{tx.subtitle}</p>
          </div>

          <div className="inline-flex bg-card/60 backdrop-blur-md border border-border/40 rounded-full p-1 self-start sm:self-end">
            {['active', 'past'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-accent text-white shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'active' ? tx.active : tx.past}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="bg-card/60 border border-border/40 rounded-3xl p-16 text-center">
            <div className="w-3 h-3 rounded-full bg-accent animate-pulse mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 carpet-texture opacity-15 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                <Inbox className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mt-6">{tx.emptyTitle}</h2>
              <p className="font-body text-sm text-muted-foreground mt-3 max-w-md leading-relaxed">{tx.emptyDesc}</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link
                  to="/ai-assistant"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition shadow-lg shadow-accent/20"
                >
                  <Sparkles className="w-4 h-4" />
                  {tx.planAi}
                  <Arrow className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/tours"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gold/40 text-foreground hover:bg-gold/10 text-sm font-semibold transition"
                >
                  <Compass className="w-4 h-4 text-gold" />
                  {tx.browse}
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filtered.map((r) => (
              <RequestCard
                key={r.id}
                request={mapToCard(r)}
                onOpen={(req) => navigate(`/profile/requests/${req.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
