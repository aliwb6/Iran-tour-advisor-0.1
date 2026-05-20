import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, MessageSquare } from 'lucide-react';

const BG = "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/cce446b52_generated_d017c773.png";

const chips = [
  { en: "Best time to visit Isfahan?", fa: "بهترین زمان برای اصفهان؟", ar: "أفضل وقت لزيارة أصفهان؟" },
  { en: "7-day desert adventure", fa: "ماجراجویی ۷ روزه کویر", ar: "مغامرة صحراوية 7 أيام" },
  { en: "Family trip to Iran", fa: "سفر خانوادگی به ایران", ar: "رحلة عائلية إلى إيران" },
];

export default function AITeaser() {
  const { t, dir, lang } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section dir={dir} className="section-gap relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={BG} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy/80" />
        <div className="absolute inset-0 carpet-texture" />
      </div>

      {/* Persian carpet border */}
      <div className="absolute top-0 inset-x-0 h-1 carpet-border" />
      <div className="absolute bottom-0 inset-x-0 h-1 carpet-border" />

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Icon badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 mb-8">
            <Sparkles className="w-7 h-7 text-accent" />
          </div>

          <p className="font-body text-xs uppercase tracking-[0.2em] text-accent/80 mb-4 flex items-center justify-center gap-2">
            <span className="block w-6 h-px bg-accent/60" />
            {t('ai_teaser_eyebrow')}
            <span className="block w-6 h-px bg-accent/60" />
          </p>

          <h2 className="font-heading text-display-sm text-white mb-4">{t('ai_title')}</h2>
          <p className="font-body text-white/60 text-base leading-relaxed mb-8 max-w-xl mx-auto">
            {t('ai_subtitle')}
          </p>

          {/* Chat preview chips */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {chips.map((chip, i) => (
              <Link
                key={i}
                to="/ai-assistant"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white text-sm font-body px-4 py-2.5 rounded-full transition-all duration-300 backdrop-blur-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-accent shrink-0" />
                {chip[lang] || chip.en}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-2.5 bg-accent hover:bg-accent/90 text-white px-8 py-3.5 rounded-full font-body font-semibold text-sm uppercase tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-accent/30"
            >
              {t('ai_teaser_cta')}
              <Arrow className="w-4 h-4" />
            </Link>
            <Link
              to="/custom-trip"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-body transition-colors"
            >
              {t('hero_cta_custom')} <Arrow className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}