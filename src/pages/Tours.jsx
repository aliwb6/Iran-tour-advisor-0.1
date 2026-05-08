import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { useTours, FALLBACK_IMAGE } from '@/hooks/useSupabase';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import { TourCardSkeleton } from '@/components/ui/Skeletons';

const DEFAULT_FILTERS = { purpose: 'all', theme: 'all', duration: 'all' };

export default function Tours() {
  const { t, dir, lang } = useI18n();
  const navigate = useNavigate();

  const { tours, loading, error } = useTours(DEFAULT_FILTERS);

  return (
    <div dir={dir} className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TourCardSkeleton />
            <TourCardSkeleton />
            <TourCardSkeleton />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="font-heading text-2xl text-muted-foreground font-light">
              {lang === 'fa' ? 'خطا در بارگذاری' : lang === 'ar' ? 'خطأ في التحميل' : 'Failed to load'}
            </p>
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-border flex items-center justify-center">
              <span className="text-3xl text-accent/40">❋</span>
            </div>
            <p className="font-heading text-2xl text-muted-foreground font-light">
              {lang === 'fa' ? 'توری یافت نشد' : lang === 'ar' ? 'لم يتم العثور على جولات' : 'No tours found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour, i) => (
              <TourCard key={tour.id} tour={tour} index={i} />
            ))}
          </div>
        )}

        {tours.length > 0 && (
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

      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={tour.cover_image || tour.image_url || FALLBACK_IMAGE}
          alt={tour.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

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

        {tour.price && (
          <div className="absolute bottom-4 end-4">
            <span className="font-heading text-white text-xl font-medium">
              {lang === 'fa' ? 'از ' : lang === 'ar' ? 'من ' : 'from '}${tour.price.toLocaleString()}
            </span>
          </div>
        )}
      </div>

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

        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <span className="flex items-center gap-1 text-xs font-body text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-accent/60" />
            {tour.location}
          </span>
          <button className="flex items-center gap-1.5 text-sm font-body font-semibold text-accent hover:gap-2.5 transition-all duration-200">
            {t('package_inquiry')}
            <span className="text-lg leading-none">→</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}