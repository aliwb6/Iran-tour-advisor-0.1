import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, Check,
  MapPin, Car, Hotel, ChevronDown, Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const IRANIAN_CITIES = [
  'Tehran', 'Isfahan', 'Shiraz', 'Yazd', 'Mashhad',
  'Tabriz', 'Kerman', 'Kashan', 'Qom', 'Rasht',
];

const GUIDE_LANGUAGES = [
  'English', 'Persian', 'Arabic', 'French', 'German', 'Chinese', 'Spanish',
];

const HOLIDAY_TYPES = [
  { id: 'Active',       label: 'Active',       emoji: '🏃' },
  { id: 'Local Living', label: 'Local Living',  emoji: '🏘️' },
  { id: 'Nature',       label: 'Nature',        emoji: '🌿' },
  { id: 'Offbeat',      label: 'Offbeat',       emoji: '🗺️' },
  { id: 'Relaxing',     label: 'Relaxing',      emoji: '😌' },
];

const ADDITIONAL_SERVICES = [
  { id: 'air_tickets',        label: 'Air Tickets',        emoji: '✈️' },
  { id: 'train_tickets',      label: 'Train Tickets',      emoji: '🚂' },
  { id: 'attraction_tickets', label: 'Attraction Tickets', emoji: '🎟️' },
  { id: 'visa',               label: 'Visa',               emoji: '📋' },
  { id: 'airport_transfer',   label: 'Airport Transfer',   emoji: '🚗' },
];

const STAR_RATINGS = [
  { stars: 1, label: 'Budget' },
  { stars: 2, label: 'Economy' },
  { stars: 3, label: 'Standard' },
  { stars: 4, label: 'Premium' },
  { stars: 5, label: 'Luxury' },
];

const HOW_IT_WORKS = [
  {
    icon: '✍️',
    title: 'Tell us your travel wishlist',
    desc: 'Share your destination, dates, and preferences',
  },
  {
    icon: '💬',
    title: 'Receive proposals from local guides',
    desc: 'Expert guides craft tailored itineraries for you',
  },
  {
    icon: '✅',
    title: 'Choose your guide',
    desc: 'Compare proposals and pick the perfect match',
  },
  {
    icon: '🌟',
    title: 'Have an unforgettable journey',
    desc: 'Experience authentic Iran with a dedicated local guide',
  },
];

const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

const INITIAL_FORM = {
  destination: '',
  start_date: '',
  end_date: '',
  arrival_hour: '09',
  arrival_minute: '00',
  arrival_period: 'AM',
  departure_hour: '09',
  departure_minute: '00',
  departure_period: 'AM',
  timings_flexible: false,
  adults: 1,
  children: 0,
  guide_languages: [],
  assistance: [],
  accommodation_stars: null,
  requirements: '',
  holiday_types: [],   // text[] in Supabase — migration: ALTER TABLE trip_requests ADD COLUMN holiday_types text[];
  additional_services: [],
  tour_type: '',
};

// ── Calendar helpers ───────────────────────────────────────────────────────

const MONTH_NAMES  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_HEADERS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function getTodayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${SHORT_MONTHS[m - 1]} ${y}`;
}

// ── DatePickerInput ────────────────────────────────────────────────────────

function DatePickerInput({ value, onChange, otherDate }) {
  const now = new Date();
  const [open, setOpen]           = useState(false);
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const wrapperRef = useRef(null);
  const todayStr   = getTodayStr();

  // Sync view to selected (or other) date when the picker opens
  useEffect(() => {
    if (!open) return;
    const src = value || otherDate;
    if (src) {
      const [y, m] = src.split('-').map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const prevMonth = () => setViewMonth(m => {
    if (m === 0) { setViewYear(y => y - 1); return 11; }
    return m - 1;
  });

  const nextMonth = () => setViewMonth(m => {
    if (m === 11) { setViewYear(y => y + 1); return 0; }
    return m + 1;
  });

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const offsetRaw   = new Date(viewYear, viewMonth, 1).getDay();
  const offset      = offsetRaw === 0 ? 6 : offsetRaw - 1; // Mon = 0

  const rangeStart = value && otherDate ? (value <= otherDate ? value : otherDate) : null;
  const rangeEnd   = value && otherDate ? (value <= otherDate ? otherDate : value) : null;

  const handleDayClick = (day) => {
    const ds = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    if (ds < todayStr) return;
    onChange(ds);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full px-3 py-2.5 bg-background/50 border rounded-xl text-sm text-left transition-colors ${
          open ? 'border-accent' : 'border-border/40'
        } ${value ? 'text-foreground' : 'text-muted-foreground/60'}`}
      >
        {value ? formatDateDisplay(value) : 'Select date…'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 mt-1.5 z-50 bg-card border border-border/60 rounded-2xl shadow-2xl p-4 w-[272px]"
          >
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button" onClick={prevMonth}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-foreground">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button
                type="button" onClick={nextMonth}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-0.5">
              {DAY_HEADERS.map(d => (
                <div key={d} className="flex items-center justify-center text-[10px] font-medium text-muted-foreground/70 pb-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {Array.from({ length: offset }, (_, i) => <div key={`p${i}`} className="h-9" />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const ds = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const isSelected = ds === value;
                const isOther    = ds === otherDate;
                const inRange    = rangeStart && rangeEnd && ds > rangeStart && ds < rangeEnd;
                const isToday    = ds === todayStr;
                const isPast     = ds < todayStr;

                return (
                  <div
                    key={day}
                    className={`relative flex items-center justify-center h-9 ${
                      inRange || isSelected || isOther ? 'bg-accent/10' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => !isPast && handleDayClick(day)}
                      disabled={isPast}
                      className={`relative w-8 h-8 rounded-full text-xs font-medium transition-all ${
                        isSelected || isOther
                          ? 'bg-accent text-white shadow-sm shadow-accent/40'
                          : isPast
                          ? 'text-muted-foreground/25 cursor-not-allowed'
                          : 'hover:bg-accent/20 text-foreground'
                      }`}
                    >
                      {day}
                      {isToday && !isSelected && !isOther && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function FieldLabel({ children }) {
  return <p className="text-sm font-medium text-foreground mb-2.5">{children}</p>;
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-400 mt-1">{msg}</p>;
}

function Counter({ label, sublabel, value, onChange, min = 0 }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-background/50 border border-border/40">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sublabel && <p className="text-[11px] text-muted-foreground">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border-2 border-border/50 flex items-center justify-center text-muted-foreground hover:border-accent hover:text-accent disabled:opacity-30 transition-colors"
        >
          <span className="text-base leading-none select-none">−</span>
        </button>
        <span className="w-6 text-center font-semibold text-foreground tabular-nums">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border-2 border-border/50 flex items-center justify-center text-muted-foreground hover:border-accent hover:text-accent transition-colors"
        >
          <span className="text-base leading-none select-none">+</span>
        </button>
      </div>
    </div>
  );
}

function TimeSelect({ label, hourKey, minuteKey, periodKey, form, onChange, disabled }) {
  const cls = `bg-background/50 border border-border/40 rounded-lg px-2.5 py-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors`;
  return (
    <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <div className="flex gap-1.5">
        <select value={form[hourKey]}   onChange={e => onChange(hourKey, e.target.value)}   className={`flex-1 ${cls}`}>
          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <select value={form[minuteKey]} onChange={e => onChange(minuteKey, e.target.value)} className={`flex-1 ${cls}`}>
          {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={form[periodKey]} onChange={e => onChange(periodKey, e.target.value)} className={cls}>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}

function ToggleChip({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
        selected
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border/40 text-muted-foreground hover:border-accent/40 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function ToggleBlock({ selected, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
        selected
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border/40 text-muted-foreground hover:border-accent/40 hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function IconGridItem({ selected, onClick, emoji, label, multi = false }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
        selected
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border/40 text-muted-foreground hover:border-accent/40 hover:text-foreground'
      }`}
    >
      {selected && multi && (
        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-accent flex items-center justify-center">
          <Check className="w-2 h-2 text-white" />
        </div>
      )}
      <span className="text-xl leading-none">{emoji}</span>
      <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
    </button>
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────

function StepIndicator({ step }) {
  const steps = ['Trip Details', 'Preferences'];
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((label, i) => {
        const s       = i + 1;
        const done    = step > s;
        const active  = step === s;
        return (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                done   ? 'bg-accent text-white'
                : active ? 'bg-accent text-white ring-4 ring-accent/20'
                : 'bg-border/50 text-muted-foreground'
              }`}>
                {done ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap transition-colors ${
                active ? 'text-accent' : 'text-muted-foreground'
              }`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-20 h-0.5 mx-2 mb-4 rounded-full transition-all duration-300 ${
                step > 1 ? 'bg-accent' : 'bg-border/50'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Trip Details ───────────────────────────────────────────────────

function Step1({ form, set, toggle, toggleAssistance, errors }) {
  return (
    <div className="space-y-5">
      {/* Destination */}
      <div>
        <FieldLabel>I am travelling to</FieldLabel>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={form.destination}
            onChange={e => set('destination', e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-background/50 border border-border/40 rounded-xl text-sm text-foreground focus:outline-none focus:border-accent appearance-none cursor-pointer transition-colors"
          >
            <option value="">Select a city...</option>
            {IRANIAN_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        <FieldError msg={errors?.destination} />
      </div>

      {/* Dates — custom animated pickers */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Start Date</p>
          <DatePickerInput
            value={form.start_date}
            onChange={v => set('start_date', v)}
            otherDate={form.end_date}
          />
          <FieldError msg={errors?.start_date} />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">End Date</p>
          <DatePickerInput
            value={form.end_date}
            onChange={v => set('end_date', v)}
            otherDate={form.start_date}
          />
          <FieldError msg={errors?.end_date} />
        </div>
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-3">
        <TimeSelect
          label="Arrival Time"
          hourKey="arrival_hour" minuteKey="arrival_minute" periodKey="arrival_period"
          form={form} onChange={set} disabled={form.timings_flexible}
        />
        <TimeSelect
          label="Departure Time"
          hourKey="departure_hour" minuteKey="departure_minute" periodKey="departure_period"
          form={form} onChange={set} disabled={form.timings_flexible}
        />
      </div>

      {/* Timings flexible */}
      <div
        onClick={() => set('timings_flexible', !form.timings_flexible)}
        className="flex items-center gap-3 cursor-pointer group select-none"
      >
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
          form.timings_flexible
            ? 'bg-accent border-accent'
            : 'border-border/60 group-hover:border-accent/50'
        }`}>
          {form.timings_flexible && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className="text-sm text-foreground">Not yet sure about my timings</span>
      </div>

      {/* Traveller counts */}
      <div className="space-y-2">
        <Counter label="Adults"   value={form.adults}   onChange={v => set('adults', v)}   min={1} />
        <Counter label="Children" sublabel="2–12 years" value={form.children} onChange={v => set('children', v)} min={0} />
      </div>

      {/* Guide languages */}
      <div>
        <FieldLabel>I need a guide who speaks</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {GUIDE_LANGUAGES.map(lang => (
            <ToggleChip
              key={lang}
              selected={form.guide_languages.includes(lang)}
              onClick={() => toggle('guide_languages', lang)}
            >
              {lang}
            </ToggleChip>
          ))}
        </div>
        <FieldError msg={errors?.guide_languages} />
      </div>

      {/* Assistance + star ratings */}
      <div>
        <FieldLabel>I need assistance with</FieldLabel>
        <div className="flex gap-3">
          <ToggleBlock
            selected={form.assistance.includes('Transportation')}
            onClick={() => toggleAssistance('Transportation')}
            icon={<Car className="w-4 h-4" />}
            label="Transportation"
          />
          <ToggleBlock
            selected={form.assistance.includes('Accommodation')}
            onClick={() => toggleAssistance('Accommodation')}
            icon={<Hotel className="w-4 h-4" />}
            label="Accommodation"
          />
        </div>

        {/* FIX 1 — Star rating row, animates in when Accommodation is selected */}
        <AnimatePresence>
          {form.assistance.includes('Accommodation') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 mt-3">
                {STAR_RATINGS.map(({ stars, label }) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => set('accommodation_stars', form.accommodation_stars === stars ? null : stars)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                      form.accommodation_stars === stars
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border/40 text-muted-foreground hover:border-accent/40 hover:text-foreground'
                    }`}
                  >
                    <span className="text-[10px] leading-none tracking-tight">{'★'.repeat(stars)}</span>
                    <span className="text-[9px] font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Step 2: Preferences ────────────────────────────────────────────────────

function Step2({ form, set, toggle, errors }) {
  return (
    <div className="space-y-6">
      {/* Requirements */}
      <div>
        <FieldLabel>Your Requirements</FieldLabel>
        <textarea
          value={form.requirements}
          onChange={e => set('requirements', e.target.value)}
          placeholder="Describe your travel goals, interests, or any special needs..."
          rows={4}
          className="w-full px-4 py-3 bg-background/50 border border-border/40 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent resize-none transition-colors"
        />
      </div>

      {/* Holiday type — FIX 3: multi-select */}
      <div>
        <FieldLabel>Type of holiday I am looking for</FieldLabel>
        <div className="grid grid-cols-5 gap-2">
          {HOLIDAY_TYPES.map(type => (
            <IconGridItem
              key={type.id}
              selected={form.holiday_types.includes(type.id)}
              onClick={() => toggle('holiday_types', type.id)}
              emoji={type.emoji}
              label={type.label}
              multi
            />
          ))}
        </div>
        <FieldError msg={errors?.holiday_types} />
      </div>

      {/* Additional services */}
      <div>
        <FieldLabel>Additional services I require</FieldLabel>
        <div className="grid grid-cols-5 gap-2">
          {ADDITIONAL_SERVICES.map(svc => (
            <IconGridItem
              key={svc.id}
              selected={form.additional_services.includes(svc.id)}
              onClick={() => toggle('additional_services', svc.id)}
              emoji={svc.emoji}
              label={svc.label}
              multi
            />
          ))}
        </div>
      </div>

      {/* Tour type */}
      <div>
        <FieldLabel>I prefer:</FieldLabel>
        <div className="flex gap-3">
          {[
            { id: 'Private Tour', label: 'Private Tour' },
            { id: 'Group Tour',   label: 'Group Tour'   },
          ].map(t => (
            <ToggleBlock
              key={t.id}
              selected={form.tour_type === t.id}
              onClick={() => set('tour_type', form.tour_type === t.id ? '' : t.id)}
              label={t.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export default function TripRequestForm({ isOpen, onClose }) {
  const { user }       = useAuth();
  const queryClient    = useQueryClient();
  const [step, setStep]           = useState(1);
  const [direction, setDirection] = useState(1);
  const [form, setForm]           = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]       = useState({});

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const toggle = (key, item) => setForm(f => {
    const arr = f[key];
    return { ...f, [key]: arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item] };
  });

  // FIX 1 — clear accommodation_stars when Accommodation is deselected
  const toggleAssistance = (item) => {
    setForm(f => {
      const removing    = f.assistance.includes(item);
      const newAssistance = removing
        ? f.assistance.filter(x => x !== item)
        : [...f.assistance, item];
      return {
        ...f,
        assistance: newAssistance,
        ...(item === 'Accommodation' && removing ? { accommodation_stars: null } : {}),
      };
    });
  };

  const handleClose = () => {
    setStep(1);
    setDirection(1);
    setForm(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  // FIX 4 — full Step 1 validation before advancing
  const goNext = () => {
    const errs = {};
    if (!form.destination)    errs.destination    = 'Please select a destination.';
    if (!form.start_date)     errs.start_date     = 'Please select a start date.';
    if (!form.end_date)       errs.end_date       = 'Please select an end date.';
    if (form.start_date && form.end_date && form.end_date <= form.start_date)
      errs.end_date = 'End date must be after start date.';
    if (!form.guide_languages.length)
      errs.guide_languages = 'Please select at least one language.';

    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setDirection(1);
    setStep(2);
  };

  const goBack = () => {
    setErrors({});
    setDirection(-1);
    setStep(1);
  };

  // FIX 4 — robust submit with validation, logging, spinner, and error toasts
  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('Please log in to submit a request.');
      return;
    }

    const errs = {};
    if (!form.holiday_types.length)
      errs.holiday_types = 'Please select at least one type of holiday.';

    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const arrival_time   = form.timings_flexible ? null : `${form.arrival_hour}:${form.arrival_minute} ${form.arrival_period}`;
      const departure_time = form.timings_flexible ? null : `${form.departure_hour}:${form.departure_minute} ${form.departure_period}`;

      const payload = {
        user_id:             user.id,
        destination:         form.destination,
        start_date:          form.start_date  || null,
        end_date:            form.end_date    || null,
        arrival_time,
        departure_time,
        timings_flexible:    form.timings_flexible,
        adults:              form.adults,
        children:            form.children,
        guide_languages:     form.guide_languages,
        assistance:          form.assistance,
        accommodation_stars: form.accommodation_stars,
        requirements:        form.requirements,
        holiday_types:       form.holiday_types,
        additional_services: form.additional_services,
        tour_type:           form.tour_type,
        status:              'active',
        created_at:          new Date().toISOString(),
      };

      console.log('[TripRequestForm] submit payload:', payload);

      const { error } = await supabase.from('trip_requests').insert(payload);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['trip_requests', user.id] });
      toast.success('Trip request submitted! Local guides will reach out soon.');
      handleClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-4xl flex rounded-3xl overflow-hidden shadow-2xl"
            style={{ maxHeight: 'min(92vh, 780px)' }}
          >
            {/* ── Sidebar (desktop only) ── */}
            <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-navy relative overflow-hidden">
              <div className="relative z-10 flex flex-col h-full p-7">
                <div className="mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-4">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-heading text-white text-base font-semibold leading-snug">
                    How it works
                  </h3>
                  <p className="text-white/45 text-[11px] mt-1 leading-relaxed">
                    Plan your perfect Iran trip in minutes
                  </p>
                </div>

                <div className="space-y-5 flex-1">
                  {HOW_IT_WORKS.map((s, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-base shrink-0 mt-0.5">
                        {s.icon}
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold leading-snug">{s.title}</p>
                        <p className="text-white/45 text-[11px] mt-0.5 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-px h-full bg-white/10" />
            </aside>

            {/* ── Form area ── */}
            <div className="flex-1 bg-card flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between px-6 sm:px-8 pt-6 pb-0 shrink-0">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-foreground">
                    New Trip Request
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step === 1 ? 'Step 1 of 2 — Trip Details' : 'Step 2 of 2 — Preferences'}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="px-6 sm:px-8 pt-5 shrink-0">
                <StepIndicator step={step} />
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-4">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    initial={{ x: direction * 36, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction * -36, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step === 1
                      ? <Step1 form={form} set={set} toggle={toggle} toggleAssistance={toggleAssistance} errors={errors} />
                      : <Step2 form={form} set={set} toggle={toggle} errors={errors} />
                    }
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer buttons */}
              <div className="px-6 sm:px-8 py-4 border-t border-border/40 shrink-0 flex items-center justify-between gap-3 bg-card">
                {step === 1 ? (
                  <button
                    onClick={handleClose}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={goBack}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}

                {step === 1 ? (
                  <button
                    onClick={goNext}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/25"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/25 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                      : 'Submit Request'
                    }
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
