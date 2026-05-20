import { useI18n } from '@/lib/i18n.jsx';
import { SlidersHorizontal, X } from 'lucide-react';

// IMPORTANT: keys must match the slug values that guides actually save via
// TourForm (THEMES / PURPOSES catalogs). The DB columns `tours.theme[]` and
// `tours.purpose[]` are text[] arrays of these slugs, and the Tours page
// filter uses array-containment to match rows.
const purposeOptions = [
  { key: 'all',         icon: '✦', en: 'All Journeys',          fa: 'همه سفرها',          ar: 'كل الرحلات' },
  { key: 'leisure',     icon: '☀', en: 'Leisure & Fun',         fa: 'تفریح و سرگرمی',     ar: 'ترفيه ومتعة' },
  { key: 'business',    icon: '◈', en: 'Business',              fa: 'کسب‌وکار',            ar: 'أعمال' },
  { key: 'educational', icon: '◎', en: 'Research & Education',  fa: 'تحقیق و آموزش',       ar: 'بحث وتعليم' },
  { key: 'religious',   icon: '✿', en: 'Spiritual & Religious', fa: 'معنوی و زیارتی',      ar: 'روحاني وديني' },
];

const themeOptions = [
  { key: 'all',      en: 'All Themes',           fa: 'همه تم‌ها',                  ar: 'كل الأنواع' },
  { key: 'nature',   en: 'Nature & Wildlife',    fa: 'طبیعت‌گردی و حیات وحش',     ar: 'الطبيعة والحياة البرية' },
  { key: 'cultural', en: 'Cultural & Historical', fa: 'فرهنگی و تاریخی',           ar: 'ثقافي وتاريخي' },
  { key: 'coastal',  en: 'Coastal & Marine',     fa: 'ساحلی و دریایی',             ar: 'ساحلي وبحري' },
  { key: 'urban',    en: 'Urban & Modern',       fa: 'شهری و مدرن',                ar: 'حضري وعصري' },
  { key: 'rural',    en: 'Rural & Eco',          fa: 'روستایی و بوم‌گردی',          ar: 'ريفي وبيئي' },
  { key: 'luxury',   en: 'Luxury & VIP',         fa: 'لاکچری و VIP',                ar: 'فاخر و VIP' },
  { key: 'budget',   en: 'Budget & Backpacking', fa: 'اقتصادی و کوله‌گردی',         ar: 'اقتصادي وحقيبة ظهر' },
];

const durationOptions = [
  { key: 'all', en: 'Any Duration', fa: 'هر مدت', ar: 'أي مدة' },
  { key: 'short', en: 'Up to 7 days', fa: 'تا ۷ روز', ar: 'حتى 7 أيام' },
  { key: 'medium', en: '8–11 days', fa: '۸ تا ۱۱ روز', ar: '8-11 أيام' },
  { key: 'long', en: '12+ days', fa: '۱۲+ روز', ar: '12+ أيام' },
];

export default function TourFilters({ filters, onChange, resultCount }) {
  const { lang, dir, t } = useI18n();
  const label = (opt) => opt[lang] || opt.en;

  const hasActive = filters.purpose !== 'all' || filters.theme !== 'all' || filters.duration !== 'all';

  const reset = () => onChange({ purpose: 'all', theme: 'all', duration: 'all' });

  return (
    <div dir={dir} className="mb-12">
      {/* Purpose selector — primary filter, big & prominent */}
      <div className="mb-8">
        <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <span className="text-accent">◆</span>
          {t('filters_purpose_q')}
        </p>
        <div className="flex flex-wrap gap-3">
          {purposeOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => onChange({ ...filters, purpose: opt.key })}
              className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-2xl border transition-all duration-300 font-body text-sm font-medium
                ${filters.purpose === opt.key
                  ? 'bg-foreground text-background border-foreground shadow-lg scale-[1.03]'
                  : 'border-border/60 hover:border-accent/40 hover:bg-accent/5 text-foreground/70'}`}
            >
              {/* Persian carpet motif accent */}
              {filters.purpose === opt.key && (
                <span className="absolute inset-0 rounded-2xl opacity-10 pointer-events-none"
                  style={{ background: 'repeating-linear-gradient(45deg, hsl(var(--accent)) 0px, hsl(var(--accent)) 1px, transparent 1px, transparent 8px)' }} />
              )}
              <span className="text-base">{opt.icon}</span>
              {label(opt)}
            </button>
          ))}
        </div>
      </div>

      {/* Divider with Persian motif */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="text-accent text-lg">❋</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Secondary filters row */}
      <div className="flex flex-wrap gap-6 items-end">
        {/* Theme */}
        <div className="flex-1 min-w-[160px]">
          <p className="font-body text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3 h-3" />
            {t('filters_theme')}
          </p>
          <div className="flex flex-wrap gap-2">
            {themeOptions.map(opt => (
              <button key={opt.key} onClick={() => onChange({ ...filters, theme: opt.key })}
                className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all
                  ${filters.theme === opt.key ? 'bg-accent text-white border-accent' : 'border-border/50 text-muted-foreground hover:border-accent/40 hover:text-foreground'}`}>
                {label(opt)}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="min-w-[160px]">
          <p className="font-body text-xs text-muted-foreground mb-2">
            {t('filters_duration')}
          </p>
          <div className="flex gap-2">
            {durationOptions.map(opt => (
              <button key={opt.key} onClick={() => onChange({ ...filters, duration: opt.key })}
                className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all
                  ${filters.duration === opt.key ? 'bg-accent text-white border-accent' : 'border-border/50 text-muted-foreground hover:border-accent/40 hover:text-foreground'}`}>
                {label(opt)}
              </button>
            ))}
          </div>
        </div>

        {/* Result count + reset */}
        <div className="flex items-center gap-3 ms-auto">
          <span className="font-body text-sm text-muted-foreground">
            <span className="text-foreground font-semibold">{resultCount}</span>
            {t('filters_results_found')}
          </span>
          {hasActive && (
            <button onClick={reset} className="flex items-center gap-1 text-xs font-body text-destructive hover:opacity-70 transition-opacity">
              <X className="w-3.5 h-3.5" />
              {t('filters_clear')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}