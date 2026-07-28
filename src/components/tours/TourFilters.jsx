import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n.jsx';
import { ChevronDown, X, MapPin } from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────────

const themeOptions = [
  { key: 'all',         en: 'All Themes',        fa: 'همه تم‌ها',       ar: 'كل الأنواع' },
  { key: 'history',     en: 'History & Heritage',fa: 'تاریخ و میراث',   ar: 'التاريخ والتراث' },
  { key: 'desert',      en: 'Desert & Nature',   fa: 'کویر و طبیعت',   ar: 'الصحراء والطبيعة' },
  { key: 'food',        en: 'Culinary',          fa: 'آشپزی',           ar: 'الطهي' },
  { key: 'photography', en: 'Photography',       fa: 'عکاسی',           ar: 'التصوير' },
  { key: 'culture',     en: 'Art & Culture',     fa: 'هنر و فرهنگ',     ar: 'الفن والثقافة' },
];

const durationOptions = [
  { key: 'all',    en: 'Any Duration', fa: 'هر مدت',       ar: 'أي مدة' },
  { key: 'short',  en: 'Up to 7 days',fa: 'تا ۷ روز',     ar: 'حتى 7 أيام' },
  { key: 'medium', en: '8–11 days',   fa: '۸ تا ۱۱ روز',  ar: '8-11 أيام' },
  { key: 'long',   en: '12+ days',    fa: '۱۲+ روز',      ar: '12+ أيام' },
];

const cityOptions = [
  { key: 'all',          en: 'All Cities',   fa: 'همه شهرها',    ar: 'كل المدن' },
  { key: 'Tehran',       en: 'Tehran',       fa: 'تهران',         ar: 'طهران' },
  { key: 'Isfahan',      en: 'Isfahan',      fa: 'اصفهان',        ar: 'أصفهان' },
  { key: 'Shiraz',       en: 'Shiraz',       fa: 'شیراز',         ar: 'شيراز' },
  { key: 'Yazd',         en: 'Yazd',         fa: 'یزد',           ar: 'يزد' },
  { key: 'Mashhad',      en: 'Mashhad',      fa: 'مشهد',          ar: 'مشهد' },
  { key: 'Tabriz',       en: 'Tabriz',       fa: 'تبریز',         ar: 'تبريز' },
  { key: 'Kerman',       en: 'Kerman',       fa: 'کرمان',         ar: 'كرمان' },
  { key: 'Kashan',       en: 'Kashan',       fa: 'کاشان',         ar: 'كاشان' },
  { key: 'Rasht',        en: 'Rasht',        fa: 'رشت',           ar: 'رشت' },
  { key: 'Qom',          en: 'Qom',          fa: 'قم',            ar: 'قم' },
  { key: 'Hamadan',      en: 'Hamadan',      fa: 'همدان',         ar: 'همدان' },
  { key: 'Ahvaz',        en: 'Ahvaz',        fa: 'اهواز',         ar: 'الأهواز' },
  { key: 'Urmia',        en: 'Urmia',        fa: 'ارومیه',        ar: 'أورمية' },
  { key: 'Ardabil',      en: 'Ardabil',      fa: 'اردبیل',        ar: 'أردبيل' },
  { key: 'Bandar Abbas', en: 'Bandar Abbas', fa: 'بندرعباس',     ar: 'بندر عباس' },
  { key: 'Sari',         en: 'Sari',         fa: 'ساری',          ar: 'ساري' },
  { key: 'Qazvin',       en: 'Qazvin',       fa: 'قزوین',         ar: 'قزوين' },
  { key: 'Dezful',       en: 'Dezful',       fa: 'دزفول',         ar: 'دزفول' },
  { key: 'Zanjan',       en: 'Zanjan',       fa: 'زنجان',         ar: 'زنجان' },
  { key: 'Gorgan',       en: 'Gorgan',       fa: 'گرگان',         ar: 'گرگان' },
  { key: 'Khorramabad',  en: 'Khorramabad',  fa: 'خرم‌آباد',      ar: 'خرم آباد' },
  { key: 'Sanandaj',     en: 'Sanandaj',     fa: 'سنندج',         ar: 'سنندج' },
  { key: 'Bushehr',      en: 'Bushehr',      fa: 'بوشهر',         ar: 'بوشهر' },
  { key: 'Semnan',       en: 'Semnan',       fa: 'سمنان',         ar: 'سمنان' },
  { key: 'Arak',         en: 'Arak',         fa: 'اراک',          ar: 'أراك' },
  { key: 'Ilam',         en: 'Ilam',         fa: 'ایلام',         ar: 'إيلام' },
  { key: 'Birjand',      en: 'Birjand',      fa: 'بیرجند',        ar: 'بيرجند' },
  { key: 'Bojnord',      en: 'Bojnord',      fa: 'بجنورد',        ar: 'بجنورد' },
  { key: 'Yasuj',        en: 'Yasuj',        fa: 'یاسوج',         ar: 'يسوج' },
  { key: 'Zahedan',      en: 'Zahedan',      fa: 'زاهدان',        ar: 'زاهدان' },
  { key: 'Karaj',        en: 'Karaj',        fa: 'کرج',           ar: 'كرج' },
  { key: 'Pasargadae',   en: 'Pasargadae',   fa: 'پاسارگاد',      ar: 'باسارغاد' },
];

const priceOptions = [
  { key: 'all',    en: 'All Prices', fa: 'همه قیمت‌ها', ar: 'كل الأسعار' },
  { key: 'budget', en: 'Budget',     fa: 'اقتصادی',     ar: 'اقتصادي',     max: 1200 },
  { key: 'mid',    en: 'Mid-range',  fa: 'متوسط',       ar: 'متوسط',       min: 1200, max: 2500 },
  { key: 'luxury', en: 'Luxury',     fa: 'لوکس',        ar: 'فاخر',        min: 2500 },
];

// ── FilterDropdown sub-component ─────────────────────────────────────────────

function FilterDropdown({ label, value, options, onChange, lang, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.key === value) || options[0];
  const isActive = value !== 'all';

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 min-w-[130px]">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border font-body text-sm transition-all duration-200
          ${isActive
            ? 'border-accent/70 bg-accent/10 text-accent'
            : 'border-border/50 bg-card/60 text-foreground/70 hover:border-accent/40 hover:text-foreground'
          } backdrop-blur-sm`}
      >
        <span className="flex items-center gap-2 truncate">
          {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />}
          <span className="text-[11px] uppercase tracking-wider opacity-60 hidden sm:block">{label}</span>
          <span className={`font-medium truncate ${isActive ? 'text-accent' : ''}`}>
            {selected.icon ? `${selected.icon} ` : ''}{selected[lang] || selected.en}
          </span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 min-w-full w-max max-h-64 overflow-y-auto bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl shadow-black/20 py-2">
          {/* Persian ornament top accent */}
          <div className="px-4 pb-2 mb-1 border-b border-border/30">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5">
              <span className="text-accent text-xs">❖</span> {label}
            </p>
          </div>
          {options.map(opt => (
            <button
              key={opt.key}
              onClick={() => { onChange(opt.key); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-left transition-colors
                ${opt.key === value
                  ? 'text-accent bg-accent/10 font-semibold'
                  : 'text-foreground/70 hover:bg-accent/5 hover:text-foreground'
                }`}
            >
              {opt.icon && <span className="w-5 text-center text-base">{opt.icon}</span>}
              <span>{opt[lang] || opt.en}</span>
              {opt.key === value && <span className="ml-auto text-accent text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function TourFilters({ filters, onChange, resultCount }) {
  const { lang, dir } = useI18n();

  const hasActive = filters.theme !== 'all'
    || filters.duration !== 'all' || (filters.city && filters.city !== 'all')
    || (filters.price && filters.price !== 'all');

  const reset = () => onChange({ theme: 'all', duration: 'all', city: 'all', price: 'all' });

  return (
    <div dir={dir} className="mb-12">
      {/* Persian ornamental top border */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="text-accent/50 text-sm tracking-widest">✦ ❋ ✦</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Filter bar */}
      <div className="relative">
        {/* Subtle background card */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/[0.03] via-card/80 to-gold/[0.03] border border-border/40 backdrop-blur-sm" />

        <div className="relative flex flex-wrap gap-3 p-4">
          <FilterDropdown
            label={lang === 'fa' ? 'شهر' : lang === 'ar' ? 'المدينة' : 'City'}
            value={filters.city || 'all'}
            options={cityOptions}
            onChange={(v) => onChange({ ...filters, city: v })}
            lang={lang}
            icon={MapPin}
          />
          <FilterDropdown
            label={lang === 'fa' ? 'تم' : lang === 'ar' ? 'النوع' : 'Theme'}
            value={filters.theme || 'all'}
            options={themeOptions}
            onChange={(v) => onChange({ ...filters, theme: v })}
            lang={lang}
          />
          <FilterDropdown
            label={lang === 'fa' ? 'مدت' : lang === 'ar' ? 'المدة' : 'Duration'}
            value={filters.duration || 'all'}
            options={durationOptions}
            onChange={(v) => onChange({ ...filters, duration: v })}
            lang={lang}
          />
          <FilterDropdown
            label={lang === 'fa' ? 'قیمت' : lang === 'ar' ? 'السعر' : 'Price'}
            value={filters.price || 'all'}
            options={priceOptions}
            onChange={(v) => onChange({ ...filters, price: v })}
            lang={lang}
          />

          {/* Result count + reset */}
          <div className="flex items-center gap-3 ms-auto self-center px-2">
            <span className="font-body text-sm text-muted-foreground whitespace-nowrap inline-flex items-center gap-1">
              <span className="text-accent font-bold text-2xl">{resultCount}</span>
              {lang === 'fa' ? ' تور' : lang === 'ar' ? ' رحلة' : '    Tours'}
            </span>
            {hasActive && (
              <button
                onClick={reset}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-body border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all"
              >
                <X className="w-3 h-3" />
                {lang === 'fa' ? 'پاک کردن' : lang === 'ar' ? 'مسح' : 'Clear'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Persian ornamental bottom border */}
      <div className="flex items-center gap-4 mt-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="text-accent/30 text-xs">◆</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </div>
  );
}