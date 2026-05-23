import { useState } from 'react';
import { useI18n } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import TourFilters from '@/components/tours/TourFilters';
import TourCard from '@/components/tours/TourCard';
import { useTours, FALLBACK_IMAGE } from '@/hooks/useSupabase';

const DEFAULT_FILTERS = { purpose: 'all', theme: 'all', duration: 'all' };

// TourCard expects multilingual objects ({ en, fa, ar }) for title/desc/cities/highlights.
// Supabase stores flat strings, so we wrap them here without changing the TourCard UI.
const toMultilangText = (val) => {
  if (val && typeof val === 'object' && !Array.isArray(val)) return val;
  const v = val ?? '';
  return { en: v, fa: v, ar: v };
};

const toMultilangArray = (val) => {
  if (val && typeof val === 'object' && !Array.isArray(val) && (val.en || val.fa || val.ar)) return val;
  const arr = Array.isArray(val) ? val : [];
  return { en: arr, fa: arr, ar: arr };
};

const normalizeTour = (tour) => ({
  ...tour,
  title: toMultilangText(tour.title),
  desc: toMultilangText(tour.desc ?? tour.description),
  cities: toMultilangText(tour.cities),
  highlights: toMultilangArray(tour.highlights),
  cityCount: tour.cityCount ?? tour.city_count ?? 0,
  priceFrom: tour.priceFrom ?? tour.price_from ?? null,
});

const pickImage = (tour) => {
  if (tour.cover_image) return tour.cover_image;
  if (tour.image_url) return tour.image_url;
  if (tour.image) return tour.image;
  if (Array.isArray(tour.gallery) && tour.gallery[0]) return tour.gallery[0];
  return FALLBACK_IMAGE;
};

export default function Tours() {
  const { dir, lang } = useI18n();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { tours, loading, error } = useTours(filters);

  const loadingText = lang === 'fa' ? 'در حال بارگذاری تورها...' : lang === 'ar' ? 'جار تحميل الرحلات...' : 'Loading tours...';
  const errorTitle = lang === 'fa' ? 'بارگذاری تورها با خطا مواجه شد' : lang === 'ar' ? 'فشل تحميل الرحلات' : 'Failed to load tours';

  return (
    <div dir={dir} className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Filters */}
        <TourFilters filters={filters} onChange={setFilters} resultCount={tours.length} />

        {/* States */}
        {loading ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-border flex items-center justify-center animate-pulse">
              <span className="text-3xl text-accent/40">❋</span>
            </div>
            <p className="font-heading text-xl text-muted-foreground font-light">{loadingText}</p>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-destructive/40 flex items-center justify-center">
              <span className="text-3xl text-destructive/60">!</span>
            </div>
            <p className="font-heading text-2xl text-muted-foreground font-light">{errorTitle}</p>
            <p className="font-body text-sm text-destructive mt-2">{error}</p>
          </div>
        ) : (
          /* Tour Grid */
          <AnimatePresence mode="wait">
            {tours.length === 0 ? (
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
                {tours.map((tour, i) => (
                  <TourCard
                    key={tour.id}
                    tour={normalizeTour(tour)}
                    image={pickImage(tour)}
                    index={i}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Bottom Persian carpet border */}
        {!loading && !error && tours.length > 0 && (
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
