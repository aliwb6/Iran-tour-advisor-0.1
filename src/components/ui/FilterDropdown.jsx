import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export default function FilterDropdown({ label, value, options, onChange, lang, icon: Icon, searchable = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const selected = options.find(o => o.key === value) || options[0];
  const isActive = value !== 'all';
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleOptions = !normalizedQuery
    ? options
    : options.filter((option, index) => index === 0 || ['en', 'fa', 'ar', 'key'].some((field) =>
        String(option[field] || '').toLocaleLowerCase().includes(normalizedQuery)
      ));

  const close = () => { setOpen(false); setQuery(''); };

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 min-w-[130px]">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border font-body text-sm transition-all duration-200
          ${isActive
            ? 'border-accent/70 bg-accent/10 text-accent'
            : 'border-border/50 bg-card/60 text-foreground/70 hover:border-accent/40 hover:text-foreground'
          } backdrop-blur-sm`}
      >
        <span className="flex items-center gap-2 truncate">
          {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />}
          <span className="text-[11px] uppercase tracking-wider opacity-60 hidden sm:block">{label}</span>
          <span className={`font-medium truncate ${isActive ? 'text-accent' : ''}`}>
            {selected.icon ? `${selected.icon} ` : ''}{selected[lang] || selected.en}
          </span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 min-w-full w-72 bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl shadow-black/20 py-2 overflow-hidden">
          <div className="px-4 pb-2 mb-1 border-b border-border/30">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5">
              <span className="text-accent text-xs">❖</span> {label}
            </p>
          </div>
          {searchable && (
            <div className="px-3 pb-2 border-b border-border/30">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={lang === 'fa' ? 'جستجوی شهر یا روستا…' : lang === 'ar' ? 'ابحث عن مدينة أو قرية…' : 'Search city or village…'}
                  className="w-full ps-9 pe-3 py-2 rounded-lg border border-border/60 bg-background/80 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/10"
                />
              </div>
            </div>
          )}
          <div className="max-h-64 overflow-y-auto py-1">
          {visibleOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => { onChange(opt.key); close(); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-left transition-colors
                ${opt.key === value
                  ? 'text-accent bg-accent/10 font-semibold'
                  : 'text-foreground/70 hover:bg-accent/5 hover:text-foreground'
                }`}
            >
              {opt.icon && <span className="w-5 text-center text-base">{opt.icon}</span>}
              <span>{opt[lang] || opt.en}</span>
              {opt.key === value && <span className="ml-auto text-accent text-xs">✓</span>}
            </button>
          ))}
          {visibleOptions.length === 0 && (
            <p className="px-4 py-5 text-center text-xs text-muted-foreground">
              {lang === 'fa' ? 'مقصدی پیدا نشد' : lang === 'ar' ? 'لم يتم العثور على وجهة' : 'No destination found'}
            </p>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
