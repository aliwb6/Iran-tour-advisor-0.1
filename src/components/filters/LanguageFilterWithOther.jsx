import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe } from 'lucide-react';
import { allLanguages } from '@/data/languages';

export default function LanguageFilterWithOther({
  selectedLanguages = [],
  languagesInList = [],
  onLanguageChange,
  placeholder = 'Search other languages...',
}) {
  const [showOther, setShowOther] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowOther(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = searchInput.trim()
    ? allLanguages.filter((lang) =>
        lang.toLowerCase().includes(searchInput.toLowerCase()) &&
        !selectedLanguages.includes(lang)
      ).slice(0, 6)
    : [];

  const handleSelectLanguage = (lang) => {
    onLanguageChange([...selectedLanguages, lang]);
    setSearchInput('');
    setShowOther(false);
  };

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Regular language chips */}
      <div className="flex flex-wrap gap-2">
        {languagesInList.map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(selectedLanguages.includes(lang) ? selectedLanguages.filter((l) => l !== lang) : [...selectedLanguages, lang])}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedLanguages.includes(lang)
                ? 'bg-accent/20 text-accent border border-accent/40'
                : 'bg-secondary text-foreground border border-border/50 hover:border-border'
            }`}
          >
            {lang}
          </button>
        ))}

        {/* "Other" chip */}
        <button
          onClick={() => setShowOther(!showOther)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            showOther
              ? 'bg-gold/20 text-gold border border-gold/40'
              : 'bg-transparent border-2 border-dashed border-gold/40 text-gold/70 hover:border-gold/60 hover:text-gold'
          }`}
        >
          <span>+ Other</span>
        </button>
      </div>

      {/* Collapsible search bar */}
      <AnimatePresence>
        {showOther && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Globe className="w-4 h-4 text-gold" strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={placeholder}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border/50 focus:border-gold/50 outline-none text-sm font-body text-foreground placeholder-muted-foreground transition-colors"
                  autoComplete="off"
                />
              </div>

              {/* Dropdown suggestions */}
              <AnimatePresence>
                {searchInput.trim() && filteredLanguages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, translateY: -8 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -8 }}
                    transition={{ duration: 0.15 }}
                    className="mt-2 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-10"
                  >
                    {filteredLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleSelectLanguage(lang)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-gold/10 transition-colors border-b last:border-b-0"
                      >
                        <Globe className="w-4 h-4 text-gold flex-shrink-0" />
                        <span className="text-foreground font-medium">{lang}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected languages from "Other" */}
              {selectedLanguages.some((l) => !languagesInList.includes(l)) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedLanguages.map((lang) => {
                    if (languagesInList.includes(lang)) return null;
                    return (
                      <div
                        key={lang}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gold/15 text-gold border border-gold/30"
                      >
                        {lang}
                        <button
                          onClick={() => onLanguageChange(selectedLanguages.filter((l) => l !== lang))}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
