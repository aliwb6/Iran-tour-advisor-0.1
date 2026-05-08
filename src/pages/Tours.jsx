import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { useTours, FALLBACK_IMAGE } from '@/hooks/useSupabase';
import { MapPin, Star, Check, X, Calendar } from 'lucide-react';

const SAMPLE_PACKAGE = {
  header_image: "https://images.unsplash.com/photo-1564960723835-2898c9df9297?w=1920&h=800&fit=crop",
  title: { en: 'Persia Heritage Trail', fa: 'مسیر میراث پارس', ar: 'طريق تراث فارس' },
  description: { en: 'A 10-day journey through Tehran, Isfahan, Persepolis, and Shiraz — the beating heart of ancient Persia.', fa: 'سفر ۱۰ روزه از تهران، اصفهان، تخت جمشید و شیراز — قلب تمدن پارس.', ar: 'رحلة 10 أيام عبر طهران وأصفهان وبرسبوليس وشيراز.' },
  days: 10,
  cities: 4,
  price: 2499,
  highlights: ['Persepolis Ruins', 'Isfahan\'s Naqsh-e Jahan Square', 'Shiraz Poetry Gardens', 'Tehran Museum Quarter'],
  itinerary: [
    { day: 1, title: 'Tehran Arrival', description: 'Welcome to Iran. Private transfer, check-in, and evening stroll through Tajrish Bazaar.' },
    { day: 2, title: 'Tehran Museums', description: 'Visit the National Museum, Glassware Museum, and Golestan Palace.' },
    { day: 3, title: 'Flight to Isfahan', description: 'Morning flight to Isfahan. Walk across Si-o-se-pol and visit the famous square.' },
    { day: 4, title: 'Isfahan Heritage', description: 'Naqsh-e Jahan Square, Sheikh Lotfollah Mosque, Ali Qapu Palace.' },
    { day: 5, title: 'Isfahan Palaces', description: 'Chehel Sotoun, Hasht Behesht, and Armenian Vank Cathedral.' },
    { day: 6, title: 'Drive to Shiraz via Pasargadae', description: 'Stop at Pasargadae — Cyrus the Great\'s tomb — before arriving in Shiraz.' },
    { day: 7, title: 'Shiraz Culture', description: 'Persepolis, Naqsh-e Rostam, and sunset at the Pink Mosque.' },
    { day: 8, title: 'Shiraz Gardens', description: 'Eram Garden, Narenjestan, Hafez Tomb, and the Quran Gate.' },
    { day: 9, title: 'Return to Tehran', description: 'Domestic flight back to Tehran. Free evening for last-minute exploration.' },
    { day: 10, title: 'Departure', description: 'Private transfer to IKA airport. Safe travels.' },
  ],
  included: ['Private guide throughout', 'All domestic flights', '4-star hotel accommodation', 'Daily breakfast & 5 dinners', 'Entrance fees to all sites', 'Airport transfers'],
  not_included: ['International flights', 'Travel insurance', 'Visa fee', 'Personal expenses', 'Tipping', 'Lunches'],
};

export default function Tours() {
  const { t, lang, dir } = useI18n();
  const Arrow = dir === 'rtl' ? '←' : '→';

  const { tours, loading } = useTours({});
  const pkg = tours.length > 0 ? tours[0] : SAMPLE_PACKAGE;
  const showDb = tours.length > 0 && tours[0].image_url;
  const data = showDb ? tours[0] : SAMPLE_PACKAGE;

  const title = showDb ? data.title : (data.title[lang] || data.title.en);
  const description = showDb ? data.description : (data.description[lang] || data.description.en);

  return (
    <div dir={dir} className="pt-0 pb-20 min-h-screen bg-background">
      <div className="relative h-[65vh] min-h-[420px] overflow-hidden">
        <img
          src={showDb ? data.cover_image || data.image_url : data.header_image}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />

        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 lg:p-14">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-body flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {data.days} {t('package_duration')}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-body flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {data.cities} {t('package_cities')}
                </span>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
                {title}
              </h1>
              <p className="font-body text-white/75 text-base lg:text-lg max-w-2xl leading-relaxed">
                {description}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl bg-card border border-border/50 mb-10"
        >
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="font-body text-xs text-muted-foreground mb-1">{t('package_duration')}</p>
              <p className="font-heading text-lg font-semibold text-foreground">{data.days} {t('package_duration')}</p>
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground mb-1">{t('package_cities')}</p>
              <p className="font-heading text-lg font-semibold text-foreground">{data.cities}</p>
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground mb-1">
                {lang === 'fa' ? 'قیمت' : lang === 'ar' ? 'السعر' : 'Price'}
              </p>
              <p className="font-heading text-lg font-semibold text-foreground">
                {data.price ? `$${data.price.toLocaleString()}` : t('package_coming_soon')}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="py-2.5 px-6 rounded-xl bg-accent text-white font-body font-semibold text-sm hover:bg-accent/90 transition-colors">
              {t('package_inquiry')}
            </button>
          </div>
        </motion.div>

        <div className="space-y-12">
          {data.highlights && data.highlights.length > 0 && (
            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {lang === 'fa' ? 'نکات برجسته' : lang === 'ar' ? 'المرورزات' : 'Highlights'}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {data.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-secondary/50">
                    <Star className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span className="font-body text-sm text-foreground">{h}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.itinerary && data.itinerary.length > 0 && (
            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                {lang === 'fa' ? 'برنامه سفر' : lang === 'ar' ? 'خط الرحلة' : 'Tour Plan'}
              </h2>
              <div className="relative">
                <div className="absolute start-7 top-0 bottom-0 w-px bg-accent/20" />
                <div className="space-y-4">
                  {data.itinerary.map((day, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      className="relative flex gap-4"
                    >
                      <div className="relative z-10 w-14 h-14 shrink-0 rounded-2xl bg-accent/10 border border-accent/20 flex flex-col items-center justify-center">
                        <span className="font-heading text-lg font-bold text-accent">{day.day}</span>
                        <span className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">
                          {lang === 'fa' ? 'روز' : lang === 'ar' ? 'يوم' : 'Day'}
                        </span>
                      </div>
                      <div className="flex-1 p-4 rounded-2xl border border-border/50 bg-card">
                        <h3 className="font-heading text-lg font-semibold text-foreground mb-1.5">{day.title}</h3>
                        <p className="font-body text-sm text-foreground/65 leading-relaxed">{day.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {(data.included?.length > 0 || data.not_included?.length > 0) && (
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    {lang === 'fa' ? 'شامل' : lang === 'ar' ? 'مشمول' : 'Included'}
                  </h3>
                  <ul className="space-y-2">
                    {data.included?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 font-body text-sm text-foreground/70">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-500/15 flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    {lang === 'fa' ? 'شامل نیست' : lang === 'ar' ? 'غير مشمول' : 'Not Included'}
                  </h3>
                  <ul className="space-y-2">
                    {data.not_included?.map((item, i) => (
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
      </div>
    </div>
  );
}

  

