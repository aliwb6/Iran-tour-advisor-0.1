import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Search, Star, MessageCircle, Globe } from 'lucide-react';
import { useState } from 'react';

const guides = [
  {
    name: "Ali Hosseini",
    city: { en: "Isfahan", fa: "اصفهان", ar: "أصفهان" },
    specialties: { en: ["Architecture", "History"], fa: ["معماری", "تاریخ"], ar: ["العمارة", "التاريخ"] },
    languages: ["English", "French", "Persian"],
    rating: 4.9, reviews: 127,
    bio: { en: "15 years guiding through Isfahan's architectural masterpieces. Specialized in Safavid-era history and Islamic art.", fa: "۱۵ سال راهنمایی در شاهکارهای معماری اصفهان. متخصص تاریخ صفوی و هنر اسلامی.", ar: "15 عامًا من الإرشاد عبر روائع أصفهان المعمارية." },
  },
  {
    name: "Sara Karimi",
    city: { en: "Shiraz", fa: "شیراز", ar: "شيراز" },
    specialties: { en: ["Poetry", "Gardens", "Culture"], fa: ["شعر", "باغ‌ها", "فرهنگ"], ar: ["الشعر", "الحدائق", "الثقافة"] },
    languages: ["English", "German", "Persian"],
    rating: 4.8, reviews: 95,
    bio: { en: "Passionate about Persian poetry and garden culture. Brings Hafez and Saadi to life in their birthplace.", fa: "عاشق شعر فارسی و فرهنگ باغ‌سازی. حافظ و سعدی را در زادگاهشان زنده می‌کند.", ar: "شغوفة بالشعر الفارسي وثقافة الحدائق." },
  },
  {
    name: "Mehdi Yazdi",
    city: { en: "Yazd", fa: "یزد", ar: "يزد" },
    specialties: { en: ["Desert", "Zoroastrianism"], fa: ["کویر", "زرتشت"], ar: ["الصحراء", "الزرادشتية"] },
    languages: ["English", "Arabic", "Persian"],
    rating: 4.9, reviews: 156,
    bio: { en: "Desert-born guide specializing in Zoroastrian heritage and desert survival experiences.", fa: "راهنمای متولد کویر متخصص میراث زرتشتی و تجربه‌های بقا در کویر.", ar: "مرشد ولد في الصحراء متخصص في التراث الزرادشتي." },
  },
  {
    name: "Maryam Tehrani",
    city: { en: "Tehran", fa: "تهران", ar: "طهران" },
    specialties: { en: ["Modern Art", "Food", "Nightlife"], fa: ["هنر مدرن", "غذا", "زندگی شبانه"], ar: ["الفن الحديث", "الطعام", "الحياة الليلية"] },
    languages: ["English", "Spanish", "Persian"],
    rating: 4.7, reviews: 83,
    bio: { en: "Exploring the contemporary side of Tehran — street art, hidden cafes, and the vibrant food scene.", fa: "کاوش در سمت معاصر تهران — هنر خیابانی، کافه‌های مخفی و صحنه غذایی پرنشاط.", ar: "استكشاف الجانب المعاصر من طهران." },
  },
  {
    name: "Reza Kermani",
    city: { en: "Kerman", fa: "کرمان", ar: "كرمان" },
    specialties: { en: ["Photography", "Desert Safari"], fa: ["عکاسی", "کویرگردی"], ar: ["التصوير", "رحلات الصحراء"] },
    languages: ["English", "Persian"],
    rating: 5.0, reviews: 72,
    bio: { en: "Professional photographer and desert guide. Creates unforgettable experiences in the Lut Desert under the stars.", fa: "عکاس حرفه‌ای و راهنمای کویر. تجربه‌های فراموش‌نشدنی در کویر لوت زیر ستاره‌ها.", ar: "مصور محترف ومرشد صحراوي." },
  },
  {
    name: "Nadia Shirazi",
    city: { en: "Tabriz", fa: "تبریز", ar: "تبريز" },
    specialties: { en: ["Silk Road", "Crafts", "Bazaar"], fa: ["جاده ابریشم", "صنایع دستی", "بازار"], ar: ["طريق الحرير", "الحرف", "البازار"] },
    languages: ["English", "Turkish", "Persian", "Azerbaijani"],
    rating: 4.8, reviews: 110,
    bio: { en: "Born in the heart of the Silk Road. Expert in traditional crafts, carpet weaving, and Tabriz's UNESCO-listed bazaar.", fa: "متولد قلب جاده ابریشم. متخصص صنایع دستی سنتی، قالی‌بافی و بازار تبریز.", ar: "ولدت في قلب طريق الحرير. خبيرة في الحرف التقليدية." },
  },
];

const cityColors = ['bg-accent/10 text-accent', 'bg-gold/20 text-gold', 'bg-primary/10 text-primary'];

export default function Guides() {
  const { t, dir, lang } = useI18n();
  const [search, setSearch] = useState('');

  const filtered = guides.filter(g => {
    const city = g.city[lang] || g.city.en;
    return city.toLowerCase().includes(search.toLowerCase()) || g.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div dir={dir} className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-foreground mb-4">
            {t('guides_title')}
          </h1>
          <p className="font-body text-muted-foreground max-w-xl text-lg mb-8">
            {t('guides_subtitle')}
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('guides_search')}
              className="w-full ps-11 pe-4 py-3 bg-secondary rounded-xl font-body text-sm border border-border/50 focus:border-accent/50 outline-none transition-colors"
            />
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((guide, i) => (
            <motion.div
              key={guide.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg hover:border-gold/30 transition-all duration-300"
            >
              {/* Avatar & Name */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full border-2 border-gold bg-secondary flex items-center justify-center shrink-0">
                  <span className="font-heading text-xl font-semibold text-foreground">
                    {guide.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg font-semibold text-foreground">{guide.name}</h3>
                  <p className="font-body text-sm text-muted-foreground">{guide.city[lang] || guide.city.en}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    <span className="font-body text-sm font-medium text-foreground">{guide.rating}</span>
                    <span className="font-body text-xs text-muted-foreground">({guide.reviews} {t('guides_reviews')})</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="font-body text-sm text-foreground/70 leading-relaxed mb-4">
                {guide.bio[lang] || guide.bio.en}
              </p>

              {/* Languages */}
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-body text-xs text-muted-foreground font-medium">{t('guides_languages')}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {guide.languages.map(l => (
                    <span key={l} className="px-2.5 py-0.5 rounded-full bg-secondary text-xs font-body text-muted-foreground">{l}</span>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-5">
                <span className="font-body text-xs text-muted-foreground font-medium mb-2 block">{t('guides_specialties')}</span>
                <div className="flex flex-wrap gap-1.5">
                  {(guide.specialties[lang] || guide.specialties.en).map((s, j) => (
                    <span key={j} className={`px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${cityColors[j % cityColors.length]}`}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Connect */}
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent/10 text-accent font-body text-sm font-medium hover:bg-accent hover:text-white transition-all duration-300">
                <MessageCircle className="w-4 h-4" />
                {t('guides_connect')}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}