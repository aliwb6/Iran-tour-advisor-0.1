import { useParams, Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { usePackageById, FALLBACK_IMAGE } from '@/hooks/useSupabase';
import { TourDetailsSkeleton } from '@/components/ui/Skeletons';
import {
  MapPin, Star, Phone, Mail, Check, X, Calendar
} from 'lucide-react';

export default function PackageDetails() {
  const { id } = useParams();
  const { t, lang, dir } = useI18n();
  const Arrow = dir === 'rtl' ? '←' : '→';

  const { pkg, loading, error } = usePackageById(id);

  if (loading) {
    return <TourDetailsSkeleton />;
  }

  if (error || !pkg) {
    return (
      <div dir={dir} className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-foreground mb-4">
            {lang === 'fa' ? 'پکیج یافت نشد' : lang === 'ar' ? 'الباقة غير موجودة' : 'Package Not Found'}
          </h1>
          <Link to="/tours" className="text-accent hover:underline">
            {t('view_all')} →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="pt-0 pb-20 min-h-screen">
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src={pkg.header_image || FALLBACK_IMAGE}
          alt={pkg.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        <Link 
          to="/tours" 
          className="absolute top-24 start-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
        >
          <span>{Arrow}</span>
          {t('back_to_home')}
        </Link>

        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-body flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {pkg.days} {lang === 'fa' ? 'روز' : lang === 'ar' ? 'أيام' : 'days'}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-body flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {pkg.cities} {lang === 'fa' ? 'شهر' : lang === 'ar' ? 'مدن' : 'cities'}
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
                {pkg.title}
              </h1>

              <p className="font-body text-white/80 text-lg max-w-2xl">
                {pkg.description}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl bg-card border border-border/50 mb-10"
        >
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="font-body text-xs text-muted-foreground mb-1">{t('package_duration')}</p>
              <p className="font-heading text-lg font-semibold text-foreground">{pkg.days} {lang === 'fa' ? 'روز' : lang === 'ar' ? 'يوم' : 'days'}</p>
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground mb-1">{t('package_cities')}</p>
              <p className="font-heading text-lg font-semibold text-foreground">{pkg.cities}</p>
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground mb-1">
                {lang === 'fa' ? 'قیمت' : lang === 'ar' ? 'السعر' : 'Price'}
              </p>
              <p className="font-heading text-lg font-semibold text-foreground">
                ${pkg.price?.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {lang === 'fa' ? 'overview' : lang === 'ar' ? 'نظرة عامة' : 'Overview'}
              </h2>
              <p className="font-body text-foreground/70 leading-relaxed">
                {pkg.description}
              </p>
            </section>

            {pkg.highlights && pkg.highlights.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  {lang === 'fa' ? 'نکات برجسته' : lang === 'ar' ? 'المرورزات' : 'Highlights'}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {pkg.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-secondary/50">
                      <Star className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span className="font-body text-sm text-foreground">{h}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {pkg.itinerary && pkg.itinerary.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                  {lang === 'fa' ? 'برنامه سفر' : lang === 'ar' ? 'خط الرحلة' : 'Tour Plan'}
                </h2>
                <div className="space-y-4">
                  {pkg.itinerary.map((day, i) => (
                    <div key={i} className="border border-border/50 rounded-2xl overflow-hidden">
                      <div className="flex items-stretch">
                        <div className="w-16 sm:w-20 bg-accent/10 flex flex-col items-center justify-center p-4">
                          <span className="font-heading text-xl font-bold text-accent">{day.day}</span>
                          <span className="font-body text-xs text-muted-foreground">
                            {lang === 'fa' ? 'روز' : lang === 'ar' ? 'يوم' : 'Day'}
                          </span>
                        </div>
                        <div className="flex-1 p-4">
                          <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{day.title}</h3>
                          <p className="font-body text-sm text-foreground/70">{day.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(pkg.included?.length > 0 || pkg.not_included?.length > 0) && (
              <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                      {lang === 'fa' ? 'شامل' : lang === 'ar' ? 'مشمول' : 'Included'}
                    </h3>
                    <ul className="space-y-2">
                      {pkg.included?.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 font-body text-sm text-foreground/70">
                          <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                      {lang === 'fa' ? 'شامل نیست' : lang === 'ar' ? 'غير مشمول' : 'Not Included'}
                    </h3>
                    <ul className="space-y-2">
                      {pkg.not_included?.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 font-body text-sm text-foreground/70">
                          <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                  {lang === 'fa' ? 'رزرو کنید' : lang === 'ar' ? 'احجز الآن' : 'Book This Package'}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <button className="w-full py-3 rounded-xl bg-accent text-white font-body font-semibold hover:bg-accent/90 transition-colors">
                    {lang === 'fa' ? 'رزرو آنلاین' : lang === 'ar' ? 'احجز الآن' : 'Book Now'}
                  </button>
                  <button className="w-full py-3 rounded-xl border border-accent text-accent font-body font-semibold hover:bg-accent/10 transition-colors">
                    {t('package_inquiry')}
                  </button>
                </div>

                <div className="pt-4 border-t border-border/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="font-body text-sm text-foreground/70">+98 912 123 4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-body text-sm text-foreground/70">info@irantours.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
