import { useParams, Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import {
  Clock, MapPin, CheckCircle, XCircle,
  ArrowRight, ArrowLeft, Star, Phone, Mail, Instagram,
} from 'lucide-react';
import { useTourBySlug, FALLBACK_IMAGE } from '@/hooks/useSupabase';

const purposeBadgeConfig = {
  leisure: { en: 'Leisure', fa: 'تفریحی', ar: 'ترفيه', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  work: { en: 'Business', fa: 'کسب‌وکار', ar: 'أعمال', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  research: { en: 'Research', fa: 'تحقیقاتی', ar: 'بحثي', color: 'bg-violet-500/15 text-violet-700 dark:text-violet-400' },
  spiritual: { en: 'Spiritual', fa: 'معنوی', ar: 'روحاني', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400' },
};

const pickLang = (val, lang) => {
  if (val == null) return '';
  if (typeof val === 'object' && !Array.isArray(val)) return val[lang] || val.en || '';
  return val;
};

const pickLangArray = (val, lang) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') {
    const arr = val[lang] || val.en;
    return Array.isArray(arr) ? arr : [];
  }
  return [];
};

const pickHeroImage = (tour) => {
  if (!tour) return FALLBACK_IMAGE;
  if (Array.isArray(tour.gallery) && tour.gallery[0]) return tour.gallery[0];
  return tour.cover_image || tour.image_url || tour.image || FALLBACK_IMAGE;
};

export default function TourDetails() {
  const { slug } = useParams();
  const { t, lang, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const { tour, loading, error } = useTourBySlug(slug);

  if (loading) {
    return (
      <div dir={dir} className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <p className="font-body text-muted-foreground">
          {lang === 'fa' ? 'در حال بارگذاری تور...' : lang === 'ar' ? 'جار تحميل الرحلة...' : 'Loading tour...'}
        </p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div dir={dir} className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-foreground mb-4">
            {lang === 'fa' ? 'تور یافت نشد' : lang === 'ar' ? 'الرحلة غير موجودة' : 'Tour Not Found'}
          </h1>
          {error && <p className="font-body text-sm text-destructive mb-4">{error}</p>}
          <Link to="/tours" className="text-accent hover:underline">{t('view_all')} →</Link>
        </div>
      </div>
    );
  }

  const title = pickLang(tour.title, lang);
  const desc = pickLang(tour.desc ?? tour.description, lang);
  const location = pickLang(tour.location, lang);
  const highlights = pickLangArray(tour.highlights, lang);
  const included = pickLangArray(tour.included, lang);
  const excluded = pickLangArray(tour.excluded, lang);
  const itinerary = Array.isArray(tour.itinerary) ? tour.itinerary : [];
  const cityCount = tour.cityCount ?? tour.city_count ?? 0;
  const priceFrom = tour.priceFrom ?? tour.price_from ?? null;
  const heroImage = pickHeroImage(tour);

  return (
    <div dir={dir} className="pt-0 pb-20 min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src={heroImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Back button */}
        <Link
          to="/tours"
          className="absolute top-24 start-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
        >
          <Arrow className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          {lang === 'fa' ? 'بازگشت' : lang === 'ar' ? 'رجوع' : 'Back'}
        </Link>

        {/* Title overlay */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {tour.duration != null && (
                  <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-body flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {tour.duration} {t('package_duration')}
                  </span>
                )}
                {location && (
                  <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-body flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {location}
                  </span>
                )}
                {tour.purpose && purposeBadgeConfig[tour.purpose] && (
                  <span className={`px-3 py-1.5 rounded-full text-xs font-body font-medium ${purposeBadgeConfig[tour.purpose].color}`}>
                    {purposeBadgeConfig[tour.purpose][lang] || purposeBadgeConfig[tour.purpose].en}
                  </span>
                )}
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
                {title}
              </h1>

              <p className="font-body text-white/80 text-lg max-w-2xl">
                {desc}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Quick Info Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl bg-card border border-border/50 mb-10"
        >
          <div className="flex flex-wrap gap-8">
            {tour.duration != null && (
              <div>
                <p className="font-body text-xs text-muted-foreground mb-1">{t('package_duration')}</p>
                <p className="font-heading text-lg font-semibold text-foreground">{tour.duration} {t('package_duration')}</p>
              </div>
            )}
            {cityCount > 0 && (
              <div>
                <p className="font-body text-xs text-muted-foreground mb-1">{t('package_cities')}</p>
                <p className="font-heading text-lg font-semibold text-foreground">{cityCount}</p>
              </div>
            )}
            {tour.difficulty && (
              <div>
                <p className="font-body text-xs text-muted-foreground mb-1">{t('package_difficulty')}</p>
                <p className="font-heading text-lg font-semibold text-foreground">{t(`difficulty_${tour.difficulty}`)}</p>
              </div>
            )}
            {tour.cultural && (
              <div>
                <p className="font-body text-xs text-muted-foreground mb-1">{t('package_cultural')}</p>
                <p className="font-heading text-lg font-semibold text-foreground">{t(`cultural_${tour.cultural}`)}</p>
              </div>
            )}
          </div>

          {priceFrom != null && (
            <div className="text-start">
              <p className="font-body text-xs text-muted-foreground mb-1">
                {lang === 'fa' ? 'قیمت از' : lang === 'ar' ? 'السعر من' : 'from'}
              </p>
              <p className="font-heading text-3xl font-bold text-accent">
                ${Number(priceFrom).toLocaleString()}
              </p>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            {desc && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  {lang === 'fa' ? 'مرور کلی' : lang === 'ar' ? 'نظرة عامة' : 'Overview'}
                </h2>
                <p className="font-body text-foreground/70 leading-relaxed">
                  {desc}
                </p>
              </section>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  {lang === 'fa' ? 'نکات برجسته' : lang === 'ar' ? 'أبرز المعالم' : 'Highlights'}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-secondary/50">
                      <Star className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span className="font-body text-sm text-foreground">{h}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                  {lang === 'fa' ? 'برنامه سفر' : lang === 'ar' ? 'خط الرحلة' : 'Tour Plan'}
                </h2>
                <div className="space-y-4">
                  {itinerary.map((day, i) => {
                    const dayTitle = pickLang(day.title, lang);
                    const dayDesc = pickLang(day.desc ?? day.description, lang);
                    return (
                      <div key={i} className="border border-border/50 rounded-2xl overflow-hidden">
                        <div className="flex items-stretch">
                          <div className="w-16 sm:w-20 bg-accent/10 flex flex-col items-center justify-center p-4">
                            <span className="font-heading text-xl font-bold text-accent">{day.day ?? i + 1}</span>
                            <span className="font-body text-xs text-muted-foreground">
                              {lang === 'fa' ? 'روز' : lang === 'ar' ? 'يوم' : 'Day'}
                            </span>
                          </div>
                          <div className="flex-1 p-4">
                            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{dayTitle}</h3>
                            <p className="font-body text-sm text-foreground/70">{dayDesc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Included / Excluded */}
            {(included.length > 0 || excluded.length > 0) && (
              <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {included.length > 0 && (
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        {lang === 'fa' ? 'شامل' : lang === 'ar' ? 'مشمول' : 'Included'}
                      </h3>
                      <ul className="space-y-2">
                        {included.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 font-body text-sm text-foreground/70">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {excluded.length > 0 && (
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        {lang === 'fa' ? 'شامل نیست' : lang === 'ar' ? 'غير مشمول' : 'Not Included'}
                      </h3>
                      <ul className="space-y-2">
                        {excluded.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 font-body text-sm text-foreground/70">
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Gallery */}
            {Array.isArray(tour.gallery) && tour.gallery.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  {lang === 'fa' ? 'گالری' : lang === 'ar' ? 'معرض الصور' : 'Gallery'}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {tour.gallery.map((img, i) => (
                    <div key={i} className="aspect-video rounded-xl overflow-hidden">
                      <img src={img} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Booking Card */}
              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                  {lang === 'fa' ? 'رزرو کنید' : lang === 'ar' ? 'احجز الآن' : 'Book This Tour'}
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

              {/* Share */}
              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                  {lang === 'fa' ? 'به اشتراک بگذارید' : lang === 'ar' ? 'مشاركة' : 'Share'}
                </h3>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/20 transition-colors">
                    <Instagram className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
