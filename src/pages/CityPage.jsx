import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map as MapIcon, User, Landmark, BookOpen, Sparkles,
  Search, ArrowRight, ArrowLeft, ArrowUpRight,
  Clock, DollarSign, Star, Languages, MessageCircle, Compass,
  Calendar, Plane, Info,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';
import { supabase } from '@/supabaseClient';
import { avatarFor } from '@/lib/avatar';

// ── City catalog ─────────────────────────────────────────────────────────────
// Keys are the lowercase URL slugs. Each entry carries English copy from the
// spec; FA / AR labels are kept short and inline so the page localises with the
// rest of the site without growing i18n.jsx.
const cityData = {
  isfahan: {
    name: 'Isfahan',
    nameI18n: { fa: 'اصفهان', ar: 'أصفهان' },
    category: 'Architecture & History',
    image: '/images/isfahan.jpg',
    description:
      "Known as 'Half of the World', Isfahan dazzles visitors with its stunning Islamic architecture, turquoise-domed mosques, and the magnificent Naqsh-e Jahan Square — a UNESCO World Heritage Site.",
    highlights: ['Naqsh-e Jahan Square', 'Sheikh Lotfollah Mosque', 'Si-o-Se Pol Bridge', 'Armenian Quarter'],
    bestTime: 'March – May & September – November',
  },
  shiraz: {
    name: 'Shiraz',
    nameI18n: { fa: 'شیراز', ar: 'شيراز' },
    category: 'History & Poetry',
    image: '/images/shiraz.jpg',
    description:
      "The city of poets, roses, and wine. Shiraz is home to Persepolis — the ancient capital of the Persian Empire — and the tombs of legendary Persian poets Hafez and Sa'di.",
    highlights: ['Persepolis', 'Tomb of Hafez', 'Nasir ol-Molk Mosque', 'Eram Garden'],
    bestTime: 'March – May (spring blossoms)',
  },
  yazd: {
    name: 'Yazd',
    nameI18n: { fa: 'یزد', ar: 'يزد' },
    category: 'Culture & Desert',
    image: '/images/yazd.jpg',
    description:
      "A living museum of Persian culture. Yazd's ancient mud-brick architecture, wind towers, and Zoroastrian fire temples make it one of the oldest continuously inhabited cities in the world.",
    highlights: ['Jameh Mosque of Yazd', 'Towers of Silence', 'Zoroastrian Fire Temple', 'Amir Chakhmaq Complex'],
    bestTime: 'October – April (cooler desert season)',
  },
  mashhad: {
    name: 'Mashhad',
    nameI18n: { fa: 'مشهد', ar: 'مشهد' },
    category: 'Spiritual & Cultural',
    image: '/images/mashhad.jpg',
    description:
      "Iran's holiest city and spiritual heart. The magnificent shrine of Imam Reza draws millions of pilgrims annually, surrounded by museums, bazaars, and beautiful gardens.",
    highlights: ['Imam Reza Shrine', 'Goharshad Mosque', 'Mellat Park', 'Khorasan Museum'],
    bestTime: 'April – October',
  },
  gilan: {
    name: 'Gilan',
    nameI18n: { fa: 'گیلان', ar: 'جيلان' },
    category: 'Nature & Forest',
    image: '/images/Gilan.jpg',
    description:
      "Iran's lush green paradise. Gilan's misty forests, rice paddies, and Caspian coastline offer a dramatic contrast to Iran's desert interior — perfect for nature lovers.",
    highlights: ['Masuleh Village', 'Anzali Lagoon', 'Rudkhan Castle', 'Rasht Bazaar'],
    bestTime: 'May – September',
  },
  lorestan: {
    name: 'Lorestan',
    nameI18n: { fa: 'لرستان', ar: 'لرستان' },
    category: 'Adventure & Nature',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
    description:
      "Iran's adventure capital. Lorestan's dramatic Zagros mountains, ancient caves, and roaring rivers make it a paradise for trekkers, climbers, and those seeking Iran's wild side.",
    highlights: ['Bisheh Waterfall', 'Falak-ol-Aflak Castle', 'Khorramabad River', 'Zagros Mountains'],
    bestTime: 'April – June & September – October',
  },
};

// ── Mock data (shown only when Supabase has no matching rows yet) ────────────
const MOCK_TOURS = [
  { id: 'mt1', title: 'Cultural Heritage Tour', duration: 5, price: 890, image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600' },
  { id: 'mt2', title: 'Persian Poetry & Gardens', duration: 4, price: 720, image: 'https://images.unsplash.com/photo-1582550945154-660d3ea7b1a8?w=600' },
  { id: 'mt3', title: 'Architecture Photography', duration: 6, price: 1080, image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600' },
];

const MOCK_GUIDES = [
  { id: 'mg1', full_name: 'Reza Hosseini', languages: 'Persian, English', rating: 4.9 },
  { id: 'mg2', full_name: 'Maryam Tehrani', languages: 'Persian, English, French', rating: 4.8 },
  { id: 'mg3', full_name: 'Ali Karimi', languages: 'Persian, Arabic, English', rating: 4.95 },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CityPage() {
  const { citySlug } = useParams();
  const navigate = useNavigate();
  const { lang, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const slug = String(citySlug || '').toLowerCase();
  const city = cityData[slug];

  const [tab, setTab] = useState('tours');
  const [query, setQuery] = useState('');
  const [tours, setTours] = useState([]);
  const [guides, setGuides] = useState([]);
  const [usingMockTours, setUsingMockTours] = useState(false);
  const [usingMockGuides, setUsingMockGuides] = useState(false);

  // Best-effort Supabase fetches scoped to the active city. If nothing matches
  // we fall back to MOCK_* so the UI is never empty for travellers exploring
  // this page before content has been authored.
  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    (async () => {
      const [toursRes, guidesRes] = await Promise.all([
        supabase
          .from('tours')
          .select('*')
          .eq('status', 'published')
          .ilike('city', `%${city.name}%`)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url, gender, city, languages, role')
          .in('role', ['guide', 'agency'])
          .ilike('city', `%${city.name}%`)
          .limit(3),
      ]);
      if (cancelled) return;
      const realTours = toursRes.data || [];
      const realGuides = guidesRes.data || [];
      setTours(realTours.length ? realTours : MOCK_TOURS);
      setUsingMockTours(realTours.length === 0);
      setGuides(realGuides.length ? realGuides : MOCK_GUIDES);
      setUsingMockGuides(realGuides.length === 0);
    })();
    return () => { cancelled = true; };
  }, [city]);

  // ── Localised copy ─────────────────────────────────────────────────────────
  const tx = useMemo(() => ({
    notFound:    lang === 'fa' ? 'مقصد یافت نشد' : lang === 'ar' ? 'الوجهة غير موجودة' : 'Destination not found',
    backToHome:  lang === 'fa' ? 'بازگشت به خانه' : lang === 'ar' ? 'العودة إلى الرئيسية' : 'Back to home',
    searchIn:    lang === 'fa' ? `جستجو در ${city?.nameI18n?.fa || city?.name || ''}` : lang === 'ar' ? `ابحث في ${city?.nameI18n?.ar || city?.name || ''}` : `Search in ${city?.name || ''}`,
    tabTours:    lang === 'fa' ? 'تورها' : lang === 'ar' ? 'الجولات' : 'Tours',
    tabGuides:   lang === 'fa' ? 'راهنماها' : lang === 'ar' ? 'المرشدون' : 'Guides',
    tabAttract:  lang === 'fa' ? 'دیدنی‌ها' : lang === 'ar' ? 'الأماكن' : 'Attractions',
    tabAbout:    lang === 'fa' ? 'درباره' : lang === 'ar' ? 'حول' : 'About',
    tabAi:       lang === 'fa' ? 'برنامه‌ریزی با هوش' : lang === 'ar' ? 'خطط مع AI' : 'Plan with AI',
    viewPackage: lang === 'fa' ? 'مشاهده پکیج' : lang === 'ar' ? 'عرض الباقة' : 'View Package',
    contactGuide:lang === 'fa' ? 'تماس با راهنما' : lang === 'ar' ? 'تواصل مع المرشد' : 'Contact Guide',
    fromPrice:   lang === 'fa' ? 'از' : lang === 'ar' ? 'من' : 'from',
    days:        lang === 'fa' ? 'روز' : lang === 'ar' ? 'أيام' : 'days',
    mockBanner:  lang === 'fa' ? 'نمونه — به‌زودی محتوای واقعی برای این شهر اضافه می‌شود' : lang === 'ar' ? 'عينة — سيُضاف محتوى حقيقي لهذه المدينة قريباً' : 'Sample — real content for this city is coming soon',
    aiTitle:     lang === 'fa'
      ? `با هوش مصنوعی، تجربه‌ای کامل از ${city?.nameI18n?.fa || ''} بساز`
      : lang === 'ar'
      ? `خطّط تجربتك المثالية في ${city?.nameI18n?.ar || ''} مع الذكاء الاصطناعي`
      : `Chat with our AI to plan your perfect ${city?.name || ''} experience`,
    aiSub:       lang === 'fa' ? 'بگو چه می‌خواهی — مساعد ما همه‌چیز را برایت آماده می‌کند.' : lang === 'ar' ? 'أخبرنا بما تريد — سيتولى مساعدنا الباقي.' : 'Tell us what you love — our assistant handles the rest.',
    openAi:      lang === 'fa' ? 'باز کردن دستیار هوش مصنوعی' : lang === 'ar' ? 'افتح مساعد الذكاء الاصطناعي' : 'Open AI Assistant',
    travelTips:  lang === 'fa' ? 'نکات سفر' : lang === 'ar' ? 'نصائح السفر' : 'Travel Tips',
    bestTime:    lang === 'fa' ? 'بهترین زمان سفر' : lang === 'ar' ? 'أفضل وقت للزيارة' : 'Best time to visit',
    gettingThere:lang === 'fa' ? 'دسترسی' : lang === 'ar' ? 'الوصول' : 'Getting there',
    gettingThereVal: lang === 'fa' ? 'پرواز داخلی، اتوبوس بین‌شهری یا قطار از تهران' : lang === 'ar' ? 'رحلة داخلية أو حافلة أو قطار من طهران' : 'Domestic flight, intercity bus, or train from Tehran',
    knowBefore:  lang === 'fa' ? 'پیش از سفر' : lang === 'ar' ? 'قبل السفر' : 'Good to know',
    knowBeforeVal: lang === 'fa' ? 'احترام به پوشش محلی، با راهنمای مجاز سفر کن، اینترنت محدود است.' : lang === 'ar' ? 'احترم اللباس المحلي، سافر مع مرشد مرخص، الإنترنت محدود.' : 'Respect local dress codes, travel with a licensed guide, internet access can be limited.',
    noResults:   lang === 'fa' ? 'نتیجه‌ای یافت نشد' : lang === 'ar' ? 'لا توجد نتائج' : 'No results',
  }), [lang, city]);

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!city) {
    return (
      <div dir={dir} className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <h1 className="font-heading text-3xl font-semibold text-foreground mb-3">{tx.notFound}</h1>
        <p className="font-body text-sm text-muted-foreground mb-6">/{slug}</p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition">
          <Arrow className="w-4 h-4 rotate-180" />
          {tx.backToHome}
        </Link>
      </div>
    );
  }

  const localName = city.nameI18n?.[lang] || city.name;

  // Search filtering — applied per tab.
  const q = query.trim().toLowerCase();
  const filteredTours      = !q ? tours      : tours.filter((t) => String(t.title || '').toLowerCase().includes(q));
  const filteredGuides     = !q ? guides     : guides.filter((g) => String(g.full_name || '').toLowerCase().includes(q));
  const filteredHighlights = !q ? city.highlights : city.highlights.filter((h) => h.toLowerCase().includes(q));

  const TABS = [
    { id: 'tours',       label: tx.tabTours,    icon: MapIcon },
    { id: 'guides',      label: tx.tabGuides,   icon: User },
    { id: 'attractions', label: tx.tabAttract,  icon: Landmark },
    { id: 'about',       label: tx.tabAbout,    icon: BookOpen },
    { id: 'ai',          label: tx.tabAi,       icon: Sparkles },
  ];

  return (
    <div dir={dir} className="min-h-screen bg-background">
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative h-[460px] sm:h-[520px] overflow-hidden">
        <img src={city.image} alt={localName} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-navy/70 to-navy/35" />
        <div className="absolute inset-0 carpet-texture opacity-25" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-full flex items-end pb-12 sm:pb-14 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 max-w-2xl"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[10px] font-semibold uppercase tracking-wider text-white mb-4">
              <span className="w-1 h-1 rounded-full bg-gold" />
              {city.category}
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-4">
              {localName}
            </h1>
            <p className="font-body text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
              {city.description}
            </p>
          </motion.div>

          {/* Search bar (lg:right side of hero, sits below on smaller screens) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="hidden lg:block w-[320px] ms-6"
          >
            <div className="relative">
              <Search className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-white/60" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tx.searchIn}
                className="w-full bg-white/15 backdrop-blur-xl border border-white/25 rounded-full ps-11 pe-4 py-3 text-white placeholder:text-white/55 text-sm focus:outline-none focus:bg-white/20 focus:border-gold/50 transition"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile/tablet search bar (under hero) */}
      <div className="lg:hidden max-w-7xl mx-auto px-5 sm:px-8 -mt-8 relative z-20">
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tx.searchIn}
            className="w-full bg-card border border-border/60 rounded-full ps-11 pe-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-accent transition shadow-md"
          />
        </div>
      </div>

      {/* ── Sticky tabs ─────────────────────────────────────────────────────── */}
      <div className="sticky top-[64px] z-30 bg-background/85 backdrop-blur-xl border-b border-border/40 mt-8 lg:mt-0">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <nav className="flex gap-1 overflow-x-auto no-scrollbar" role="tablist">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    if (t.id === 'ai') {
                      navigate(`/ai-assistant?city=${encodeURIComponent(city.name)}`);
                      return;
                    }
                    setTab(t.id);
                  }}
                  className={`relative flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'text-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                  {active && (
                    <motion.span
                      layoutId="city-tab-underline"
                      className="absolute inset-x-2 bottom-0 h-0.5 bg-gold rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10 lg:py-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'tours' && (
              <TourGrid
                tours={filteredTours}
                cityName={city.name}
                isMock={usingMockTours}
                tx={tx}
                Arrow={Arrow}
                noResults={q && filteredTours.length === 0}
              />
            )}

            {tab === 'guides' && (
              <GuideGrid
                guides={filteredGuides}
                cityName={city.name}
                isMock={usingMockGuides}
                tx={tx}
                noResults={q && filteredGuides.length === 0}
              />
            )}

            {tab === 'attractions' && (
              <AttractionsGrid highlights={filteredHighlights} cityImage={city.image} cityName={localName} q={q} tx={tx} />
            )}

            {tab === 'about' && (
              <AboutPanel city={city} tx={tx} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* "Plan with AI" content card is always reachable from the bottom of
            the page even when the user is on another tab. */}
        {tab !== 'ai' && (
          <PlanWithAiCard cityName={city.name} navigate={navigate} tx={tx} />
        )}
      </main>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function NoResults({ tx }) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <p className="font-body text-sm">{tx.noResults}</p>
    </div>
  );
}

function MockBanner({ tx }) {
  return (
    <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-[11px]">
      <Info className="w-3.5 h-3.5" />
      {tx.mockBanner}
    </div>
  );
}

function TourGrid({ tours, cityName, isMock, tx, Arrow, noResults }) {
  if (noResults) return <NoResults tx={tx} />;
  return (
    <>
      {isMock && <MockBanner tx={tx} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => {
          const img = tour.image_url || tour.image || 'https://images.unsplash.com/photo-1564960723835-2898c9df9297?w=600';
          const title = (tour.title && typeof tour.title === 'object' ? tour.title.en : tour.title) || tour.name || 'Tour';
          const price = tour.price ?? tour.price_from ?? tour.price_usd;
          const href = tour.slug ? `/tours/${tour.slug}` : '/tours';
          return (
            <Link
              key={tour.id}
              to={href}
              className="group block bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-accent/40 hover:shadow-xl transition-all duration-500"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <span className="absolute top-3 start-3 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[10px] font-semibold text-white">
                  {cityName}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-3 group-hover:text-accent transition-colors">{title}</h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {tour.duration ? `${tour.duration} ${tx.days}` : '—'}
                  </span>
                  {price != null && (
                    <span className="flex items-center gap-1 text-accent font-semibold">
                      <DollarSign className="w-3.5 h-3.5" />
                      {tx.fromPrice} {Number(price).toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  {tx.viewPackage}
                  <Arrow className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function GuideGrid({ guides, cityName, isMock, tx, noResults }) {
  if (noResults) return <NoResults tx={tx} />;
  return (
    <>
      {isMock && <MockBanner tx={tx} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide) => {
          const isReal = !String(guide.id).startsWith('mg');
          const rating = guide.rating ?? 4.9;
          return (
            <div
              key={guide.id}
              className="bg-card rounded-3xl border border-border/50 p-6 hover:border-accent/40 hover:shadow-xl transition-all duration-500"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={isReal ? avatarFor(guide) : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(guide.full_name)}&backgroundColor=0d1117&textColor=c9a96e`}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover border-2 border-gold/40 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-heading text-base font-semibold text-foreground truncate">{guide.full_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Compass className="w-3 h-3 text-accent" />
                    {cityName}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-accent" />
                  {guide.languages || '—'}
                </p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-3.5 h-3.5 ${n <= Math.round(rating) ? 'text-gold fill-gold' : 'text-muted-foreground/30'}`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ms-1">{rating.toFixed(1)}</span>
                </div>
              </div>

              <Link
                to={isReal ? `/chat/${guide.id}` : '/guides'}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-accent hover:bg-accent/90 text-white text-sm font-semibold transition"
              >
                <MessageCircle className="w-4 h-4" />
                {tx.contactGuide}
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}

function AttractionsGrid({ highlights, cityImage, cityName, q, tx }) {
  if (q && highlights.length === 0) return <NoResults tx={tx} />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {highlights.map((h, i) => (
        <div
          key={h}
          className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-border/40 hover:border-gold/40 hover:shadow-xl transition-all duration-500"
        >
          <img
            src={`${cityImage}&q=80&sat=-10&blur=${i % 2 === 0 ? 0 : 2}`}
            alt={h}
            className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <span className="absolute top-4 start-4 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[10px] font-semibold text-white">
            #{String(i + 1).padStart(2, '0')}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-[11px] text-white/65 mb-1">{cityName}</p>
            <h3 className="font-heading text-xl font-semibold text-white leading-tight">{h}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}

function AboutPanel({ city, tx }) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-card border border-border/40 rounded-3xl p-6 sm:p-8">
        <p className="font-body text-base text-foreground/85 leading-relaxed mb-6">{city.description}</p>
        <h3 className="font-heading text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
          {tx.tabAttract}
        </h3>
        <ul className="grid sm:grid-cols-2 gap-2.5">
          {city.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2.5 text-sm text-foreground/80">
              <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
              {h}
            </li>
          ))}
        </ul>
      </div>

      <aside className="bg-card border border-border/40 rounded-3xl p-6 sm:p-8 space-y-5">
        <h3 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wider">
          {tx.travelTips}
        </h3>
        <Tip icon={Calendar} label={tx.bestTime} value={city.bestTime} />
        <Tip icon={Plane}    label={tx.gettingThere} value={tx.gettingThereVal} />
        <Tip icon={Info}     label={tx.knowBefore}   value={tx.knowBeforeVal} />
      </aside>
    </div>
  );
}

function Tip({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mb-0.5">{label}</p>
        <p className="text-sm text-foreground/85 leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

function PlanWithAiCard({ cityName, navigate, tx }) {
  return (
    <div className="mt-12 relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-navy/60 via-card to-card p-8 sm:p-10 text-center">
      <div className="absolute -top-20 -end-20 w-60 h-60 rounded-full bg-gold/15 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 mb-4">
          <Sparkles className="w-5 h-5 text-gold" />
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-2.5">
          {tx.aiTitle}
        </h2>
        <p className="font-body text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          {tx.aiSub}
        </p>
        <button
          onClick={() => navigate(`/ai-assistant?city=${encodeURIComponent(cityName)}`)}
          className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gold hover:bg-gold-light text-navy font-body font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-gold/30"
        >
          <Sparkles className="w-4 h-4" />
          {tx.openAi}
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
