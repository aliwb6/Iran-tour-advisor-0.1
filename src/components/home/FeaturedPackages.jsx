import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Clock, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';

const packages = [
  {
    title: { en: "Persian Jewels", fa: "جواهرات ایران", ar: "جواهر فارس" },
    cities: { en: "Isfahan · Shiraz · Yazd", fa: "اصفهان · شیراز · یزد", ar: "أصفهان · شيراز · يزد" },
    duration: { en: "10 days", fa: "۱۰ روز", ar: "10 أيام" },
    tag: { en: "Bestseller", fa: "پرفروش‌ترین", ar: "الأكثر مبيعاً" },
    desc: { en: "Turquoise domes, poetic gardens, and ancient wind catchers.", fa: "گنبدهای فیروزه‌ای، باغ‌های شاعرانه و بادگیرهای کهن.", ar: "قباب فيروزية وحدائق شعرية وملاقف قديمة." },
  },
  {
    title: { en: "Desert Whispers", fa: "نجوای کویر", ar: "همسات الصحراء" },
    cities: { en: "Kerman · Lut Desert", fa: "کرمان · کویر لوت", ar: "كرمان · صحراء لوت" },
    duration: { en: "7 days", fa: "۷ روز", ar: "7 أيام" },
    tag: { en: "Adventure", fa: "ماجراجویانه", ar: "مغامرة" },
    desc: { en: "Star-lit nights and ancient Silk Road caravanserais.", fa: "شب‌های پرستاره و کاروانسراهای کهن جاده ابریشم.", ar: "ليالٍ مرصعة بالنجوم وخانات طريق الحرير." },
  },
  {
    title: { en: "Ancient Persia", fa: "ایران باستان", ar: "بلاد فارس القديمة" },
    cities: { en: "Shiraz · Pasargadae", fa: "شیراز · پاسارگاد", ar: "شيراز · باسارغاد" },
    duration: { en: "9 days", fa: "۹ روز", ar: "9 أيام" },
    tag: { en: "Heritage", fa: "میراث", ar: "تراث" },
    desc: { en: "Walk through millennia at Persepolis and Naqsh-e Rostam.", fa: "قدم زدن در هزاره‌های تاریخ در تخت جمشید و نقش رستم.", ar: "تجوّل عبر الآلاف السنين في برسبوليس ونقش رستم." },
  },
];

const IMAGES = [
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/67ecc93d7_generated_d105795a.png",
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/cce446b52_generated_d017c773.png",
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/edfc38152_generated_aa7676e0.png",
];

export default function FeaturedPackages() {
  const { t, dir, lang } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

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
            <p className="font-body text-xs uppercase tracking-[0.2em] text-accent mb-3 flex items-center gap-2">
              <span className="block w-6 h-px bg-accent" />
              {lang === 'fa' ? 'سفرهای منتخب' : lang === 'ar' ? 'رحلات منتقاة' : 'Featured Journeys'}
            </p>
            <h2 className="font-heading text-display-sm text-foreground">{t('packages_title')}</h2>
            <p className="font-body text-muted-foreground mt-2">{t('packages_subtitle')}</p>
          </motion.div>
          <Link
            to="/tours"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-body font-medium text-accent hover:gap-3 transition-all"
          >
            {t('view_all')} <Arrow className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {packages.map((pkg, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="group cursor-pointer"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-5 shadow-warm">
                <img
                  src={IMAGES[i]}
                  alt={pkg.title[lang] || pkg.title.en}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-107"
                  style={{ transformOrigin: 'center' }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />

                {/* Tag */}
                <div className="absolute top-4 start-4">
                  <span className="bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] font-body font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full">
                    {pkg.tag[lang] || pkg.tag.en}
                  </span>
                </div>

                {/* Bottom meta */}
                <div className="absolute bottom-4 start-4 end-4">
                  <h3 className="font-heading text-2xl text-white mb-1">{pkg.title[lang] || pkg.title.en}</h3>
                  <div className="flex items-center gap-3 text-white/70 text-xs font-body">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {pkg.cities[lang] || pkg.cities.en}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {pkg.duration[lang] || pkg.duration.en}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desc */}
              <p className="font-body text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/70 transition-colors">
                {pkg.desc[lang] || pkg.desc.en}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}