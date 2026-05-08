import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Clock, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTours, FALLBACK_IMAGE } from '@/hooks/useSupabase';
import { useNavigate } from 'react-router-dom';

const IMAGE_INDICES = [0, 2, 1];

export default function FeaturedPackages() {
  const { t, dir, lang } = useI18n();
  const navigate = useNavigate();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const { tours, loading, error } = useTours({});
  const featuredTours = tours.slice(0, 3);

  if (error) {
    return null;
  }

  return (
    <section dir={dir} className="section-gap bg-background">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-body text-xs uppercase tracking-[1.5em] text-accent mb-3 flex items-center gap-2">
              <span className="block w-6 h-px bg-accent" />
              {lang === 'fa' ? 'سفرهای_selected' : lang === 'ar' ? 'رحلات منتقاة' : 'Featured_ Journeys'}
            </p>
            <h2 className="font-heading text-display-sm text-foreground">{t('packages_title')}</h2>
            <p className="font-body text-muted-foreground mt-2">{t('packages_subtitle')}</p>
          </motion.div>
          <Link
            to="/tours"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-body font-medium text-accent hover:gap-3 transition-all"
          >
            {t('view_all')}
            <Arrow className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-card rounded-3xl overflow-hidden border border-border/50">
                <div className="aspect-[4/3] animate-pulse bg-muted" />
                <div className="p-6 space-y-3">
                  <div className="h-6 w-3/4 animate-pulse bg-muted rounded" />
                  <div className="h-4 w-1/2 animate-pulse bg-muted rounded" />
                  <div className="h-4 w-full animate-pulse bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tours Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {featuredTours.map((tour, i) => (
              <motion.article
                key={tour.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/tours/${tour.slug}`)}
                className="group relative bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-accent/30 hover:shadow-xl transition-all duration-500 cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={tour.image_url || FALLBACK_IMAGE}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  
                  {/* Duration Badge */}
                  <div className="absolute top-4 start-4">
                    <span className="px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-body flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {tour.duration} {t('package_duration')}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  {/* Title */}
                  <h3 className="font-heading text-xl sm:text-2xl font-medium text-foreground mb-2 group-hover:text-accent transition-colors">
                    {tour.title}
                  </h3>
                  
                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    {tour.location}
                  </div>
                  
                  {/* Description */}
                  <p className="font-body text-sm text-foreground/65 leading-relaxed line-clamp-2 mb-4">
                    {tour.description}
                  </p>
                  
                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/40">
                    <span className="font-heading text-lg font-semibold text-accent">
                      ${tour.price}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-body font-medium text-accent">
                      {t('package_view')}
                      <Arrow className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}