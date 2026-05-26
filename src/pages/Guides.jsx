import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, ShieldCheck, MapPin } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';
import { useGuides } from '@/hooks/useSupabase';
import { avatarFor } from '@/lib/avatar';
import { supabase } from '@/supabaseClient';
import {
  FiltersShell, FilterSection, MultiSelectChips, SingleSelectChips,
  RatingFilter, PriceRange, ActiveChips,
} from '@/components/filters/FilterPrimitives';
import CityFilterWithOther from '@/components/filters/CityFilterWithOther';
import LanguageFilterWithOther from '@/components/filters/LanguageFilterWithOther';

// ── Filter catalog ───────────────────────────────────────────────────────────
const CITIES      = ['Tehran', 'Isfahan', 'Shiraz', 'Yazd', 'Mashhad', 'Tabriz', 'Kerman', 'Rasht'];
const LANGUAGES   = ['English', 'Arabic', 'French', 'German', 'Spanish', 'Italian', 'Chinese'];

const GENDERS = (lang) => [
  { value: 'male',   label: lang === 'fa' ? 'مرد' : lang === 'ar' ? 'ذكر'  : 'Male' },
  { value: 'female', label: lang === 'fa' ? 'زن' : lang === 'ar' ? 'أنثى' : 'Female' },
];

const EXPERIENCE = (lang) => [
  { value: 'lt2',  label: lang === 'fa' ? 'کمتر از ۲ سال' : lang === 'ar' ? 'أقل من سنتين' : 'Less than 2 years' },
  { value: '2to5', label: lang === 'fa' ? '۲ تا ۵ سال'    : lang === 'ar' ? '2-5 سنوات'    : '2–5 years' },
  { value: 'gt5',  label: lang === 'fa' ? 'بیش از ۵ سال'  : lang === 'ar' ? 'أكثر من 5'    : '5+ years' },
];

const DEFAULT_FILTERS = {
  search: '',
  cities: [],
  gender: '',
  languages: [],
  specialties: [],
  rating: 0,
  experience: '',
  price: { min: null, max: null },
};

function rowMatches(g, f) {
  if (f.search) {
    const q = f.search.toLowerCase();
    const hay = `${g.full_name || ''} ${g.city || ''} ${g.bio || ''}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (f.cities.length > 0) {
    const city = (g.city || '').toLowerCase();
    if (!city || !f.cities.some((c) => city.includes(c.toLowerCase()))) return false;
  }
  if (f.gender) {
    if (g.gender && g.gender !== f.gender) return false;
  }
  if (f.languages.length > 0) {
    const langs = parseList(g.languages);
    if (langs.length && !f.languages.some((l) => langs.includes(l.toLowerCase()))) return false;
  }
  if (f.specialties.length > 0) {
    const specs = [...parseList(g.specialties), ...(g.specialty ? [String(g.specialty).toLowerCase()] : [])];
    if (specs.length && !f.specialties.some((s) => specs.includes(s.toLowerCase()))) return false;
  }
  if (f.rating > 0) {
    if (g.rating != null && Number(g.rating) < f.rating) return false;
  }
  if (f.experience) {
    const yrs = g.experience_years;
    if (yrs != null) {
      if (f.experience === 'lt2'  && !(yrs < 2)) return false;
      if (f.experience === '2to5' && !(yrs >= 2 && yrs <= 5)) return false;
      if (f.experience === 'gt5'  && !(yrs > 5)) return false;
    }
  }
  if (f.price.min != null || f.price.max != null) {
    const p = g.price_per_day;
    if (p != null) {
      if (f.price.min != null && p < f.price.min) return false;
      if (f.price.max != null && p > f.price.max) return false;
    }
  }
  return true;
}

function parseList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((s) => String(s).toLowerCase());
  return String(val).split(/[,·;]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
}

// ── Guide Card ────────────────────────────────────────────────────────────────

function GuideCard({ guide, lang, onNavigate }) {
  const specialties = Array.isArray(guide.specialties)
    ? guide.specialties
    : guide.specialty
    ? [guide.specialty]
    : [];
  const verified = guide.is_approved || guide.is_verified;
  const reviewCount = guide.reviews ?? guide.review_count ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      onClick={() => onNavigate(`/guides/${guide.id}`)}
      className="bg-card rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-border/40 hover:border-gold/30 group"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={avatarFor(guide)}
          alt={guide.full_name || ''}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* City badge top-left */}
        {guide.city && (
          <span className="absolute top-3 start-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
            <MapPin className="w-3 h-3 text-gold" />
            {guide.city}
          </span>
        )}
        {/* Verified badge top-right */}
        {verified && (
          <span className="absolute top-3 end-3 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-medium">
            <ShieldCheck className="w-3 h-3" />
            {lang === 'fa' ? 'تأیید شده' : lang === 'ar' ? 'موثق' : 'Verified'}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Name */}
        <h3 className="font-heading text-lg font-semibold text-foreground truncate mb-1">
          {guide.full_name || (lang === 'fa' ? 'راهنما' : 'Guide')}
        </h3>

        {/* Stars + rating + reviews */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`w-3.5 h-3.5 ${
                  n <= Math.round(guide.rating ?? 0)
                    ? 'fill-gold text-gold'
                    : 'fill-border text-border'
                }`}
              />
            ))}
          </div>
          {guide.rating != null && (
            <span className="font-body text-sm font-semibold text-foreground">{Number(guide.rating).toFixed(1)}</span>
          )}
          <span className="font-body text-xs text-muted-foreground">
            · {reviewCount} {lang === 'fa' ? 'نظر' : lang === 'ar' ? 'تقييم' : 'Reviews'}
          </span>
        </div>

        {/* Bio excerpt */}
        {guide.bio && (
          <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {guide.bio}
          </p>
        )}

        {/* Specialty tags */}
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {specialties.slice(0, 3).map((s, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-[11px] font-body font-medium bg-gold/10 text-gold border border-gold/20"
              >
                {s}
              </span>
            ))}
            {specialties.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-body text-muted-foreground bg-muted">
                +{specialties.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Guides() {
  const { t, dir, lang } = useI18n();
  const navigate = useNavigate();
  const { guides, loading, error } = useGuides();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [dynamicSpecialties, setDynamicSpecialties] = useState([]);

  // Load unique specialties from Supabase
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('specialties, specialty')
          .eq('role', 'guide');
        if (data) {
          const all = data.flatMap((g) => {
            if (Array.isArray(g.specialties)) return g.specialties;
            if (g.specialty) return [g.specialty];
            return [];
          });
          setDynamicSpecialties([...new Set(all.map((s) => String(s).trim()).filter(Boolean))]);
        }
      } catch {
        // silently fail — static fallback used
      }
    })();
  }, []);

  const specialtyOptions = (dynamicSpecialties.length > 0 ? dynamicSpecialties : [
    'Architecture', 'History', 'Nature', 'Photography', 'Food & Cuisine', 'Desert Adventure', 'Art & Crafts',
  ]).map((s) => ({ value: s, label: s }));

  const update = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const clearAll = () => setFilters(DEFAULT_FILTERS);

  const filtered = useMemo(
    () => guides.filter((g) => rowMatches(g, filters)),
    [guides, filters]
  );

  const tx = {
    section: {
      city:      lang === 'fa' ? 'شهر'           : lang === 'ar' ? 'المدينة'      : 'City',
      gender:    lang === 'fa' ? 'جنسیت'         : lang === 'ar' ? 'الجنس'        : 'Gender',
      lang:      lang === 'fa' ? 'زبان'           : lang === 'ar' ? 'اللغة'         : 'Languages spoken',
      spec:      lang === 'fa' ? 'تخصص'           : lang === 'ar' ? 'التخصص'        : 'Specialty',
      rating:    lang === 'fa' ? 'امتیاز'         : lang === 'ar' ? 'التقييم'       : 'Rating',
      experience:lang === 'fa' ? 'تجربه'          : lang === 'ar' ? 'الخبرة'         : 'Experience',
      price:     lang === 'fa' ? 'قیمت روزانه'    : lang === 'ar' ? 'السعر اليومي'  : 'Price per day',
    },
    results: (n) => lang === 'fa'
      ? `${n} راهنما یافت شد`
      : lang === 'ar'
      ? `${n} مرشد`
      : `${n} guide${n === 1 ? '' : 's'} found`,
  };

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.search) {
      chips.push({ key: 'search', label: `"${filters.search}"`, onRemove: () => update({ search: '' }) });
    }
    filters.cities.forEach((c) => chips.push({
      key: `city-${c}`, label: c, onRemove: () => update({ cities: filters.cities.filter((x) => x !== c) }),
    }));
    if (filters.gender) {
      const g = GENDERS(lang).find((x) => x.value === filters.gender);
      if (g) chips.push({ key: 'gender', label: g.label, onRemove: () => update({ gender: '' }) });
    }
    filters.languages.forEach((l) => chips.push({
      key: `lang-${l}`, label: l, onRemove: () => update({ languages: filters.languages.filter((x) => x !== l) }),
    }));
    filters.specialties.forEach((s) => chips.push({
      key: `spec-${s}`, label: s, onRemove: () => update({ specialties: filters.specialties.filter((x) => x !== s) }),
    }));
    if (filters.rating > 0) {
      chips.push({ key: 'rating', label: `${filters.rating}+ ★`, onRemove: () => update({ rating: 0 }) });
    }
    if (filters.experience) {
      const e = EXPERIENCE(lang).find((x) => x.value === filters.experience);
      if (e) chips.push({ key: 'exp', label: e.label, onRemove: () => update({ experience: '' }) });
    }
    return chips;
  }, [filters, lang]);

  const activeCount = activeChips.length;

  const loadingText = lang === 'fa' ? 'در حال بارگذاری راهنماها...' : lang === 'ar' ? 'جار تحميل المرشدين...' : 'Loading guides...';
  const errorText   = lang === 'fa' ? 'بارگذاری راهنماها با خطا مواجه شد' : lang === 'ar' ? 'فشل تحميل المرشدين' : 'Failed to load guides';
  const emptyText   = lang === 'fa' ? 'راهنمایی با این فیلترها یافت نشد' : lang === 'ar' ? 'لا توجد نتائج بهذه الفلاتر' : 'No guides match these filters';

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
            {t('guides_title')}
          </h1>
          <p className="font-body text-muted-foreground max-w-xl text-lg">
            {t('guides_subtitle')}
          </p>
        </motion.div>

        {/* Search bar */}
        <div className="relative mb-8">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder={lang === 'fa' ? 'جستجو در راهنماها...' : lang === 'ar' ? 'ابحث عن مرشدين...' : 'Search guides by name, city, specialty...'}
            className="w-full ps-11 pe-4 py-3 rounded-2xl border border-border bg-card font-body text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition shadow-sm"
          />
        </div>

        {/* Layout: filters + grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          <FiltersShell activeCount={activeCount} onClearAll={clearAll}>
            <FilterSection label={tx.section.city}>
              <CityFilterWithOther
                selectedCities={filters.cities}
                citiesInList={CITIES}
                onCityChange={(v) => update({ cities: v })}
                placeholder={lang === 'fa' ? 'شهر دیگری را جستجو کنید...' : lang === 'ar' ? 'ابحث عن مدينة أخرى...' : 'Search other cities...'}
              />
            </FilterSection>
            <FilterSection label={tx.section.lang}>
              <LanguageFilterWithOther
                selectedLanguages={filters.languages}
                languagesInList={LANGUAGES}
                onLanguageChange={(v) => update({ languages: v })}
                placeholder={lang === 'fa' ? 'زبان دیگری را جستجو کنید...' : lang === 'ar' ? 'ابحث عن لغة أخرى...' : 'Search other languages...'}
              />
            </FilterSection>
            <FilterSection label={tx.section.gender}>
              <SingleSelectChips options={GENDERS(lang)} value={filters.gender} onChange={(v) => update({ gender: v })} />
            </FilterSection>
            <FilterSection label={tx.section.spec}>
              <MultiSelectChips options={specialtyOptions} value={filters.specialties} onChange={(v) => update({ specialties: v })} />
            </FilterSection>
            <FilterSection label={tx.section.rating}>
              <RatingFilter value={filters.rating} onChange={(v) => update({ rating: v })} />
            </FilterSection>
            <FilterSection label={tx.section.experience}>
              <SingleSelectChips options={EXPERIENCE(lang)} value={filters.experience} onChange={(v) => update({ experience: v })} />
            </FilterSection>
            <FilterSection label={tx.section.price}>
              <PriceRange value={filters.price} onChange={(v) => update({ price: v })} />
            </FilterSection>
          </FiltersShell>

          <div className="flex-1 min-w-0">
            {/* Active chips + result count */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <ActiveChips chips={activeChips} />
              <p className="font-body text-sm text-muted-foreground ms-auto">
                {tx.results(filtered.length)}
              </p>
            </div>

            {loading ? (
              <p className="font-body text-muted-foreground text-center py-16">{loadingText}</p>
            ) : error ? (
              <div className="text-center py-16">
                <p className="font-body text-destructive mb-2">{errorText}</p>
                <p className="font-body text-xs text-muted-foreground">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="font-body text-muted-foreground text-center py-16">{emptyText}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filtered.map((guide) => (
                  <GuideCard key={guide.id} guide={guide} lang={lang} onNavigate={navigate} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
