import { useI18n } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'fa', label: 'فا', full: 'فارسی' },
  { code: 'ar', label: 'ع', full: 'العربية' },
];

export default function LanguageSwitcher() {
  const { lang, switchLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = languages.find(l => l.code === lang);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-full border border-border/50 hover:border-accent/50 transition-all duration-300 bg-background/50 backdrop-blur-sm"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-body font-medium">{current?.label}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 end-0 bg-white dark:bg-gray-900 border border-border rounded-xl shadow-xl overflow-hidden min-w-[160px] z-50"
          >
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => { switchLang(l.code); setOpen(false); }}
                className={`w-full px-4 py-3 flex items-center justify-between text-sm font-body hover:bg-accent/5 transition-colors ${
                  lang === l.code ? 'text-accent font-medium bg-accent/5' : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                <span>{l.full}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{l.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}