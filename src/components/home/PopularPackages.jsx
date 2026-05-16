import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { MapPin, Clock, Loader2 } from 'lucide-react';

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1564960723835-2898c9df9297?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1574952561422-b4f6d806e5e9?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519810755548-39cd217da494?w=600&h=400&fit=crop",
];

const COMING_SOON_PACKAGES = [
  {
    id: 1,
    title: { en: 'Persia Heritage Trail', fa: 'مسیر میراث پارس', ar: 'طريق تراث فارس' },
    location: { en: 'Tehran · Isfahan · Shiraz', fa: 'تهران · اصفهان · شیراز', ar: 'طهران · أصفهان · شيراز' },
    duration: 10,
    price: null,
  },
  {
    id: 2,
    title: { en: 'Lut Desert Expedition', fa: 'سفر کویر لوت', ar: 'رحلة صحراء لوت' },
    location: { en: 'Kerman · Dasht-e Lut', fa: 'کرمان · کویر لوت', ar: 'كرمان · صحراء لوت' },
    duration: 6,
    price: null,
  },
  {
    id: 3,
    title: { en: 'Caspian Coastal Journey', fa: 'سفر ساحلی خزر', ar: 'رحلة ساحل قزوين' },
    location: { en: 'Gilan · Mazandaran', fa: 'گیلان · مازندران', ar: 'جيلان · مازندران' },
    duration: 8,
    price: null,
  },
];

export default function PopularPackages() {
  const { t, dir, lang } = useI18n();
  return (
    <section dir={dir} className="section-gap bg-sand/30">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-body text-xs uppercase tracking-[1.5em] text-accent mb-3 flex items-center gap-2">
              <span className="block w-6 h-px bg-accent" />
              {t('packages_title')}
            </p>
            <h2 className="font-heading text-display-sm text-foreground">{t('packages_title')}</h2>
            <p className="font-body text-muted-foreground mt-2">{t('packages_subtitle')}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {COMING_SOON_PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="group relative bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-accent/30 hover:shadow-xl transition-all duration-500"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={SAMPLE_IMAGES[i]}
                  alt={pkg.title[lang] || pkg.title.en}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-0 bg-accent/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    <span className="font-body text-sm text-white font-medium">{t('package_coming_soon')}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span>{pkg.location[lang] || pkg.location.en}</span>
                </div>
                <h3 className="font-heading text-xl sm:text-2xl font-medium text-foreground mb-3 group-hover:text-accent transition-colors">
                  {pkg.title[lang] || pkg.title.en}
                </h3>
                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {pkg.duration} {t('package_duration')}
                  </div>
                  <span className="font-body text-sm text-muted-foreground">
                    {t('package_coming_soon')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="font-body text-sm text-muted-foreground">
            {t('package_coming_soon_desc')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}