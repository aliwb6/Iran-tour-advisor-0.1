import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, ShieldCheck, Building2, MapPin, Globe, Briefcase } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';
import { useAgencies } from '@/hooks/useSupabase';
import { avatarFor } from '@/lib/avatar';
import FilterDropdown from '@/components/ui/FilterDropdown';

// ── Filter catalogs ────────────────────────────────────────────────────────────

const CITY_OPTIONS = [
  { key: 'all',          en: 'All Cities',    fa: 'همه شهرها',   ar: 'كل المدن' },
  { key: 'Tehran',       en: 'Tehran',        fa: 'تهران',        ar: 'طهران' },
  { key: 'Isfahan',      en: 'Isfahan',       fa: 'اصفهان',       ar: 'أصفهان' },
  { key: 'Shiraz',       en: 'Shiraz',        fa: 'شیراز',        ar: 'شيراز' },
  { key: 'Mashhad',      en: 'Mashhad',       fa: 'مشهد',         ar: 'مشهد' },
  { key: 'Tabriz',       en: 'Tabriz',        fa: 'تبریز',        ar: 'تبريز' },
  { key: 'Yazd',         en: 'Yazd',          fa: 'یزد',          ar: 'يزد' },
  { key: 'Kerman',       en: 'Kerman',        fa: 'کرمان',        ar: 'كرمان' },
  { key: 'Kashan',       en: 'Kashan',        fa: 'کاشان',        ar: 'كاشان' },
  { key: 'Rasht',        en: 'Rasht',         fa: 'رشت',          ar: 'رشت' },
  { key: 'Qom',          en: 'Qom',           fa: 'قم',           ar: 'قم' },
];

const LANGUAGE_OPTIONS = [
  { key: 'all',     en: 'All Languages', fa: 'همه زبان‌ها',  ar: 'كل اللغات' },
  { key: 'english', en: 'English',       fa: 'انگلیسی',      ar: 'الإنجليزية' },
  { key: 'arabic',  en: 'Arabic',        fa: 'عربی',         ar: 'العربية' },
  { key: 'french',  en: 'French',        fa: 'فرانسوی',      ar: 'الفرنسية' },
  { key: 'german',  en: 'German',        fa: 'آلمانی',       ar: 'الألمانية' },
  { key: 'spanish', en: 'Spanish',       fa: 'اسپانیایی',    ar: 'الإسبانية' },
  { key: 'italian', en: 'Italian',       fa: 'ایتالیایی',    ar: 'الإيطالية' },
  { key: 'russian', en: 'Russian',       fa: 'روسی',         ar: 'الروسية' },
  { key: 'chinese', en: 'Chinese',       fa: 'چینی',         ar: 'الصينية' },
  { key: 'japanese',en: 'Japanese',      fa: 'ژاپنی',        ar: 'اليابانية' },
];

const TOUR_TYPE_OPTIONS = [
  { key: 'all',         en: 'All Types',       fa: 'همه انواع',        ar: 'كل الأنواع' },
  { key: 'cultural',    en: 'Cultural',        fa: 'فرهنگی',           ar: 'ثقافية' },
  { key: 'adventure',   en: 'Adventure',       fa: 'ماجراجویی',        ar: 'مغامرة' },
  { key: 'luxury',      en: 'Luxury',          fa: 'لوکس',             ar: 'فاخرة' },
  { key: 'budget',      en: 'Budget-friendly', fa: 'اقتصادی',          ar: 'اقتصادية' },
  { key: 'photography', en: 'Photography',     fa: 'عکاسی',            ar: 'تصوير' },
  { key: 'academic',    en: 'Academic',        fa: 'علمی',             ar: 'أكاديمية' },
  { key: 'religious',   en: 'Religious',       fa: 'مذهبی',            ar: 'دينية' },
  { key: 'nature',      en: 'Nature',          fa: 'طبیعت‌گردی',       ar: 'طبيعة' },
];

const DEFAULT_FILTERS = { city: 'all', language: 'all', tourType: 'all' };

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((s) => String(s).toLowerCase());
  return String(val).split(/[,·;]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function agencyMatches(a, search, filters) {
  if (search) {
    const q = search.toLowerCase();
    const hay = `${a.full_name || ''} ${a.city || ''} ${a.bio || ''}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (filters.city !== 'all') {
    const city = (a.city || '').toLowerCase();
    if (!city.includes(filters.city.toLowerCase())) return false;
  }
  if (filters.language !== 'all') {
    const langs = parseList(a.languages ?? a.support_languages);
    if (langs.length > 0 && !langs.some((l) => l.includes(filters.language.toLowerCase()))) return false;
  }
  if (filters.tourType !== 'all') {
    const types = parseList(a.tour_types ?? a.specialties ?? a.specialty);
    if (types.length > 0 && !types.some((t) => t.includes(filters.tourType.toLowerCase()))) return false;
  }
  return true;
}

// ── Agency Card ────────────────────────────────────────────────────────────────

function AgencyCard({ agency, lang, onNavigate }) {
  const tourTypes = Array.isArray(agency.tour_types)
    ? agency.tour_types
    : Array.isArray(agency.specialties)
    ? agency.specialties
    : agency.specialty
    ? [agency.specialty]
    : [];
  const licensed = agency.is_licensed || agency.is_approved || agency.is_verified;
  const reviewCount = agency.reviews ?? agency.review_count ?? 0;
  const hasAvatar = !!agency.avatar_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      onClick={() => onNavigate(`/agencies/${agency.id}`)}
      className="bg-card rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-border/40 hover:border-gold/30 group"
    >
      {/* Photo / Logo area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gold/5">
        {hasAvatar ? (
          <img
            src={avatarFor(agency)}
            alt={agency.full_name || ''}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/10 to-gold/5">
            <Building2 className="w-16 h-16 text-gold/40" />
          </div>
        )}
        {/* City badge */}
        {agency.city && (
          <span className="absolute top-3 start-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
            <MapPin className="w-3 h-3 text-gold" />
            {agency.city}
          </span>
        )}
        {/* Licensed badge */}
        {licensed && (
          <span className="absolute top-3 end-3 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-medium">
            <ShieldCheck className="w-3 h-3" />
            {lang === 'fa' ? 'مجاز' : lang === 'ar' ? 'معتمد' : 'Licensed'}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-foreground truncate mb-1">
          {agency.full_name || (lang === 'fa' ? 'آژانس' : 'Agency')}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`w-3.5 h-3.5 ${
                  n <= Math.round(agency.rating ?? 0)
                    ? 'fill-gold text-gold'
                    : 'fill-border text-border'
                }`}
              />
            ))}
          </div>
          {agency.rating != null && (
            <span className="font-body text-sm font-semibold text-foreground">{Number(agency.rating).toFixed(1)}</span>
          )}
          <span className="font-body text-xs text-muted-foreground">
            · {reviewCount} {lang === 'fa' ? 'نظر' : lang === 'ar' ? 'تقييم' : 'Reviews'}
          </span>
        </div>

        {/* Bio excerpt */}
        {agency.bio && (
          <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {agency.bio}
          </p>
        )}

        {/* Tour type tags */}
        {tourTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tourTypes.slice(0, 3).map((s, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-[11px] font-body font-medium bg-gold/10 text-gold border border-gold/20"
              >
                {s}
              </span>
            ))}
            {tourTypes.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-body text-muted-foreground bg-muted">
                +{tourTypes.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Agencies() {
  const { dir, lang } = useI18n();
  const navigate = useNavigate();
  const { agencies, loading, error } = useAgencies();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => agencies.filter((a) => agencyMatches(a, search, filters)),
    [agencies, search, filters]
  );

  const hasActive = filters.city !== 'all' || filters.language !== 'all' || filters.tourType !== 'all' || search !== '';

  const tx = {
    title:    lang === 'fa' ? 'آژانس‌های مسافرتی' : lang === 'ar' ? 'وكالات السفر'         : 'Travel Agencies',
    subtitle: lang === 'fa' ? 'آژانس‌های رسمی و مورد اعتماد ایران برای سفر مرفه و آسوده' : lang === 'ar' ? 'وكالات إيرانية موثوقة ومرخصة لسفر مريح وسلس' : 'Trusted, licensed Iranian agencies for an effortless journey',
    search:   lang === 'fa' ? 'جستجو در آژانس‌ها...' : lang === 'ar' ? 'ابحث في الوكالات...' : 'Search agencies by name or city...',
    loading:  lang === 'fa' ? 'در حال بارگذاری آژانس‌ها...' : lang === 'ar' ? 'جار تحميل الوكالات...' : 'Loading agencies...',
    error:    lang === 'fa' ? 'بارگذاری آژانس‌ها با خطا مواجه شد' : lang === 'ar' ? 'فشل تحميل الوكالات' : 'Failed to load agencies',
    empty:    lang === 'fa' ? 'آژانسی با این فیلترها یافت نشد' : lang === 'ar' ? 'لا توجد وكالات بهذه الفلاتر' : 'No agencies match these filters',
    results:  (n) => lang === 'fa' ? `${n} آژانس یافت شد` : lang === 'ar' ? `${n} وكالة` : `${n} agenc${n === 1 ? 'y' : 'ies'} found`,
    clearAll: lang === 'fa' ? 'پاک کردن فیلترها' : lang === 'ar' ? 'مسح الفلاتر' : 'Clear all filters',
    cityLabel:    lang === 'fa' ? 'شهر' : lang === 'ar' ? 'المدينة' : 'City',
    langLabel:    lang === 'fa' ? 'زبان' : lang === 'ar' ? 'اللغة' : 'Language',
    typeLabel:    lang === 'fa' ? 'نوع تور' : lang === 'ar' ? 'نوع الجولة' : 'Tour Type',
  };

  return (
    <div dir={dir} className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-accent/40 text-sm tracking-[0.3em]">✦ ◆ ✦</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-foreground mb-4">
            {tx.title}
          </h1>
          <p className="font-body text-muted-foreground max-w-xl text-lg">
            {tx.subtitle}
          </p>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          {/* Persian ornamental top border */}
          <div className="carpet-border mb-4 opacity-40" />

          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm">
            {/* Search + dropdowns row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tx.search}
                  className="w-full ps-9 pe-4 py-3 rounded-xl border border-border/50 bg-background/60 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition"
                />
              </div>

              {/* Dropdowns */}
              <FilterDropdown
                label={tx.cityLabel}
                value={filters.city}
                options={CITY_OPTIONS}
                onChange={(v) => setFilters((f) => ({ ...f, city: v }))}
                lang={lang}
                icon={MapPin}
              />
              <FilterDropdown
                label={tx.langLabel}
                value={filters.language}
                options={LANGUAGE_OPTIONS}
                onChange={(v) => setFilters((f) => ({ ...f, language: v }))}
                lang={lang}
                icon={Globe}
              />
              <FilterDropdown
                label={tx.typeLabel}
                value={filters.tourType}
                options={TOUR_TYPE_OPTIONS}
                onChange={(v) => setFilters((f) => ({ ...f, tourType: v }))}
                lang={lang}
                icon={Briefcase}
              />
            </div>

            {/* Active filter summary row */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
              <p className="font-body text-xs text-muted-foreground/70">
                {tx.results(filtered.length)}
              </p>
              {hasActive && (
                <button
                  onClick={() => { setFilters(DEFAULT_FILTERS); setSearch(''); }}
                  className="font-body text-xs text-accent hover:underline"
                >
                  {tx.clearAll}
                </button>
              )}
            </div>
          </div>

          {/* Persian ornamental bottom border */}
          <div className="carpet-border mt-4 opacity-40" />
        </motion.div>

        {/* States */}
        {loading ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-border flex items-center justify-center animate-pulse">
              <span className="text-3xl text-accent/40">❋</span>
            </div>
            <p className="font-heading text-xl text-muted-foreground font-light">{tx.loading}</p>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-destructive/40 flex items-center justify-center">
              <span className="text-3xl text-destructive/60">!</span>
            </div>
            <p className="font-heading text-2xl text-muted-foreground font-light">{tx.error}</p>
            <p className="font-body text-sm text-destructive mt-2">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-border flex items-center justify-center">
              <span className="text-3xl text-accent/40">❋</span>
            </div>
            <p className="font-heading text-2xl text-muted-foreground font-light">{tx.empty}</p>
            <button
              onClick={() => { setFilters(DEFAULT_FILTERS); setSearch(''); }}
              className="mt-4 text-sm font-body text-accent hover:underline"
            >
              {tx.clearAll}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filtered.map((agency) => (
              <AgencyCard key={agency.id} agency={agency} lang={lang} onNavigate={navigate} />
            ))}
          </motion.div>
        )}

        {/* Bottom Persian carpet border */}
        {!loading && !error && filtered.length > 0 && (
          <div className="mt-16 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-accent/40 text-2xl">✦ ❋ ✦</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
