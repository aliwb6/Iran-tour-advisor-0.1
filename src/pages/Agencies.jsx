import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, ShieldCheck, Building2, MapPin } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';
import { useAgencies } from '@/hooks/useSupabase';
import { avatarFor } from '@/lib/avatar';
import { supabase } from '@/supabaseClient';
import {
  FiltersShell, FilterSection, MultiSelectChips, SingleSelectChips,
  RatingFilter, ActiveChips,
} from '@/components/filters/FilterPrimitives';
import CityFilterWithOther from '@/components/filters/CityFilterWithOther';
import LanguageFilterWithOther from '@/components/filters/LanguageFilterWithOther';

// ── Filter catalog ───────────────────────────────────────────────────────────
const HQ_CITIES     = ['Tehran', 'Isfahan', 'Shiraz', 'Yazd', 'Mashhad', 'Tabriz'];
const SUPPORT_LANGS = ['English', 'Arabic', 'French', 'German', 'Spanish'];

const YEARS_EXP = (lang) => [
  { value: '1to3', label: lang === 'fa' ? '۱ تا ۳ سال'   : lang === 'ar' ? '1-3 سنوات'  : '1–3 years' },
  { value: '3to7', label: lang === 'fa' ? '۳ تا ۷ سال'   : lang === 'ar' ? '3-7 سنوات'  : '3–7 years' },
  { value: 'gt7',  label: lang === 'fa' ? 'بیش از ۷ سال' : lang === 'ar' ? 'أكثر من 7'  : '7+ years' },
];

const DEFAULT_FILTERS = {
  search: '',
  cities: [],
  tourTypes: [],
  languages: [],
  rating: 0,
  yearsExp: '',
};

function rowMatches(a, f) {
  if (f.search) {
    const q = f.search.toLowerCase();
    const hay = `${a.full_name || ''} ${a.city || ''} ${a.bio || ''}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (f.cities.length > 0) {
    const city = (a.city || '').toLowerCase();
    if (!city || !f.cities.some((c) => city.includes(c.toLowerCase()))) return false;
  }
  if (f.tourTypes.length > 0) {
    const types = parseList(a.tour_types ?? a.specialties);
    if (types.length && !f.tourTypes.some((t) => types.includes(String(t).toLowerCase()))) return false;
  }
  if (f.languages.length > 0) {
    const langs = parseList(a.languages ?? a.support_languages);
    if (langs.length && !f.languages.some((l) => langs.includes(String(l).toLowerCase()))) return false;
  }
  if (f.rating > 0) {
    if (a.rating != null && Number(a.rating) < f.rating) return false;
  }
  if (f.yearsExp) {
    const yrs = a.years_experience ?? a.experience_years;
    if (yrs != null) {
      if (f.yearsExp === '1to3' && !(yrs >= 1 && yrs <= 3)) return false;
      if (f.yearsExp === '3to7' && !(yrs >= 3 && yrs <= 7)) return false;
      if (f.yearsExp === 'gt7'  && !(yrs > 7)) return false;
    }
  }
  return true;
}

function parseList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((s) => String(s).toLowerCase());
  return String(val).split(/[,·;]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
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
  const [dynamicTourTypes, setDynamicTourTypes] = useState([]);

  // Load unique tour types from Supabase
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('tour_types, specialties, specialty')
          .eq('role', 'agency');
        if (data) {
          const all = data.flatMap((a) => {
            if (Array.isArray(a.tour_types)) return a.tour_types;
            if (Array.isArray(a.specialties)) return a.specialties;
            if (a.specialty) return [a.specialty];
            return [];
          });
          setDynamicTourTypes([...new Set(all.map((s) => String(s).trim()).filter(Boolean))]);
        }
      } catch {
        // silently fail
      }
    })();
  }, []);

  const tourTypeOptions = (dynamicTourTypes.length > 0 ? dynamicTourTypes : [
    'Cultural', 'Adventure', 'Luxury', 'Budget-friendly', 'Photography', 'Academic/Research',
  ]).map((s) => ({ value: s, label: s }));

  const update = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const clearAll = () => setFilters(DEFAULT_FILTERS);

  const filtered = useMemo(
    () => agencies.filter((a) => rowMatches(a, filters)),
    [agencies, filters]
  );

  const tx = {
    title:    lang === 'fa' ? 'آژانس‌های مسافرتی' : lang === 'ar' ? 'وكالات السفر'         : 'Travel Agencies',
    subtitle: lang === 'fa' ? 'آژانس‌های رسمی و مورد اعتماد ایران برای سفر مرفه و آسوده' : lang === 'ar' ? 'وكالات إيرانية موثوقة ومرخصة لسفر مريح وسلس' : 'Trusted, licensed Iranian agencies for an effortless journey',
    licensed: lang === 'fa' ? 'دارای مجوز رسمی'      : lang === 'ar' ? 'حاصل على ترخيص'      : 'Officially licensed',
    loading:  lang === 'fa' ? 'در حال بارگذاری آژانس‌ها...' : lang === 'ar' ? 'جار تحميل الوكالات...' : 'Loading agencies...',
    error:    lang === 'fa' ? 'بارگذاری آژانس‌ها با خطا مواجه شد' : lang === 'ar' ? 'فشل تحميل الوكالات' : 'Failed to load agencies',
    empty:    lang === 'fa' ? 'آژانسی با این فیلترها یافت نشد' : lang === 'ar' ? 'لا توجد وكالات بهذه الفلاتر' : 'No agencies match these filters',
    results:  (n) => lang === 'fa' ? `${n} آژانس یافت شد` : lang === 'ar' ? `${n} وكالة` : `${n} agenc${n === 1 ? 'y' : 'ies'} found`,
    section: {
      hq:       lang === 'fa' ? 'شهر دفتر مرکزی' : lang === 'ar' ? 'مدينة المقر'    : 'Headquarters city',
      tourType: lang === 'fa' ? 'نوع تور'         : lang === 'ar' ? 'نوع الجولة'     : 'Tour type',
      langs:    lang === 'fa' ? 'زبان پشتیبانی'    : lang === 'ar' ? 'لغة الدعم'      : 'Support language',
      rating:   lang === 'fa' ? 'امتیاز'           : lang === 'ar' ? 'التقييم'        : 'Rating',
      years:    lang === 'fa' ? 'سال‌های تجربه'    : lang === 'ar' ? 'سنوات الخبرة'   : 'Years of experience',
      licensed: lang === 'fa' ? 'مجوز رسمی'        : lang === 'ar' ? 'الترخيص'        : 'Official license',
    },
  };

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.search) chips.push({ key: 'search', label: `"${filters.search}"`, onRemove: () => update({ search: '' }) });
    filters.cities.forEach((c) => chips.push({ key: `city-${c}`, label: c, onRemove: () => update({ cities: filters.cities.filter((x) => x !== c) }) }));
    filters.tourTypes.forEach((t) => chips.push({ key: `tt-${t}`, label: t, onRemove: () => update({ tourTypes: filters.tourTypes.filter((x) => x !== t) }) }));
    filters.languages.forEach((l) => chips.push({ key: `lang-${l}`, label: l, onRemove: () => update({ languages: filters.languages.filter((x) => x !== l) }) }));
    if (filters.rating > 0) chips.push({ key: 'rating', label: `${filters.rating}+ ★`, onRemove: () => update({ rating: 0 }) });
    if (filters.yearsExp) {
      const opt = YEARS_EXP(lang).find((x) => x.value === filters.yearsExp);
      if (opt) chips.push({ key: 'yrs', label: opt.label, onRemove: () => update({ yearsExp: '' }) });
    }
    return chips;
  }, [filters, lang]);

  const activeCount = activeChips.length;

  return (
    <div dir={dir} className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-foreground mb-4">
            {tx.title}
          </h1>
          <p className="font-body text-muted-foreground max-w-xl text-lg">
            {tx.subtitle}
          </p>
        </motion.div>

        {/* Search bar */}
        <div className="relative mb-8">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder={lang === 'fa' ? 'جستجو در آژانس‌ها...' : lang === 'ar' ? 'ابحث في الوكالات...' : 'Search agencies by name, city, tour type...'}
            className="w-full ps-11 pe-4 py-3 rounded-2xl border border-border bg-card font-body text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition shadow-sm"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <FiltersShell activeCount={activeCount} onClearAll={clearAll}>
            <FilterSection label={tx.section.hq}>
              <CityFilterWithOther
                selectedCities={filters.cities}
                citiesInList={HQ_CITIES}
                onCityChange={(v) => update({ cities: v })}
                placeholder={lang === 'fa' ? 'شهر دیگری را جستجو کنید...' : lang === 'ar' ? 'ابحث عن مدينة أخرى...' : 'Search other cities...'}
              />
            </FilterSection>
            <FilterSection label={tx.section.tourType}>
              <MultiSelectChips options={tourTypeOptions} value={filters.tourTypes} onChange={(v) => update({ tourTypes: v })} />
            </FilterSection>
            <FilterSection label={tx.section.langs}>
              <LanguageFilterWithOther
                selectedLanguages={filters.languages}
                languagesInList={SUPPORT_LANGS}
                onLanguageChange={(v) => update({ languages: v })}
                placeholder={lang === 'fa' ? 'زبان دیگری را جستجو کنید...' : lang === 'ar' ? 'ابحث عن لغة أخرى...' : 'Search other languages...'}
              />
            </FilterSection>
            <FilterSection label={tx.section.rating}>
              <RatingFilter value={filters.rating} onChange={(v) => update({ rating: v })} />
            </FilterSection>
            <FilterSection label={tx.section.years}>
              <SingleSelectChips options={YEARS_EXP(lang)} value={filters.yearsExp} onChange={(v) => update({ yearsExp: v })} />
            </FilterSection>
          </FiltersShell>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <ActiveChips chips={activeChips} />
              <p className="font-body text-sm text-muted-foreground ms-auto">{tx.results(filtered.length)}</p>
            </div>

            {loading ? (
              <p className="font-body text-muted-foreground text-center py-16">{tx.loading}</p>
            ) : error ? (
              <div className="text-center py-16">
                <p className="font-body text-destructive mb-2">{tx.error}</p>
                <p className="font-body text-xs text-muted-foreground">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="font-body text-muted-foreground text-center py-16">{tx.empty}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((agency) => (
                  <AgencyCard key={agency.id} agency={agency} lang={lang} onNavigate={navigate} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
