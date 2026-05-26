import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';
import { useGuides } from '@/hooks/useSupabase';
import { avatarFor } from '@/lib/avatar';
import { useAuth } from '@/lib/AuthContext';
import {
  FiltersShell, FilterSection, MultiSelectChips, SingleSelectChips,
  RatingFilter, PriceRange, ToggleRow, ActiveChips,
} from '@/components/filters/FilterPrimitives';
import CityFilterWithOther from '@/components/filters/CityFilterWithOther';
import LanguageFilterWithOther from '@/components/filters/LanguageFilterWithOther';

// ── Filter catalog ───────────────────────────────────────────────────────────
const CITIES      = ['Tehran', 'Isfahan', 'Shiraz', 'Yazd', 'Mashhad', 'Tabriz', 'Kerman', 'Rasht'];
const LANGUAGES   = ['English', 'Arabic', 'French', 'German', 'Spanish', 'Italian', 'Chinese'];
const SPECIALTIES = ['Architecture', 'History', 'Nature', 'Photography', 'Food & Cuisine', 'Desert Adventure', 'Art & Crafts'];

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
  verifiedOnly: false,
};

// Field-by-field passes the row through the filter. Returns true when the row
// matches. Missing columns on the row are treated as "pass" so the UI keeps
// working even before the DB has every column added (e.g. price_per_day,
// experience_years).
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
  if (f.verifiedOnly) {
    if (!g.is_approved && !g.is_verified) return false;
  }
  return true;
}

// Languages / specialties columns are stored as either a comma-separated
// string or a text[] in Supabase depending on the row's vintage. Normalise.
function parseList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((s) => String(s).toLowerCase());
  return String(val).split(/[,·;]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
}

const cityColors = ['bg-accent/10 text-accent', 'bg-gold/20 text-gold', 'bg-primary/10 text-primary'];

export default function Guides() {
  const { t, dir, lang } = useI18n();
  const navigate = useNavigate();
  const { guides, loading, error } = useGuides();
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

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
      verified:  lang === 'fa' ? 'فقط تایید شده‌ها' : lang === 'ar' ? 'الموثق فقط'    : 'Verified only',
    },
    verifiedOnly: lang === 'fa' ? 'فقط تایید شده‌ها' : lang === 'ar' ? 'الموثق فقط' : 'Verified only',
    results: (n) => lang === 'fa'
      ? `${n} راهنما یافت شد`
      : lang === 'ar'
      ? `${n} مرشد`
      : `${n} guide${n === 1 ? '' : 's'} found`,
  };

  // Summarise active filters as removable chips above the grid.
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
    if (filters.price.min != null || filters.price.max != null) {
      const range = `$${filters.price.min ?? 0} — ${filters.price.max != null ? `$${filters.price.max}` : '∞'}`;
      chips.push({ key: 'price', label: range, onRemove: () => update({ price: { min: null, max: null } }) });
    }
    if (filters.verifiedOnly) {
      chips.push({ key: 'verified', label: tx.verifiedOnly, onRemove: () => update({ verifiedOnly: false }) });
    }
    return chips;
  }, [filters, lang]);

  const activeCount = activeChips.length;

  const loadingText = lang === 'fa' ? 'در حال بارگذاری راهنماها...' : lang === 'ar' ? 'جار تحميل المرشدين...' : 'Loading guides...';
  const errorText   = lang === 'fa' ? 'بارگذاری راهنماها با خطا مواجه شد' : lang === 'ar' ? 'فشل تحميل المرشدين' : 'Failed to load guides';
  const emptyText   = lang === 'fa' ? 'راهنمایی با این فیلترها یافت نشد' : lang === 'ar' ? 'لا توجد نتائج بهذه الفلاتر' : 'No guides match these filters';

  const toOpt = (s) => ({ value: s, label: s });

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
            <FilterSection label={tx.section.gender}>
              <SingleSelectChips options={GENDERS(lang)} value={filters.gender} onChange={(v) => update({ gender: v })} />
            </FilterSection>
            <FilterSection label={tx.section.lang}>
              <LanguageFilterWithOther
                selectedLanguages={filters.languages}
                languagesInList={LANGUAGES}
                onLanguageChange={(v) => update({ languages: v })}
                placeholder={lang === 'fa' ? 'زبان دیگری را جستجو کنید...' : lang === 'ar' ? 'ابحث عن لغة أخرى...' : 'Search other languages...'}
              />
            </FilterSection>
            <FilterSection label={tx.section.spec}>
              <MultiSelectChips options={SPECIALTIES.map(toOpt)} value={filters.specialties} onChange={(v) => update({ specialties: v })} />
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
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((guide, i) => {
                  const specialties = Array.isArray(guide.specialties) ? guide.specialties : (guide.specialty ? [guide.specialty] : []);
                  const verified = guide.is_approved || guide.is_verified;
                  return (
                    <motion.div
                      key={guide.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: Math.min(i * 0.04, 0.3) }}
                      onClick={() => navigate(`/guides/${guide.id}`)}
                      className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg hover:border-gold/30 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={avatarFor(guide)}
                          alt={guide.full_name || ''}
                          className="w-14 h-14 rounded-full border-2 border-gold object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-heading text-lg font-semibold text-foreground truncate">{guide.full_name}</h3>
                            {verified && <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" title="Verified" />}
                          </div>
                          {guide.city && <p className="font-body text-sm text-muted-foreground">{guide.city}</p>}
                          {guide.rating != null && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                              <span className="font-body text-sm font-medium text-foreground">{guide.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {guide.bio && (
                        <p className="font-body text-sm text-foreground/70 leading-relaxed mb-4 line-clamp-3">{guide.bio}</p>
                      )}

                      {specialties.length > 0 && (
                        <div className="mb-5">
                          <span className="font-body text-xs text-muted-foreground font-medium mb-2 block">{t('guides_specialties')}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {specialties.map((s, j) => (
                              <span key={j} className={`px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${cityColors[j % cityColors.length]}`}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
