import { useState } from 'react';
import { useI18n } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import TourFilters from '@/components/tours/TourFilters';
import { useTours, FALLBACK_IMAGE } from '@/hooks/useSupabase';
import { TourCardSkeleton } from '@/components/ui/Skeletons';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';

const DEFAULT_FILTERS = { purpose: 'all', theme: 'all', duration: 'all' };

export default function Tours() {
  const { t, dir, lang } = useI18n();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const { tours, loading, error } = useTours(filters);

  return (
    <div dir={dir} className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Header */}
        <div className="relative mb-14">
          <div className="absolute -top-4 inset-x-0 h-1 overflow-hidden">
            <div className="w-full h-full"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--accent)) 0px, hsl(var(--accent)) 4px, transparent 4px, transparent 12px, hsl(var(--gold)) 12px, hsl(var(--gold)) 14px, transparent 14px, transparent 20px)',
                opacity: 0.5
              }} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="pt-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-accent text-xl">❖</span>
              <span className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {lang === 'fa' ? 'پکیج‌های سفر' : lang === 'ar' ? 'باقات السفر' : 'Tour Packages'}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-foreground mb-4">
              {t('packages_title')}
            </h1>
            <p className="font-body text-muted-foreground max-w-xl text-base leading-relaxed">
              {t('packages_subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <TourFilters filters={filters} onChange={setFilters} resultCount={tours.length} />

        {/* Tour Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <TourCardSkeleton />
              <TourCardSkeleton />
              <TourCardSkeleton />
              <TourCardSkeleton />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <p className="font-heading text-2xl text-destructive mb-4">{error}</p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-accent hover:underline"
              >
                {lang === 'fa' ? 'تلاش مجدد' : lang === 'ar' ? 'حاول مرة أخرى' : 'Try again'}
              </button>
            </motion.div>
          ) : tours.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-border flex items-center justify-center">
                <span className="text-3xl text-accent/40">❋</span>
              </div>
              <p className="font-heading text-2xl text-muted-foreground font-light">
                {lang === 'fa' ? 'توری یافت نشد' : lang === 'ar' ? 'لم يتم العثور على جولات' : 'No tours found'}
              </p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-4 text-sm font-body text-accent hover:underline"
              >
                {lang === 'fa' ? 'پاک کردن فیلترها' : lang === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
            >
              {tours.map((tour, i) => (
                <TourCard key={tour.id} tour={tour} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Border */}
        {tours.length > 0 && !loading && (
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

function TourCard({ tour, index }) {
  const { t, lang, dir } = useI18n();
  const navigate = useNavigate();

  const purposeBadgeConfig = {
    leisure: { en: 'Leisure', fa: 'تفریحی', ar: 'ترفيه', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
    work: { en: 'Business', fa: 'کسب‌وکار', ar: 'أعمال', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
    research: { en: 'Research', fa: 'تحقیقاتی', ar: 'بحثي', color: 'bg-violet-500/15 text-violet-700 dark:text-violet-400' },
    spiritual: { en: 'Spiritual', fa: 'معنوی', ar: 'روحاني', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400' },
  };

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
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={tour.image_url || tour.cover_image || FALLBACK_IMAGE}
          alt={tour.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 start-4 flex gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-body flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {tour.duration} {t('package_duration')}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-body flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            {tour.city_count || 3} {t('package_cities')}
          </span>
        </div>

        {/* Purpose Badge */}
        {tour.purpose && tour.purpose !== 'all' && (
          <div className="absolute top-4 end-4">
            <span className={`px-3 py-1.5 rounded-full text-xs font-body font-medium ${purposeBadgeConfig[tour.purpose]?.color || ''}`}>
              {purposeBadgeConfig[tour.purpose]?.[lang] || purposeBadgeConfig[tour.purpose]?.en}
            </span>
          </div>
        )}

        {/* Price */}
        {tour.price && (
          <div className="absolute bottom-4 end-4">
            <span className="font-heading text-white text-xl font-medium">
              {lang === 'fa' ? 'از ' : lang === 'ar' ? 'من ' : 'from '}${tour.price.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-accent/40 text-xs">❖</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        <h2 className="font-heading text-2xl lg:text-3xl font-medium text-foreground mb-1 group-hover:text-accent transition-colors duration-300">
          {tour.title}
        </h2>
        <p className="font-body text-xs text-accent mb-3 tracking-wide">{tour.cities || tour.location}</p>
        <p className="font-body text-sm text-foreground/65 leading-relaxed mb-4 line-clamp-2">
          {tour.description}
        </p>

        {/* Highlights */}
        {tour.highlights && tour.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tour.highlights.slice(0, 3).map((h, j) => (
              <span key={j} className="px-2.5 py-1 text-xs font-body rounded-lg border border-border/70 text-muted-foreground bg-secondary/50">
                {h}
              </span>
            ))}
            {tour.highlights.length > 3 && (
              <span className="px-2.5 py-1 text-xs font-body text-accent">+{tour.highlights.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div className="flex gap-3 items-center">
            <span className="flex items-center gap-1 text-xs font-body text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-accent/60" />
              {tour.location}
            </span>
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