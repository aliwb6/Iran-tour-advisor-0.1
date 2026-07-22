import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Mountain, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';
import { THEMES, PURPOSES } from '@/components/dashboard/TourForm';

// Persian carpet corner motif as SVG
const CarpetMotif = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2 L12 2 L12 5 L5 5 L5 12 L2 12 Z" fill="currentColor" opacity="0.4" />
    <path d="M2 8 L8 8 L8 2" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
    <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.3" />
    <path d="M2 2 L5 5 M12 2 L9 5 M2 12 L5 9" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
  </svg>
);

// Slug → localised label. Custom tags (free text added via "+ Add custom…"
// in TourForm) won't appear in the catalog — for those we fall back to the
// raw value so custom themes/purposes still render as chips.
const THEME_INDEX   = new Map(THEMES.map(t => [t.value, t]));
const PURPOSE_INDEX = new Map(PURPOSES.map(p => [p.value, p]));

const themeLabel   = (slug, lang) => {
  const entry = THEME_INDEX.get(slug);
  return entry ? (entry[lang] || entry.en) : slug;
};
const purposeLabel = (slug, lang) => {
  const entry = PURPOSE_INDEX.get(slug);
  return entry ? (entry[lang] || entry.en) : slug;
};

// Helper: coerce a value into an array of strings whether it arrived as
// text[] (DB) or as a single scalar (old fixture rows).
const toTagArray = (val) => {
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string' && val.trim()) return [val.trim()];
  return [];
};

// Tour rows can arrive in two shapes:
//  - Raw Supabase row: title="…", cities=["Tehran","Isfahan"], price/price_usd
//  - Normalised fixture/wrapped row: title={en,fa,ar}, cities={en:[…], fa:[…], ar:[…]}, priceFrom
// These helpers tolerate both without changing visual output.
const pickText = (val, lang) => {
  if (val == null) return '';
  if (Array.isArray(val)) return val.join(' · ');
  if (typeof val === 'object') {
    const inner = val[lang] ?? val.en;
    if (Array.isArray(inner)) return inner.join(' · ');
    return inner ?? '';
  }
  return String(val);
};

const pickArray = (val, lang) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') {
    const inner = val[lang] ?? val.en;
    if (Array.isArray(inner)) return inner;
    if (typeof inner === 'string') return inner.split(/[,·]/).map(s => s.trim()).filter(Boolean);
  }
  if (typeof val === 'string') return val.split(/[,·]/).map(s => s.trim()).filter(Boolean);
  return [];
};

const computeCityCount = (tour, lang) => {
  const c = tour.cities;
  if (Array.isArray(c)) return c.length;
  if (c && typeof c === 'object') {
    const inner = c[lang] ?? c.en;
    if (Array.isArray(inner)) return inner.length;
    if (typeof inner === 'string' && inner.trim()) {
      return inner.split(/[,·]/).filter(s => s.trim()).length;
    }
  }
  if (typeof c === 'string' && c.trim()) {
    return c.split(/[,·]/).filter(s => s.trim()).length;
  }
  if (tour.cityCount != null) return Number(tour.cityCount) || 0;
  if (tour.city_count != null) return Number(tour.city_count) || 0;
  if (tour.city) return 1;
  return 0;
};

export default function TourCard({ tour, image, index }) {
  const { lang, t } = useI18n();
  const navigate = useNavigate();

  const title = pickText(tour.title, lang);
  const desc = pickText(tour.desc ?? tour.description, lang);
  const cities = pickText(tour.cities, lang) || tour.city || tour.location || '';
  const highlights = pickArray(tour.highlights, lang);
  const cityCount = computeCityCount(tour, lang);
  const themes = toTagArray(tour.theme);
  const purposes = toTagArray(tour.purpose);

  // Price: prefer normalised price_usd, fall back to numeric price, then fixture priceFrom.
  const rawPrice = tour.price_usd ?? tour.price ?? tour.priceFrom ?? null;
  const priceDisplay = rawPrice != null && rawPrice !== ''
    ? `$${Number(rawPrice).toLocaleString()}`
    : null;

  const handleClick = () => {
    navigate(`/tours/${tour.slug}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      onClick={handleClick}
      className="group relative bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-accent/30 hover:shadow-xl transition-all duration-500 cursor-pointer"
    >
      {/* Persian carpet border top accent */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      {/* Carpet corner motifs */}
      <div className="absolute top-3 start-3 w-8 h-8 text-accent/30 z-10 pointer-events-none">
        <CarpetMotif />
      </div>

      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Overlay gradient with Persian carpet-inspired texture */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-4 start-4 flex gap-2 flex-wrap">
          {tour.duration != null && tour.duration !== '' && (
            <span className="px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-body flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {tour.duration} {t('package_duration')}
            </span>
          )}
          {cityCount > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-body flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              {cityCount === 1 ? '1 City' : `${cityCount} Cities`}
            </span>
          )}
        </div>

        {/* Price bottom of image */}
        {priceDisplay && (
          <div className="absolute bottom-4 end-4">
            <span className="font-heading text-white text-xl font-medium">
              {priceDisplay}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Persian ornament line */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-accent/40 text-xs">❖</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        <h2 className="font-heading text-2xl lg:text-3xl font-medium text-foreground mb-1 group-hover:text-accent transition-colors duration-300">
          {title}
        </h2>
        <p className="font-body text-xs text-accent mb-3 tracking-wide">{cities}</p>

        {/* Theme + Purpose chips — pulled from tour.theme[] and tour.purpose[].
            Custom values that aren't in the catalog render their raw text. */}
        {(themes.length > 0 || purposes.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {themes.map((slug, j) => (
              <span
                key={`th-${j}`}
                className="px-2 py-0.5 text-[11px] font-body rounded-full bg-accent/10 border border-accent/20 text-accent"
              >
                {themeLabel(slug, lang)}
              </span>
            ))}
            {purposes.map((slug, j) => (
              <span
                key={`pu-${j}`}
                className="px-2 py-0.5 text-[11px] font-body rounded-full bg-gold/10 border border-gold/30 text-gold-foreground"
                style={{ color: 'hsl(var(--gold))' }}
              >
                {purposeLabel(slug, lang)}
              </span>
            ))}
          </div>
        )}

        <p className="font-body text-sm text-foreground/65 leading-relaxed mb-4 line-clamp-2">{desc}</p>

        {/* Highlights — styled like carpet pattern tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {highlights.slice(0, 3).map((h, j) => (
            <span key={j}
              className="px-2.5 py-1 text-xs font-body rounded-lg border border-border/70 text-muted-foreground bg-secondary/50"
              style={{ borderImage: 'none' }}>
              {h}
            </span>
          ))}
          {highlights.length > 3 && (
            <span className="px-2.5 py-1 text-xs font-body text-accent">+{highlights.length - 3}</span>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div className="flex gap-3 items-center">
            {tour.difficulty && (
              <span className="flex items-center gap-1 text-xs font-body text-muted-foreground">
                <Mountain className="w-3.5 h-3.5 text-accent/60" />
                {t(`difficulty_${tour.difficulty}`)}
              </span>
            )}
            {tour.difficulty && (tour.cultural || tour.cultural_intensity) && (
              <span className="w-1 h-1 rounded-full bg-border" />
            )}
            {(tour.cultural || tour.cultural_intensity) && (
              <span className="flex items-center gap-1 text-xs font-body text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-accent/60" />
                {t(`cultural_${tour.cultural || tour.cultural_intensity}`)}
              </span>
            )}
          </div>
          <button className="flex items-center gap-1.5 text-sm font-body font-semibold text-accent hover:gap-2.5 transition-all duration-200">
            {t('package_inquiry')}
            <span className="text-lg leading-none">→</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}