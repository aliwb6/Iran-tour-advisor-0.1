import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Search, Star, MapPin, Globe, SlidersHorizontal, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuides } from '@/hooks/useSupabase';
import FilterDropdown from '@/components/ui/FilterDropdown';

// Fallback local data (only if Supabase returns nothing)
import { guides as localGuides } from '@/data/guides';

const ALL_CITIES = [
  { key: 'all',          en: 'All Cities',   fa: 'همه شهرها',  ar: 'كل المدن' },
  { key: 'Tehran',       en: 'Tehran',       fa: 'تهران',       ar: 'طهران' },
  { key: 'Isfahan',      en: 'Isfahan',      fa: 'اصفهان',      ar: 'أصفهان' },
  { key: 'Shiraz',       en: 'Shiraz',       fa: 'شیراز',       ar: 'شيراز' },
  { key: 'Yazd',         en: 'Yazd',         fa: 'یزد',         ar: 'يزد' },
  { key: 'Mashhad',      en: 'Mashhad',      fa: 'مشهد',        ar: 'مشهد' },
  { key: 'Tabriz',       en: 'Tabriz',       fa: 'تبریز',       ar: 'تبريز' },
  { key: 'Kerman',       en: 'Kerman',       fa: 'کرمان',       ar: 'كرمان' },
  { key: 'Kashan',       en: 'Kashan',       fa: 'کاشان',       ar: 'كاشان' },
  { key: 'Rasht',        en: 'Rasht',        fa: 'رشت',         ar: 'رشت' },
  { key: 'Qom',          en: 'Qom',          fa: 'قم',          ar: 'قم' },
  { key: 'Hamadan',      en: 'Hamadan',      fa: 'همدان',       ar: 'همدان' },
  { key: 'Ahvaz',        en: 'Ahvaz',        fa: 'اهواز',       ar: 'الأهواز' },
  { key: 'Urmia',        en: 'Urmia',        fa: 'ارومیه',      ar: 'أورمية' },
  { key: 'Ardabil',      en: 'Ardabil',      fa: 'اردبیل',      ar: 'أردبيل' },
  { key: 'Bandar Abbas', en: 'Bandar Abbas', fa: 'بندرعباس',    ar: 'بندر عباس' },
  { key: 'Sari',         en: 'Sari',         fa: 'ساری',        ar: 'ساري' },
  { key: 'Qazvin',       en: 'Qazvin',       fa: 'قزوین',       ar: 'قزوين' },
  { key: 'Zanjan',       en: 'Zanjan',       fa: 'زنجان',       ar: 'زنجان' },
  { key: 'Gorgan',       en: 'Gorgan',       fa: 'گرگان',       ar: 'گرگان' },
  { key: 'Khorramabad',  en: 'Khorramabad',  fa: 'خرم‌آباد',    ar: 'خرم آباد' },
  { key: 'Sanandaj',     en: 'Sanandaj',     fa: 'سنندج',       ar: 'سنندج' },
  { key: 'Bushehr',      en: 'Bushehr',      fa: 'بوشهر',       ar: 'بوشهر' },
  { key: 'Semnan',       en: 'Semnan',       fa: 'سمنان',       ar: 'سمنان' },
  { key: 'Arak',         en: 'Arak',         fa: 'اراک',        ar: 'أراك' },
  { key: 'Dezful',       en: 'Dezful',       fa: 'دزفول',       ar: 'دزفول' },
  { key: 'Zahedan',      en: 'Zahedan',      fa: 'زاهدان',      ar: 'زاهدان' },
  { key: 'Karaj',        en: 'Karaj',        fa: 'کرج',         ar: 'كرج' },
  { key: 'Ilam',         en: 'Ilam',         fa: 'ایلام',       ar: 'إيلام' },
  { key: 'Birjand',      en: 'Birjand',      fa: 'بیرجند',      ar: 'بيرجند' },
];

const LANGUAGE_OPTIONS = [
  { key: 'all',      en: 'All Languages', fa: 'همه زبان‌ها',  ar: 'كل اللغات' },
  { key: 'English',  en: 'English',       fa: 'انگلیسی',      ar: 'الإنجليزية' },
  { key: 'Arabic',   en: 'Arabic',        fa: 'عربی',          ar: 'العربية' },
  { key: 'French',   en: 'French',        fa: 'فرانسوی',      ar: 'الفرنسية' },
  { key: 'German',   en: 'German',        fa: 'آلمانی',        ar: 'الألمانية' },
  { key: 'Spanish',  en: 'Spanish',       fa: 'اسپانیایی',    ar: 'الإسبانية' },
  { key: 'Italian',  en: 'Italian',       fa: 'ایتالیایی',    ar: 'الإيطالية' },
  { key: 'Chinese',  en: 'Chinese',       fa: 'چینی',          ar: 'الصينية' },
  { key: 'Russian',  en: 'Russian',       fa: 'روسی',          ar: 'الروسية' },
  { key: 'Japanese', en: 'Japanese',      fa: 'ژاپنی',         ar: 'اليابانية' },
  { key: 'Turkish',  en: 'Turkish',       fa: 'ترکی',          ar: 'التركية' },
];

const SPECIALTY_OPTIONS = [
  { key: 'all',          en: 'All Specialties',    fa: 'همه تخصص‌ها',      ar: 'كل التخصصات' },
  { key: 'history',      en: 'History & Heritage', fa: 'تاریخ و میراث',    ar: 'التاريخ والتراث' },
  { key: 'architecture', en: 'Architecture',       fa: 'معماری',            ar: 'العمارة' },
  { key: 'nature',       en: 'Nature & Eco',       fa: 'طبیعت',             ar: 'الطبيعة' },
  { key: 'food',         en: 'Food & Culinary',    fa: 'غذا',               ar: 'الطهي' },
  { key: 'photography',  en: 'Photography',        fa: 'عکاسی',             ar: 'التصوير' },
  { key: 'desert',       en: 'Desert & Adventure', fa: 'کویر',              ar: 'الصحراء' },
  { key: 'spiritual',    en: 'Spiritual & Religious', fa: 'معنوی',          ar: 'ديني' },
  { key: 'business',     en: 'Business Travel',    fa: 'سفر تجاری',        ar: 'أعمال' },
];

const DEFAULT_FILTERS = { city: 'all', language: 'all', specialty: 'all' };

export default function Guides() {
  const { t, dir, lang } = useI18n();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const navigate = useNavigate();

  // Prefer Supabase data (already filters is_approved: true in the hook)
  const { guides: supabaseGuides, loading } = useGuides();

  // Use Supabase guides if available, otherwise fallback to local verified guides only
  const allGuides = supabaseGuides.length > 0
    ? supabaseGuides
    : localGuides.filter(g => g.is_verified === true);

  const hasActive = filters.city !== 'all' || filters.language !== 'all' || filters.specialty !== 'all';
  const reset = () => setFilters(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    return allGuides.filter(g => {
      const cityVal = typeof g.city === 'object' ? (g.city[lang] || g.city.en) : (g.city || '');
      const nameVal = g.full_name || g.name || '';
      const bioVal = typeof g.bio === 'object' ? (g.bio[lang] || g.bio.en || '') : (g.bio || '');

      if (search && !nameVal.toLowerCase().includes(search.toLowerCase()) &&
          !cityVal.toLowerCase().includes(search.toLowerCase()) &&
          !bioVal.toLowerCase().includes(search.toLowerCase())) return false;

      if (filters.city !== 'all' && !cityVal.toLowerCase().includes(filters.city.toLowerCase())) return false;

      if (filters.language !== 'all') {
        const guideLanguages = Array.isArray(g.languages)
          ? (typeof g.languages[0] === 'object' ? (g.languages[0][lang] || []) : g.languages)
          : [];
        const langMatch = guideLanguages.some(l =>
          (typeof l === 'string' ? l : (l.en || '')).toLowerCase().includes(filters.language.toLowerCase())
        );
        if (!langMatch) return false;
      }

      if (filters.specialty !== 'all') {
        const specs = Array.isArray(g.specialties)
          ? (typeof g.specialties[0] === 'object' ? (g.specialties[lang] || g.specialties.en || []) : g.specialties)
          : (g.specialty ? [g.specialty] : []);
        const specMatch = specs.some(s =>
          (typeof s === 'string' ? s : '').toLowerCase().includes(filters.specialty.toLowerCase())
        );
        if (!specMatch) return false;
      }

      return true;
    });
  }, [allGuides, search, filters, lang]);

  return (
    <div dir={dir} className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-foreground mb-4">
            {t('guides_title')}
          </h1>
          <p className="font-body text-muted-foreground max-w-xl text-lg mb-8">
            {t('guides_subtitle')}
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'fa' ? 'جستجو بر اساس نام، شهر یا تخصص...' : lang === 'ar' ? 'البحث بالاسم أو المدينة...' : 'Search by name, city, or specialty...'}
              className={`w-full ${dir === 'rtl' ? 'pe-11 ps-4' : 'ps-11 pe-4'} py-3 bg-secondary rounded-xl font-body text-sm border border-border/50 focus:border-accent/50 outline-none transition-colors`}
            />
          </div>
        </motion.div>

        {/* Filter bar — same pattern as TourFilters */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-accent/50 text-sm tracking-widest">✦ ❋ ✦</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/[0.03] via-card/80 to-gold/[0.03] border border-border/40 backdrop-blur-sm" />
            <div className="relative flex flex-wrap gap-3 p-4">
              <FilterDropdown
                label={lang === 'fa' ? 'شهر' : lang === 'ar' ? 'المدينة' : 'City'}
                value={filters.city}
                options={ALL_CITIES}
                onChange={(v) => setFilters(f => ({ ...f, city: v }))}
                lang={lang}
                icon={MapPin}
              />
              <FilterDropdown
                label={lang === 'fa' ? 'زبان' : lang === 'ar' ? 'اللغة' : 'Language'}
                value={filters.language}
                options={LANGUAGE_OPTIONS}
                onChange={(v) => setFilters(f => ({ ...f, language: v }))}
                lang={lang}
                icon={Globe}
              />
              <FilterDropdown
                label={lang === 'fa' ? 'تخصص' : lang === 'ar' ? 'التخصص' : 'Specialty'}
                value={filters.specialty}
                options={SPECIALTY_OPTIONS}
                onChange={(v) => setFilters(f => ({ ...f, specialty: v }))}
                lang={lang}
                icon={SlidersHorizontal}
              />
              <div className="flex items-center gap-3 ms-auto self-center px-2">
                <span className="font-body text-sm text-muted-foreground whitespace-nowrap">
                  <span className="text-foreground font-semibold">{filtered.length}</span>
                  {lang === 'fa' ? ' راهنما' : lang === 'ar' ? ' مرشد' : ' guides'}
                </span>
                {hasActive && (
                  <button onClick={reset} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-body border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all">
                    <X className="w-3 h-3" />
                    {lang === 'fa' ? 'پاک کردن' : lang === 'ar' ? 'مسح' : 'Clear'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-accent/30 text-xs">◆</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </div>

        {/* Guide Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-border flex items-center justify-center">
              <span className="text-3xl text-accent/40">❋</span>
            </div>
            <p className="font-heading text-2xl text-muted-foreground font-light">
              {lang === 'fa' ? 'راهنمایی با این مشخصات یافت نشد' : lang === 'ar' ? 'لا يوجد مرشدون بهذه المعايير' : 'No guides match these filters'}
            </p>
            <button onClick={reset} className="mt-4 text-sm font-body text-accent hover:underline">
              {lang === 'fa' ? 'پاک کردن فیلترها' : lang === 'ar' ? 'مسح الفلاتر' : 'Clear all filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((guide, i) => {
              const cityVal = typeof guide.city === 'object' ? (guide.city[lang] || guide.city.en) : (guide.city || '');
              const nameVal = guide.full_name || guide.name || '';
              const bioVal = typeof guide.bio === 'object' ? (guide.bio[lang] || guide.bio.en || '') : (guide.bio || '');
              const specs = Array.isArray(guide.specialties)
                ? (typeof guide.specialties[0] === 'object' ? (guide.specialties[lang] || guide.specialties.en || []) : guide.specialties)
                : (guide.specialty ? [guide.specialty] : []);

              return (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/guides/${guide.slug || guide.id}`)}
                  className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg hover:border-gold/30 transition-all duration-300 cursor-pointer"
                >
                  {/* Avatar & Name — DO NOT MODIFY THIS BLOCK */}
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={guide.photo || guide.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameVal)}&background=random`}
                      alt={nameVal}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gold/30 flex-shrink-0"
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameVal)}&background=C9A84C&color=fff`; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h3 className="font-heading text-lg font-semibold text-foreground truncate">{nameVal}</h3>
                        {(guide.is_approved || guide.is_verified) && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-body font-medium border border-emerald-500/20 flex-shrink-0">
                            ✓ {lang === 'fa' ? 'تأیید شده' : lang === 'ar' ? 'موثق' : 'Verified'}
                          </span>
                        )}
                      </div>
                      <p className="font-body text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {cityVal}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  {guide.rating > 0 && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Star className="w-4 h-4 text-gold fill-gold" />
                      <span className="font-body text-sm font-semibold">{Number(guide.rating).toFixed(1)}</span>
                      {guide.reviews > 0 && <span className="font-body text-xs text-muted-foreground">({guide.reviews} {t('guides_reviews')})</span>}
                    </div>
                  )}

                  {/* Bio */}
                  {bioVal && (
                    <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-4">{bioVal}</p>
                  )}

                  {/* Specialties */}
                  {specs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {specs.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-body">{s}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
