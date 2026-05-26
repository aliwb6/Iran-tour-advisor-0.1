import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, ShieldCheck, Building2, Calendar } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';
import { useAgencies } from '@/hooks/useSupabase';
import { avatarFor } from '@/lib/avatar';
import { useAuth } from '@/lib/AuthContext';
import {
  FiltersShell, FilterSection, MultiSelectChips, SingleSelectChips,
  RatingFilter, ToggleRow, ActiveChips,
} from '@/components/filters/FilterPrimitives';
import CityFilterWithOther from '@/components/filters/CityFilterWithOther';
import LanguageFilterWithOther from '@/components/filters/LanguageFilterWithOther';

// ── Filter catalog ───────────────────────────────────────────────────────────
const HQ_CITIES        = ['Tehran', 'Isfahan', 'Shiraz', 'Yazd', 'Mashhad', 'Tabriz'];
const TOUR_TYPES       = ['Cultural', 'Adventure', 'Luxury', 'Budget-friendly', 'Photography', 'Academic/Research'];
const SUPPORT_LANGS    = ['English', 'Arabic', 'French', 'German', 'Spanish'];

const TOUR_DURATIONS = (lang) => [
  { value: 'day',    label: lang === 'fa' ? 'یک‌روزه' : lang === 'ar' ? 'يوم واحد'   : 'Day trip' },
  { value: '2to3',   label: lang === 'fa' ? '۲ تا ۳ روز' : lang === 'ar' ? '2-3 أيام' : '2–3 days' },
  { value: 'week',   label: lang === 'fa' ? 'یک هفته'   : lang === 'ar' ? 'أسبوع'      : 'Week-long' },
  { value: 'custom', label: lang === 'fa' ? 'سفارشی'    : lang === 'ar' ? 'مخصص'       : 'Custom' },
];

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
  durations: [],
  rating: 0,
  yearsExp: '',
  licensedOnly: false,
};

// Same "missing column = pass" semantics as the Guides filter so the page
// works today against the existing `profiles` schema and starts effectively
// filtering once dedicated agency columns are added.
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
  if (f.durations.length > 0) {
    const durs = parseList(a.tour_durations);
    if (durs.length && !f.durations.some((d) => durs.includes(String(d).toLowerCase()))) return false;
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
  if (f.licensedOnly) {
    if (!a.is_licensed && !a.is_approved && !a.is_verified) return false;
  }
  return true;
}

function parseList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((s) => String(s).toLowerCase());
  return String(val).split(/[,·;]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
}

const tagColors = ['bg-accent/10 text-accent', 'bg-gold/20 text-gold', 'bg-primary/10 text-primary'];

export default function Agencies() {
  const { dir, lang } = useI18n();
  const navigate = useNavigate();
  const { agencies, loading, error } = useAgencies();
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const update = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const clearAll = () => setFilters(DEFAULT_FILTERS);

  const filtered = useMemo(
    () => agencies.filter((a) => rowMatches(a, filters)),
    [agencies, filters]
  );

  const tx = {
    title:    lang === 'fa' ? 'آژانس‌های مسافرتی' : lang === 'ar' ? 'وكالات السفر'         : 'Travel Agencies',
    subtitle: lang === 'fa' ? 'آژانس‌های رسمی و مورد اعتماد ایران برای سفر مرفه و آسوده' : lang === 'ar' ? 'وكالات إيرانية موثوقة ومرخصة لسفر مريح وسلس' : 'Trusted, licensed Iranian agencies for an effortless journey',
    search:   lang === 'fa' ? 'جستجو در آژانس‌ها...' : lang === 'ar' ? 'ابحث في الوكالات...' : 'Search agencies...',
    connect:  lang === 'fa' ? 'تماس'                : lang === 'ar' ? 'تواصل'                : 'Contact',
    tagTours: lang === 'fa' ? 'تورها'               : lang === 'ar' ? 'الجولات'              : 'Tour types',
    licensed: lang === 'fa' ? 'دارای مجوز رسمی'      : lang === 'ar' ? 'حاصل على ترخيص'      : 'Officially licensed',
    yearsLabel: (n) => lang === 'fa' ? `${n} سال تجربه` : lang === 'ar' ? `${n} سنوات خبرة` : `${n} yrs experience`,
    loading: lang === 'fa' ? 'در حال بارگذاری آژانس‌ها...' : lang === 'ar' ? 'جار تحميل الوكالات...' : 'Loading agencies...',
    error:   lang === 'fa' ? 'بارگذاری آژانس‌ها با خطا مواجه شد' : lang === 'ar' ? 'فشل تحميل الوكالات' : 'Failed to load agencies',
    empty:   lang === 'fa' ? 'آژانسی با این فیلترها یافت نشد' : lang === 'ar' ? 'لا توجد وكالات بهذه الفلاتر' : 'No agencies match these filters',
    results: (n) => lang === 'fa' ? `${n} آژانس یافت شد` : lang === 'ar' ? `${n} وكالة` : `${n} agenc${n === 1 ? 'y' : 'ies'} found`,
    section: {
      hq:        lang === 'fa' ? 'شهر دفتر مرکزی' : lang === 'ar' ? 'مدينة المقر'    : 'Headquarters city',
      tourType:  lang === 'fa' ? 'نوع تور'         : lang === 'ar' ? 'نوع الجولة'     : 'Tour type',
      langs:     lang === 'fa' ? 'زبان پشتیبانی'    : lang === 'ar' ? 'لغة الدعم'      : 'Support language',
      duration:  lang === 'fa' ? 'مدت تور'          : lang === 'ar' ? 'مدة الجولة'     : 'Tour duration',
      rating:    lang === 'fa' ? 'امتیاز'           : lang === 'ar' ? 'التقييم'        : 'Rating',
      years:     lang === 'fa' ? 'سال‌های تجربه'    : lang === 'ar' ? 'سنوات الخبرة'   : 'Years of experience',
      licensed:  lang === 'fa' ? 'مجوز رسمی'        : lang === 'ar' ? 'الترخيص'        : 'Official license',
    },
    licensedOnly: lang === 'fa' ? 'فقط آژانس‌های دارای مجوز' : lang === 'ar' ? 'الوكالات المرخصة فقط' : 'Verified agencies only',
  };

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.search) chips.push({ key: 'search', label: `"${filters.search}"`, onRemove: () => update({ search: '' }) });
    filters.cities.forEach((c) => chips.push({ key: `city-${c}`, label: c, onRemove: () => update({ cities: filters.cities.filter((x) => x !== c) }) }));
    filters.tourTypes.forEach((t) => chips.push({ key: `tt-${t}`, label: t, onRemove: () => update({ tourTypes: filters.tourTypes.filter((x) => x !== t) }) }));
    filters.languages.forEach((l) => chips.push({ key: `lang-${l}`, label: l, onRemove: () => update({ languages: filters.languages.filter((x) => x !== l) }) }));
    filters.durations.forEach((d) => {
      const opt = TOUR_DURATIONS(lang).find((x) => x.value === d);
      chips.push({ key: `dur-${d}`, label: opt?.label || d, onRemove: () => update({ durations: filters.durations.filter((x) => x !== d) }) });
    });
    if (filters.rating > 0) chips.push({ key: 'rating', label: `${filters.rating}+ ★`, onRemove: () => update({ rating: 0 }) });
    if (filters.yearsExp) {
      const opt = YEARS_EXP(lang).find((x) => x.value === filters.yearsExp);
      if (opt) chips.push({ key: 'yrs', label: opt.label, onRemove: () => update({ yearsExp: '' }) });
    }
    if (filters.licensedOnly) chips.push({ key: 'lic', label: tx.licensedOnly, onRemove: () => update({ licensedOnly: false }) });
    return chips;
  }, [filters, lang]);

  const activeCount = activeChips.length;
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
            {tx.title}
          </h1>
          <p className="font-body text-muted-foreground max-w-xl text-lg">
            {tx.subtitle}
          </p>
        </motion.div>

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
              <MultiSelectChips options={TOUR_TYPES.map(toOpt)} value={filters.tourTypes} onChange={(v) => update({ tourTypes: v })} />
            </FilterSection>
            <FilterSection label={tx.section.langs}>
              <LanguageFilterWithOther
                selectedLanguages={filters.languages}
                languagesInList={SUPPORT_LANGS}
                onLanguageChange={(v) => update({ languages: v })}
                placeholder={lang === 'fa' ? 'زبان دیگری را جستجو کنید...' : lang === 'ar' ? 'ابحث عن لغة أخرى...' : 'Search other languages...'}
              />
            </FilterSection>
            <FilterSection label={tx.section.duration}>
              <MultiSelectChips options={TOUR_DURATIONS(lang)} value={filters.durations} onChange={(v) => update({ durations: v })} />
            </FilterSection>
            <FilterSection label={tx.section.rating}>
              <RatingFilter value={filters.rating} onChange={(v) => update({ rating: v })} />
            </FilterSection>
            <FilterSection label={tx.section.years}>
              <SingleSelectChips options={YEARS_EXP(lang)} value={filters.yearsExp} onChange={(v) => update({ yearsExp: v })} />
            </FilterSection>
          </FiltersShell>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((agency, i) => {
                  const tourTypes = Array.isArray(agency.tour_types)
                    ? agency.tour_types
                    : Array.isArray(agency.specialties)
                    ? agency.specialties
                    : (agency.specialty ? [agency.specialty] : []);
                  const yrs = agency.years_experience ?? agency.experience_years;
                  const licensed = agency.is_licensed || agency.is_approved || agency.is_verified;
                  return (
                    <motion.div
                      key={agency.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: Math.min(i * 0.04, 0.3) }}
                      onClick={() => navigate(`/guides/${agency.id}`)}
                      className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg hover:border-gold/30 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl border-2 border-gold flex items-center justify-center shrink-0 overflow-hidden bg-gold/10">
                          {agency.avatar_url ? (
                            <img src={avatarFor(agency)} alt={agency.full_name || ''} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-6 h-6 text-gold" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-heading text-lg font-semibold text-foreground truncate">{agency.full_name || 'Agency'}</h3>
                            {licensed && (
                              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" title={tx.licensed} />
                            )}
                          </div>
                          {agency.city && <p className="font-body text-sm text-muted-foreground">{agency.city}</p>}
                          {agency.rating != null && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                              <span className="font-body text-sm font-medium text-foreground">{agency.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {agency.bio && (
                        <p className="font-body text-sm text-foreground/70 leading-relaxed mb-4 line-clamp-3">{agency.bio}</p>
                      )}

                      {yrs != null && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                          <Calendar className="w-3.5 h-3.5 text-accent" />
                          {tx.yearsLabel(yrs)}
                        </div>
                      )}

                      {tourTypes.length > 0 && (
                        <div className="mb-5">
                          <span className="font-body text-xs text-muted-foreground font-medium mb-2 block">{tx.tagTours}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {tourTypes.slice(0, 4).map((s, j) => (
                              <span key={j} className={`px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${tagColors[j % tagColors.length]}`}>{s}</span>
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
