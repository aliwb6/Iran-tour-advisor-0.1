import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';
import { useState, useRef, useEffect } from 'react';

// Single source of truth for the homepage spotlight grid.
// Slugs match the keys in CityPage.jsx's cityData so the cards route correctly.
const SPOTLIGHT_CITIES = [
  {
    slug: 'tehran',
    image: '/images/tehran.jpg',
    name:     { en: 'Tehran',  fa: 'تهران',   ar: 'طهران' },
    category: { en: 'Culture', fa: 'فرهنگ', ar: 'الثقافة' },
  },
  {
    slug: 'shiraz',
    image: '/images/shiraz.jpg',
    name:     { en: 'Shiraz',   fa: 'شیراز',    ar: 'شيراز' },
    category: { en: 'History',  fa: 'تاریخ',    ar: 'التاريخ' },
  },
  {
    slug: 'isfahan',
    image: '/images/isfahan.jpg',
    name:     { en: 'Isfahan',  fa: 'اصفهان',   ar: 'أصفهان' },
    category: { en: 'Architecture', fa: 'معماری', ar: 'العمارة' },
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
    slug: 'rasht',
    image: '/images/rasht.jpg',
    name:     { en: 'Rasht',   fa: 'رشت',   ar: 'رشت' },
    category: { en: 'Nature', fa: 'طبیعت',   ar: 'الطبيعة' },
  },
  {
    slug: 'kerman',
    image: '/images/kerman.jpg',
    name:     { en: 'Kerman',  fa: 'کرمان',   ar: 'كرمان' },
    category: { en: 'History', fa: 'تاریخ', ar: 'التاريخ' },
  },
  {
    slug: 'kashan',
    image: '/images/kashan.jpg',
    name:     { en: 'Kashan',  fa: 'کاشان',   ar: 'كاشان' },
    category: { en: 'Architecture', fa: 'معماری', ar: 'العمارة' },
  },
  {
    slug: 'qom',
    image: '/images/qom.jpg',
    name:     { en: 'Qom',  fa: 'قم',   ar: 'قم' },
    category: { en: 'Spiritual', fa: 'معنوی', ar: 'روحاني' },
  },
  {
    slug: 'tabriz',
    image: '/images/tabriz.jpg',
    name:     { en: 'Tabriz',  fa: 'تبریز',   ar: 'تبريز' },
    category: { en: 'Culture', fa: 'فرهنگ', ar: 'الثقافة' },
  },
  {
    slug: 'kish-island',
    image: '/images/kish island.jpg',
    name:     { en: 'Kish Island',  fa: 'جزیره کیش',   ar: 'جزيرة كيش' },
    category: { en: 'Nature', fa: 'طبیعت', ar: 'الطبيعة' },
  },
  {
    slug: 'qeshm-island',
    image: '/images/qeshm island.jpg',
    name:     { en: 'Qeshm Island',  fa: 'جزیره قشم',   ar: 'جزيرة قشم' },
    category: { en: 'Nature', fa: 'طبیعت', ar: 'الطبيعة' },
  },
  {
    slug: 'hormuz-island',
    image: '/images/Hormuz Island.jpg',
    name:     { en: 'Hormuz Island',  fa: 'جزیره هرمز',   ar: 'جزيرة هرمز' },
    category: { en: 'Nature', fa: 'طبیعت', ar: 'الطبيعة' },
  },
];

export default function SpotlightDestinations() {
  const { lang, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  // Tracks the active flex gap (gap-5 = 20px below lg, lg:gap-6 = 24px at ≥1024px)
  // so the width/translate math can account for it exactly.
  const [gapPx, setGapPx] = useState(24);
  const [isHovering, setIsHovering] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    const updateLayout = () => {
      if (window.innerWidth < 768) { setVisibleCards(1); setGapPx(20); }
      else if (window.innerWidth < 1024) { setVisibleCards(2); setGapPx(20); }
      else { setVisibleCards(3); setGapPx(24); }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const maxSlide = Math.max(0, SPOTLIGHT_CITIES.length - visibleCards);
  const canGoNext = currentSlide < maxSlide;
  const canGoPrev = currentSlide > 0;

  const handlePrevious = () => {
    if (canGoPrev) setCurrentSlide(currentSlide - 1);
  };

  const handleNext = () => {
    if (canGoNext) setCurrentSlide(currentSlide + 1);
  };

  useEffect(() => {
    if (isHovering) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev >= maxSlide) return 0;
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [maxSlide, isHovering]);

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

        {/* Carousel container */}
        <div
          ref={carouselRef}
          className="overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <motion.div
            className="flex gap-5 lg:gap-6"
            animate={{
              x: `calc(-1 * ${currentSlide} * (100% - ${gapPx * (visibleCards - 1)}px) / ${visibleCards} - ${currentSlide * gapPx}px)`,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {SPOTLIGHT_CITIES.map((city, i) => {
              const cityName = lang === 'fa' ? city.name.fa : lang === 'ar' ? city.name.ar : city.name.en;
              const cityCategory = lang === 'fa' ? city.category.fa : lang === 'ar' ? city.category.ar : city.category.en;
              const countryLabel = lang === 'fa' ? 'ایران' : lang === 'ar' ? 'إيران' : 'Iran';

              return (
              <motion.div
                key={city.slug}
                className="flex-shrink-0"
                style={{ width: `calc((100% - ${gapPx * (visibleCards - 1)}px) / ${visibleCards})` }}
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
              <img decoding="async"
                src={city.image}
                alt={cityName}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 group-hover:from-black/85 transition-colors duration-500" />
              {/* Category badge */}
              <span className="absolute top-4 start-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[10px] font-semibold uppercase tracking-wider text-white">
                <span className="w-1 h-1 rounded-full bg-gold" />
                {cityCategory}
              </span>

              {/* Bottom: name + explore CTA */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <div className="flex items-center gap-1.5 text-white/70 text-[11px] mb-1.5">
                  <MapPin className="w-3 h-3 text-gold" />
                  {countryLabel}
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-white leading-tight mb-3 group-hover:text-gold transition-colors">
                  {cityName}
                </h3>
                {/* "Explore →" reveals on hover (always visible on mobile via opacity-100 below md) */}
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gold opacity-90 md:opacity-0 md:translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  {heading.explore}
                  <Arrow className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
                </Link>
              </motion.div>
            );
            })}

          </motion.div>
        </div>

        {/* Navigation controls below carousel */}
        <div className="flex justify-center items-center gap-6 mt-8 lg:mt-10">
          {/* Left arrow */}
          <button
            onClick={handlePrevious}
            disabled={!canGoPrev}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border-2 ${
              canGoPrev
                ? 'bg-white border-gold/40 text-gold hover:bg-gold/5 hover:border-gold/60 shadow-md hover:shadow-lg'
                : 'bg-white/60 border-gold/20 text-gold/40 cursor-not-allowed'
            }`}
            aria-label="Previous"
          >
            {dir === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Dot indicators */}
          <div className="flex gap-2.5 px-4">
            {SPOTLIGHT_CITIES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(Math.min(i, maxSlide))}
                className={`rounded-full transition-all ${
                  i >= currentSlide && i < currentSlide + visibleCards
                    ? 'w-3 h-3 bg-gold'
                    : 'w-2.5 h-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/60'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border-2 ${
              canGoNext
                ? 'bg-white border-gold/40 text-gold hover:bg-gold/5 hover:border-gold/60 shadow-md hover:shadow-lg'
                : 'bg-white/60 border-gold/20 text-gold/40 cursor-not-allowed'
            }`}
            aria-label="Next"
          >
            {dir === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </section>
  );
}
