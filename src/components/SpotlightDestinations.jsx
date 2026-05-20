import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';

// Single source of truth for the homepage spotlight grid.
// Slugs match the keys in CityPage.jsx's cityData so the cards route correctly.
const SPOTLIGHT_CITIES = [
  {
    slug: 'isfahan',
    image: '/images/isfahan.jpg',
    name:     { en: 'Isfahan',  fa: 'اصفهان',   ar: 'أصفهان' },
    category: { en: 'Architecture', fa: 'معماری', ar: 'العمارة' },
  },
  {
    slug: 'shiraz',
    image: '/images/shiraz.jpg',
    name:     { en: 'Shiraz',   fa: 'شیراز',    ar: 'شيراز' },
    category: { en: 'History',  fa: 'تاریخ',    ar: 'التاريخ' },
  },
  {
    slug: 'yazd',
    image: '/images/yazd.jpg',
    name:     { en: 'Yazd',     fa: 'یزد',      ar: 'يزد' },
    category: { en: 'Culture',  fa: 'فرهنگ',    ar: 'الثقافة' },
  },
  {
    slug: 'mashhad',
    image: '/images/mashhad.jpg',
    name:     { en: 'Mashhad',    fa: 'مشهد',    ar: 'مشهد' },
    category: { en: 'Spiritual',  fa: 'معنوی',   ar: 'روحاني' },
  },
  {
    slug: 'gilan',
    image: '/images/Gilan.jpg',
    name:     { en: 'Gilan',   fa: 'گیلان',   ar: 'جيلان' },
    category: { en: 'Nature', fa: 'طبیعت',   ar: 'الطبيعة' },
  },
  {
    slug: 'lorestan',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
    name:     { en: 'Lorestan',   fa: 'لرستان',     ar: 'لرستان' },
    category: { en: 'Adventure',  fa: 'ماجراجویی',  ar: 'مغامرة' },
  },
];

export default function SpotlightDestinations() {
  const { lang, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const heading = {
    eyebrow: lang === 'fa' ? 'مقصدها' : lang === 'ar' ? 'الوجهات' : 'Destinations',
    title:   lang === 'fa' ? 'شگفتی‌های پنهان ایران را کشف کن' : lang === 'ar' ? 'اكتشف عجائب إيران الخفية' : "Explore Iran's Hidden Wonders",
    sub:     lang === 'fa'
      ? 'از معماری کهن تا طبیعت بکر — ایران را شهر به شهر کشف کن.'
      : lang === 'ar'
      ? 'من العمارة العريقة إلى الطبيعة البكر — اكتشف إيران مدينةً بمدينة.'
      : 'From ancient architecture to untouched nature — discover Iran city by city',
    explore: lang === 'fa' ? 'کاوش' : lang === 'ar' ? 'استكشف' : 'Explore',
  };

  return (
    <section dir={dir} className="section-gap bg-background">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 lg:mb-16"
        >
          <p className="font-body text-xs uppercase tracking-[0.25em] text-gold mb-3 flex items-center justify-center gap-3">
            <span className="block w-8 h-px bg-gold/60" />
            {heading.eyebrow}
            <span className="block w-8 h-px bg-gold/60" />
          </p>
          <h2 className="font-heading text-display-sm text-foreground mb-3">{heading.title}</h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto leading-relaxed">{heading.sub}</p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {SPOTLIGHT_CITIES.map((city, i) => (
            <motion.div
              key={city.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/destinations/${city.slug}`}
                className="group relative block aspect-[4/5] rounded-3xl overflow-hidden border border-border/40 hover:border-gold/40 shadow-md hover:shadow-2xl hover:shadow-black/30 transition-all duration-500"
              >
                {/* Background image */}
                <img
                  src={city.image}
                  alt={city.name[lang] || city.name.en}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 group-hover:from-black/85 transition-colors duration-500" />
                {/* Category badge */}
                <span className="absolute top-4 start-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[10px] font-semibold uppercase tracking-wider text-white">
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  {city.category[lang] || city.category.en}
                </span>

                {/* Bottom: name + explore CTA */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <div className="flex items-center gap-1.5 text-white/70 text-[11px] mb-1.5">
                    <MapPin className="w-3 h-3 text-gold" />
                    {lang === 'fa' ? 'ایران' : lang === 'ar' ? 'إيران' : 'Iran'}
                  </div>
                  <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-white leading-tight mb-3 group-hover:text-gold transition-colors">
                    {city.name[lang] || city.name.en}
                  </h3>
                  {/* "Explore →" reveals on hover (always visible on mobile via opacity-100 below md) */}
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gold opacity-90 md:opacity-0 md:translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    {heading.explore}
                    <Arrow className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
