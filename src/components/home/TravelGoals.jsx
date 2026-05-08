import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Landmark, BookOpen, Trees, Sun, UtensilsCrossed, Camera, Crown, FlaskConical } from 'lucide-react';

const goals = [
  { key: 'architecture', icon: Landmark, color: 'bg-blue-500/10 text-blue-600' },
  { key: 'history', icon: BookOpen, color: 'bg-amber-500/10 text-amber-600' },
  { key: 'nature', icon: Trees, color: 'bg-green-500/10 text-green-600' },
  { key: 'desert', icon: Sun, color: 'bg-orange-500/10 text-orange-600' },
  { key: 'food', icon: UtensilsCrossed, color: 'bg-rose-500/10 text-rose-600' },
  { key: 'photography', icon: Camera, color: 'bg-purple-500/10 text-purple-600' },
  { key: 'luxury', icon: Crown, color: 'bg-gold/10 text-gold' },
  { key: 'research', icon: FlaskConical, color: 'bg-turquoise/10 text-turquoise' },
];

export default function TravelGoals() {
  const { t, dir } = useI18n();

  return (
    <section dir={dir} className="section-gap bg-sand/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="font-body text-xs uppercase tracking-[0.2em] text-accent mb-3 flex items-center justify-center gap-2">
            <span className="block w-6 h-px bg-accent" />
            {t('goals_title')}
            <span className="block w-6 h-px bg-accent" />
          </p>
          <h2 className="font-heading text-display-sm text-foreground mb-3">{t('goals_title')}</h2>
          <p className="font-body text-muted-foreground max-w-md mx-auto">{t('goals_subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-4">
          {goals.map((goal, i) => {
            const Icon = goal.icon;
            return (
              <motion.div
                key={goal.key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to="/tours"
                  className="group flex flex-col items-center gap-3 p-4 lg:p-5 rounded-2xl border border-border/50 bg-card hover:border-accent/30 hover:shadow-warm transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${goal.color} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-body text-xs font-medium text-center text-foreground/80 group-hover:text-foreground transition-colors leading-snug">
                    {t(`goal_${goal.key}`)}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}