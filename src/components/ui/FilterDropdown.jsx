import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FilterDropdown({ label, value, options, onChange, lang, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.key === value) || options[0];
  const isActive = value !== 'all';

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
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
        <div className="absolute top-full mt-2 left-0 z-50 min-w-full w-max max-h-64 overflow-y-auto bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl shadow-black/20 py-2">
          <div className="px-4 pb-2 mb-1 border-b border-border/30">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5">
              <span className="text-accent text-xs">❖</span> {label}
            </p>
          </div>
          {options.map(opt => (
            <button
              key={opt.key}
              onClick={() => { onChange(opt.key); setOpen(false); }}
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
        </div>
      )}
    </div>
  );
}
