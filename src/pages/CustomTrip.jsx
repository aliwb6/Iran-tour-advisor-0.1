import { useI18n } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Landmark, BookOpen, Trees, Sun, UtensilsCrossed, Camera, Crown,
  ChevronRight, ChevronLeft, Check, MapPin, Clock, Sparkles
} from 'lucide-react';
import { iranianDestinations as cityOptions } from '@/data/iranianCities';

const goalOptions = [
  { key: 'architecture', icon: Landmark },
  { key: 'history', icon: BookOpen },
  { key: 'nature', icon: Trees },
  { key: 'desert', icon: Sun },
  { key: 'food', icon: UtensilsCrossed },
  { key: 'photography', icon: Camera },
  { key: 'luxury', icon: Crown },
];

export default function CustomTrip() {
  const { t, dir, lang } = useI18n();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState([]);
  const [cities, setCities] = useState([]);
  const [duration, setDuration] = useState(7);
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  const steps = [
    t('custom_step_goal'),
    t('custom_step_cities'),
    t('custom_step_duration'),
    t('custom_step_review'),
  ];

  const toggleGoal = (key) => {
    setGoals(prev => prev.includes(key) ? prev.filter(g => g !== key) : [...prev, key]);
  };

  const toggleCity = (city) => {
    setCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };

  return (
    <div dir={dir} className="pt-24 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-foreground mb-4">
            {t('custom_title')}
          </h1>
          <p className="font-body text-muted-foreground">{t('custom_subtitle')}</p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-medium transition-all ${
                i <= step ? 'bg-accent text-white' : 'bg-secondary text-muted-foreground'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`hidden sm:block w-8 h-px transition-colors ${i < step ? 'bg-accent' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <div>
                <h3 className="font-heading text-2xl text-foreground mb-6 text-center">{steps[0]}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {goalOptions.map((g) => {
                    const Icon = g.icon;
                    const selected = goals.includes(g.key);
                    return (
                      <button
                        key={g.key}
                        onClick={() => toggleGoal(g.key)}
                        className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 ${
                          selected ? 'border-accent bg-accent/5' : 'border-border/50 hover:border-accent/30'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${selected ? 'text-accent' : 'text-muted-foreground'}`} />
                        <span className="font-body text-sm font-medium">{t(`goal_${g.key}`)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h3 className="font-heading text-2xl text-foreground mb-6 text-center">{steps[1]}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cityOptions.map((city) => {
                    const name = city[lang] || city.en;
                    const selected = cities.includes(city.en);
                    return (
                      <button
                        key={city.en}
                        onClick={() => toggleCity(city.en)}
                        className={`flex items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          selected ? 'border-accent bg-accent/5' : 'border-border/50 hover:border-accent/30'
                        }`}
                      >
                        <MapPin className={`w-4 h-4 shrink-0 ${selected ? 'text-accent' : 'text-muted-foreground'}`} />
                        <span className="font-body text-sm font-medium">{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="text-center">
                <h3 className="font-heading text-2xl text-foreground mb-8">{steps[2]}</h3>
                <div className="flex items-center justify-center gap-6 mb-4">
                  <button
                    onClick={() => setDuration(Math.max(3, duration - 1))}
                    className="w-12 h-12 rounded-full border-2 border-border hover:border-accent flex items-center justify-center font-body text-xl transition-colors"
                  >−</button>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="font-heading text-5xl font-light text-foreground">{duration}</span>
                    <span className="font-body text-muted-foreground">{t('package_duration')}</span>
                  </div>
                  <button
                    onClick={() => setDuration(Math.min(30, duration + 1))}
                    className="w-12 h-12 rounded-full border-2 border-border hover:border-accent flex items-center justify-center font-body text-xl transition-colors"
                  >+</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="font-body text-sm text-accent font-medium">{t('custom_step_review')}</span>
                </div>
                <div className="p-8 rounded-2xl border border-border/50 bg-card text-start space-y-4">
                  <div>
                    <span className="font-body text-xs text-muted-foreground">{t('custom_step_goal')}</span>
                    <p className="font-body font-medium">{goals.map(g => t(`goal_${g}`)).join(', ') || '—'}</p>
                  </div>
                  <div>
                    <span className="font-body text-xs text-muted-foreground">{t('custom_step_cities')}</span>
                    <p className="font-body font-medium">{cities.join(', ') || '—'}</p>
                  </div>
                  <div>
                    <span className="font-body text-xs text-muted-foreground">{t('custom_step_duration')}</span>
                    <p className="font-body font-medium">{duration} {t('package_duration')}</p>
                  </div>
                </div>
                <button className="mt-8 inline-flex items-center gap-2 bg-accent text-white px-8 py-3.5 rounded-full font-body font-medium text-sm hover:bg-accent/90 transition-all">
                  <Sparkles className="w-4 h-4" />
                  {t('custom_build')}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <BackIcon className="w-4 h-4" />
              {t('custom_back')}
            </button>
          ) : <div />}
          {step < 3 && (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-full font-body text-sm font-medium hover:bg-accent/90 transition-all"
            >
              {t('custom_next')}
              <NextIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
