import React from 'react';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { useTours, FALLBACK_IMAGE } from '@/hooks/useSupabase';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Globe, Anchor, Compass, Sparkles } from 'lucide-react';

const DEFAULT_FILTERS = { purpose: 'all', theme: 'all', duration: 'all' };

const CATEGORIES = [
  { id: 'all', label: { en: 'All Tours', fa: 'همه تورها', ar: 'كل الجولات' } },
  { id: 'leisure', label: { en: 'Leisure', fa: 'تفریحی', ar: 'ترفيه' } },
  { id: 'business', label: { en: 'Business', fa: 'کسب‌وکار', ar: 'أعمال' } },
  { id: 'research', label: { en: 'Research', fa: 'پژوهشی', ar: 'بحث' } },
  { id: 'spiritual', label: { en: 'Spiritual', fa: 'معنوی', ar: 'روحي' } },
];

const SAMPLE_TOUR = {
  id: 0,
  slug: 'jewels-of-iran',
  title: { en: 'Jewels of Iran', fa: 'جواهرات ایران', ar: 'جواهر إيران' },
  shortDesc: { en: 'A journey through Persia\'s most magnificent cities, from Isfahan\'s turquoise domes to Shiraz\'s poetic gardens and Yazd\'s ancient wind catchers.', fa: 'سفری به میان باشکوه‌ترین شهرهای ایران، از گنبدهای فیروزه‌ای اصفهان تا باغ‌های شاعرانه شیراز و بادگیرهای کهن یزد.', ar: 'رحلة عبر أروع مدن إيران، من قباب أصفهان الفيروزية إلى حدائق شيراز الشعرية وملاقف يزد القديمة.' },
  cities: { en: 'Isfahan, Shiraz, Yazd', fa: 'اصفهان، شیراز، یزد', ar: 'أصفهان، شيراز، يزد' },
  duration: 10,
  cityCount: 6,
  category: 'leisure',
  priceFrom: 1800,
  location: { en: 'Central Iran', fa: 'مرکز ایران', ar: 'وسط إيران' },
  highlights: { en: ['Naqsh-e Jahan', 'Persepolis', 'Eram Garden', 'Yazd Old Town'], fa: ['میدان نقش جهان', 'تخت جمشید', 'باغ ارم', 'بافت قدیم یزد'], ar: ['ميدان نقش جهان', 'برسبوليس', 'حديقة إرام', 'مدينة يزد القديمة'] },
  coverImage: 'https://images.unsplash.com/photo-1564960723835-2898c9df9297?w=800&h=600&fit=crop',
};

export default function Tours() {
  const { t, dir, lang } = useI18n();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = React.useState('all');
  
  const { tours, loading, error } = useTours(DEFAULT_FILTERS);

  const sampleTours = [SAMPLE_TOUR];

  const filteredTours = activeCategory === 'all' 
    ? sampleTours 
    : sampleTours.filter(t => t.category === activeCategory);

  return (
    <div dir={dir} className="min-h-screen" style={{ backgroundColor: '#0B0F19' }}>
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-amber-400 text-xl">✦</span>
              <span className="font-body text-xs uppercase tracking-[0.2em] text-gray-400">
                {lang === 'fa' ? 'تورهای ایران' : lang === 'ar' ? 'جولات إيران' : 'Iran Tours'}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent" />
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-4">
              {lang === 'fa' ? 'سفرهای_selected' : lang === 'ar' ? 'رحلات مختارة' : 'Featured Journeys'}
            </h1>
            <p className="font-body text-gray-400 max-w-xl text-base leading-relaxed">
              {lang === 'fa' 
                ? 'بهترین تجربیات سفر در ایران را کاوش کنید'
                : lang === 'ar' 
                ? 'استكشف أفضل تجارب السفر في إيران'
                : 'Discover the best travel experiences in Iran'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap gap-3 mb-12"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full font-body text-sm transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-black'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                }`}
              >
                {cat.label[lang] || cat.label.en}
              </button>
            ))}
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TourCardSkeleton />
              <TourCardSkeleton />
              <TourCardSkeleton />
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <p className="font-heading text-2xl text-gray-500 font-light">
                {lang === 'fa' ? 'خطا در بارگذاری' : lang === 'ar' ? 'خطأ في التحميل' : 'Failed to load'}
              </p>
            </div>
          ) : filteredTours.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-gray-700 flex items-center justify-center">
                <span className="text-3xl text-amber-400/40">✦</span>
              </div>
              <p className="font-heading text-2xl text-gray-500 font-light">
                {lang === 'fa' ? 'توری یافت نشد' : lang === 'ar' ? 'لم يتم العثور على جولات' : 'No tours found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map((tour, i) => (
                <TourCard key={tour.id} tour={tour} index={i} />
              ))}
            </div>
          )}

          {filteredTours.length > 0 && (
            <div className="mt-16 flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
              <span className="text-amber-400/40 text-2xl">✦ ✧ ✦</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
            </div>
          )}
        </div>
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

  const getCategoryLabel = (category) => {
    const labels = {
      leisure: { en: 'Leisure', fa: 'تفریحی', ar: 'ترفيه' },
      business: { en: 'Business', fa: 'کسب‌وکار', ar: 'أعمال' },
      research: { en: 'Research', fa: 'پژوهشی', ar: 'بحث' },
      spiritual: { en: 'Spiritual', fa: 'معنوی', ar: 'روحي' },
    };
    return labels[category]?.[lang] || labels[category]?.en || 'Leisure';
  };

  const title = tour.title?.[lang] || tour.title?.en || tour.title;
  const description = tour.shortDesc?.[lang] || tour.shortDesc?.en || tour.description;
  const cities = tour.cities?.[lang] || tour.cities?.en || tour.cities;
  const location = tour.location?.[lang] || tour.location?.en || tour.location;
  const highlights = tour.highlights?.[lang] || tour.highlights?.en || tour.highlights || [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      className="group relative bg-gray-900/50 rounded-3xl overflow-hidden border border-gray-800 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={tour.coverImage || tour.cover_image || tour.image_url || FALLBACK_IMAGE}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-4 start-4">
          <span className="px-3 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-sm text-black text-xs font-body font-medium flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            {getCategoryLabel(tour.category)}
          </span>
        </div>

        <div className="absolute top-4 end-4 flex gap-2">
          <span className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-body flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {tour.duration} {t('package_duration')}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-body flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            {tour.cityCount || 3} {t('package_cities')}
          </span>
        </div>

        {tour.priceFrom && (
          <div className="absolute bottom-4 start-4">
            <div className="px-4 py-2 rounded-lg bg-black/60 backdrop-blur-sm">
              <span className="font-heading text-white text-lg font-medium">
                {lang === 'fa' ? 'از ' : lang === 'ar' ? 'من ' : 'from '}${tour.priceFrom.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <h2 className="font-heading text-2xl lg:text-2.5xl font-medium text-white mb-2 group-hover:text-amber-400 transition-colors duration-300">
          {title}
        </h2>
        <p className="font-body text-sm text-amber-400 mb-3 tracking-wide flex items-center gap-1">
          <Globe className="w-3.5 h-3.5" />
          {cities}
        </p>
        <p className="font-body text-sm text-gray-400 leading-relaxed mb-5 line-clamp-2">
          {description}
        </p>

        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {highlights.slice(0, 4).map((h, j) => (
              <span key={j} className="px-3 py-1 text-xs font-body rounded-full border border-gray-700 text-gray-300 bg-gray-800/50">
                {h}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-body text-gray-500">
              <Compass className="w-4 h-4 text-amber-500/60" />
              <span>{lang === 'fa' ? 'ماجراجویی' : lang === 'ar' ? 'مغامرة' : 'Adventure'}</span>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-1.5 text-xs font-body text-gray-500">
              <Anchor className="w-4 h-4 text-amber-500/60" />
              <span>{lang === 'fa' ? 'فرهنگی' : lang === 'ar' ? 'ثقافي' : 'Cultural'}</span>
            </div>
          </div>
          <button 
            onClick={handleClick}
            className="flex items-center gap-2 text-sm font-body font-semibold text-amber-400 hover:gap-3 transition-all duration-200"
          >
            {t('package_inquiry')}
            <span className="text-lg leading-none">→</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function TourCardSkeleton() {
  return (
    <div className="bg-gray-900/50 rounded-3xl overflow-hidden border border-gray-800 animate-pulse">
      <div className="aspect-[16/10] bg-gray-800" />
      <div className="p-6">
        <div className="h-8 bg-gray-800 rounded mb-3 w-3/4" />
        <div className="h-4 bg-gray-800 rounded mb-2 w-1/2" />
        <div className="h-4 bg-gray-800 rounded mb-4 w-full" />
        <div className="flex gap-2 mb-6">
          <div className="h-6 bg-gray-800 rounded-full w-16" />
          <div className="h-6 bg-gray-800 rounded-full w-20" />
          <div className="h-6 bg-gray-800 rounded-full w-14" />
        </div>
        <div className="flex justify-between pt-4 border-t border-gray-800">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-800 rounded w-16" />
            <div className="h-4 bg-gray-800 rounded w-16" />
          </div>
          <div className="h-4 bg-gray-800 rounded w-24" />
        </div>
      </div>
    </div>
  );
}