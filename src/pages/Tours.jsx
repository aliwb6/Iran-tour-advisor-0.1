import { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import TourFilters from '@/components/tours/TourFilters';
import TourCard from '@/components/tours/TourCard';
import { tours, TOUR_IMAGES } from '@/data/tours';

const DEFAULT_FILTERS = { purpose: 'all', theme: 'all', duration: 'all' };

export default function Tours() {
  const { t, dir, lang } = useI18n();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    return tours.filter(tour => {
      if (filters.purpose !== 'all' && tour.purpose !== filters.purpose) return false;
      if (filters.theme !== 'all' && tour.theme !== filters.theme) return false;
      if (filters.duration !== 'all') {
        if (filters.duration === 'short' && tour.duration > 7) return false;
        if (filters.duration === 'medium' && (tour.duration < 8 || tour.duration > 11)) return false;
        if (filters.duration === 'long' && tour.duration < 12) return false;
      }
      return true;
    });
  }, [filters]);

  return (
    <div dir={dir} className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Header with Persian carpet border motif */}
        <div className="relative mb-14">
          {/* Top Persian ornamental border */}
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
            {/* Decorative label */}
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
        <TourFilters filters={filters} onChange={setFilters} resultCount={filtered.length} />

        {/* Tour Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              {/* Persian carpet medallion decoration */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-border flex items-center justify-center">
                <span className="text-3xl text-accent/40">❋</span>
              </div>
              <p className="font-heading text-2xl text-muted-foreground font-light">
                {lang === 'fa' ? 'توری با این فیلترها یافت نشد' : lang === 'ar' ? 'لا توجد رحلات بهذه المعايير' : 'No tours match these filters'}
              </p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-4 text-sm font-body text-accent hover:underline"
              >
                {lang === 'fa' ? 'پاک کردن فیلترها' : lang === 'ar' ? 'مسح الفلاتر' : 'Clear all filters'}
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
              {filtered.map((tour, i) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  image={TOUR_IMAGES[(tour.id - 1) % TOUR_IMAGES.length]}
                  index={i}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Persian carpet border */}
        {filtered.length > 0 && (
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
