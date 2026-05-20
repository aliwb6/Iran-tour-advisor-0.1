import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Mitchell",
    origin: { en: "London, UK", fa: "لندن، انگلستان", ar: "لندن، المملكة المتحدة" },
    rating: 5,
    text: {
      en: "Iran absolutely blew me away. The level of hospitality, the architecture, the food — nothing could have prepared me for how extraordinary this country is. Iran Soul Tours made every moment seamless.",
      fa: "ایران مرا کاملاً شگفت‌زده کرد. سطح مهمان‌نوازی، معماری، غذا — هیچ چیز نمی‌توانست مرا برای این عظمت آماده کند.",
      ar: "أذهلتني إيران تمامًا. مستوى الضيافة والمعمار والطعام — لم أكن أتخيل أن تكون هذه الدولة بهذه الروعة."
    },
    tour: { en: "Persian Jewels — 10 days", fa: "جواهرات ایران — ۱۰ روز", ar: "جواهر فارس — 10 أيام" },
  },
  {
    name: "Khaled Al-Rashid",
    origin: { en: "Dubai, UAE", fa: "دبی، امارات", ar: "دبي، الإمارات" },
    rating: 5,
    text: {
      en: "As an Arab traveler, I felt completely at home. The guides spoke Arabic, the cultural depth was incredible. Seeing Persepolis at sunrise is something I'll carry forever.",
      fa: "به عنوان یک مسافر عرب، کاملاً احساس خانه کردم. راهنماها عربی صحبت می‌کردند، عمق فرهنگی شگفت‌انگیز بود.",
      ar: "كمسافر عربي شعرت بأنني في وطني. المرشدون يتحدثون العربية والعمق الثقافي كان رائعاً."
    },
    tour: { en: "Ancient Persia — 9 days", fa: "ایران باستان — ۹ روز", ar: "بلاد فارس القديمة — 9 أيام" },
  },
  {
    name: "Yuki Tanaka",
    origin: { en: "Tokyo, Japan", fa: "توکیو، ژاپن", ar: "طوكيو، اليابان" },
    rating: 5,
    text: {
      en: "The photography tour was a dream. Every morning had golden light, every guide knew the perfect angle. The Lut Desert under the stars was the most beautiful thing I've ever photographed.",
      fa: "تور عکاسی یک رویا بود. هر صبح نور طلایی داشت، هر راهنما زاویه کامل را می‌دانست.",
      ar: "كان جولة التصوير حلمًا. كل صباح كان يحمل ضوءاً ذهبياً ومرشدون يعرفون الزاوية المثالية."
    },
    tour: { en: "Photographer's Dream — 11 days", fa: "رویای عکاس — ۱۱ روز", ar: "حلم المصور — 11 أيام" },
  },
];

export default function TestimonialsSection() {
  const { t, dir, lang } = useI18n();

  return (
    <section dir={dir} className="section-gap bg-sand/30">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-body text-xs uppercase tracking-[0.2em] text-accent mb-3 flex items-center justify-center gap-2">
            <span className="block w-6 h-px bg-accent" />
            {t('testimonials_eyebrow')}
            <span className="block w-6 h-px bg-accent" />
          </p>
          <h2 className="font-heading text-display-sm text-foreground">{t('testimonials_title')}</h2>
          <p className="font-body text-muted-foreground mt-2">{t('testimonials_subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="relative bg-card border border-border/60 rounded-3xl p-7 shadow-warm hover:shadow-warm-lg transition-all duration-500 hover:-translate-y-1"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 end-6 w-8 h-8 text-accent/10" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-gold text-gold" />
                ))}
              </div>

              {/* Text */}
              <p className="font-body text-sm text-foreground/75 leading-relaxed mb-6 italic">
                "{review.text[lang] || review.text.en}"
              </p>

              {/* Attribution */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-heading text-base font-semibold text-foreground">{review.name}</p>
                  <p className="font-body text-xs text-muted-foreground">{review.origin[lang] || review.origin.en}</p>
                </div>
                <span className="text-xs font-body text-accent/70 bg-accent/8 px-3 py-1 rounded-full border border-accent/15 text-end">
                  {review.tour[lang] || review.tour.en}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}