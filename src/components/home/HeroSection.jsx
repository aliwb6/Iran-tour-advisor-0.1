import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Star } from 'lucide-react';

const HERO_IMAGES = [
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/7a7bd2ab5_generated_847e20ff.png",
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/67ecc93d7_generated_d105795a.png",
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/edfc38152_generated_aa7676e0.png",
];

const STATS = [
  { en: "500+", fa: "۵۰۰+", ar: "500+" , label: { en: "Happy Travelers", fa: "مسافر راضی", ar: "مسافر سعيد" }},
  { en: "40+", fa: "۴۰+", ar: "40+", label: { en: "Curated Tours", fa: "تور انتخابی", ar: "جولة منتقاة" }},
  { en: "15+", fa: "۱۵+", ar: "15+", label: { en: "Expert Guides", fa: "راهنمای متخصص", ar: "مرشد خبير" }},
];

export default function HeroSection() {
  const { t, dir, lang } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImg(i => (i + 1) % HERO_IMAGES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section dir={dir} className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background images with crossfade */}
      {HERO_IMAGES.map((img, i) => (
        <motion.div
          key={img}
          animate={{ opacity: i === activeImg ? 1 : 0 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={img}
            alt=""
            className="w-full h-full object-cover"
          />
        </motion.div>
      ))}

      {/* Cinematic layered overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-navy/20 to-navy/80 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/40 via-transparent to-transparent z-[1]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 lg:px-10 pb-16 lg:pb-20 pt-28">

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-gold text-gold" />
              ))}
            </div>
            <span className="font-body text-[11px] text-white/90 font-medium">
              {t('hero_trust_badge')}
            </span>
          </div>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-heading text-white mb-6 max-w-4xl text-balance"
          style={{ fontSize: 'clamp(2.6rem, 6.5vw, 6rem)', lineHeight: '1.06', letterSpacing: '-0.02em', wordSpacing: '0.15em' }}
        >
          {t('hero_title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="font-body text-white/70 text-base lg:text-lg leading-relaxed mb-10 max-w-xl"
        >
          {t('hero_subtitle')}
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="flex flex-wrap items-center gap-4 mb-14 lg:mb-16"
        >
          <Link
            to="/tours"
            className="inline-flex items-center gap-2.5 bg-accent hover:bg-accent/90 text-white px-7 py-3.5 rounded-full font-body font-semibold text-sm uppercase tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5"
          >
            {t('hero_cta')}
            <Arrow className="w-4 h-4" />
          </Link>
          <Link
            to="/ai-assistant"
            className="inline-flex items-center gap-2 bg-white/12 hover:bg-white/20 text-white border border-white/25 px-7 py-3.5 rounded-full font-body font-medium text-sm transition-all duration-300 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            {t('hero_cta_ai')}
          </Link>
        </motion.div>

        {/* Bottom row: stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-end gap-6"
        >
          {/* Stats */}
          <div className="flex items-center gap-6 sm:gap-8">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="font-heading text-2xl text-white font-semibold">{stat[lang] || stat.en}</p>
                <p className="font-body text-[11px] text-white/55 uppercase tracking-wider mt-0.5">
                  {stat.label[lang] || stat.label.en}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Image dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveImg(i)}
            className={`rounded-full transition-all duration-500 ${
              i === activeImg ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}