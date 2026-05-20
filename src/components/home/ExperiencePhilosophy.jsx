import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Cpu, Compass, Gem } from 'lucide-react';

const pillars = [
  {
    key: 'modern',
    icon: Cpu,
    accent: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
  },
  {
    key: 'authentic',
    icon: Compass,
    accent: 'text-gold',
    bg: 'bg-gold/10',
    border: 'border-gold/20',
  },
  {
    key: 'luxury',
    icon: Gem,
    accent: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
];

export default function ExperiencePhilosophy() {
  const { t, dir } = useI18n();

  return (
    <section dir={dir} className="section-gap bg-background">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14 lg:mb-16"
        >
          <p className="font-body text-xs uppercase tracking-[0.2em] text-accent mb-3 flex items-center justify-center gap-2">
            <span className="block w-6 h-px bg-accent" />
            {t('philosophy_eyebrow')}
            <span className="block w-6 h-px bg-accent" />
          </p>
          <h2 className="font-heading text-display-sm text-foreground mb-3">{t('philosophy_title')}</h2>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">{t('philosophy_subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative p-8 rounded-3xl border ${pillar.border} ${pillar.bg} hover:shadow-xl transition-all duration-500 hover:-translate-y-1`}
              >
                <div className={`w-14 h-14 rounded-2xl ${pillar.bg} border ${pillar.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${pillar.accent}`} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {t(`philosophy_${pillar.key}`)}
                </h3>
                <p className="font-body text-sm text-foreground/65 leading-relaxed">
                  {t(`philosophy_${pillar.key}_desc`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}