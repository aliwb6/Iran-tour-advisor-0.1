// Tour "What's Included" catalog + serialise / parse helpers.
//
// Save format (per product spec): a `text[]` array of *human-readable English
// labels* on `tours.included`. Examples:
//   ["Hotel (4★)", "Airport Transfer", "Private Car / Van",
//    "Breakfast only", "English-speaking Guide", "Entrance Fees"]
//
// The "Not Included" section was removed — anything the guide does not select
// is implicitly excluded. `tours.excluded` / `tours.not_included` columns are
// no longer written by the form, but legacy data on them still renders fine.

export const ACCOMMODATION_TYPES = [
  { value: 'hotel',       en: 'Hotel',                            fa: 'هتل',                              ar: 'فندق' },
  { value: 'hostel',      en: 'Hostel / Guesthouse',              fa: 'هاستل / مهمان‌سرا',                ar: 'نزل / بيت ضيافة' },
  { value: 'traditional', en: 'Traditional House / Eco-lodge',    fa: 'خانه سنتی / اقامتگاه بوم‌گردی',    ar: 'منزل تقليدي / نزل بيئي' },
];

export const HOTEL_STAR_LEVELS = [2, 3, 4, 5];

export const TRANSPORTATION_OPTIONS = [
  { value: 'airport_transfer', en: 'Airport Transfer',       fa: 'ترانسفر فرودگاهی',  ar: 'النقل من المطار' },
  { value: 'private_car',      en: 'Private Car / Van',      fa: 'خودرو / ون اختصاصی', ar: 'سيارة / فان خاص' },
  { value: 'public_transit',   en: 'Public Transportation',  fa: 'حمل‌ونقل عمومی',     ar: 'النقل العام' },
  { value: 'bus_intercity',    en: 'Intercity Bus',          fa: 'اتوبوس بین‌شهری',    ar: 'حافلة بين المدن' },
  { value: 'train',            en: 'Train',                  fa: 'قطار',                ar: 'قطار' },
  { value: 'domestic_flight',  en: 'Domestic Flight',        fa: 'پرواز داخلی',         ar: 'رحلة داخلية' },
];

// Mutually exclusive — single select / radio.
export const MEALS_OPTIONS = [
  { value: 'none',             en: 'No meals included',       fa: 'بدون وعده غذایی',      ar: 'بدون وجبات' },
  { value: 'breakfast',        en: 'Breakfast only',          fa: 'فقط صبحانه',           ar: 'إفطار فقط' },
  { value: 'breakfast_lunch',  en: 'Breakfast + Lunch',       fa: 'صبحانه + ناهار',       ar: 'إفطار + غداء' },
  { value: 'breakfast_dinner', en: 'Breakfast + Dinner',      fa: 'صبحانه + شام',          ar: 'إفطار + عشاء' },
  { value: 'all',              en: 'All meals (3 meals/day)', fa: 'تمام وعده‌ها (۳ وعده در روز)', ar: 'جميع الوجبات (3 يومياً)' },
];

export const OTHER_OPTIONS = [
  { value: 'guide_en',         en: 'English-speaking Guide', fa: 'راهنمای انگلیسی‌زبان', ar: 'مرشد يتحدث الإنجليزية' },
  { value: 'entrance_fees',    en: 'Entrance Fees',          fa: 'هزینه ورودی‌ها',        ar: 'رسوم الدخول' },
  { value: 'travel_insurance', en: 'Travel Insurance',       fa: 'بیمه سفر',              ar: 'تأمين السفر' },
  { value: 'sim_internet',     en: 'SIM Card / Internet',    fa: 'سیم‌کارت / اینترنت',    ar: 'شريحة SIM / إنترنت' },
];

export const DEFAULT_INCLUDED_STATE = Object.freeze({
  accommodationEnabled: false,
  accommodationType:    '',     // '' | 'hotel' | 'hostel' | 'traditional'
  hotelStars:           4,
  transportation:       [],     // value[]
  meals:                'none', // single value
  other:                [],     // value[]
});

// ── Serialise structured state → human-readable English label array ──────────

const accommodationLabel = (type, stars) => {
  if (type === 'hotel') return `Hotel (${stars}★)`;
  const def = ACCOMMODATION_TYPES.find(a => a.value === type);
  return def?.en || '';
};

export function serializeIncluded(state) {
  if (!state) return [];
  const out = [];

  if (state.accommodationEnabled && state.accommodationType) {
    const label = accommodationLabel(state.accommodationType, state.hotelStars);
    if (label) out.push(label);
  }

  for (const value of state.transportation || []) {
    const opt = TRANSPORTATION_OPTIONS.find(o => o.value === value);
    if (opt) out.push(opt.en);
  }

  if (state.meals && state.meals !== 'none') {
    const opt = MEALS_OPTIONS.find(o => o.value === state.meals);
    if (opt) out.push(opt.en);
  }

  for (const value of state.other || []) {
    const opt = OTHER_OPTIONS.find(o => o.value === value);
    if (opt) out.push(opt.en);
  }

  return out;
}

// ── Parse stored array (new labels and legacy slugs/free-text) → state ───────

// Build a normalised lookup so "Hotel (4★)", "hotel_4star", "HOTEL (4*)" all
// resolve to the same accommodation entry.
const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

const TRANSPORT_LOOKUP = new Map();
for (const o of TRANSPORTATION_OPTIONS) {
  TRANSPORT_LOOKUP.set(norm(o.en), o.value);
  TRANSPORT_LOOKUP.set(o.value, o.value);
}
// Aliases for legacy slug variants from earlier turn
TRANSPORT_LOOKUP.set('bus (intercity)', 'bus_intercity');

const MEALS_LOOKUP = new Map();
for (const o of MEALS_OPTIONS) {
  MEALS_LOOKUP.set(norm(o.en), o.value);
  MEALS_LOOKUP.set(o.value, o.value);
}
MEALS_LOOKUP.set('all meals', 'all');
MEALS_LOOKUP.set('all_meals', 'all');

const OTHER_LOOKUP = new Map();
for (const o of OTHER_OPTIONS) {
  OTHER_LOOKUP.set(norm(o.en), o.value);
  OTHER_LOOKUP.set(o.value, o.value);
}
// Aliases for the legacy slug catalog
OTHER_LOOKUP.set('tour guide (english speaking)', 'guide_en');
OTHER_LOOKUP.set('tour_guide_en', 'guide_en');

const HOTEL_RE = /^hotel\s*\(\s*(\d)\s*[★*]\s*\)\s*$/i;
const HOTEL_SLUG_RE = /^hotel_(\d)star$/i;

export function parseIncluded(items) {
  const state = {
    accommodationEnabled: DEFAULT_INCLUDED_STATE.accommodationEnabled,
    accommodationType:    DEFAULT_INCLUDED_STATE.accommodationType,
    hotelStars:           DEFAULT_INCLUDED_STATE.hotelStars,
    transportation:       [],
    meals:                DEFAULT_INCLUDED_STATE.meals,
    other:                [],
  };
  if (!Array.isArray(items)) return state;

  for (const raw of items) {
    if (typeof raw !== 'string') continue;
    const item = raw.trim();
    if (!item) continue;
    const key = norm(item);

    // Hotel with stars (new "Hotel (4★)" or legacy "hotel_4star")
    const hotelMatch = item.match(HOTEL_RE) || item.match(HOTEL_SLUG_RE);
    if (hotelMatch) {
      state.accommodationEnabled = true;
      state.accommodationType = 'hotel';
      state.hotelStars = Number(hotelMatch[1]) || state.hotelStars;
      continue;
    }
    if (key === 'hostel / guesthouse' || key === 'hostel') {
      state.accommodationEnabled = true;
      state.accommodationType = 'hostel';
      continue;
    }
    if (key === 'traditional house / eco-lodge'
        || key === 'traditional house (eco-lodge)'
        || key === 'eco_lodge'
        || key === 'traditional') {
      state.accommodationEnabled = true;
      state.accommodationType = 'traditional';
      continue;
    }

    const t = TRANSPORT_LOOKUP.get(key);
    if (t) { if (!state.transportation.includes(t)) state.transportation.push(t); continue; }

    const m = MEALS_LOOKUP.get(key);
    if (m) { state.meals = m; continue; }

    const o = OTHER_LOOKUP.get(key);
    if (o) { if (!state.other.includes(o)) state.other.push(o); continue; }

    // Unknown — silently ignore. Detail page lookupInclusionLabel still
    // renders the raw string for legacy data.
  }

  return state;
}

// ── Detail-page label lookup ─────────────────────────────────────────────────

// Reverse map of every catalog English label → localised lookup so FA/AR
// readers see translated text on the public detail page even though we now
// store English-only strings.
const LABEL_INDEX = new Map();
for (const o of [...TRANSPORTATION_OPTIONS, ...MEALS_OPTIONS, ...OTHER_OPTIONS]) {
  LABEL_INDEX.set(norm(o.en), o);
}
for (const a of ACCOMMODATION_TYPES) {
  if (a.value !== 'hotel') LABEL_INDEX.set(norm(a.en), a);
}

// Hotel star variants don't have a static label entry — we localise inline.
const HOTEL_BASE_LABEL = { en: 'Hotel', fa: 'هتل', ar: 'فندق' };

/**
 * Resolve a saved inclusion entry (new English label or legacy slug) into a
 * localised label for the public TourDetails view. Falls through to the raw
 * string if no catalog match exists.
 */
export function lookupInclusionLabel(item, lang = 'en') {
  if (item == null) return '';
  const raw = String(item).trim();
  if (!raw) return '';
  const key = norm(raw);

  // Hotel-with-stars: new "Hotel (4★)" and legacy "hotel_4star"
  const hotelMatch = raw.match(HOTEL_RE) || raw.match(HOTEL_SLUG_RE);
  if (hotelMatch) {
    const stars = hotelMatch[1];
    const base = HOTEL_BASE_LABEL[lang] || HOTEL_BASE_LABEL.en;
    return `${base} (${stars}★)`;
  }

  const entry = LABEL_INDEX.get(key);
  if (entry) return entry[lang] || entry.en || raw;

  return raw;
}
